"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const chatService = {
  async getAllUsers(currentUserId, searchQuery = "", limit = 20) {
    try {
      console.log("👥 Getting all users for chat search");
      
      let query = supabase
        .from('users')
        .select('user_id, name, profile_image, bio, email, is_online, last_seen')
        .neq('user_id', currentUserId) 
        .order('name', { ascending: true });

      // Add search filter if provided
      if (searchQuery && searchQuery.trim() !== "") {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error("❌ Error getting users:", error);
        return { success: false, error: error.message, users: [] };
      }

      // Format users with online status
      const users = data.map(user => ({
        id: user.user_id,
        user_id: user.user_id,
        name: user.name,
        profile_image: user.profile_image || "/default-avatar.png",
        bio: user.bio || "",
        email: user.email,
        online: user.is_online || false,
        lastSeen: this.formatLastSeen(user.last_seen)
      }));

      return { success: true, users };
    } catch (error) {
      console.error("❌ Exception getting users:", error);
      return { success: false, error: error.message, users: [] };
    }
  },

  // ✅ Get users you're following + have chatted with
  async getChatUsers(currentUserId, searchQuery = "") {
    try {
      console.log("💬 Getting chat users for:", currentUserId);
      
      if (!currentUserId) {
        return { success: false, error: "User ID is required", users: [] };
      }

      // Get users you're following
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUserId);

      if (followingError) {
        console.error("❌ Error getting following:", followingError);
        return { success: false, error: followingError.message, users: [] };
      }

      const followingIds = followingData?.map(f => f.following_id) || [];

      // Get users you've chatted with
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

      if (convError) {
        console.error("❌ Error getting conversations:", convError);
        return { success: false, error: convError.message, users: [] };
      }

      const chatUserIds = conversationData?.flatMap(conv => 
        conv.user1_id === currentUserId ? [conv.user2_id] : [conv.user1_id]
      ) || [];

      // Combine and deduplicate user IDs
      const allUserIds = [...new Set([...followingIds, ...chatUserIds])];
      
      // If no users, return empty
      if (allUserIds.length === 0) {
        return { success: true, users: [] };
      }

      // Get user details
      let userQuery = supabase
        .from('users')
        .select('user_id, name, profile_image, bio, email, is_online, last_seen')
        .in('user_id', allUserIds);

      // Add search filter if provided
      if (searchQuery && searchQuery.trim() !== "") {
        userQuery = userQuery.or(`name.ilike.%${searchQuery}%`);
      }

      const { data: usersData, error: usersError } = await userQuery;

      if (usersError) {
        console.error("❌ Error getting user details:", usersError);
        return { success: false, error: usersError.message, users: [] };
      }

      // Format users
      const users = usersData.map(user => ({
        id: user.user_id,
        user_id: user.user_id,
        name: user.name,
        profile_image: user.profile_image || "/default-avatar.png",
        bio: user.bio || "",
        email: user.email,
        online: user.is_online || false,
        lastSeen: this.formatLastSeen(user.last_seen)
      }));

      return { success: true, users };
    } catch (error) {
      console.error("❌ Exception getting chat users:", error);
      return { success: false, error: error.message, users: [] };
    }
  },

  // ✅ Helper: Format last seen time
  formatLastSeen(timestamp) {
    if (!timestamp) return "never";
    
    try {
      const lastSeen = new Date(timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastSeen) / (1000 * 60));
      
      if (diffMinutes < 1) return "just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    } catch (error) {
      return "recently";
    }
  },

  // ✅ Start new conversation with user
  async startNewConversation(currentUserId, otherUserId) {
    try {
      console.log("🆕 Starting conversation between:", currentUserId, otherUserId);
      
      const { success, conversation, error } = await this.getOrCreateConversation(currentUserId, otherUserId);
      
      if (!success) {
        return { success: false, error };
      }

      return { success: true, conversation };
    } catch (error) {
      console.error("❌ Exception starting conversation:", error);
      return { success: false, error: error.message };
    }
  },

  // ✅ Get or create conversation
  async getOrCreateConversation(user1Id, user2Id) {
    try {
      console.log("💬 Getting/creating conversation between:", user1Id, user2Id);
      
      if (!user1Id || !user2Id) {
        return { success: false, error: "Both user IDs are required" };
      }

      // Ensure user1_id < user2_id for consistency
      const [u1, u2] = [user1Id, user2Id].sort();
      
      // Check if conversation exists
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user1_id', u1)
        .eq('user2_id', u2)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("❌ Error checking conversation:", checkError);
        return { success: false, error: checkError.message };
      }

      // If conversation exists, return it
      if (existingConv) {
        return { success: true, conversation: existingConv };
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: u1,
          user2_id: u2,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error("❌ Error creating conversation:", createError);
        return { success: false, error: createError.message };
      }

      console.log("✅ Created new conversation:", newConv.id);
      return { success: true, conversation: newConv };
    } catch (error) {
      console.error("❌ Exception in getOrCreateConversation:", error);
      return { success: false, error: error.message };
    }
  },

  // ✅ Get user's conversations
  async getUserConversations(userId) {
    try {
      console.log("💬 Getting conversations for user:", userId);
      
      if (!userId) {
        return { success: false, error: "User ID is required", conversations: [] };
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          last_message_at,
          created_at,
          user1:users!conversations_user1_id_fkey (
            user_id,
            name,
            profile_image,
            bio,
            email,
            is_online,
            last_seen
          ),
          user2:users!conversations_user2_id_fkey (
            user_id,
            name,
            profile_image,
            bio,
            email,
            is_online,
            last_seen
          ),
          messages:messages!messages_conversation_id_fkey (
            id,
            message_text,
            sender_id,
            read,
            delivered,
            created_at
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error("❌ Error getting conversations:", error);
        return { success: false, error: error.message, conversations: [] };
      }

      // Format conversations
      const conversations = data.map(conv => {
        const isUser1 = conv.user1_id === userId;
        const otherUser = isUser1 ? conv.user2 : conv.user1;
        
        // Get last message
        const messages = conv.messages || [];
        const lastMessage = messages.length > 0 
          ? messages[messages.length - 1] 
          : null;

        return {
          id: conv.id,
          conversation_id: conv.id,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
          last_message_at: conv.last_message_at,
          created_at: conv.created_at,
          otherUser: {
            id: otherUser?.user_id,
            user_id: otherUser?.user_id,
            name: otherUser?.name || "Unknown User",
            profile_image: otherUser?.profile_image || "/default-avatar.png",
            bio: otherUser?.bio || "",
            email: otherUser?.email || "",
            online: otherUser?.is_online || false,
            lastSeen: otherUser?.last_seen ? this.formatLastSeen(otherUser.last_seen) : "never"
          },
          lastMessage: lastMessage ? {
            text: lastMessage.message_text,
            senderId: lastMessage.sender_id,
            timestamp: lastMessage.created_at,
            read: lastMessage.read,
            delivered: lastMessage.delivered
          } : null,
          unreadCount: messages.filter(msg => 
            !msg.read && msg.sender_id !== userId
          ).length
        };
      });

      return { success: true, conversations };
    } catch (error) {
      console.error("❌ Exception getting conversations:", error);
      return { success: false, error: error.message, conversations: [] };
    }
  },

  // ✅ Get messages for conversation
  async getMessages(conversationId, limit = 100) {
    try {
      console.log("📨 Getting messages for conversation:", conversationId);
      
      if (!conversationId) {
        return { success: false, error: "Conversation ID required", messages: [] };
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error("❌ Error getting messages:", error);
        return { success: false, error: error.message, messages: [] };
      }

      return { success: true, messages: data || [] };
    } catch (error) {
      console.error("❌ Exception getting messages:", error);
      return { success: false, error: error.message, messages: [] };
    }
  },

  // ✅ Send message
  async sendMessage(conversationId, senderId, messageText) {
    try {
      console.log("📤 Sending message to conversation:", conversationId);
      
      if (!conversationId || !senderId || !messageText) {
        return { success: false, error: "Missing parameters" };
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: messageText,
          delivered: true,
          read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error sending message:", error);
        return { success: false, error: error.message };
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { success: true, message: data };
    } catch (error) {
      console.error("❌ Exception sending message:", error);
      return { success: false, error: error.message };
    }
  },

  // ✅ Mark messages as read
  async markMessagesAsRead(conversationId, userId) {
    try {
      console.log("👁️ Marking messages as read:", conversationId);
      
      const { error } = await supabase
        .from('messages')
        .update({ 
          read: true,
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false);

      if (error) {
        console.error("❌ Error marking messages as read:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Exception marking messages as read:", error);
      return { success: false, error: error.message };
    }
  },

  
        // utils/chatService.js - Updated getUnreadCount function
  async getUnreadCount(userId) {
    try {
        console.log("🔔 Getting unread count for:", userId);
        
        if (!userId) {
        return { success: false, error: "User ID required", count: 0 };
        }

        // First, get all conversation IDs for this user
        const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        if (convError) {
        console.error("❌ Error getting conversations:", convError);
        return { success: false, error: convError.message, count: 0 };
        }

        if (!conversations || conversations.length === 0) {
        return { success: true, count: 0 };
        }

        // Extract conversation IDs
        const conversationIds = conversations.map(conv => conv.id);
        
        // Get unread messages count
        const { data, error } = await supabase
        .from('messages')
        .select('id')
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .eq('read', false);

        if (error) {
        console.error("❌ Error getting unread messages:", error);
        return { success: false, error: error.message, count: 0 };
        }

        return { success: true, count: data?.length || 0 };
    } catch (error) {
        console.error("❌ Exception getting unread count:", error);
        return { success: false, error: error.message, count: 0 };
    }
  },

//   // ✅ Get unread count
//   async getUnreadCount(userId) {
//     try {
//       console.log("🔔 Getting unread count for:", userId);
      
//       if (!userId) {
//         return { success: false, error: "User ID required", count: 0 };
//       }

//       const { data, error } = await supabase
//         .from('messages')
//         .select('id, conversation_id, sender_id, read')
//         .in('conversation_id', 
//           supabase
//             .from('conversations')
//             .select('id')
//             .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
//         )
//         .neq('sender_id', userId)
//         .eq('read', false);

//       if (error) {
//         console.error("❌ Error getting unread count:", error);
//         return { success: false, error: error.message, count: 0 };
//       }

//       return { success: true, count: data?.length || 0 };
//     } catch (error) {
//       console.error("❌ Exception getting unread count:", error);
//       return { success: false, error: error.message, count: 0 };
//     }
//   }
};