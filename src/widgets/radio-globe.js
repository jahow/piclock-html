import * as naturalEarthCoastlines from '../webradios/ne_50m_coastline.json';
import * as naturalEarthBoundariesLand from '../webradios/ne_50m_admin_0_boundary_lines_land.json';
import * as webRadios from '../webradios/webradios.json';
import { getLatitudeLongitude } from './utils/location.js';
import { DOT_MUTED, DOT_ON, getDotColor } from '../matrix.js';

const stream = 'http://195.150.20.242:8000/rmf_fm';

console.log(webRadios.features[0]);

const audioEl = /** @type {HTMLAudioElement} */ (
  document.createElement('audio')
);
audioEl.src = stream;
// audioEl.play();

let centerLon = 0;
let centerLat = 0;
let panning = false;

getLatitudeLongitude().then(([lat, lon]) => {
  centerLat = lat;
  centerLon = lon;
});

function projectPoint(context, lon, lat) {
  const x = (lon - centerLon) * 4 + context.canvas.width / 2;
  const y = (centerLat - lat) * 4 + context.canvas.height / 2;
  return [x, y];
}

function drawLine(context, coordinates) {
  context.beginPath();
  for (let j = 0; j < coordinates.length; j++) {
    // for (let j = coordinates.length - 1; j >= 0; j--) {
    const [lon, lat] = coordinates[j];
    const [x, y] = projectPoint(context, lon, lat);
    if (j === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();
}

function drawMultiLine(context, coordinates) {
  for (let i = 0; i < coordinates.length; i++) {
    drawLine(context, coordinates[i]);
  }
}

function drawFeatureCollection(context, collection) {
  for (let i = 0; i < collection.features.length; i++) {
    const feature = collection.features[i];
    if (feature.geometry.type === 'LineString') {
      drawLine(context, feature.geometry.coordinates);
    } else if (feature.geometry.type === 'MultiLineString') {
      // console.log('drawing multiline');
      drawMultiLine(context, feature.geometry.coordinates);
    } else {
      console.log('could not draw that');
    }
  }
}

/**
 * @type {Widget}
 */
export const radioGlobeWidget = {
  render(context) {
    // const matrix = getMatrix();
    // matrix.clear();
    // context.font = '18px sans-serif';
    // context.fillStyle = 'hsl(47, 84%, 82%)';
    // context.fillText('hello world', 100, 100);
    context.strokeStyle = getDotColor(DOT_ON);
    context.lineWidth = 1;
    drawFeatureCollection(context, naturalEarthCoastlines);
    context.strokeStyle = getDotColor(DOT_MUTED);
    context.lineWidth = 1;
    drawFeatureCollection(context, naturalEarthBoundariesLand);
  },

  pointerDown(context, x, y) {
    panning = true;
  },

  pointerMove(context, x, y, prevX, prevY) {
    if (!panning) {
      return;
    }
    centerLon += (prevX - x) / 4;
    centerLat += (y - prevY) / 4;
    if (centerLon < -180) {
      centerLon += 360;
    } else if (centerLon > 180) {
      centerLon -= 360;
    }
    centerLat = Math.min(90, Math.max(-90, centerLat));
  },

  pointerUp(context, x, y) {
    panning = false;
  },
};
