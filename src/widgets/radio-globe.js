import { getMatrix } from '../matrix.js';

const stream = 'http://195.150.20.242:8000/rmf_fm';

const audioEl = /** @type {HTMLAudioElement} */ (
  document.createElement('audio')
);
audioEl.src = stream;
// audioEl.play();

/**
 * @type {Widget}
 */
export const radioGlobeWidget = {
  render(context) {
    const matrix = getMatrix();
    matrix.clear();
    context.font = '18px sans-serif';
    context.fillStyle = 'hsl(47, 84%, 82%)';
    context.fillText('hello world', 100, 100);
  },
};
