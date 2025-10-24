import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { clearCache } from '../middleware/cache';

export async function getAllProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category_id, status, search, limit = '50', offset = '0' } = req.query;
    let query = supabaseAdmin.from('products').select('*, categories(name)', { count: 'exact' });

    if (category_id) query = query.eq('category_id', category_id);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) throw new AppError(500, error.message);
    res.json({ products: data, total: count });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Product not found');
    res.json({ product: data });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productData = {
      ...req.body,
      created_by: req.authUser!.id,
      status: req.body.status || 'draft',
    };
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    
    // Clear products cache
    clearCache('/api/products');
    
    res.status(201).json({ product: data });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    
    // Clear products cache
    clearCache('/api/products');
    
    res.json({ product: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw new AppError(400, error.message);
    
    // Clear products cache
    clearCache('/api/products');
    
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
}
