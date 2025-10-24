import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getAllCoupons(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search } = req.query;
    let query = supabaseAdmin.from('coupons').select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('code', `%${search}%`);

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw new AppError(500, error.message);
    res.json({ coupons: data, total: count });
  } catch (error) {
    next(error);
  }
}

export async function getCouponById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Coupon not found');
    res.json({ coupon: data });
  } catch (error) {
    next(error);
  }
}

export async function validateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, orderTotal } = req.body;
    const userId = req.authUser?.id;

    // Get coupon
    const { data: coupon, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      throw new AppError(404, 'كود الخصم غير صحيح');
    }

    // Check if user already used this coupon
    if (userId) {
      const { data: previousUsage } = await supabaseAdmin
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', userId)
        .single();

      if (previousUsage) {
        throw new AppError(400, 'لقد استخدمت هذا الكود من قبل');
      }
    }

    // Check if active
    if (coupon.status !== 'active') {
      throw new AppError(400, 'كود الخصم غير نشط');
    }

    // Check validity dates
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      throw new AppError(400, 'كود الخصم لم يبدأ بعد');
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      throw new AppError(400, 'كود الخصم منتهي الصلاحية');
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new AppError(400, 'تم استخدام كود الخصم بالكامل');
    }

    // Check minimum purchase amount
    if (coupon.min_purchase_amount && orderTotal < coupon.min_purchase_amount) {
      throw new AppError(400, `الحد الأدنى للطلب ${coupon.min_purchase_amount} جنيه`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderTotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discountAmount: Math.min(discountAmount, orderTotal),
    });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const couponData = {
      ...req.body,
      code: req.body.code.toUpperCase(),
      created_by: req.authUser!.id,
    };

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert(couponData)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.status(201).json({ coupon: data });
  } catch (error) {
    next(error);
  }
}

export async function updateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };
    
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.json({ coupon: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('coupons').delete().eq('id', id);
    if (error) throw new AppError(400, error.message);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
}

export async function getCouponUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // First, get coupon usage
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from('coupon_usage')
      .select('*')
      .eq('coupon_id', id)
      .order('used_at', { ascending: false });

    if (usageError) throw new AppError(500, usageError.message);

    // If no usage, return empty array
    if (!usageData || usageData.length === 0) {
      return res.json({ usage: [] });
    }

    // Get user details from orders table (which has full_name and phone)
    const usageWithUsers = await Promise.all(
      usageData.map(async (usage) => {
        // Try to get user info from the order
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('full_name, phone')
          .eq('id', usage.order_id)
          .single();

        // If no order, try to get from auth.users
        let email = 'غير متوفر';
        if (usage.user_id) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(usage.user_id);
          email = authUser?.user?.email || 'غير متوفر';
        }

        return {
          ...usage,
          user_profiles: {
            full_name: order?.full_name || 'مستخدم',
            email: email
          }
        };
      })
    );

    res.json({ usage: usageWithUsers });
  } catch (error) {
    next(error);
  }
}

export async function getCouponStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Get coupon details
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (couponError) throw new AppError(404, 'Coupon not found');

    // Get usage statistics
    const { data: usage, error: usageError } = await supabaseAdmin
      .from('coupon_usage')
      .select('discount_amount, order_total')
      .eq('coupon_id', id);

    if (usageError) throw new AppError(500, usageError.message);

    const totalDiscount = usage?.reduce((sum, u) => sum + parseFloat(u.discount_amount.toString()), 0) || 0;
    const totalOrders = usage?.reduce((sum, u) => sum + parseFloat(u.order_total.toString()), 0) || 0;

    res.json({
      coupon,
      stats: {
        used_count: coupon.used_count,
        remaining: coupon.usage_limit ? coupon.usage_limit - coupon.used_count : null,
        total_discount: totalDiscount,
        total_orders: totalOrders,
      },
    });
  } catch (error) {
    next(error);
  }
}
