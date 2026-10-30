import { textSymbols } from './symbols.definitions.js';

/**
 * Extracts symbol from a given character.
 * @param {string} text 1 char length string
 * @returns {Symbol} A set of symbols built from the string.
 */
export function getSymbolFromString(text) {
  const char = text[0].toUpperCase();
  if (textSymbols.symbols[char]) {
    return textSymbols.symbols[char];
  } else {
    return textSymbols.symbols['?'];
  }
}

/**
 * Extracts all unique symbols from a given string.
 * @param {string} text
 * @param {SymbolSet} [symbolSet]
 * @returns {Symbol[]} A set of symbols built from the string.
 */
export function getSymbolsFromString(text, symbolSet = textSymbols) {
  const symbols = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toUpperCase();
    if (symbolSet.symbols[char]) {
      symbols.push(symbolSet.symbols[char]);
    } else {
      symbols.push(symbolSet.symbols['?']);
    }
  }
  return symbols;
}

/**
 * @param {Symbol[]} symbols
 * @param {number} padding
 * @return {number}
 */
export function getSymbolChainWidth(symbols, padding = 1) {
  let width = 0;

  for (let i = 0, ii = symbols.length; i < ii; i++) {
    width += symbols[i].width;
    if (i < ii - 1) {
      width += padding;
    }
  }

  return width;
}
