const DEBUG = false;

/**
 * @param {SymbolSet} set
 * @param {string} key
 * @return {number}
 */
export function getSymbolWidth(set, key) {
  // missing symbol: return checker pattern
  if (DEBUG && !(key in set.symbols)) {
    return Math.ceil(set.height / 2);
  }
  return set.symbols[key][0];
}

/**
 * @param {SymbolSet} set
 * @param {string} key
 * @param {number} col
 * @param {number} row
 * @return {number}
 */
export function getSymbolValue(set, key, col, row) {
  const width = getSymbolWidth(set, key);

  if (col < 0 || col >= width || row < 0 || row >= set.height) {
    return 0;
  }

  // missing symbol: return checker pattern
  if (DEBUG && !(key in set.symbols)) {
    return (col % 2 === 0 && row % 2 === 0) || (col % 2 === 1 && row % 2 === 1)
      ? 1
      : 0;
  }

  const symbol = set.symbols[key];
  return symbol[1 + col + row * width];
}

/**
 * @param {SymbolSet} set
 * @param {string[]} keys
 * @param {number} padding
 * @param {number} col
 * @param {number} row
 * @return {number}
 */
export function getSymbolChainValue(set, keys, padding, col, row) {
  let currCol = 0;
  let value = 0;

  for (let i = 0, ii = keys.length; i < ii; i++) {
    value += getSymbolValue(set, keys[i], col - currCol, row);
    currCol += getSymbolWidth(set, keys[i]) + padding;
  }

  return value;
}

/**
 * @param {SymbolSet} set
 * @param {string[]} keys
 * @param {number} padding
 * @return {number}
 */
export function getSymbolChainWidth(set, keys, padding) {
  let width = 0;

  for (let i = 0, ii = keys.length; i < ii; i++) {
    width += getSymbolWidth(set, keys[i]) + padding;
  }

  return width;
}
