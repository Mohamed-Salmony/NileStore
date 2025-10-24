import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { createWelcomeNotification } from '../utils/notifications';

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.authUser;
    if (!user) throw new AppError(401, 'Not authenticated');

    // Get additional user profile data if exists
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({ 
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { full_name, phone, avatar_url } = req.body;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userId,
        full_name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit = '50', offset = '0' } = req.query;

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
      perPage: parseInt(limit as string),
    });

    if (error) throw new AppError(500, error.message);

    // Get order counts for each user
    const usersWithStats = await Promise.all(
      data.users.map(async (user) => {
        const { count } = await supabaseAdmin
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          ...user,
          orders_count: count || 0,
        };
      })
    );

    res.json({ users: usersWithStats, total: usersWithStats.length });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      throw new AppError(400, 'Invalid role. Must be admin or user');
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      app_metadata: { role },
    });

    if (error) throw new AppError(400, error.message);
    res.json({ user: data.user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw new AppError(400, error.message);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// Create welcome notification for new user
export async function createUserWelcomeNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    
    // Check if welcome notification already exists
    const { data: existingNotification } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'welcome')
      .single();

    if (existingNotification) {
      return res.json({ message: 'Welcome notification already exists' });
    }

    // Create welcome notification
    await createWelcomeNotification(userId);

    res.status(201).json({ message: 'Welcome notification created successfully' });
  } catch (error) {
    next(error);
  }
}
