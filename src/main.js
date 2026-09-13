import { addWidget, setPage } from './display.js';
import { clockWidget } from './widgets/clock.js';
import { daysWidget } from './widgets/days.js';
import { createButtonWidget } from './widgets/button.js';
import './display.js';
import { iconSymbols } from './widgets/utils/symbols.definitions.js';
import { getMatrix } from './matrix.js';
import {
  radioGlobeWidget,
  resetView,
  zoomIn,
  zoomOut,
} from './widgets/radio-globe.js';

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

// RADIO
addWidget(radioGlobeWidget, 'radio');
addWidget(
  createButtonWidget(2, 4, iconSymbols.symbols.ok, () => setPage('default')),
  'radio',
);
addWidget(
  createButtonWidget(2, 18, iconSymbols.symbols.plus, () => zoomIn(), true),
  'radio',
);
addWidget(
  createButtonWidget(2, 27, iconSymbols.symbols.minus, () => zoomOut(), true),
  'radio',
);
addWidget(
  createButtonWidget(
    2,
    36,
    iconSymbols.symbols.my_loc,
    () => resetView(),
    true,
  ),
  'radio',
);

// temp
setPage('radio');
