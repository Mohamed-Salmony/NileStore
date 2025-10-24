import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

// Create support ticket (from chatbot or user)
export const createTicket = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    const { subject, message, category, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Generate ticket number
    const { data: ticketNumber, error: numberError } = await supabaseAdmin
      .rpc('generate_ticket_number');

    if (numberError) throw numberError;

    // Create ticket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .insert([{
        ticket_number: ticketNumber,
        user_id: userId,
        subject,
        status: 'open',
        priority: priority || 'normal',
        category: category || 'general'
      }])
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Add first message
    const { data: ticketMessage, error: messageError } = await supabaseAdmin
      .from('ticket_messages')
      .insert([{
        ticket_id: ticket.id,
        sender_id: userId,
        sender_type: 'user',
        message
      }])
      .select()
      .single();

    if (messageError) throw messageError;

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket: {
        ...ticket,
        messages: [ticketMessage]
      }
    });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
};

// Get user tickets
export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      tickets: data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// Get ticket details with messages
export const getTicketDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    const { id } = req.params;

    // Get ticket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (ticketError) throw ticketError;

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get messages (excluding internal notes)
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .eq('is_internal', false)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    res.status(200).json({
      ticket: {
        ...ticket,
        messages
      }
    });
  } catch (error: any) {
    console.error('Get ticket details error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
};

// Add message to ticket
export const addTicketMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.authUser?.id;
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Verify ticket belongs to user
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Add message
    const { data, error } = await supabaseAdmin
      .from('ticket_messages')
      .insert([{
        ticket_id: id,
        sender_id: userId,
        sender_type: 'user',
        message
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Message sent successfully',
      ticketMessage: data
    });
  } catch (error: any) {
    console.error('Add ticket message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Admin: Get all tickets
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const { status, priority, category, assigned_to, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Get user info for each ticket
    const ticketsWithUserInfo = await Promise.all(
      (data || []).map(async (ticket) => {
        try {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(ticket.user_id);
          return {
            ...ticket,
            user: {
              email: authUser?.user?.email || 'Unknown',
              raw_user_meta_data: authUser?.user?.user_metadata || {}
            }
          };
        } catch (err) {
          return {
            ...ticket,
            user: { email: 'Unknown', raw_user_meta_data: {} }
          };
        }
      })
    );

    res.status(200).json({
      tickets: ticketsWithUserInfo,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// Admin: Get ticket details (including internal notes)
export const adminGetTicketDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get ticket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError) throw ticketError;

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get user info
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(ticket.user_id);
      ticket.user = {
        email: authUser?.user?.email || 'Unknown',
        raw_user_meta_data: authUser?.user?.user_metadata || {}
      };
    } catch (err) {
      ticket.user = { email: 'Unknown', raw_user_meta_data: {} };
    }

    // Get all messages (including internal)
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    res.status(200).json({
      ticket: { ...ticket, messages }
    });
  } catch (error: any) {
    console.error('Admin get ticket details error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
};

// Admin: Reply to ticket
export const adminReplyToTicket = async (req: Request, res: Response) => {
  try {
    const adminId = req.authUser?.id;
    const { id } = req.params;
    const { message, is_internal = false } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Add admin message
    const { data, error } = await supabaseAdmin
      .from('ticket_messages')
      .insert([{
        ticket_id: id,
        sender_id: adminId,
        sender_type: 'admin',
        message,
        is_internal
      }])
      .select()
      .single();

    if (error) throw error;

    // Update ticket status if needed
    if (!is_internal) {
      await supabaseAdmin
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', id)
        .eq('status', 'open');
      
      // Get ticket details to create notification
      const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select('user_id, ticket_number')
        .eq('id', id)
        .single();
      
      if (ticket) {
        // Create notification for user
        const messagePreview = message.length > 100 
          ? message.substring(0, 100) + '...' 
          : message;
        
        await supabaseAdmin.rpc('create_support_reply_notification', {
          p_user_id: ticket.user_id,
          p_ticket_id: id,
          p_ticket_number: ticket.ticket_number,
          p_message_preview: messagePreview
        });
      }
    }

    res.status(201).json({
      message: 'Reply sent successfully',
      ticketMessage: data
    });
  } catch (error: any) {
    console.error('Admin reply error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
};

// Admin: Update ticket
export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, category, assigned_to } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (category) updateData.category = category;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }
    if (status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Ticket updated successfully',
      ticket: data
    });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

// Admin: Get ticket statistics
export const getTicketStats = async (req: Request, res: Response) => {
  try {
    const { count: openCount } = await supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    const { count: inProgressCount } = await supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');

    const { count: resolvedCount } = await supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');

    const { count: closedCount } = await supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'closed');

    res.status(200).json({
      stats: {
        open: openCount || 0,
        in_progress: inProgressCount || 0,
        resolved: resolvedCount || 0,
        closed: closedCount || 0,
        total: (openCount || 0) + (inProgressCount || 0) + 
               (resolvedCount || 0) + (closedCount || 0)
      }
    });
  } catch (error: any) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket statistics' });
  }
};
