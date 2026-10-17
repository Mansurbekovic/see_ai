'use client';

import { useState, useCallback, useEffect } from 'react';

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (query: string = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const url = query
        ? `/api/conversations?q=${encodeURIComponent(query)}`
        : '/api/conversations';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Suhbatlarni yuklab bo‘lmadi');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/conversations');
        if (!res.ok) throw new Error('Suhbatlarni yuklab bo‘lmadi');
        const data = await res.json();
        if (!ignore) {
          setConversations(data.conversations || []);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('O‘chirib bo‘lmadi');
      setConversations((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error('Nomini o‘zgartirib bo‘lmadi');
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    deleteConversation,
    renameConversation,
    setConversations,
  };
}
