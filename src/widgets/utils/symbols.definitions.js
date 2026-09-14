/**
 * @typedef {Object} Symbol
 * @property {number[]} dots 0 is empty, 1 is muted and 2 is on
 * @property {number} width
 * @property {number} height
 */

/**
 * @param {string[]} symbolAsStrings
 * @return {Symbol} symbols Symbol width is the first value
 */
function processSymbol(symbolAsStrings) {
  const symbolWidth = symbolAsStrings.reduce(
    (prev, curr) => Math.max(prev, curr.length),
    0,
  );
  const dots = symbolAsStrings.reduce((prev, curr) => {
    return [
      ...prev,
      ...curr
        .padEnd(symbolWidth, ' ')
        .split('')
        .map((char) => {
          if (char === ' ') return 0;
          if (char === '.') return 1;
          return 2;
        }),
    ];
  }, []);
  return {
    dots,
    width: symbolWidth,
    height: symbolAsStrings.length,
  };
}

/**
 * @typedef {Object} SymbolSet
 * @property {number} baseWidth
 * @property {number} height
 * @property {Object<string, Symbol>} symbols Symbol width is the first number here
 */

/** @type {SymbolSet} */
export const clockSymbols = {
  baseWidth: 9,
  height: 15,
  symbols: {
    0: processSymbol([
      ' .xxxxx. ',
      '.xxxxxxx.',
      'xxxxxxxxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxxxxxxxx',
      '.xxxxxxx.',
      ' .xxxxx. ',
    ]),
    1: processSymbol([
      '   xxxx. ',
      '   xxxxx.',
      '   xxxxxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
    ]),
    2: processSymbol([
      'xxxxxxx. ',
      'xxxxxxxx.',
      'xxxxxxxxx',
      '      xxx',
      '      xxx',
      '      xxx',
      ' .xxxxxxx',
      '.xxxxxxx.',
      'xxxxxxx. ',
      'xxx      ',
      'xxx      ',
      'xxx      ',
      'xxxxxxxxx',
      'xxxxxxxxx',
      '.xxxxxxxx',
    ]),
    3: processSymbol([
      'xxxxxxx. ',
      'xxxxxxxx.',
      'xxxxxxxxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '   xxxxxx',
      '   xxxxx.',
      '   xxxxxx',
      '      xxx',
      '      xxx',
      '      xxx',
      'xxxxxxxxx',
      'xxxxxxxx.',
      'xxxxxxx. ',
    ]),
    4: processSymbol([
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxxxxxxxx',
      'xxxxxxxxx',
      '.xxxxxxxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
    ]),
    5: processSymbol([
      '.xxxxxxxx',
      'xxxxxxxxx',
      'xxxxxxxxx',
      'xxx      ',
      'xxx      ',
      'xxx      ',
      'xxxxxxx. ',
      'xxxxxxxx.',
      '.xxxxxxxx',
      '      xxx',
      '      xxx',
      '      xxx',
      'xxxxxxxxx',
      'xxxxxxxx.',
      '.xxxxxx. ',
    ]),
    6: processSymbol([
      ' .xxxxx. ',
      '.xxxxxxx.',
      'xxxxxxxxx',
      'xxx      ',
      'xxx      ',
      'xxx      ',
      'xxxxxxx. ',
      'xxxxxxxx.',
      'xxxxxxxxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxxxxxxxx',
      '.xxxxxxx.',
      ' .xxxxx. ',
    ]),
    7: processSymbol([
      'xxxxxxxx.',
      'xxxxxxxxx',
      'xxxxxxxxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
      '      xxx',
    ]),
    8: processSymbol([
      ' .xxxxx. ',
      '.xxxxxxx.',
      'xxxxxxxxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxxxxxxxx',
      '.xxxxxxx.',
      'xxxxxxxxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxxxxxxxx',
      '.xxxxxxx.',
      ' .xxxxx. ',
    ]),
    9: processSymbol([
      ' .xxxxx. ',
      '.xxxxxxx.',
      'xxxxxxxxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxx   xxx',
      'xxxxxxxxx',
      '.xxxxxxxx',
      ' .xxxxxxx',
      '      xxx',
      '      xxx',
      '      xxx',
      'xxxxxxxxx',
      'xxxxxxxx.',
      '.xxxxxx. ',
    ]),
    ':': processSymbol([
      '   ',
      '   ',
      '   ',
      'xxx',
      'xxx',
      'xxx',
      '   ',
      '   ',
      '   ',
      'xxx',
      'xxx',
      'xxx',
      '   ',
      '   ',
      '   ',
    ]),
    ':(top)': processSymbol([
      '   ',
      '   ',
      '   ',
      '.x.',
      'xxx',
      '.x.',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
    ]),
    ':(bottom)': processSymbol([
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '   ',
      '.x.',
      'xxx',
      '.x.',
      '   ',
      '   ',
      '   ',
    ]),
  },
};

