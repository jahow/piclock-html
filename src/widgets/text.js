import { getSymbolChainValue, getSymbolChainWidth } from './utils/symbols';
import { clockSymbols, textSymbols } from './utils/symbols.definitions';
import { getValue } from './utils/misc';

const FILL = 1;
const OUTLINE = 0.15;

/**
 * @param {VariableNumber} baseX
 * @param {VariableNumber} baseY
 * @param {string} text
 * @param {boolean} [outline]
 * @return {Widget}
 */
export function textWidget(baseX, baseY, text, outline) {
  const chars = text.toUpperCase().split('');

  return {
    render(x, y) {
      const baseXValue = getValue(baseX);
      const baseYValue = getValue(baseY);
      const value = getSymbolChainValue(
        textSymbols,
        chars,
        1,
        x - baseXValue,
        y - baseYValue
      );
      const outlineValue = outline
        ? getSymbolChainValue(
            textSymbols,
            chars,
            1,
            x - baseXValue - 1,
            y - baseYValue
          ) +
          getSymbolChainValue(
            textSymbols,
            chars,
            1,
            x - baseXValue + 1,
            y - baseYValue
          ) +
          getSymbolChainValue(
            textSymbols,
            chars,
            1,
            x - baseXValue,
            y - baseYValue - 1
          ) +
          getSymbolChainValue(
            textSymbols,
            chars,
            1,
            x - baseXValue,
            y - baseYValue + 1
          ) +
          getSymbolChainValue(
            textSymbols,
            chars,
            1,
            x - baseXValue - 1,
            y - baseYValue - 1
          ) +
          getSymbolChainValue(
            textSymbols,
            chars,
            1,
            x - baseXValue + 1,
            y - baseYValue - 1
          ) +
          getSymbolChainValue(
            textSymbols,
            chars,
            1,
            x - baseXValue + 1,
            y - baseYValue + 1
          ) +
          getSymbolChainValue(
            textSymbols,
            chars,
            1,
            x - baseXValue - 1,
            y - baseYValue + 1
          )
        : 0;
      return value > 0 ? FILL : outlineValue > 0 ? OUTLINE : 0;
    },
    update() {},
    extent() {
      return {
        minX: getValue(baseX),
        minY: getValue(baseY),
        maxX: getValue(baseX) + getSymbolChainWidth(textSymbols, chars, 1),
        maxY: getValue(baseY) + textSymbols.height,
      };
    },
  };
}
