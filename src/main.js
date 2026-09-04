import { addWidget } from './display.js';
import { clockWidget } from './widgets/clock.js';
import { daysWidget } from './widgets/days.js';
import { createButtonWidget } from './widgets/button.js';
import './display.js';
import { iconSymbols } from './widgets/utils/symbols.definitions.js';
import { getMatrix } from './matrix.js';

addWidget(clockWidget);
addWidget(daysWidget);
addWidget(createButtonWidget(2, 4, iconSymbols.symbols.radio, () => {}));
addWidget(
  createButtonWidget(
    getMatrix().width - 11,
    4,
    iconSymbols.symbols.alarm,
    () => {},
  ),
);