/** @type {SymbolSet} */
export const textSymbols = {
  baseWidth: 4,
  height: 6,
  symbols: {
    // prettier-ignore
    A: processSymbol([
      '    ',
      ' xx ',
      'x  x',
      'x  x',
      ' xxx',
      '    '
    ]),
    // prettier-ignore
    B: processSymbol([
      'x   ',
      'xxx ',
      'x  x',
      'x  x',
      ' xx ',
      '    '
    ]),
    // prettier-ignore
    C: processSymbol([
      '    ',
      ' xx ',
      'x   ',
      'x   ',
      ' xxx',
      '    '
    ]),
    // prettier-ignore
    D: processSymbol([
      '   x',
      ' xxx',
      'x  x',
      'x  x',
      ' xx ',
      '    '
    ]),
    // prettier-ignore
    E: processSymbol([
      '    ',
      ' xx ',
      'xxxx',
      'x   ',
      ' xxx',
      '    '
    ]),
    // prettier-ignore
    F: processSymbol([
      '  x',
      ' x ',
      'xxx',
      ' x ',
      ' x ',
      ' x '
    ]),
    // prettier-ignore
    G: processSymbol([
      '    ',
      ' xx ',
      'x  x',
      ' xxx',
      '   x',
      'xxx '
    ]),
    // prettier-ignore
    H: processSymbol([
      'x   ',
      'x   ',
      'xxx ',
      'x  x',
      'x  x',
      '    '
    ]),
    // prettier-ignore
    I: processSymbol([
      'x ',
      '  ',
      'x ',
      'x ',
      ' x',
      '   '
    ]),
    // prettier-ignore
    J: processSymbol([
      '  x',
      '   ',
      '  x',
      '  x',
      '  x',
      'xx '
    ]),
    // prettier-ignore
    K: processSymbol([
      'x  ',
      'x  ',
      'x x',
      'xx ',
      'x x',
      '   '
    ]),
    // prettier-ignore
    L: processSymbol([
      'x  ',
      'x  ',
      'x  ',
      'x  ',
      ' xx',
      '   '
    ]),
    // prettier-ignore
    M: processSymbol([
      '     ',
      'xx x ',
      'x x x',
      'x   x',
      'x   x',
      '     '
    ]),
    // prettier-ignore
    N: processSymbol([
      '    ',
      'x x ',
      'xx x',
      'x  x',
      'x  x',
      '    '
    ]),
    // prettier-ignore
    O: processSymbol([
      '    ',
      ' xx ',
      'x  x',
      'x  x',
      ' xx ',
      '    '
    ]),
    // prettier-ignore
    P: processSymbol([
      '    ',
      ' xx ',
      'x  x',
      'x  x',
      'xxx ',
      'x   '
    ]),
    // prettier-ignore
    Q: processSymbol([
      '    ',
      ' xx ',
      'x  x',
      'x  x',
      ' xxx',
      '   x'
    ]),
    // prettier-ignore
    R: processSymbol([
      '   ',
      'x x',
      'xx ',
      'x  ',
      'x  ',
      '   '
    ]),
    // prettier-ignore
    S: processSymbol([
      '    ',
      ' xx ',
      'xxx ',
      '   x',
      'xxx ',
      '    '
    ]),
    // prettier-ignore
    T: processSymbol([
      'x  ',
      'xx ',
      'x  ',
      'x  ',
      ' xx',
      '   '
    ]),
    // prettier-ignore
    U: processSymbol([
      '    ',
      'x  x',
      'x  x',
      'x  x',
      ' xxx',
      '    '
    ]),
    // prettier-ignore
    V: processSymbol([
      '    ',
      'x  x',
      'x  x',
      'x x ',
      ' x  ',
      '    '
    ]),
    // prettier-ignore
    W: processSymbol([
      '     ',
      'x   x',
      'x   x',
      'x x x',
      ' x x ',
      '     '
    ]),
    // prettier-ignore
    X: processSymbol([
      '    ',
      'x  x',
      ' xx ',
      ' xx ',
      'x  x',
      '    '
    ]),
    // prettier-ignore
    Y: processSymbol([
      '    ',
      'x  x',
      'x  x',
      ' xxx',
      '   x',
      ' xx '
    ]),
    // prettier-ignore
    Z: processSymbol([
      '    ',
      'xxxx',
      '  x ',
      ' x  ',
      'xxxx',
      '    '
    ]),
    // prettier-ignore
    0: processSymbol([
      ' xx ',
      'x  x',
      'x  x',
      'x  x',
      ' xx ',
      '    '
    ]),
    // prettier-ignore
    1: processSymbol([
      'xx',
      ' x',
      ' x',
      ' x',
      ' x',
      '  '
    ]),
    // prettier-ignore
    2: processSymbol([
      'xxx ',
      '   x',
      ' xx ',
      'x   ',
      'xxxx',
      '    '
    ]),
    // prettier-ignore
    3: processSymbol([
      'xxx ',
      '   x',
      '  xx',
      '   x',
      'xxx ',
      '    '
    ]),
    // prettier-ignore
    4: processSymbol([
      'x  x',
      'x  x',
      'xxxx',
      '   x',
      '   x',
      '    '
    ]),
    // prettier-ignore
    5: processSymbol([
      'xxxx',
      'x   ',
      'xxx ',
      '   x',
      'xxx ',
      '    '
    ]),
    // prettier-ignore
    6: processSymbol([
      ' xx ',
      'x   ',
      'xxx ',
      'x  x',
      ' xx ',
      '    '
    ]),
    // prettier-ignore
    7: processSymbol([
      'xxxx',
      '   x',
      '   x',
      '   x',
      '   x',
      '    '
    ]),
    // prettier-ignore
    8: processSymbol([
      ' xx ',
      'x  x',
      ' xx ',
      'x  x',
      ' xx ',
      '    '
    ]),
    // prettier-ignore
    9: processSymbol([
      ' xx ',
      'x  x',
      ' xxx',
      '   x',
      ' xx ',
      '    '
    ]),
    // prettier-ignore
    ' ': processSymbol([
      '    ',
      '    ',
      '    ',
      '    ',
      '    ',
      '    '
    ]),
    // prettier-ignore
    '%': processSymbol([
      '    ',
      'x  x',
      '  x ',
      ' x  ',
      'x  x',
      '    '
    ]),
    // prettier-ignore
    '°': processSymbol([
      ' x ',
      'x x',
      ' x ',
      '   ',
      '   ',
      '   '
    ]),
    // prettier-ignore
    '.': processSymbol([
      ' ',
      ' ',
      ' ',
      ' ',
      'x',
      ' '
    ]),
    // prettier-ignore
    '-': processSymbol([
      '  ',
      '  ',
      'xx',
      '  ',
      '  ',
      '  '
    ]),
    // prettier-ignore
    ':': processSymbol([
      ' ',
      ' ',
      'x',
      ' ',
      'x',
      ' '
    ]),
    // prettier-ignore
    '!': processSymbol([
      'x',
      'x',
      'x',
      ' ',
      'x',
      ' '
    ]),
    // prettier-ignore
    '?': processSymbol([
      'xx ',
      '  x',
      ' x ',
      '   ',
      ' x ',
      '   '
    ]),
  },
};

