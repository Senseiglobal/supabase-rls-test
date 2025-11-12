import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';


export const config = {
  runtime: 'nodejs',
};

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
  };
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { accessToken, userId } = await req.json();

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check permissions
    const { data: permission } = await supabase
      .from('permissions')
      .select('granted')
      .eq('user_id', userId)
      .eq('permission_type', 'inbox_reader')
      .single();

    if (!permission?.granted) {
      return new Response(
        JSON.stringify({ error: 'Inbox Reader not enabled' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gmail API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth });

    // Search for booking-related emails
    const searchQuery = 'booking OR gig OR venue OR show OR performance OR tour';
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 20,
    });

    const messages: GmailMessage[] = [];
    
    if (response.data.messages) {
      for (const msg of response.data.messages) {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });
        
        messages.push(fullMessage.data as any);
      }
    }

    // Transform messages for frontend
    const transformedMessages = messages.map((msg) => {
      const headers = msg.payload?.headers || [];
      const from = headers.find((h) => h.name === 'From')?.value || '';
      const subject = headers.find((h) => h.name === 'Subject')?.value || '';
      const date = headers.find((h) => h.name === 'Date')?.value || '';

      return {
        id: msg.id,
        from,
        subject,
        snippet: msg.snippet,
        date,
        threadId: msg.threadId,
      };
    });

    return new Response(
      JSON.stringify({ messages: transformedMessages, count: transformedMessages.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Inbox sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
