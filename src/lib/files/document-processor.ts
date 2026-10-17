export async function processFileContent(
  buffer: Buffer,
  mimeType: string,
  filename: string,
  maxChars: number = 50_000
): Promise<{ text: string; truncated: boolean }> {
  // Plain text formats: .txt, .md, source code, json
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/javascript' ||
    filename.endsWith('.md') ||
    filename.endsWith('.ts') ||
    filename.endsWith('.tsx') ||
    filename.endsWith('.js') ||
    filename.endsWith('.py') ||
    filename.endsWith('.json') ||
    filename.endsWith('.txt')
  ) {
    const rawText = buffer.toString('utf-8');
    const truncated = rawText.length > maxChars;
    return {
      text: rawText.slice(0, maxChars),
      truncated,
    };
  }

  // Fallback for binary / unsupported document formats
  return {
    text: `[File attached: ${filename} (${mimeType}, ${buffer.length} bytes)]`,
    truncated: false,
  };
}
