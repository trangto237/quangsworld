/** Listening questions use on-device speech synthesis, so they work offline. */
export function speak(text: string, rate = 0.92): boolean {
  if (typeof speechSynthesis === 'undefined') return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB';
  u.rate = rate;
  const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('en-GB')) ?? speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'));
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
  return true;
}

export const stopSpeaking = () => typeof speechSynthesis !== 'undefined' && speechSynthesis.cancel();

/**
 * Reads a listening script aloud, giving each speaker a different voice (or pitch, if the device
 * has only one English voice). Calls `onEnd` when the whole script has been read.
 */
export function speakScript(lines: { who: string; text: string }[], onEnd?: () => void, rate = 0.95): boolean {
  if (typeof speechSynthesis === 'undefined') return false;
  speechSynthesis.cancel();
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  const speakers = [...new Set(lines.map((l) => l.who))];
  lines.forEach((line, i) => {
    const u = new SpeechSynthesisUtterance(line.text);
    const k = speakers.indexOf(line.who);
    u.lang = 'en-GB';
    u.rate = rate;
    if (voices.length > 1) u.voice = voices[k % voices.length];
    else u.pitch = [1, 1.35, 0.8][k % 3];
    if (i === lines.length - 1 && onEnd) u.onend = () => onEnd();
    speechSynthesis.speak(u);
  });
  return true;
}

/** Plays a question's audio: a multi-voice script if it has one, otherwise its single audio line. */
export function playQuestionAudio(q: { audio?: string; script?: { who: string; text: string }[] }, onEnd?: () => void) {
  if (q.script?.length) return speakScript(q.script, onEnd);
  if (q.audio) return speak(q.audio);
  return false;
}
