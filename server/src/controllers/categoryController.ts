import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export async function getAllCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new AppError(500, error.message);
    res.json({ categories: data });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError(404, 'Category not found');
    res.json({ category: data });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug, description, image_url, parent_id } = req.body;
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, slug, description, image_url, parent_id })
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    res.status(201).json({ category: data });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, slug, description, image_url, parent_id } = req.body;
    
    // Get old category data to check if image changed
    const { data: oldCategory } = await supabaseAdmin
      .from('categories')
      .select('image_url')
      .eq('id', id)
      .single();
    
    // Update the category
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ name, slug, description, image_url, parent_id, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(400, error.message);
    
    // Delete old image from storage if image was changed
    if (oldCategory?.image_url && image_url && oldCategory.image_url !== image_url) {
      try {
        const urlParts = oldCategory.image_url.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const fullPath = urlParts[1];
          const pathParts = fullPath.split('/');
          const bucket = pathParts[0];
          const filePath = pathParts.slice(1).join('/');
          
          console.log('Deleting old image from storage:', { bucket, filePath });
          
          await supabaseAdmin.storage.from(bucket).remove([filePath]);
          console.log('Old image deleted successfully');
        }
      } catch (storageError) {
        console.error('Error deleting old image:', storageError);
        // Don't throw error, just log it
      }
    }
    
    res.json({ category: data });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // Get category data first to retrieve image_url
    const { data: category, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('image_url')
      .eq('id', id)
      .single();
    
    if (fetchError) throw new AppError(404, 'Category not found');
    
    // Delete the category from database
    const { error: deleteError } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw new AppError(400, deleteError.message);
    
    // Delete image from storage if exists
    if (category?.image_url) {
      try {
        // Extract path from URL
        // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
        const urlParts = category.image_url.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const fullPath = urlParts[1]; // e.g., "NileStore-Files/categories/123_image.jpg"
          const pathParts = fullPath.split('/');
          const bucket = pathParts[0]; // "NileStore-Files"
          const filePath = pathParts.slice(1).join('/'); // "categories/123_image.jpg"
          
          console.log('Deleting image from storage:', { bucket, filePath });
          
          const { error: storageError } = await supabaseAdmin.storage
            .from(bucket)
            .remove([filePath]);
          
          if (storageError) {
            console.error('Failed to delete image from storage:', storageError);
            // Don't throw error, just log it - category is already deleted
          } else {
            console.log('Image deleted successfully from storage');
          }
        }
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError);
        // Don't throw error, just log it - category is already deleted
      }
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
}
