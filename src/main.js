import { addWidget } from './display.js';
import { clockWidget } from './widgets/clock.js';
import { daysWidget } from './widgets/days.js';
import { buttonRadioWidget } from './widgets/button_radio.js';
import { buttonAlarmWidget } from './widgets/button_alarm.js';
import './display.js';

addWidget(clockWidget);
addWidget(daysWidget);
addWidget(buttonRadioWidget);
addWidget(buttonAlarmWidget);
