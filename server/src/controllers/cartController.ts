import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw new AppError(500, error.message);
    res.json({ cart: data });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { product_id, quantity } = req.body;

    // Check if item exists
    const { data: existing } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new AppError(400, error.message);
      return res.json({ cart_item: data });
    }

    // Insert new
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .insert({ user_id: userId, product_id, quantity })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.status(201).json({ cart_item: data });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { id } = req.params;
    const { quantity } = req.body;

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.json({ cart_item: data });
  } catch (error) {
    next(error);
  }
}

export async function removeFromCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(400, error.message);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.authUser!.id;
    const { error } = await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
    if (error) throw new AppError(400, error.message);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
}
