import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (unread_only === 'true') {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      notifications: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    res.status(200).json({ count: data?.length || 0 });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ 
      message: 'Notification marked as read',
      notification: data 
    });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Admin: Create notification for user(s)
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { 
      user_id, 
      user_ids, // For multiple users
      type, 
      title_ar, 
      title_en, 
      message_ar, 
      message_en,
      data 
    } = req.body;

    // Validate required fields
    if (!type || !title_ar || !title_en || !message_ar || !message_en) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, title_ar, title_en, message_ar, message_en' 
      });
    }

    if (!user_id && !user_ids) {
      return res.status(400).json({ 
        error: 'Either user_id or user_ids must be provided' 
      });
    }

    const notifications = [];
    const targetUserIds = user_ids || [user_id];

    for (const targetUserId of targetUserIds) {
      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .insert([{
          user_id: targetUserId,
          type,
          title_ar,
          title_en,
          message_ar,
          message_en,
          data: data || {}
        }])
        .select()
        .single();

      if (error) {
        console.error(`Failed to create notification for user ${targetUserId}:`, error);
        continue;
      }

      notifications.push(notification);
    }

    res.status(201).json({
      message: `Created ${notifications.length} notification(s)`,
      notifications
    });
  } catch (error: any) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Admin: Send notification to all users
export const sendToAllUsers = async (req: Request, res: Response) => {
  try {
    const { 
      type, 
      title_ar, 
      title_en, 
      message_ar, 
      message_en,
      data 
    } = req.body;

    // Validate required fields
    if (!type || !title_ar || !title_en || !message_ar || !message_en) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) throw usersError;

    const notifications = [];

    for (const user of users.users) {
      const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .insert([{
          user_id: user.id,
          type,
          title_ar,
          title_en,
          message_ar,
          message_en,
          data: data || {}
        }])
        .select()
        .single();

      if (error) {
        console.error(`Failed to create notification for user ${user.id}:`, error);
        continue;
      }

      notifications.push(notification);
    }

    res.status(201).json({
      message: `Sent notification to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error: any) {
    console.error('Send to all users error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
};

// Admin: Get all notifications
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, user_id, type, is_read } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('notifications')
      .select('*, user:auth.users(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (is_read !== undefined) {
      query = query.eq('is_read', is_read === 'true');
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      notifications: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Admin: Delete notification
export const adminDeleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    console.error('Admin delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Helper function to create order notification (to be called from orders controller)
export const createOrderNotification = async (
  userId: string,
  orderId: string,
  orderNumber: string,
  status: string
) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('create_order_notification', {
      p_user_id: userId,
      p_order_id: orderId,
      p_order_number: orderNumber,
      p_status: status
    });

    if (error) {
      console.error('Create order notification error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Create order notification error:', error);
    return null;
  }
};
