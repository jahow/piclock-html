import * as naturalEarthCoastlines from '../webradios/ne_50m_coastline.json';
import * as naturalEarthBoundariesLand from '../webradios/ne_50m_admin_0_boundary_lines_land.json';
import * as webRadios from '../webradios/webradios.json';
import { DOT_MUTED, DOT_ON, getDotColor } from '../matrix.js';
import { getLatitudeLongitude } from './utils/location.js';

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

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function projectPoint(context, lon, lat) {
  const radius = 300;
  const centerLonRad = toRad(centerLon);
  const centerLatRad = toRad(centerLat);
  const latRad = toRad(lat);
  const lonRad = toRad(lon);
  // compute xyz of point on sphere
  const pX = Math.cos(latRad) * Math.cos(lonRad - Math.PI / 2);
  const pY = Math.cos(latRad) * Math.sin(lonRad - Math.PI / 2);
  const pZ = Math.sin(latRad);
  const cosAlpha = Math.cos(-centerLonRad);
  const sinAlpha = Math.sin(-centerLonRad);
  const cosTheta = Math.cos(centerLatRad);
  const sinTheta = Math.sin(centerLatRad);

  // general 3d rotation matrix from https://en.wikipedia.org/wiki/Rotation_matrix
  // X_rotated =
  //   cosAlpha * cosBeta * X +
  //   (cosAlpha * sinBeta * sinTheta - sinAlpha * cosTheta) * Y +
  //   (cosAlpha * sinBeta * cosTheta + sinAlpha * sinTheta) * Z;
  // Y_rotated =
  //   sinAlpha * cosBeta * X +
  //   (sinAlpha * sinBeta * sinTheta + cosAlpha * cosTheta) * Y +
  //   (sinAlpha * sinBeta * cosTheta - cosAlpha * sinTheta) * Z;
  // R_rotated = -sinBeta * X + cosBeta * sinTheta * Y + cosBeta * cosTheta * Z;

  // rotate around X
  const pXa = cosAlpha * pX + -sinAlpha * pY;
  const pYa = sinAlpha * pX + cosAlpha * pY;
  const pZa = pZ;
  // rotate around Z
  const pXb = pXa;
  const pYb = cosTheta * pYa - sinTheta * pZa;
  const pZb = sinTheta * pYa + cosTheta * pZa;

  if (pYb > 0) {
    return [NaN, NaN];
  }

  return [
    pXb * radius + context.canvas.width / 2,
    context.canvas.height / 2 - pZb * radius,
  ];

  // const theta = angleLon;
  // const phi =
  //   -toRad(lat) +
  //   toRad(centerLat) +
  //   (Math.PI / 2 - toRad(lat)) * Math.cos(angleLon);
  // // const phi = angleLat;
  //
  // const x = Math.cos(phi) * radius * Math.sin(theta);
  // const y = Math.sin(phi) * radius;
  // return [x + context.canvas.width / 2, context.canvas.height / 2 - y];
}

function drawLine(context, coordinates) {
  context.beginPath();
  let first = true;
  for (let j = 0; j < coordinates.length; j++) {
    const [lon, lat] = coordinates[j];
    const [x, y] = projectPoint(context, lon, lat);
    if (isNaN(x) || isNaN(y)) {
      if (!first) {
        context.stroke();
        first = true;
      }
      continue;
    }
    if (first) {
      context.moveTo(x, y);
      first = false;
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
