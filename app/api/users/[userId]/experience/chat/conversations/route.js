// app/api/chat/conversations/route.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { status: 400 });
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user1:users!conversations_user1_id_fkey(user_id, name, profile_image),
        user2:users!conversations_user2_id_fkey(user_id, name, profile_image)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(conversations || []), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}