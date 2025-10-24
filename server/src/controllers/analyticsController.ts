import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    // Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get total orders
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total customers (users with role 'user' or without admin role)
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
    const totalCustomers = allUsers?.users?.filter(user => 
      user.app_metadata?.role !== 'admin'
    ).length || 0;

    // Get total revenue from confirmed orders
    const { data: revenueData } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

    // Get pending orders
    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get confirmed orders
    const { count: confirmedOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    // Get low stock products
    const { data: lowStockProducts } = await supabaseAdmin
      .from('products')
      .select('id, name, quantity')
      .lte('quantity', 10)
      .eq('track_quantity', true)
      .order('quantity', { ascending: true })
      .limit(5);

    // Get recent orders
    const { data: recentOrders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get sales data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: weekSales } = await supabaseAdmin
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', sevenDaysAgo.toISOString())
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    // Group sales by day
    const salesByDay = new Map();
    weekSales?.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('ar-EG');
      if (salesByDay.has(date)) {
        salesByDay.set(date, salesByDay.get(date) + parseFloat(order.total_amount));
      } else {
        salesByDay.set(date, parseFloat(order.total_amount));
      }
    });

    const chartData = Array.from(salesByDay.entries()).map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(2))
    }));

    res.json({
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalCustomers: totalCustomers,
      pendingOrders: pendingOrders || 0,
      confirmedOrders: confirmedOrders || 0,
      lowStockProducts: lowStockProducts || [],
      recentOrders: recentOrders || [],
      chartData: chartData,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSalesReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select('created_at, total_amount, status, payment_status')
      .eq('payment_status', 'paid');

    if (start_date) {
      query = query.gte('created_at', start_date as string);
    }
    if (end_date) {
      query = query.lte('created_at', end_date as string);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new AppError(500, error.message);

    const totalSales = data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
    const orderCount = data?.length || 0;

    res.json({
      sales: data,
      summary: {
        totalSales: totalSales.toFixed(2),
        orderCount,
        averageOrderValue: orderCount > 0 ? (totalSales / orderCount).toFixed(2) : '0.00',
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTopProducts(_req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .select('product_id, product_name, quantity, price')
      .order('quantity', { ascending: false })
      .limit(10);

    if (error) throw new AppError(500, error.message);

    // Aggregate by product
    const productMap = new Map();
    data?.forEach((item) => {
      if (productMap.has(item.product_id)) {
        const existing = productMap.get(item.product_id);
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.quantity * parseFloat(item.price);
      } else {
        productMap.set(item.product_id, {
          product_id: item.product_id,
          product_name: item.product_name,
          totalQuantity: item.quantity,
          totalRevenue: item.quantity * parseFloat(item.price),
        });
      }
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    res.json({ topProducts });
  } catch (error) {
    next(error);
  }
}
