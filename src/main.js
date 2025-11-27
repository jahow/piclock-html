import './display.js';
import { addWidget } from './display.js';
import { clockWidget } from './widgets/clock.js';
import { daysWidget } from './widgets/days.js';
import { DOT_DAWN, DOT_DAY, DOT_NIGHT, DOT_ON, getMatrix } from './matrix.js';

addWidget(clockWidget);
addWidget(daysWidget);
