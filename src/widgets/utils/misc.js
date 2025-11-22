/**
 * @param {VariableNumber} variableNumber
 * @return {number}
 */
export function getValue(variableNumber) {
  return Math.round(
    typeof variableNumber === 'number'
      ? variableNumber
      : variableNumber(Date.now())
  );
}
