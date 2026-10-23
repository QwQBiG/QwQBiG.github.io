// Match emoji sequences without treating plain arrows, numbers or copyright signs as emoji.
const pictograph = String.raw`\p{Extended_Pictographic}\uFE0F?\p{Emoji_Modifier}?`;
const plainSymbols = String.raw`[\u00A9\u00AE\u2122\u2194-\u2199\u21A9\u21AA\u2934\u2935\u2B05-\u2B07]`;
const emojiSequence = [
  String.raw`\u{1F3F4}[\u{E0020}-\u{E007E}]+\u{E007F}`,
  String.raw`[0-9#*]\uFE0F?\u20E3`,
  String.raw`\p{Regional_Indicator}{2}`,
  `${pictograph}(?:\\u200D${pictograph})+`,
  String.raw`(?:\p{Emoji_Presentation}(?!\uFE0E)|\p{Extended_Pictographic}\uFE0F)\uFE0F?\p{Emoji_Modifier}?`,
  String.raw`(?!${plainSymbols})\p{Extended_Pictographic}(?!\uFE0E)\uFE0F?\p{Emoji_Modifier}?`,
].join('|');

const emojiPattern = new RegExp(`(?:${emojiSequence})+`, 'gu');

export interface EmojiMatch {
  value: string;
  index: number;
}

export function findEmoji(text: string): EmojiMatch[] {
  return [...text.matchAll(emojiPattern)].map((match) => ({ value: match[0], index: match.index! }));
}

export function replaceEmoji(text: string, replacement = '[表情]'): string {
  return text.replace(emojiPattern, replacement);
}

// Used only for source validation; display text must never interpret user-written escapes.
export function decodeEmojiEscapes(text: string): string {
  const codePoint = (digits: string, radix: number, original: string) => {
    const value = Number.parseInt(digits, radix);
    return value <= 0x10ffff ? String.fromCodePoint(value) : original;
  };

  return text
    .replace(/&#(?:x([\da-f]+)|(\d+));?/gi, (original, hex: string, decimal: string) =>
      codePoint(hex || decimal, hex ? 16 : 10, original))
    .replace(/(?<!\\)((?:\\\\)*)\\u(?:\{([\da-f]{1,6})\}|([\da-f]{4}))/gi,
      (original, prefix: string, braced: string, fixed: string) =>
        prefix + codePoint(braced || fixed, 16, original.slice(prefix.length)));
}
