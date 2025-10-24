import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getAllPaymentMethods(req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .eq('is_active', true);

    if (error) throw new AppError(500, error.message);
    res.json({ payment_methods: data });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentMethodByType(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.params;
    const { data, error } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .eq('method_type', type)
      .single();

    if (error) throw new AppError(404, 'Payment method not found');
    res.json({ payment_method: data });
  } catch (error) {
    next(error);
  }
}

export async function updatePaymentMethod(req: Request, res: Response, next: NextFunction) {
  try {
    const { type } = req.params;
    const { is_active, vodafone_number, instapay_email, instructions_ar, instructions_en } = req.body;

    const { data, error } = await supabaseAdmin
      .from('payment_methods')
      .update({ 
        is_active,
        vodafone_number,
        instapay_email,
        instructions_ar,
        instructions_en,
        updated_at: new Date().toISOString() 
      })
      .eq('method_type', type)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.json({ payment_method: data });
  } catch (error) {
    next(error);
  }
}
