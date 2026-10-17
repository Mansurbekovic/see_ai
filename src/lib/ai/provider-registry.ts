import type { AIProvider, ModelInfo } from './types';
import { geminiProvider } from './providers/gemini';
import { anthropicProvider } from './providers/anthropic';

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();

  constructor() {
    this.register(geminiProvider);
    this.register(anthropicProvider);
  }

  register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  getAvailable(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getAvailableModels(): ModelInfo[] {
    const models: ModelInfo[] = [];
    for (const provider of this.providers.values()) {
      if (typeof provider.getModels === 'function') {
        models.push(...provider.getModels());
      } else if (Array.isArray(provider.models)) {
        models.push(...provider.models);
      }
    }
    return models;
  }
}

export const providerRegistry = new ProviderRegistry();
