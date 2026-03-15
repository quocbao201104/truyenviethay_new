/**
 * Automatically formats chapter content if it lacks proper newlines.
 * Replaces sentence endings followed by a space with the same ending plus two newlines.
 */
export const formatChapterContent = (content: string): string => {
  if (!content) return "";
  
  // If content already contains newlines, assume it's properly formatted
  if (content.includes("\n")) {
    return content;
  }

  // Auto-format: Replace .!?, followed by a space with the ending followed by two newlines
  return content.replace(/([.!?])\s/g, "$1\n\n");
};
