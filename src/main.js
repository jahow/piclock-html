import { addWidget, setPage } from './display.js';
import { clockWidget } from './widgets/clock.js';
import { daysWidget } from './widgets/days.js';
import { createButtonWidget } from './widgets/button.js';
import './display.js';
import { iconSymbols } from './widgets/utils/symbols.definitions.js';
import { getMatrix } from './matrix.js';
import { radioGlobeWidget } from './widgets/radio-globe.js';

addWidget(clockWidget);
addWidget(daysWidget);
addWidget(
  createButtonWidget(2, 4, iconSymbols.symbols.radio, () => setPage('radio')),
);
addWidget(
  createButtonWidget(
    getMatrix().width - 11,
    4,
    iconSymbols.symbols.alarm,
    () => {},
  ),
);

addWidget(radioGlobeWidget, 'radio');
addWidget(
  createButtonWidget(2, 4, iconSymbols.symbols.ok, () => setPage('default')),
  'radio',
);

// temp
setPage('radio');
