import type { AIMessage } from './types';

// Rough token estimation (1 token ≈ 4 chars for English)
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Estimate tokens for a single message including attachments
export function estimateMessageTokens(message: AIMessage): number {
  let count = estimateTokens(message.content || '');
  // Base message structure overhead (role, formatting tags)
  count += 4;

  if (message.attachments && message.attachments.length > 0) {
    for (const attachment of message.attachments) {
      if (attachment.type === 'image') {
        // High-resolution vision tokens typically average ~1000 tokens per image
        count += 1000;
      } else if (attachment.type === 'document') {
        // If document text or base64 data is present
        count += Math.max(estimateTokens(attachment.data || ''), 500);
      }
    }
  }

  return count;
}

// Estimate total tokens for a sequence of messages
export function estimateMessagesTokens(messages: AIMessage[]): number {
  return messages.reduce((total, msg) => total + estimateMessageTokens(msg), 0);
}

// Select messages that fit within the context window
export function selectMessages(
  messages: AIMessage[],
  maxTokens: number,
  reserveForOutput: number = 4096
): AIMessage[] {
  if (!messages || messages.length === 0) {
    return [];
  }

  const available = Math.max(maxTokens - reserveForOutput, 500);

  // If all messages already fit within the available budget, return all of them
  const totalTokens = estimateMessagesTokens(messages);
  if (totalTokens <= available) {
    return [...messages];
  }

  // If only one message exists, return it
  if (messages.length === 1) {
    return [messages[0]];
  }

  // Initial message often contains system/context setup or primary instruction
  const firstMessage = messages[0];
  const firstTokens = estimateMessageTokens(firstMessage);

  // If first message alone exceeds the entire budget, retain only the latest message
  if (firstTokens >= available) {
    return [messages[messages.length - 1]];
  }

  let remainingBudget = available - firstTokens;
  const recentMessages: AIMessage[] = [];

  // Work backwards from the most recent message up to index 1
  for (let i = messages.length - 1; i >= 1; i--) {
    const msg = messages[i];
    const msgTokens = estimateMessageTokens(msg);

    if (msgTokens <= remainingBudget) {
      recentMessages.unshift(msg);
      remainingBudget -= msgTokens;
    } else {
      // Reached budget limit
      break;
    }
  }

  // Ensure at least the latest message is included if possible
  if (recentMessages.length === 0) {
    return [firstMessage, messages[messages.length - 1]];
  }

  return [firstMessage, ...recentMessages];
}
