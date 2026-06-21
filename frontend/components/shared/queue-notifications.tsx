'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BellRing, X } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

interface QueueNotification {
  id: string;
  token_number: number;
  status: string;
}

export function QueueNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<QueueNotification[]>([]);

  useEffect(() => {
    if (!user) return; // Only listen if logged in

    // Subscribe to changes on queue_tokens table
    const channel = supabase
      .channel('queue_notifications')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queue_tokens' },
        (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;

          // If status changed to 'in_consultation', notify
          if (newStatus === 'in_consultation' && oldStatus !== 'in_consultation') {
            const notif: QueueNotification = {
              id: payload.new.id,
              token_number: payload.new.token_number,
              status: newStatus,
            };

            setNotifications((prev) => [...prev, notif]);

            // Try to play audio alert
            try {
              const audio = new Audio('/bell.mp3');
              audio.play().catch(() => {
                // Ignore audio play errors (autoplay policies)
              });
            } catch (e) {
              // ignore
            }

            // Auto dismiss after 10s
            setTimeout(() => {
              setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
            }, 10000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="flex items-center gap-3 bg-slate-900 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 rounded-lg p-4 animate-in slide-in-from-right-8"
        >
          <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
            <BellRing className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Token Called!</p>
            <p className="text-xs text-slate-400">Token #{notif.token_number} is now in consultation.</p>
          </div>
          <button
            onClick={() => dismiss(notif.id)}
            className="ml-4 text-slate-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
