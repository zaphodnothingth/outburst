// Web Audio API Sound Effects & Voice Announcer for Outburst!

class SoundManager {
  private isSoundEnabled: boolean = true;
  private isSpeechEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  constructor() {
    const soundPref = localStorage.getItem('outburst_sound_pref');
    this.isSoundEnabled = soundPref !== null ? soundPref === 'true' : true;

    const speechPref = localStorage.getItem('outburst_speech_pref');
    this.isSpeechEnabled = speechPref !== null ? speechPref === 'true' : false;
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
    localStorage.setItem('outburst_sound_pref', String(enabled));
  }

  getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  setSpeechEnabled(enabled: boolean) {
    this.isSpeechEnabled = enabled;
    localStorage.setItem('outburst_speech_pref', String(enabled));
  }

  getSpeechEnabled(): boolean {
    return this.isSpeechEnabled;
  }

  private playOscillator(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number = 0.12
  ) {
    this.initAudio();
    if (!this.isSoundEnabled || !this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Ignore audio errors
    }
  }

  // Target checked off (normal)
  playTargetHit(countSoFar: number = 1) {
    // Pitch climbs slightly as more targets are found!
    const baseFreq = 520 + countSoFar * 45;
    this.playOscillator(baseFreq, 'triangle', 0.14, 0.2);
    setTimeout(() => {
      this.playOscillator(baseFreq * 1.35, 'sine', 0.18, 0.16);
    }, 55);
  }

  // Bonus target checked off!
  playBonusHit() {
    const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playOscillator(f, 'triangle', 0.22, 0.22);
      }, idx * 65);
    });
  }

  // Target unchecked
  playTargetUndo() {
    this.playOscillator(320, 'sine', 0.12, 0.12);
  }

  // Timer tick (last 10 seconds)
  playTimerTick(urgent: boolean = false) {
    if (urgent) {
      this.playOscillator(880, 'square', 0.06, 0.12);
    } else {
      this.playOscillator(600, 'sine', 0.05, 0.08);
    }
  }

  // Time's Up Buzzer!
  playBuzzer() {
    this.initAudio();
    if (!this.isSoundEnabled || !this.audioCtx) return;

    this.playOscillator(150, 'sawtooth', 0.65, 0.25);
    setTimeout(() => {
      this.playOscillator(135, 'sawtooth', 0.65, 0.25);
    }, 100);
  }

  // All 10 cleared! (OUTBURST Sweep!)
  playOutburstSweep() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playOscillator(freq, 'triangle', 0.35, 0.22);
      }, index * 85);
    });
  }

  // Round start chime
  playRoundStart() {
    this.playOscillator(440, 'sine', 0.12, 0.15);
    setTimeout(() => {
      this.playOscillator(880, 'triangle', 0.3, 0.2);
    }, 110);
  }

  // Card passed/swapped
  playCardSwap() {
    this.playOscillator(400, 'sine', 0.1, 0.12);
    setTimeout(() => {
      this.playOscillator(500, 'sine', 0.12, 0.12);
    }, 80);
  }

  speak(text: string) {
    if (!this.isSpeechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.06;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find((v) => v.lang.startsWith('en-'));
      if (engVoice) utterance.voice = engVoice;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore TTS errors
    }
  }
}

export const sound = new SoundManager();
