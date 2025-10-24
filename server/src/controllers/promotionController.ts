import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { clearCache } from '../middleware/cache';

export async function getAllPromotions(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, type } = req.query;
    let query = supabaseAdmin.from('promotions').select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('promotion_type', type);

    const { data, error, count } = await query.order('priority', { ascending: false }).order('created_at', { ascending: false });

    if (error) throw new AppError(500, error.message);
    res.json({ promotions: data, total: count });
  } catch (error) {
    next(error);
  }
}

export async function getPromotionById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Promotion not found');
    res.json({ promotion: data });
  } catch (error) {
    next(error);
  }
}

export async function getPromotionProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('promotion_products')
      .select(`
        *,
        products!inner(
          id,
          name,
          slug,
          price,
          featured_image,
          status
        )
      `)
      .eq('promotion_id', id);

    if (error) throw new AppError(500, error.message);
    res.json({ products: data });
  } catch (error) {
    next(error);
  }
}

export async function getActivePromotions(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .select(`
        *,
        promotion_products(
          *,
          products!inner(
            id,
            name,
            slug,
            price,
            compare_at_price,
            featured_image,
            images,
            status
          )
        )
      `)
      .eq('status', 'active')
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('priority', { ascending: false });

    if (error) throw new AppError(500, error.message);
    res.json({ promotions: data });
  } catch (error) {
    next(error);
  }
}

export async function createPromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const promotionData = {
      ...req.body,
      created_by: req.authUser!.id,
    };

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .insert(promotionData)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    
    clearCache('/api/promotions');
    res.status(201).json({ promotion: data });
  } catch (error) {
    next(error);
  }
}

export async function updatePromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    
    clearCache('/api/promotions');
    res.json({ promotion: data });
  } catch (error) {
    next(error);
  }
}

export async function deletePromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('promotions').delete().eq('id', id);
    if (error) throw new AppError(400, error.message);
    
    clearCache('/api/promotions');
    res.json({ message: 'Promotion deleted' });
  } catch (error) {
    next(error);
  }
}

export async function addProductToPromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { product_id, custom_price } = req.body;

    const { data, error } = await supabaseAdmin
      .from('promotion_products')
      .insert({
        promotion_id: id,
        product_id,
        custom_price,
      })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    
    clearCache('/api/promotions');
    res.status(201).json({ promotionProduct: data });
  } catch (error) {
    next(error);
  }
}

export async function removeProductFromPromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, productId } = req.params;

    const { error } = await supabaseAdmin
      .from('promotion_products')
      .delete()
      .eq('promotion_id', id)
      .eq('product_id', productId);

    if (error) throw new AppError(400, error.message);
    
    clearCache('/api/promotions');
    res.json({ message: 'Product removed from promotion' });
  } catch (error) {
    next(error);
  }
}

export async function updatePromotionProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id, productId } = req.params;
    const { custom_price } = req.body;

    const { data, error } = await supabaseAdmin
      .from('promotion_products')
      .update({ custom_price })
      .eq('promotion_id', id)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    
    clearCache('/api/promotions');
    res.json({ promotionProduct: data });
  } catch (error) {
    next(error);
  }
}
