export type SpeechSpeed = 'normal' | 'slow';

let currentUtterance: SpeechSynthesisUtterance | null = null;

function pickFrenchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  return (
    voices.find((v) => v.lang.toLowerCase() === 'fr-fr') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('fr-')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('fr')) ??
    null
  );
}

export function stopFrenchSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function speakFrenchText(
  text: string,
  options?: {
    speed?: SpeechSpeed;
    onStart?: () => void;
    onEnd?: () => void;
  }
): void {
  const clean = text.trim();
  if (!clean) {
    options?.onEnd?.();
    return;
  }

  const rate = options?.speed === 'slow' ? 0.68 : 0.92;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onStart?.();
    setTimeout(() => options?.onEnd?.(), 900);
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'fr-FR';
    utter.rate = rate;
    utter.pitch = 1.02;

    const frenchVoice = pickFrenchVoice();
    if (frenchVoice) {
      utter.voice = frenchVoice;
    }

    currentUtterance = utter;
    options?.onStart?.();

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (currentUtterance === utter) {
        currentUtterance = null;
      }
      options?.onEnd?.();
    };

    utter.onend = finish;
    utter.onerror = finish;

    window.speechSynthesis.speak(utter);

    // Safety fallback timeout in case browser speech engine hangs without firing onend
    const estimatedMs = Math.max(1500, clean.length * (options?.speed === 'slow' ? 120 : 85));
    setTimeout(finish, estimatedMs + 1500);
  } catch {
    options?.onStart?.();
    setTimeout(() => options?.onEnd?.(), 700);
  }
}
