import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signUploadSchema } from '../schemas/validation';
import { env } from '../config/env';
import { supabaseAdmin } from '../config/supabase';
import { sanitizeFileName } from '../utils/helpers';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

// Direct upload via backend
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({ error: 'file is required (multipart/form-data)' });
    }
    
    const sanitizedName = sanitizeFileName(req.file.originalname);
    const path = req.body.path || `${req.authUser!.id}/${Date.now()}_${sanitizedName}`;
    
    console.log('Uploading file:', { path, size: req.file.size, type: req.file.mimetype });
    
    const { data, error } = await supabaseAdmin.storage
      .from(env.bucket)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    
    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(400).json({ error: error.message });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from(env.bucket)
      .getPublicUrl(data.path);

    console.log('File uploaded successfully:', publicUrl.publicUrl);
    res.json({ path: data.path, url: publicUrl.publicUrl, publicUrl: publicUrl.publicUrl });
  } catch (e: any) {
    console.error('Upload failed:', e);
    res.status(500).json({ error: 'Upload failed', details: String(e?.message ?? e) });
  }
});

// Create signed upload URL for client direct upload
router.post('/sign-upload', requireAuth, validate(signUploadSchema), async (req, res) => {
  try {
    const { path } = req.body as { path?: string };
    const objectPath = path || `${req.authUser!.id}/${Date.now()}`;
    const { data, error } = await supabaseAdmin.storage
      .from(env.bucket)
      .createSignedUploadUrl(objectPath);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ path: objectPath, signedUrl: data.signedUrl, token: data.token });
  } catch (e: any) {
    res.status(500).json({ error: 'Sign upload failed', details: String(e?.message ?? e) });
  }
});

// Create signed download URL
router.get('/sign-download', requireAuth, async (req, res) => {
  try {
    const path = req.query.path as string | undefined;
    if (!path) return res.status(400).json({ error: 'path is required' });
    const { data, error } = await supabaseAdmin.storage
      .from(env.bucket)
      .createSignedUrl(path, 60 * 60);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ path, signedUrl: data.signedUrl });
  } catch (e: any) {
    res.status(500).json({ error: 'Sign download failed', details: String(e?.message ?? e) });
  }
});

// Upload payment proof (public endpoint for customers)
router.post('/payment-proof', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({ error: 'file is required (multipart/form-data)' });
    }
    
    const sanitizedName = sanitizeFileName(req.file.originalname);
    const path = `payment-proofs/${req.authUser!.id}/${Date.now()}_${sanitizedName}`;
    
    console.log('Uploading payment proof:', { path, size: req.file.size, type: req.file.mimetype });
    
    const { data, error } = await supabaseAdmin.storage
      .from(env.bucket)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    
    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(400).json({ error: error.message });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from(env.bucket)
      .getPublicUrl(data.path);

    console.log('Payment proof uploaded successfully:', publicUrl.publicUrl);
    res.json({ path: data.path, url: publicUrl.publicUrl, publicUrl: publicUrl.publicUrl });
  } catch (e: any) {
    console.error('Payment proof upload failed:', e);
    res.status(500).json({ error: 'Upload failed', details: String(e?.message ?? e) });
  }
});

export default router;
