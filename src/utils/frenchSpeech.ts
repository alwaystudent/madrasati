export type SpeechSpeed = 'normal' | 'slow';

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Normalizes French text for Web Speech API synthesis so elisions and typographic
 * punctuation (e.g. `l'entraide`, `l’ entraide`, `d'abord`, `j'ai`, `c'est`)
 * are pronounced smoothly in liaison without TTS reading out "apostrophe" or "slash".
 */
export function normalizeFrenchTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText
    // Normalize typographic apostrophes/primes to ASCII apostrophe
    .replace(/[\u2018\u2019\u201B\u02BC\u2032`]/g, "'")
    // Replace quotation marks and ellipses with natural pauses/spaces
    .replace(/[«»“”"„]/g, ' ')
    .replace(/…|\.{3,}/g, ', ')
    // Replace underscores/fill-blanks with a short pause
    .replace(/_+/g, ', ')
    // Replace slashes (e.g. "un / une" or "le/la") with a comma pause
    .replace(/\s*\/\s*/g, ', ');

  // Remove accidental whitespace right after French elision prefixes + apostrophe
  // e.g. "l’ entraide" -> "l'entraide"
  text = text.replace(
    /(^|[\s(\-—–,;:])(l|d|j|m|t|s|c|n|qu|jusqu|lorsqu|puisqu|presqu|quelqu)'\s+/gi,
    "$1$2'"
  );

  // High-frequency contractions whose exact French pronunciation benefits from phonetic respelling
  text = text
    .replace(/\baujourd'hui\b/gi, 'aujourdhui')
    .replace(/\bprud'hom/gi, 'prudhom')
    .replace(/\bquelqu'une\b/gi, 'quelquune')
    .replace(/\bquelqu'un\b/gi, 'quelqun')
    .replace(/\bc'est\b/gi, 'sait')
    .replace(/\bn'est\b/gi, 'nait')
    .replace(/\bs'est\b/gi, 'sait')
    .replace(/\bqu'est-ce\b/gi, 'quesse')
    .replace(/\bqu'est\b/gi, 'quait')
    .replace(/\bj'ai\b/gi, 'jé');

  // Join remaining French elisions (l'entraide -> lentraide, l'école -> lécole, d'abord -> dabord, etc.)
  text = text.replace(
    /(^|[\s(\-—–,;:])(l|d|j|m|t|s|c|n|qu|jusqu|lorsqu|puisqu|presqu|quelqu)'([a-zA-ZÀ-ÿœæŒÆ])/gi,
    '$1$2$3'
  );

  // Strip any leftover stray apostrophes between letters or isolated around words
  // so no TTS engine ever speaks the word "apostrophe"
  text = text
    .replace(/([a-zA-ZÀ-ÿœæŒÆ])'([a-zA-ZÀ-ÿœæŒÆ])/g, '$1$2')
    .replace(/'+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

function pickFrenchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const frVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('fr'));
  if (!frVoices.length) return null;

  return (
    frVoices.find((v) => v.lang.toLowerCase() === 'fr-fr' && !v.localService) ??
    frVoices.find((v) => v.lang.toLowerCase() === 'fr-fr') ??
    frVoices.find((v) => v.lang.toLowerCase().startsWith('fr-')) ??
    frVoices[0]
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
  const clean = normalizeFrenchTextForSpeech(text);
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

