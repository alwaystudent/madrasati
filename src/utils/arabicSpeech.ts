export type ArabicSpeechSpeed = 'normal' | 'slow';

export function isArabicSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function stopArabicSpeech(): void {
  if (!isArabicSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore speech cancel errors
  }
}

export function speakArabicText(
  text: string,
  speed: ArabicSpeechSpeed = 'normal',
  onEnd?: () => void
): boolean {
  if (!isArabicSpeechSupported() || !text.trim()) {
    onEnd?.();
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const arabicVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith('ar-tn')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('ar-sa')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('ar'));

    if (arabicVoice) {
      utterance.voice = arabicVoice;
      utterance.lang = arabicVoice.lang;
    } else {
      utterance.lang = 'ar-SA';
    }

    utterance.rate = speed === 'slow' ? 0.78 : 0.96;
    utterance.pitch = 1.02;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    synth.speak(utterance);
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}
