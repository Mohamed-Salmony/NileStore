import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Health check moved to app.ts root level
// All other routes are in their respective route files

// Create admin endpoint (للتطوير فقط - احذفه في الإنتاج!)
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // إنشاء المستخدم مع صلاحيات admin
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // تأكيد البريد تلقائياً
      user_metadata: {
        full_name: full_name || 'Admin User',
      },
      app_metadata: {
        role: 'admin', // تعيين صلاحيات admin
      },
    });

    if (createError) throw createError;

    res.json({ 
      message: 'Admin created successfully',
      user: {
        id: user.user.id,
        email: user.user.email,
        role: 'admin',
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
