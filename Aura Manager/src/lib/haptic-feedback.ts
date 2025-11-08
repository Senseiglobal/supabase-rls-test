// Haptic feedback patterns for different interaction types

export type HapticPattern = 'light' | 'medium' | 'strong' | 'success' | 'error' | 'warning';

const hapticPatterns: Record<HapticPattern, number | number[]> = {
  light: 10,           // Quick tap for navigation
  medium: 20,          // Standard interaction like FAB
  strong: [30, 20],    // Important actions or confirmations
  success: [10, 30, 10], // Success feedback
  error: [50, 30, 50], // Error feedback
  warning: [20, 40],   // Warning feedback
};

export const triggerHaptic = (pattern: HapticPattern = 'light') => {
  if (!('vibrate' in navigator)) {
    return;
  }

  try {
    const vibrationPattern = hapticPatterns[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    console.warn('Haptic feedback not supported:', error);
  }
};

// Helper functions for specific use cases
export const hapticFeedback = {
  navigation: () => triggerHaptic('light'),
  buttonPress: () => triggerHaptic('medium'),
  success: () => triggerHaptic('success'),
  error: () => triggerHaptic('error'),
  warning: () => triggerHaptic('warning'),
  important: () => triggerHaptic('strong'),
};
