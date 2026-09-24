import { useState, useEffect, useRef } from 'react';

export function useSpeechRecognition(options = {}) {
  const { lang = 'en-IN' } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSupported(false);
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript((prev) => prev + (prev && currentTranscript ? ' ' : '') + currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied.');
        } else if (event.error === 'no-speech') {
          setError('No speech detected.');
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const startListening = () => {
    setError(null);
    if (!supported) return;
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = () => {
    if (!supported) return;
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  const resetTranscript = () => setTranscript('');

  return {
    isListening,
    transcript,
    error,
    supported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  };
}

export default useSpeechRecognition;