/** @type {SymbolSet} */
export const weatherSymbols = {
  baseWidth: 7,
  height: 7,
  symbols: {
    clear: processSymbol([
      '       ',
      '  xxx  ',
      ' x   x ',
      ' x   x ',
      ' x   x ',
      '  xxx  ',
      '       ',
    ]),
    cloud: processSymbol([
      '     x ',
      '    x x',
      ' xx  x ',
      'x  x   ',
      'x   x  ',
      ' xxx   ',
      '       ',
    ]),
    ['cloud+']: processSymbol([
      '       ',
      '   xx  ',
      ' xx  x ',
      'x  x  x',
      'x   xx ',
      ' xxx   ',
      '       ',
    ]),
    ['cloud++']: processSymbol([
      '       ',
      '   xx  ',
      ' xxxxx ',
      'x  xxxx',
      'x   xx ',
      ' xxx   ',
      '       ',
    ]),
    rain: processSymbol([
      '       ',
      '       ',
      '  x    ',
      ' x  x  ',
      '   x  x',
      '  x  x ',
      '       ',
    ]),
    ['rain+']: processSymbol([
      '       ',
      '  x  x ',
      ' x  x  ',
      'x  x  x',
      '  x  x ',
      ' x  x  ',
      '       ',
    ]),
    ['rain++']: processSymbol([
      '       ',
      '    x  ',
      '   x   ',
      '  xxx  ',
      '   x   ',
      '  x    ',
      '       ',
    ]),
    snow: processSymbol([
      '       ',
      ' x  x  ',
      'xxx    ',
      ' x   x ',
      '    xxx',
      '  x  x ',
      '       ',
    ]),
    mist: processSymbol([
      '       ',
      '       ',
      '  xx   ',
      '     xx',
      ' xx    ',
      '    xx ',
      '       ',
    ]),
    empty: processSymbol([
      '       ',
      '       ',
      '       ',
      ' x x x ',
      '       ',
      '       ',
      '       ',
    ]),
  },
};

