import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getAllGovernorates(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from('governorates')
      .select('*')
      .eq('is_active', true)
      .order('name_ar', { ascending: true });

    if (error) throw new AppError(500, error.message);
    res.json({ governorates: data });
  } catch (error) {
    next(error);
  }
}

export async function getGovernorateById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('governorates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Governorate not found');
    res.json({ governorate: data });
  } catch (error) {
    next(error);
  }
}

export async function createGovernorate(req: Request, res: Response, next: NextFunction) {
  try {
    const { name_ar, name_en, shipping_cost, is_free_shipping, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('governorates')
      .insert({ name_ar, name_en, shipping_cost, is_free_shipping, is_active })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.status(201).json({ governorate: data });
  } catch (error) {
    next(error);
  }
}

export async function updateGovernorate(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name_ar, name_en, shipping_cost, is_free_shipping, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('governorates')
      .update({ 
        name_ar, 
        name_en, 
        shipping_cost, 
        is_free_shipping, 
        is_active,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.json({ governorate: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteGovernorate(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('governorates')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(400, error.message);
    res.json({ message: 'Governorate deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function bulkUpdateShippingCost(req: Request, res: Response, next: NextFunction) {
  try {
    const { governorate_ids, shipping_cost, is_free_shipping } = req.body;

    const { data, error } = await supabaseAdmin
      .from('governorates')
      .update({ 
        shipping_cost, 
        is_free_shipping,
        updated_at: new Date().toISOString() 
      })
      .in('id', governorate_ids)
      .select();

    if (error) throw new AppError(400, error.message);
    res.json({ governorates: data });
  } catch (error) {
    next(error);
  }
}
