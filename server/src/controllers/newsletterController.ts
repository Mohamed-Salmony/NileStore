import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

// Subscribe to newsletter
export const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      // If already subscribed and active
      if (existing.status === 'active') {
        return res.status(200).json({ 
          message: 'Email already subscribed',
          subscription: existing 
        });
      }
      
      // If previously unsubscribed, reactivate
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('newsletter_subscriptions')
        .update({ 
          status: 'active',
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null
        })
        .eq('email', email.toLowerCase())
        .select()
        .single();

      if (updateError) throw updateError;

      return res.status(200).json({
        message: 'Successfully resubscribed to newsletter',
        subscription: updated
      });
    }

    // Create new subscription
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .insert([
        {
          email: email.toLowerCase(),
          status: 'active',
          subscribed_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Successfully subscribed to newsletter',
      subscription: data
    });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
};

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Successfully unsubscribed from newsletter',
      subscription: data
    });
  } catch (error: any) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
  }
};

// Get all newsletter subscriptions (Admin only)
export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      subscriptions: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

// Get subscription statistics (Admin only)
export const getSubscriptionStats = async (req: Request, res: Response) => {
  try {
    const { data: active, error: activeError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: unsubscribed, error: unsubscribedError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'unsubscribed');

    if (activeError || unsubscribedError) {
      throw activeError || unsubscribedError;
    }

    res.status(200).json({
      stats: {
        active: active?.length || 0,
        unsubscribed: unsubscribed?.length || 0,
        total: (active?.length || 0) + (unsubscribed?.length || 0)
      }
    });
  } catch (error: any) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription statistics' });
  }
};

// Delete subscription (Admin only)
export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error: any) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
};
