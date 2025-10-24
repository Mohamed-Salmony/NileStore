import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;

    const { data, error } = await supabaseAdmin
      .from('wishlist')
      .select(`
        id,
        product_id,
        created_at,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(400, error.message);

    res.json({ wishlist: data || [] });
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { product_id } = req.body;

    if (!product_id) {
      throw new AppError(400, 'Product ID is required');
    }

    // Check if product exists
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', product_id)
      .single();

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    const { data, error } = await supabaseAdmin
      .from('wishlist')
      .insert({
        user_id: userId,
        product_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError(400, 'Product already in wishlist');
      }
      throw new AppError(400, error.message);
    }

    res.json({ wishlist: data });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { product_id } = req.params;

    const { error } = await supabaseAdmin
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', product_id);

    if (error) throw new AppError(400, error.message);

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
}

export async function checkWishlistStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { product_ids } = req.body;

    if (!Array.isArray(product_ids)) {
      throw new AppError(400, 'product_ids must be an array');
    }

    const { data, error } = await supabaseAdmin
      .from('wishlist')
      .select('product_id')
      .eq('user_id', userId)
      .in('product_id', product_ids);

    if (error) throw new AppError(400, error.message);

    const wishlistProductIds = (data || []).map(item => item.product_id);
    
    res.json({ wishlist_product_ids: wishlistProductIds });
  } catch (error) {
    next(error);
  }
}
