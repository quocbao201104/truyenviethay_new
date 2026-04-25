/**
 * Automatically formats chapter content if it lacks proper newlines.
 * Adds paragraph breaks after sentence endings only for compact single-line prose.
 */
export const formatChapterContent = (content: string): string => {
  if (!content) return "";

  // If content already contains newlines, assume it's properly formatted
  if (/\r?\n/.test(content)) {
    return content;
  }

  const sentenceEndings = new Set([".", "!", "?", "。", "！", "？"]);
  const closingMarks = new Set(['"', "'", "”", "’", "»", "」", "』", "）", ")", "]", "}"]);
  let formatted = "";

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    formatted += char;

    if (!sentenceEndings.has(char)) continue;

    const previous = content[i - 1] || "";
    const next = content[i + 1] || "";
    if (char === "." && /\d/.test(previous) && /\d/.test(next)) continue;

    while (i + 1 < content.length && closingMarks.has(content[i + 1])) {
      i += 1;
      formatted += content[i];
    }

    let nextIndex = i + 1;
    while (nextIndex < content.length && /\s/.test(content[nextIndex])) {
      nextIndex += 1;
    }

    if (nextIndex < content.length) {
      formatted = formatted.trimEnd() + "\n\n";
      i = nextIndex - 1;
    }
  }

  return formatted;
};
