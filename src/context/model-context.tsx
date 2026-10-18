'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ModelInfo } from '@/lib/ai/types';

export interface ExtendedModelInfo extends ModelInfo {
  available?: boolean;
  recommended?: boolean;
}

interface ModelContextType {
  models: ExtendedModelInfo[];
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  isLoading: boolean;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [models, setModels] = useState<ExtendedModelInfo[]>([]);
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
          // If the currently selected model is NOT available or unconfigured, auto-fallback to recommended or first available
          const availableModels = data.models.filter((m: ExtendedModelInfo) => m.available !== false);
          const isCurrentValid = availableModels.some((m: ExtendedModelInfo) => m.id === selectedModel);
          if (!isCurrentValid && availableModels.length > 0) {
            const fallback = availableModels.find((m: ExtendedModelInfo) => m.recommended)?.id || availableModels[0].id;
            setSelectedModelState(fallback);
            try {
              localStorage.setItem('see_ai_model', fallback);
            } catch {
              // Ignore
            }
          }
        }
      })
      .catch((err) => console.error('Error fetching models:', err))
      .finally(() => setIsLoading(false));
  }, [selectedModel]);

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
