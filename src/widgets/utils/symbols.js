import { textSymbols } from './symbols.definitions.js';

/**
 * Extracts all unique symbols from a given string.
 * @param {string} text
 * @returns {Symbol[]} A set of symbols built from the string.
 */
export function getSymbolsFromString(text) {
  const symbols = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    if (textSymbols.symbols[char]) {
      symbols.push(textSymbols.symbols[char]);
    } else {
      symbols.push(textSymbols.symbols['?']);
    }
  }
  return symbols;
}
