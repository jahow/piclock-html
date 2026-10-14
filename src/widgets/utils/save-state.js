let currentState;

try {
  currentState = JSON.parse(localStorage.getItem('piclock-state')) ?? {};
} catch (e) {
  currentState = null;
  console.warn('saving state disabled, could not access local storage', e);
}

export function saveState(partialState) {
  if (currentState === null) {
    return; // cannot save state
  }
  currentState = { ...currentState, ...partialState };
  localStorage.setItem('piclock-state', JSON.stringify(currentState));
}

export function getState() {
  return currentState ?? {};
}
