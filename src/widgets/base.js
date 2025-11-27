/**
 * @typedef {number|function(delta: number): number} VariableNumber
 */

/**
 * @typedef {Object} Widget
 * @property {function(context: CanvasRenderingContext2D): void} render
 * @property {function(context: CanvasRenderingContext2D, pointerX: number, pointerY: number): void} [pointerDown]
 * @property {function(context: CanvasRenderingContext2D, pointerX: number, pointerY: number): void} [pointerUp]
 * @property {function(context: CanvasRenderingContext2D, pointerX: number, pointerY: number, previousPointX: number, previousPointY: number): void} [pointerMove]
 */
