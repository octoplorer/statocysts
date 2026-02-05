/**
 * Escape special characters for Telegram MarkdownV2: _*[]()~`>#+-=|{}.!
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1')
}

/**
 * Escape special characters for HTML: &<>
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