/** @type {SymbolSet} */
export const iconSymbols = {
  baseWidth: 7,
  height: 7,
  symbols: {
    radio: processSymbol([
      '       ',
      '    .  ',
      '  xxx  ',
      ' x   x ',
      ' . . . ',
      '  ...  ',
      '       ',
    ]),
    alarm: processSymbol([
      '       ',
      '   .   ',
      '  ...  ',
      '  x.x  ',
      ' x   x ',
      '  ...  ',
      '       ',
    ]),
    leave_right: processSymbol([
      '       ',
      '  x    ',
      '  xx   ',
      '  xxx  ',
      '  ..   ',
      '  .    ',
      '       ',
    ]),
    ok: processSymbol([
      '       ',
      '       ',
      '     x ',
      ' x  x. ',
      ' ....  ',
      '  ..   ',
      '       ',
    ]),
    button: processSymbol([
      '  .x.  ',
      ' .   . ',
      '.     .',
      '.     .',
      '.     .',
      ' .   . ',
      '  ...  ',
    ]),
    buttonActive: processSymbol([
      '  xxx  ',
      ' x...x ',
      'x.....x',
      'x.....x',
      'x.....x',
      ' x...x ',
      '  xxx  ',
    ]),
    plus: processSymbol([
      '       ',
      '       ',
      '   X   ',
      '  ...  ',
      '   .   ',
      '       ',
      '       ',
    ]),
    minus: processSymbol([
      '       ',
      '       ',
      '       ',
      '  .x.  ',
      '       ',
      '       ',
      '       ',
    ]),
    my_loc: processSymbol([
      '       ',
      '       ',
      '   x   ',
      '  . .  ',
      '   .   ',
      '       ',
      '       ',
    ]),
    play: processSymbol([
      '       ',
      ' xx    ',
      ' xxx   ',
      ' x...  ',
      ' ...   ',
      ' ..    ',
      '       ',
    ]),
    pause: processSymbol([
      '       ',
      ' xx xx ',
      ' xx xx ',
      ' x. .x ',
      ' .. .. ',
      ' .. .. ',
      '       ',
    ]),
  },
};
/** @type {SymbolSet} */
export const largeIconSymbols = {
  baseWidth: 9,
  height: 9,
  symbols: {
    button: processSymbol([
      '  .xxx.  ',
      ' .     . ',
      '.       .',
      'x       x',
      'x       x',
      '.       .',
      '.       .',
      ' .     . ',
      '  .....  ',
    ]),
    buttonActive: processSymbol([
      '  xxxxx  ',
      ' x.....x ',
      'x.......x',
      'x.......x',
      'x.......x',
      'x.......x',
      'x.......x',
      ' x.....x ',
      '  xxxxx  ',
    ]),
  },
};
