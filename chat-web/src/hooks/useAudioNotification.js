import { useRef, useEffect } from 'react';

const useAudioNotification = (shouldPlay) => {
  const audioRef = useRef(null);
  const userInteracted = useRef(false);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3'); // Make sure to add a notification.mp3 to your public folder
    audioRef.current.load();

    // Handle user interaction
    const handleUserInteraction = () => {
      if (!userInteracted.current) {
        userInteracted.current = true;
        // Prime the audio element by playing and immediately pausing
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }).catch(error => {
            console.log('Audio priming failed:', error);
          });
        }
      }
    };

    // Add event listeners for first user interaction
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Play sound when shouldPlay is true
  useEffect(() => {
    if (shouldPlay && userInteracted.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Playback failed:', error);
        });
      }
    }
  }, [shouldPlay]);

  return audioRef;
};

export default useAudioNotification;
