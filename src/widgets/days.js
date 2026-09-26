import * as SunCalc from 'suncalc';
import {
  DOT_DAWN,
  DOT_DAY,
  DOT_MUTED,
  DOT_NIGHT,
  DOT_OFF,
  DOT_ON,
  DOT_OVERLAY,
  DOT_SPACING_PX,
  getDotColor,
  getMatrix,
} from '../matrix.js';
import { getSymbolChainWidth, getSymbolsFromString } from './utils/symbols.js';
import { weatherSymbols } from './utils/symbols.definitions.js';
import { getEventsOnDate, refreshEvents } from './utils/events.js';
import { getLatitudeLongitude } from './utils/location.js';
import { getForecast, refreshWeatherForecast } from './utils/weather.js';
import { getRatioOfTimeInDay } from './utils/misc.js';

const CURRENT_DAY_WIDTH_DOTS = 48;
const OTHER_DAY_WIDTH_DOTS = 24;
const DAY_HEIGHT_DOTS = 15;
const PADDING_DOTS = 1;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const DAYS_RENDERED = 6;

const WEEKDAY_NAMES = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

function getTodayTime() {
  return Math.floor(new Date().getTime() / DAY_IN_MS) * DAY_IN_MS;
}

let currentDay = null;
const sunriseTimes = new Array(DAYS_RENDERED);

async function recomputeSunriseTimes() {
  const todayTime = getTodayTime();
  if (currentDay === todayTime) {
    return;
  }

  currentDay = todayTime;
  const latLon = await getLatitudeLongitude();

  for (let i = 0; i < DAYS_RENDERED; i++) {
    sunriseTimes[i] = SunCalc.getTimes(
      currentDay + DAY_IN_MS * 0.5 + i * DAY_IN_MS,
      latLon[0],
      latLon[1],
    );
  }
}

let dragging = false;
let dragShiftPx = 0;

/**
 * @type {Widget}
 */
