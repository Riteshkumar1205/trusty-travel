import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  delivery_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface UseChatProps {
  deliveryId: string;
  currentUserId: string;
  otherUserId: string;
}

export const useChat = ({ deliveryId, currentUserId, otherUserId }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch existing messages
  const fetchMessages = useCallback(async () => {
    if (!deliveryId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('delivery_id', deliveryId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deliveryId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!deliveryId) return;

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages:${deliveryId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `delivery_id=eq.${deliveryId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          // Show notification if message is from other user
          if (newMessage.sender_id !== currentUserId) {
            toast('New message received', {
              description: newMessage.content.slice(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `delivery_id=eq.${deliveryId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deliveryId, currentUserId, fetchMessages]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string, messageType: string = 'text') => {
      if (!content.trim() || !deliveryId || !currentUserId || !otherUserId) return false;

      setIsSending(true);

      try {
        const { error } = await supabase.from('messages').insert({
          delivery_id: deliveryId,
          sender_id: currentUserId,
          receiver_id: otherUserId,
          content: content.trim(),
          message_type: messageType,
        });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [deliveryId, currentUserId, otherUserId]
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!deliveryId || !currentUserId) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('delivery_id', deliveryId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [deliveryId, currentUserId]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
};

export default useChat;
