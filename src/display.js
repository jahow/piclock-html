import { createMatrix, getMatrix } from './matrix.js';

const PIXEL_RATIO = 1;

const canvas = document.createElement('canvas');
canvas.width = document.documentElement.clientWidth * PIXEL_RATIO;
canvas.height = document.documentElement.clientHeight * PIXEL_RATIO;
canvas.style.width = canvas.width / PIXEL_RATIO + 'px';
canvas.style.height = canvas.height / PIXEL_RATIO + 'px';
canvas.style.imageRendering = 'pixelated';
document.body.appendChild(canvas);

const fps = document.createElement('div');
fps.style.backgroundColor = 'black';
fps.style.color = 'white';
fps.style.fontFamily = 'monospace';
fps.style.position = 'absolute';
fps.style.top = '0';
fps.style.left = '0';

document.body.appendChild(fps);

/** @type {Widget[]} */
const widgets = [];

/**
 * @param {Widget} widget
 */
export function addWidget(widget) {
  widgets.push(widget);
}

let lastTime = Date.now();

const context = canvas.getContext('2d');

const drawCanvas = document.createElement('canvas');
drawCanvas.width = canvas.width;
drawCanvas.height = canvas.height;
const drawContext = drawCanvas.getContext('2d');

const matrixCanvas = document.createElement('canvas');
matrixCanvas.width = canvas.width;
matrixCanvas.height = canvas.height;
const matrixContext = matrixCanvas.getContext('2d');

const blurCanvas = document.createElement('canvas');
blurCanvas.width = canvas.width * 0.2;
blurCanvas.height = canvas.height * 0.2;
const blurContext = blurCanvas.getContext('2d');

createMatrix(drawContext);

function render() {
  const now = Date.now();
  const delta = now - lastTime;
  lastTime = now;

  // widgets are drawn to a canvas on top of the dot matrix
  drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  for (let i = 0; i < widgets.length; i++) {
    const widget = widgets[i];
    widget.render(drawContext);
  }

  getMatrix().render(matrixContext);

  // cpy matrix and then the draw canvas on top
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(matrixCanvas, 0, 0);
  context.drawImage(drawCanvas, 0, 0);

  // apply blur
  blurContext.drawImage(
    matrixCanvas,
    0,
    0,
    blurCanvas.width,
    blurCanvas.height,
  );
  blurContext.drawImage(drawCanvas, 0, 0, blurCanvas.width, blurCanvas.height);
  context.globalCompositeOperation = 'screen';
  context.globalAlpha = 0.08;
  context.drawImage(blurCanvas, -4, 0, canvas.width, canvas.height);
  context.drawImage(blurCanvas, 4, 0, canvas.width, canvas.height);
  context.drawImage(blurCanvas, 0, -4, canvas.width, canvas.height);
  context.drawImage(blurCanvas, 0, 4, canvas.width, canvas.height);
  context.drawImage(blurCanvas, 4, -4, canvas.width, canvas.height);
  context.drawImage(blurCanvas, 4, 4, canvas.width, canvas.height);
  context.drawImage(blurCanvas, -4, -4, canvas.width, canvas.height);
  context.drawImage(blurCanvas, -4, 4, canvas.width, canvas.height);
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;

  // update fps
  fps.innerText = `${Math.round(1000 / delta).toFixed(0)} FPS`;

  requestAnimationFrame(render);
}

render();
