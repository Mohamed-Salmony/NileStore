import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

// Submit contact message
export const submitContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'All fields are required (name, email, subject, message)' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({ 
        error: 'Message must be at least 10 characters long' 
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({ 
        error: 'Message must not exceed 5000 characters' 
      });
    }

    // Create contact message
    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          subject: subject.trim(),
          message: message.trim(),
          status: 'new'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Contact message sent successfully',
      contactMessage: data
    });
  } catch (error: any) {
    console.error('Submit contact message error:', error);
    res.status(500).json({ error: 'Failed to send contact message' });
  }
};

// Get all contact messages (Admin only)
export const getAllContactMessages = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      messages: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
};

// Get single contact message (Admin only)
export const getContactMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    // Mark as read if it's new
    if (data.status === 'new') {
      await supabaseAdmin
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', id);
      
      data.status = 'read';
    }

    res.status(200).json({ message: data });
  } catch (error: any) {
    console.error('Get contact message error:', error);
    res.status(500).json({ error: 'Failed to fetch contact message' });
  }
};

// Update contact message status (Admin only)
export const updateContactMessageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.status(200).json({
      message: 'Contact message updated successfully',
      contactMessage: data
    });
  } catch (error: any) {
    console.error('Update contact message error:', error);
    res.status(500).json({ error: 'Failed to update contact message' });
  }
};

// Delete contact message (Admin only)
export const deleteContactMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Contact message deleted successfully' });
  } catch (error: any) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ error: 'Failed to delete contact message' });
  }
};

// Get contact message statistics (Admin only)
export const getContactMessageStats = async (req: Request, res: Response) => {
  try {
    const { data: newMessages, error: newError } = await supabaseAdmin
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new');

    const { data: readMessages, error: readError } = await supabaseAdmin
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'read');

    const { data: repliedMessages, error: repliedError } = await supabaseAdmin
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'replied');

    const { data: archivedMessages, error: archivedError } = await supabaseAdmin
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'archived');

    if (newError || readError || repliedError || archivedError) {
      throw newError || readError || repliedError || archivedError;
    }

    res.status(200).json({
      stats: {
        new: newMessages?.length || 0,
        read: readMessages?.length || 0,
        replied: repliedMessages?.length || 0,
        archived: archivedMessages?.length || 0,
        total: (newMessages?.length || 0) + (readMessages?.length || 0) + 
               (repliedMessages?.length || 0) + (archivedMessages?.length || 0)
      }
    });
  } catch (error: any) {
    console.error('Get contact message stats error:', error);
    res.status(500).json({ error: 'Failed to fetch contact message statistics' });
  }
};
