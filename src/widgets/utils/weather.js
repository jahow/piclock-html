import { getLatitudeLongitude } from './location.js';

const INTERVAL = 60 * 1000 * 15; // 15 minutes
const COUNT = 5;
const KEY = 'a48634ed18dac4fc58477ba9a2e9442c';

let lastCheckTime = -1;

/**
 * @typedef {[string, number]} SingleForecast
 */
/**
 * @typedef {[SingleForecast, SingleForecast, SingleForecast]} DayForecast
 */

/** @type {Array<null|[DayForecast]>} */
const forecasts = new Array(COUNT).fill(null);

export async function refreshWeatherForecast() {
  if (Date.now() < lastCheckTime + INTERVAL) return;

  lastCheckTime = Date.now();
  const [lat, lon] = await getLatitudeLongitude();

  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}`,
  )
    .then((resp) => resp.json())
    .then((resp) => {
      const date = new Date();

      // loop on forecast items to get weather at midday
      for (let j = 0; j < COUNT; j++) {
        const dayForecast = [
          ['empty', null],
          ['empty', null],
          ['empty', null],
        ];
        for (let i = 0; i < resp.list.length; i++) {
          const item = resp.list[i];
          const time = new Date(item.dt * 1000);
          if (time.getDay() !== (date.getDay() + j) % 7) {
            continue;
          }
          const forecastSlot = time.getUTCHours() / 6;
          if (forecastSlot !== 1 && forecastSlot !== 2 && forecastSlot !== 3) {
            continue;
          }
          const temp = Math.round(item.main.temp - 273.15);
          const icon = item.weather[0].icon.substring(0, 2);
          let weather = 'empty';
          switch (icon) {
            case '01':
              weather = 'clear';
              break;
            case '02':
              weather = 'cloud';
              break;
            case '03':
              weather = 'cloud+';
              break;
            case '04':
              weather = 'cloud++';
              break;
            case '09':
              weather = 'rain';
              break;
            case '10':
              weather = 'rain+';
              break;
            case '11':
              weather = 'rain++';
              break;
            case '13':
              weather = 'snow';
              break;
            case '50':
              weather = 'mist';
              break;
          }
          dayForecast[forecastSlot - 1] = [weather, temp];
        }
        forecasts[j] = dayForecast;
      }
    });
}

export function getForecast(dayIndex) {
  if (dayIndex < 0 || dayIndex >= COUNT) return null;
  return forecasts[dayIndex];
}