export const daysWidget = {
  render(context) {
    recomputeSunriseTimes();
    refreshWeatherForecast();
    refreshEvents();

    if (!dragging) {
      dragShiftPx -= dragShiftPx * 0.3;
      if (Math.abs(dragShiftPx) < 2) {
        dragShiftPx = 0;
      }
    }

    const matrix = getMatrix();

    matrix.fillDots(0, 18, matrix.width, DAY_HEIGHT_DOTS + 6, DOT_OFF);

    const today = new Date();
    const ratioDayAdvancement = getRatioOfTimeInDay(today);
    let currentDotX =
      Math.round(matrix.width / 2) -
      Math.round(CURRENT_DAY_WIDTH_DOTS * ratioDayAdvancement) +
      matrix.getDotFromPixel(dragShiftPx);
    const currentDotY = 24;

    for (let i = 0; i < DAYS_RENDERED; i++) {
      const currentDate = new Date(today.getTime() + i * DAY_IN_MS);

      const dayWidth = i === 0 ? CURRENT_DAY_WIDTH_DOTS : OTHER_DAY_WIDTH_DOTS;
      if (sunriseTimes[i]) {
        this.renderDayBlock(
          currentDotX,
          currentDotY,
          dayWidth,
          context,
          i === 0 ? ratioDayAdvancement : -1,
          sunriseTimes[i],
        );
      }
      const dayName = WEEKDAY_NAMES[currentDate.getDay()];
      const dayDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const dayNameSymbols = getSymbolsFromString(dayName);
      matrix.applySymbolChain(
        dayNameSymbols,
        currentDotX,
        currentDotY - 6,
        undefined,
        i === 0 ? DOT_ON : DOT_MUTED,
      );
      if (i === 0) {
        const dateSymbols = getSymbolsFromString(dayDate);
        matrix.applySymbolChain(
          dateSymbols,
          currentDotX + dayWidth - getSymbolChainWidth(dateSymbols) - 3,
          currentDotY - 6,
        );
      }

      // 3 weather points per day
      this.renderDayWeather(currentDotX, currentDotY, dayWidth, i);

      const events = getEventsOnDate(currentDate);
      this.renderDayAppointments(
        currentDotX,
        currentDotY,
        dayWidth,
        context,
        currentDate,
        events,
        i === 0,
      );

      currentDotX += dayWidth + PADDING_DOTS;
    }
  },

  /**
   * @param {number} baseX
   * @param {number} baseY
   * @param {number} dayWidth
   * @param {CanvasRenderingContext2D} context
   * @param {number} dayAdvancementRatio
   * @param {Object} sunriseTimes
   */
  renderDayBlock(
    baseX,
    baseY,
    dayWidth,
    context,
    dayAdvancementRatio,
    sunriseTimes,
  ) {
    const matrix = getMatrix();

    const nightEndRow = Math.round(
      dayWidth * getRatioOfTimeInDay(sunriseTimes.nightEnd),
    );
    const nightStartRow = Math.round(
      dayWidth * getRatioOfTimeInDay(sunriseTimes.night),
    );
    const sunriseRow = Math.round(
      dayWidth * getRatioOfTimeInDay(sunriseTimes.sunrise),
    );
    const sunsetRow = Math.round(
      dayWidth * getRatioOfTimeInDay(sunriseTimes.sunset),
    );

    for (let i = 0; i < dayWidth; i++) {
      for (let j = 0; j < DAY_HEIGHT_DOTS; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === dayWidth - 1 && j === 0) ||
          (i === 0 && j === DAY_HEIGHT_DOTS - 1) ||
          (i === dayWidth - 1 && j === DAY_HEIGHT_DOTS - 1)
        ) {
          continue; // skip corners
        }
        let dotValue = DOT_DAY;
        if (i <= nightEndRow || i >= nightStartRow) {
          dotValue = DOT_NIGHT;
        } else if (i <= sunriseRow || i >= sunsetRow) {
          dotValue = DOT_DAWN;
        }
        matrix.setDotValue(baseX + i, baseY + j, dotValue);
      }
    }

    if (dayAdvancementRatio < 0) {
      return;
    }

    // current time indicator
    const baseCoords = matrix.getPixelFromDotPosition(
      context,
      baseX + dayWidth * dayAdvancementRatio,
      baseY,
    );
    // baseCoords[0] += Math.floor(DOT_SIZE_PX / 2 - DOT_SPACING_PX / 2);
    baseCoords[1] += Math.floor(-DOT_SPACING_PX / 2);
    context.strokeStyle = getDotColor(DOT_NIGHT);
    context.lineWidth = 3;
    context.setLineDash([]);
    const dayHeightPx = matrix.getPixelFromDot(DAY_HEIGHT_DOTS);
    context.beginPath();
    context.moveTo(baseCoords[0], baseCoords[1] + dayHeightPx);
    context.lineTo(baseCoords[0], baseCoords[1] + dayHeightPx + 100);
    context.closePath();
    context.stroke();
    context.strokeStyle = getDotColor(DOT_DAY);
    context.setLineDash([4, 16]);
    context.stroke();
    context.setLineDash([]);
  },

  /**
   * @param {number} baseX
   * @param {number} baseY
   * @param {number} dayWidth
   * @param {number} dayIndex
   */
  renderDayWeather(baseX, baseY, dayWidth, dayIndex) {
    const dayForecast = getForecast(dayIndex);

    const matrix = getMatrix();
    const weatherDotY = baseY + 1;
    const weatherIconWidth = weatherSymbols.baseWidth;
    const weatherIconShift = Math.round(weatherIconWidth / 2);

    const shownForecasts = dayWidth > 40 ? [0, 1, 2] : [1];
    const weatherIconCount = shownForecasts.length;
    const weatherDotXOffset = Math.round(dayWidth / weatherIconCount / 2);

    for (let i = 0; i < weatherIconCount; i++) {
      const forecast = dayForecast?.[shownForecasts[i]] ?? ['empty', null];
      const weather = forecast[0];
      const temp = forecast[1] !== null ? forecast[1].toFixed(0) : '';
      const tempSymbols = getSymbolsFromString(temp);

      const symbolX = baseX + weatherDotXOffset * (1 + i * 2) + 1;
      matrix.applySymbol(
        weatherSymbols.symbols[weather],
        symbolX - weatherIconShift,
        weatherDotY,
        false,
      );
      const tempSymbolsShift = Math.round(getSymbolChainWidth(tempSymbols) / 2);
      matrix.applySymbolChain(
        tempSymbols,
        symbolX - tempSymbolsShift - 1,
        weatherDotY + 8,
        false,
      );
    }
  },

  renderDayAppointments(
    baseX,
    baseY,
    dayWidth,
    context,
    currentDateStart,
    events,
    showEventTime,
  ) {
    const matrix = getMatrix();
    const dayWidthPx = matrix.getPixelFromDot(dayWidth);
    const eventsOrigin = matrix.getPixelFromDotPosition(
      context,
      baseX,
      baseY + 17,
    );
    const now = Date.now();
    for (let i = 0; i < events.length; i++) {
      const eventOriginX = eventsOrigin[0];
      const eventOriginY = eventsOrigin[1] + 20 * i - 5;
      const event = events[i];
      const isInPast = event.end < now;
      const isOngoing = event.end >= now && event.start <= now;
      const eventStartPx = event.startDayRatio * dayWidthPx;
      const eventEndPx = event.endDayRatio * dayWidthPx;
      context.fillStyle = isOngoing
        ? getDotColor(DOT_OVERLAY)
        : getDotColor(DOT_ON);
      context.font = '18px sans-serif';
      const titleWidthPx = context.measureText(event.title).width;

      if (!showEventTime) {
        context.fillText(event.title, eventOriginX, eventOriginY);
        continue;
      }

      const textOriginX = eventOriginX + eventStartPx - 14 - titleWidthPx; // text on the left of the time bar
      context.fillText(event.title, textOriginX, eventOriginY);

      context.strokeStyle = isInPast
        ? getDotColor(DOT_DAWN)
        : isOngoing
          ? getDotColor(DOT_OVERLAY)
          : getDotColor(DOT_ON);
      context.lineWidth = 2.5;
      context.beginPath();
      context.arc(
        eventOriginX + eventStartPx,
        eventOriginY - 6,
        5,
        0,
        2 * Math.PI,
      );
      context.moveTo(eventOriginX + eventStartPx - 6, eventOriginY - 6);
      context.lineTo(eventOriginX + eventStartPx + 6, eventOriginY - 6);
      if (event.endDayRatio > event.startDayRatio) {
        context.arc(
          eventOriginX + eventEndPx,
          eventOriginY - 6,
          5,
          0,
          2 * Math.PI,
        );
      }
      context.closePath();
      context.stroke();

      const diffStart = event.start - now;
      if (diffStart > 0 && diffStart < 60 * 60 * 1000) {
        context.font = '14px monospace';
        const minutesLeft = Math.ceil(diffStart / (60 * 1000));
        const minutesLeftText = `${minutesLeft}mn`;
        const minutesLeftTextWidth = context.measureText(minutesLeftText).width;
        context.fillStyle = 'rgba(0,0,0,0.8)';
        // context.fillStyle = 'rgba(255,255,255,0.8)';
        context.beginPath();
        context.roundRect(
          eventOriginX + eventStartPx + 8,
          eventOriginY - 14,
          minutesLeftTextWidth + 8,
          16,
          4,
        );
        context.closePath();
        context.fill();
        context.fillStyle = getDotColor(DOT_OVERLAY);
        context.fillText(
          minutesLeftText,
          eventOriginX + eventStartPx + 12,
          eventOriginY - 2,
        );
      }
    }
  },

  pointerDown(context, x, y) {
    const dotPos = getMatrix().getDotPositionFromPixel(context, x, y);
    if (dotPos[1] < 18) {
      return;
    }
    dragging = true;
  },

  pointerMove(context, x, y, prevX, prevY) {
    if (!dragging) {
      return;
    }
    dragShiftPx += x - prevX;
  },

  pointerUp(context, x, y) {
    dragging = false;
  },
};
