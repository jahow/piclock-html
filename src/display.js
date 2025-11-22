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

function render() {
  const now = Date.now();
  const delta = now - lastTime;
  lastTime = now;

  for (let i = 0; i < widgets.length; i++) {
    const widget = widgets[i];
    widget.render(context);
  }

  // update fps
  fps.innerText = `${Math.round(1000 / delta).toFixed(0)} FPS`;

  requestAnimationFrame(render);
}

render();
