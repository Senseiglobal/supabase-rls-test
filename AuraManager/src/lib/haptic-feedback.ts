export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }
};
