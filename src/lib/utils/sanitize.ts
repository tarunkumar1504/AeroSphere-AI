/**
 * Security & Input Sanitization Utilities
 * Guard against Prompt Injection (OWASP LLM01) and XSS (CWE-79)
 */

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags and their content
    .replace(/<[^>]*>?/gm, '')       // Strip any remaining HTML tags
    .replace(/[\x00-\x1f\x7f]/g, '') // Strip ASCII control characters
    .slice(0, maxLength)
    .trim();
}

export function sanitizePrompt(prompt: string, maxLength: number = 2000): string {
  if (!prompt) return '';
  return prompt
    .replace(/[\x00-\x1f\x7f]/g, '')
    // Prevent prompt jailbreak delimiters
    .replace(/(system prompt|ignore previous instructions|act as an unfiltered)/gi, '[blocked phrase]')
    .slice(0, maxLength)
    .trim();
}
