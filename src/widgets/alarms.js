import {
  DOT_DAWN,
  DOT_DAY,
  DOT_MUTED,
  DOT_NIGHT,
  DOT_ON,
  DOT_OVERLAY,
  getMatrix,
} from '../matrix.js';
import { getRatioOfTimeInDay } from './utils/misc.js';
import { getSunriseTimes } from './utils/sunrise.js';
import { getSymbolFromString, getSymbolsFromString } from './utils/symbols.js';
import { smallDigitsSymbols } from './utils/symbols.definitions.js';
import { getState, saveState } from './utils/save-state.js';
import { getIsPlaying, play, stop } from './radio-player.js';

const DAY_HEIGHT_DOTS = 38;
const DAY_WIDTH_DOTS = 7;
const PADDING_DOTS = 2;

const DAY_LETTERS = ['l', 'm', 'm', 'j', 'v', 's', 'd'];

let dragging = false;
let draggingStartHeight = 0;
let draggingDayIndex = -1;

let checkHours = -1;
let checkMinutes = -1;

/**
 * @type {Array<null | [number, number, boolean]>}
 */
const alarmTimes = getState().alarmTimes ?? [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

let alarmStopTime = getState().alarmStopTime ?? -1;
function playAlarm() {
  play();
  alarmStopTime = Date.now() + 60 + 60 * 1000; // stop after 1 hour
  saveState({
    alarmStopTime,
  });
}

/**
 * @type {Widget}
 */
export const alarmsWidget = {
  render(context) {
    this.checkAlarmShouldPlay();

    if (!getSunriseTimes()) {
      return;
    }

    for (let i = 0; i < 7; i++) {
      this.renderDayBlock(
        4 + i * (DAY_WIDTH_DOTS + PADDING_DOTS),
        8,
        context,
        getSymbolFromString(DAY_LETTERS[i]),
        alarmTimes[i],
      );
    }
  },

  checkAlarmShouldPlay() {
    // an alarm is playing
    if (alarmStopTime > 0) {
      // the radio has been stopped elsewhere; clear the timeout
      if (!getIsPlaying()) {
        alarmStopTime = -1;
        saveState({
          alarmStopTime,
        });
        return;
      }

      if (Date.now() > alarmStopTime) {
        stop();
        alarmStopTime = -1;
        saveState({
          alarmStopTime,
        });
      }
      return;
    }
    const now = new Date();
    if (now.getHours() === checkHours && now.getMinutes() === checkMinutes) {
      return;
    }
    checkHours = now.getHours();
    checkMinutes = now.getMinutes();
    const dayIndex = (now.getDay() + 6) % 7; // convert to Monday=0, Sunday=6
    const alarmTime = alarmTimes[dayIndex];

    if (
      alarmTime &&
      alarmTime[2] === true &&
      alarmTime[0] === checkHours &&
      alarmTime[1] === checkMinutes
    ) {
      playAlarm();
    }
  },

  /**
   * @param {number} baseX
   * @param {number} baseY
   * @param {CanvasRenderingContext2D} context
   * @param {Symbol} symbol
   * @param {null | [number, number, boolean]} alarmTime
   */
  renderDayBlock(baseX, baseY, context, symbol, alarmTime = null) {
    const matrix = getMatrix();
    const sunriseTimes = getSunriseTimes();

    const nightEndRow = Math.round(
      DAY_HEIGHT_DOTS * getRatioOfTimeInDay(sunriseTimes.nightEnd),
    );
    const nightStartRow = Math.round(
      DAY_HEIGHT_DOTS * getRatioOfTimeInDay(sunriseTimes.night),
    );
    const sunriseRow = Math.round(
      DAY_HEIGHT_DOTS * getRatioOfTimeInDay(sunriseTimes.sunrise),
    );
    const sunsetRow = Math.round(
      DAY_HEIGHT_DOTS * getRatioOfTimeInDay(sunriseTimes.sunset),
    );

    let alarmTimeRow = -1;
    const alarmTimeEnabled = alarmTime && alarmTime[2] === true;
    if (alarmTime) {
      const [hour, minute] = alarmTime;
      const alarmTimeRatio = (hour * 60 + minute) / (24 * 60);
      alarmTimeRow = Math.floor(DAY_HEIGHT_DOTS * alarmTimeRatio);
    }

    for (let i = 0; i < DAY_WIDTH_DOTS; i++) {
      for (let j = 0; j < DAY_HEIGHT_DOTS; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === DAY_WIDTH_DOTS - 1 && j === 0) ||
          (i === 0 && j === DAY_HEIGHT_DOTS - 1) ||
          (i === DAY_WIDTH_DOTS - 1 && j === DAY_HEIGHT_DOTS - 1)
        ) {
          continue; // skip corners
        }
        let dotValue = DOT_DAY;

        if (alarmTimeRow === j && alarmTimeEnabled) {
          dotValue = DOT_OVERLAY;
        } else if (alarmTimeRow === j && !alarmTimeEnabled && i % 6 === 0) {
          dotValue = DOT_OVERLAY;
        } else if (j <= nightEndRow || j >= nightStartRow) {
          dotValue = DOT_NIGHT;
        } else if (j <= sunriseRow || j >= sunsetRow) {
          dotValue = DOT_DAWN;
        }
        matrix.setDotValue(baseX + i, baseY + j, dotValue);
      }
    }

    if (alarmTime && alarmTimeEnabled) {
      const [hour, minute, enabled] = alarmTime;
      const hourString = hour.toString().padStart(2, '0');
      const minuteString = minute.toString().padStart(2, '0');
      const above = DAY_HEIGHT_DOTS - alarmTimeRow < 14;
      matrix.applySymbolChain(
        getSymbolsFromString(hourString, smallDigitsSymbols),
        baseX,
        baseY + alarmTimeRow + 2 - (above ? 14 : 0),
        false,
        DOT_ON,
      );
      matrix.applySymbolChain(
        getSymbolsFromString(minuteString, smallDigitsSymbols),
        baseX,
        baseY + alarmTimeRow + 8 - (above ? 14 : 0),
        false,
        DOT_ON,
      );
    }

    // day name
    matrix.applySymbol(
      symbol,
      baseX + Math.floor(DAY_WIDTH_DOTS / 2 - symbol.width / 2),
      baseY - 6,
      false,
      alarmTime && alarmTimeEnabled ? DOT_ON : DOT_MUTED,
    );

    // matrix.applySymbol(
    //   textSymbols.symbols.delete,
    //   baseX + 1,
    //   baseY + 1 + DAY_HEIGHT_DOTS,
    //   false,
    //   DOT_WARNING,
    // );
  },

  setNewAlarmTime(pointerY) {
    const matrix = getMatrix();
    const baseY = 8;
    let newRatio =
      (pointerY - matrix.getPixelFromDot(baseY)) /
      matrix.getPixelFromDot(DAY_HEIGHT_DOTS);
    newRatio = Math.max(0, Math.min(0.9999, newRatio));
    const newHour = Math.floor(newRatio * 24);
    const newMinute = Math.floor(((newRatio * 24 - newHour) * 60) / 5) * 5;
    alarmTimes[draggingDayIndex] = [newHour, newMinute, true];
  },

  pointerDown(context, x, y) {
    const matrix = getMatrix();

    for (let i = 0; i < 7; i++) {
      const baseX = 4 + i * (DAY_WIDTH_DOTS + PADDING_DOTS);
      const baseY = 8;

      // toggle btn check
      const alarmTime = alarmTimes[i];
      if (
        alarmTime &&
        matrix.hitTestDot(context, x, y, baseX + 1, baseY - 6, 6, 6)
      ) {
        alarmTimes[i][2] = !alarmTimes[i][2];
        saveState({
          alarmTimes,
        });
        return;
      }

      // drag alarm time check
      if (
        matrix.hitTestDot(
          context,
          x,
          y,
          baseX,
          baseY,
          DAY_WIDTH_DOTS,
          DAY_HEIGHT_DOTS,
        )
      ) {
        dragging = true;
        //draggingStartHeight = (alarmTimes[i][0] * DAY_HEIGHT_DOTS) / 24;
        draggingDayIndex = i;
        this.setNewAlarmTime(y);
        return;
      }
    }
  },

  pointerMove(context, x, y, prevX, prevY) {
    if (!dragging) {
      return;
    }
    this.setNewAlarmTime(y);
  },

  pointerUp(context, x, y) {
    dragging = false;
    saveState({
      alarmTimes,
    });
  },
};
