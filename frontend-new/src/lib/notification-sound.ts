// Notification sound utility
const playNotificationSound = (volume: number = 0.5) => {
  // Create a simple notification sound using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, duration: number, delay: number, gain: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    const startTime = audioContext.currentTime + delay;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };
  
  // Play a pleasant two-tone notification sound with specified volume
  playTone(800, 0.15, 0, volume * 0.3);
  playTone(600, 0.15, 0.1, volume * 0.3);
};

export const notificationSound = {
  play: playNotificationSound
};
