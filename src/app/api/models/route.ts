import { providerRegistry } from '@/lib/ai/provider-registry';
import { isProviderConfigured } from '@/lib/configuration/env';

export async function GET() {
  const allModels = providerRegistry.getAvailableModels();

  // Filter models whose providers have API keys set
  const models = allModels.map((model) => {
    const isConfigured = isProviderConfigured(
      model.provider as 'gemini' | 'anthropic'
    );
    return {
      ...model,
      available: isConfigured,
      recommended: model.id === 'gemini-2.5-flash',
    };
  });

  return Response.json({ models });
}
