import {
  DOT_DAWN,
  DOT_NIGHT,
  DOT_ON,
  getDotColor,
  getMatrix,
} from '../matrix.js';
import { iconSymbols } from './utils/symbols.definitions.js';

const audioEl = /** @type {HTMLAudioElement} */ (
  document.createElement('audio')
);
let currentRadio = null;

let isPlaying = true;
function setPlaying(playing) {
  isPlaying = playing;
  if (playing && currentRadio && currentRadio.url_resolved) {
    audioEl.src = currentRadio.url_resolved;
    audioEl.play();
  }
  if (!playing) {
    audioEl.pause();
  }
}
export function getIsPlaying() {
  return isPlaying;
}

export function setCurrentRadio(radio) {
  const urlChanged = currentRadio?.url_resolved !== radio?.url_resolved;
  currentRadio = radio;
  if (!radio || !radio.url_resolved) {
    setPlaying(false);
  } else if (urlChanged && isPlaying) {
    setPlaying(true);
  }
}

/**
 * @type {Widget}
 */
export const radioPlayerWidget = {
  render(context) {
    const matrix = getMatrix();

    const symbol = isPlaying
      ? iconSymbols.symbols.pause
      : iconSymbols.symbols.play;
    matrix.applySymbol(symbol, matrix.width - 9, matrix.height - 9);

    matrix.fillDots(24, matrix.height - 10, matrix.width - 26, 1, DOT_NIGHT);
    matrix.fillDots(24, matrix.height - 2, matrix.width - 26, 1, DOT_NIGHT);
    matrix.fillDots(matrix.width - 2, matrix.height - 9, 1, 7, DOT_NIGHT);

    // radio info
    if (!currentRadio) {
      return;
    }
    context.save();
    context.font = 'bold 24px sans-serif';
    context.fillStyle = getDotColor(DOT_ON);
    context.textAlign = 'right';
    const name = currentRadio.name || '...';
    context.fillText(
      name,
      matrix.getPixelFromDot(matrix.width - 9),
      matrix.getPixelFromDot(matrix.height - 6),
    );
    if (currentRadio.tags) {
      context.fillStyle = getDotColor(DOT_DAWN);
      context.font = 'bold 14px monospace';
      context.fillText(
        currentRadio.tags.toUpperCase(),
        matrix.getPixelFromDot(matrix.width - 9),
        matrix.getPixelFromDot(matrix.height - 3.5),
      );
    }
    context.restore();
  },

  pointerDown(context, x, y) {
    const matrix = getMatrix();
    if (
      matrix.hitTestDot(
        context,
        x,
        y,
        matrix.width - 8,
        matrix.height - 9,
        7,
        7,
      )
    ) {
      setPlaying(!isPlaying);
    }
  },

  pointerMove(context, x, y, prevX, prevY) {},

  pointerUp(context, x, y) {},
};
