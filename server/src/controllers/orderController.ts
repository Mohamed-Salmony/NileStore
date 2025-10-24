import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { createOrderNotification } from '../utils/notifications';

export async function getAllOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, limit = '50', offset = '0' } = req.query;
    const userId = req.authUser!.role === 'admin' ? undefined : req.authUser!.id;

    let query = supabaseAdmin.from('orders').select('*', { count: 'exact' });
    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) throw new AppError(500, error.message);
    res.json({ orders: data, total: count });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.authUser!.role === 'admin' ? undefined : req.authUser!.id;

    let query = supabaseAdmin.from('orders').select('*, order_items(*)').eq('id', id);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query.single();
    if (error) throw new AppError(404, 'Order not found');
    res.json({ order: data });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { 
      items, 
      shipping_address, 
      billing_address, 
      notes,
      governorate_id,
      phone,
      full_name,
      address,
      city,
      payment_method,
      payment_proof_url,
      subtotal: providedSubtotal,
      shipping_cost: providedShippingCost,
      total_amount: providedTotal,
      discount,
      coupon_code
    } = req.body;

    // Validate required fields
    if (!governorate_id) throw new AppError(400, 'Governorate is required');
    if (!phone) throw new AppError(400, 'Phone number is required');
    if (!full_name) throw new AppError(400, 'Full name is required');
    if (!address) throw new AppError(400, 'Address is required');
    if (!city) throw new AppError(400, 'City is required');

    // Get governorate to calculate shipping cost
    const { data: governorate, error: govError } = await supabaseAdmin
      .from('governorates')
      .select('*')
      .eq('id', governorate_id)
      .single();

    if (govError || !governorate) throw new AppError(400, 'Invalid governorate');

    const shipping_cost = providedShippingCost !== undefined ? providedShippingCost : (governorate.is_free_shipping ? 0 : governorate.shipping_cost);

    // Calculate totals or use provided values
    let subtotal = providedSubtotal || 0;
    const orderItems = [];

    // Get cart items if not provided
    if (!items || items.length === 0) {
      const { data: cartItems } = await supabaseAdmin
        .from('cart_items')
        .select('*, products(*)')
        .eq('user_id', userId);

      if (!cartItems || cartItems.length === 0) {
        throw new AppError(400, 'No items in cart');
      }

      for (const item of cartItems) {
        const itemTotal = item.products.price * item.quantity;
        if (!providedSubtotal) subtotal += itemTotal;

        orderItems.push({
          product_id: item.products.id,
          product_name: item.products.name,
          product_image: item.products.featured_image,
          quantity: item.quantity,
          price: item.products.price,
          total: itemTotal,
        });
      }
    } else {
      for (const item of items) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('id, name, price, featured_image')
          .eq('id', item.product_id)
          .single();

        if (!product) throw new AppError(400, `Product ${item.product_id} not found`);

        const itemTotal = product.price * item.quantity;
        if (!providedSubtotal) subtotal += itemTotal;

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          product_image: product.featured_image,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        });
      }
    }

    const { generateOrderNumber } = await import('../utils/helpers');
    const orderNumber = generateOrderNumber();
    const totalAmount = providedTotal !== undefined ? providedTotal : (subtotal + shipping_cost + (req.body.tax || 0) - (req.body.discount || 0));

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: 'pending',
        payment_status: payment_proof_url ? 'pending' : 'pending',
        total_amount: totalAmount,
        subtotal,
        tax: req.body.tax || 0,
        shipping_cost,
        discount: req.body.discount || 0,
        coupon_code: coupon_code || null,
        shipping_address: shipping_address || { address, city, governorate_id },
        billing_address: billing_address || { address, city, governorate_id },
        notes: notes || '',
        governorate_id,
        phone,
        full_name,
        payment_method: payment_method || 'vodafone_cash',
        payment_proof_url: payment_proof_url || null,
      })
      .select()
      .single();

    if (orderError) throw new AppError(400, orderError.message);

    // Track coupon usage if coupon was used
    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('id, used_count')
        .eq('code', coupon_code)
        .single();

      if (coupon) {
        // Insert into coupon_usage table (trigger will auto-increment used_count)
        await supabaseAdmin
          .from('coupon_usage')
          .insert({
            coupon_id: coupon.id,
            user_id: userId,
            order_id: order.id,
            discount_amount: req.body.discount || 0,
            order_total: totalAmount
          });
      }
    }

    // Create order items
    const itemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(itemsWithOrderId);
    if (itemsError) throw new AppError(400, itemsError.message);

    // Clear cart
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);

    // Create notification for order creation
    try {
      await createOrderNotification(userId, order.id, orderNumber, 'created');
    } catch (notifError) {
      console.error('Failed to create order notification:', notifError);
    }

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, payment_status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);

    // Deduct inventory when order is confirmed
    if (status === 'confirmed' && data) {
      try {
        // Get order items
        const { data: orderItems } = await supabaseAdmin
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', id);

        if (orderItems && orderItems.length > 0) {
          // Update inventory for each product
          for (const item of orderItems) {
            const { data: product } = await supabaseAdmin
              .from('products')
              .select('quantity, track_quantity')
              .eq('id', item.product_id)
              .single();

            if (product && product.track_quantity) {
              const newQuantity = Math.max(0, (product.quantity || 0) - item.quantity);
              await supabaseAdmin
                .from('products')
                .update({ quantity: newQuantity })
                .eq('id', item.product_id);
            }
          }
        }
      } catch (inventoryError) {
        console.error('Failed to update inventory:', inventoryError);
        // Don't fail the order update if inventory update fails
      }
    }

    // Create notification for status change
    if (status && data) {
      const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (validStatuses.includes(status)) {
        try {
          await createOrderNotification(data.user_id, data.id, data.order_number, status as any);
        } catch (notifError) {
          console.error('Failed to create status notification:', notifError);
        }
      }
    }

    res.json({ order: data });
  } catch (error) {
    next(error);
  }
}
