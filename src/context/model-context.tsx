'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ModelInfo } from '@/lib/ai/types';

interface ModelContextType {
  models: ModelInfo[];
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  isLoading: boolean;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('see_ai_model') || 'gemini-2.5-flash';
    }
    return 'gemini-2.5-flash';
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.models && Array.isArray(data.models)) {
          setModels(data.models);
        }
      })
      .catch((err) => console.error('Error fetching models:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const setSelectedModel = (modelId: string) => {
    setSelectedModelState(modelId);
    try {
      localStorage.setItem('see_ai_model', modelId);
    } catch {
      // Ignore
    }
  };

  return (
    <ModelContext.Provider
      value={{
        models,
        selectedModel,
        setSelectedModel,
        isLoading,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}
