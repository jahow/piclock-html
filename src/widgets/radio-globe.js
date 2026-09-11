import * as naturalEarthCoastlines from '../webradios/ne_50m_coastline.json';
import * as naturalEarthBoundariesLand from '../webradios/ne_50m_admin_0_boundary_lines_land.json';
import * as webRadios from '../webradios/webradios.json';
import {
  DOT_MUTED,
  DOT_OFF,
  DOT_ON,
  DOT_OVERLAY,
  getDotColor,
  getMatrix,
} from '../matrix.js';
import { getLatitudeLongitude } from './utils/location.js';

const stream = 'http://195.150.20.242:8000/rmf_fm';

const audioEl = /** @type {HTMLAudioElement} */ (
  document.createElement('audio')
);
audioEl.src = stream;
// audioEl.play();

let centerLon = 0;
let centerLat = 0;
let panDragLon = null;
let panDragLat = null;
let panning = false;

getLatitudeLongitude().then(([lat, lon]) => {
  centerLat = lat;
  centerLon = lon;
});

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}
function toDeg(radius) {
  return (radius * 180) / Math.PI;
}

let zoomLevel = 3;
let targetZoomLevel = zoomLevel;

export function zoomIn() {
  targetZoomLevel = Math.min(9, targetZoomLevel + 1);
}
export function zoomOut() {
  targetZoomLevel = Math.max(1, targetZoomLevel - 1);
}

function getRadius() {
  return 300 * Math.pow(2, zoomLevel - 1);
}

function projectPoint(context, lon, lat) {
  const radius = getRadius();
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
}

// this returns [lon, lat]
function unProjectPoint(context, x, y) {
  const radius = getRadius();
  const fromCenterXNormalized = (x - context.canvas.width / 2) / radius;
  const fromCenterYNormalized = (context.canvas.height / 2 - y) / radius;
  if (
    fromCenterXNormalized * fromCenterXNormalized +
      fromCenterYNormalized * fromCenterYNormalized >=
    1
  ) {
    return [NaN, NaN];
  }
  panning = true;
  let phi = Math.acos(fromCenterXNormalized);
  const theta = Math.acos(fromCenterYNormalized);
  const result = [
    centerLon - toDeg(phi - Math.PI / 2),
    centerLat + toDeg(Math.PI / 2 - theta),
  ];
  if (result[1] > 90) {
    result[1] = 180 - result[1];
    result[0] += 180;
  } else if (result[1] < -90) {
    result[1] = -180 - result[1];
    result[0] += 180;
  }
  if (result[0] > 180) {
    result[0] -= 360;
  } else if (result[0] < -180) {
    result[0] += 360;
  }
  return result;
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

function drawPoint(context, coordinates) {
  const [x, y] = projectPoint(context, ...coordinates);
  context.beginPath();
  context.arc(x, y, 3, 0, 2 * Math.PI);
  context.fill();
}

function drawCluster(context, coordinates, radiosCount) {
  const [x, y] = projectPoint(context, ...coordinates);
  const radius = 8 + 3 * Math.floor(Math.log10(radiosCount));
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fill();
  context.save();
  context.fillStyle = getDotColor(DOT_OFF);
  context.strokeStyle = getDotColor(DOT_OFF) + ' / 50%';
  context.strokeText(radiosCount.toString(), x, y + 5);
  context.fillText(radiosCount.toString(), x, y + 5);
  context.restore();
}

function drawFeatureCollection(context, collection) {
  for (let i = 0; i < collection.features.length; i++) {
    const feature = collection.features[i];
    if (feature.geometry.type === 'LineString') {
      drawLine(context, feature.geometry.coordinates);
    } else if (feature.geometry.type === 'MultiLineString') {
      drawMultiLine(context, feature.geometry.coordinates);
    } else if (
      feature.geometry.type === 'Point' &&
      feature.properties.radioCount
    ) {
      drawCluster(
        context,
        feature.geometry.coordinates,
        feature.properties.radioCount,
      );
    } else if (feature.geometry.type === 'Point') {
      drawPoint(context, feature.geometry.coordinates);
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
    // update zoom level
    zoomLevel += (targetZoomLevel - zoomLevel) * 0.2;

    // create clipped regions for buttons
    context.save();
    const matrix = getMatrix();
    context.beginPath();
    context.rect(0, 0, context.canvas.width, context.canvas.height);
    context.moveTo(200, 200);
    context.arc(
      matrix.getPixelFromDot(5.5),
      matrix.getPixelFromDot(30.5),
      matrix.getPixelFromDot(3.3),
      0,
      Math.PI * 2,
      true,
    );
    context.arc(
      matrix.getPixelFromDot(5.5),
      matrix.getPixelFromDot(21.5),
      matrix.getPixelFromDot(3.3),
      0,
      Math.PI * 2,
      true,
    );
    context.arc(
      matrix.getPixelFromDot(6.5),
      matrix.getPixelFromDot(8.5),
      matrix.getPixelFromDot(4.6),
      0,
      Math.PI * 2,
      true,
    );
    context.clip();

    context.font = 'bold 14px sans-serif';
    context.textAlign = 'center';
    context.strokeStyle = getDotColor(DOT_ON);
    context.lineWidth = 1;
    drawFeatureCollection(context, naturalEarthCoastlines);
    context.strokeStyle = getDotColor(DOT_MUTED);
    context.lineWidth = 1;
    drawFeatureCollection(context, naturalEarthBoundariesLand);
    context.fillStyle = getDotColor(DOT_OVERLAY);
    drawFeatureCollection(context, webRadios);

    if (panDragLat !== null && panDragLon !== null) {
      context.fillStyle = 'red';
      drawPoint(context, [panDragLon, panDragLat]);
    }

    context.restore();
  },

  pointerDown(context, x, y) {
    const [lon, lat] = unProjectPoint(context, x, y);
    if (isNaN(lon) || isNaN(lat)) {
      return;
    }
    panning = true;
    panDragLon = lon;
    panDragLat = lat;
    console.log('dragging', lon, lat);
  },

  pointerMove(context, x, y, prevX, prevY) {
    if (!panning) {
      return;
    }
    centerLon += (prevX - x) / 16;
    centerLat += (y - prevY) / 16;
    if (centerLon < -180) {
      centerLon += 360;
    } else if (centerLon > 180) {
      centerLon -= 360;
    }
    centerLat = Math.min(90, Math.max(-90, centerLat));
  },

  pointerUp(context, x, y) {
    panning = false;
    panDragLon = null;
    panDragLat = null;
  },
};
