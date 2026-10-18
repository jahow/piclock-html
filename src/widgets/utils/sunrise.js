import * as SunCalc from 'suncalc';
import { getLatitudeLongitude } from './location.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getTodayTime() {
  return Math.floor(new Date().getTime() / DAY_IN_MS) * DAY_IN_MS;
}

let sunriseTimes = null;

async function computeSunriseTimes() {
  const todayTime = getTodayTime();
  const latLon = await getLatitudeLongitude();
  sunriseTimes = SunCalc.getTimes(todayTime, latLon[0], latLon[1]);
}
computeSunriseTimes();

export function getSunriseTimes() {
  return sunriseTimes;
}
