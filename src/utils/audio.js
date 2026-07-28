/**
 * Web Audio API synthesizer for a soft curtain sound effect.
 * Plays only when triggered by user interaction (Dark Mode toggle).
 */
export function playCurtainSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const duration = 1.2;

    // Buffer for soft velvet noise (simulates fabric friction)
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter for warm fabric rustle
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(320, ctx.currentTime);
    bandpass.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + duration);
    bandpass.Q.setValueAtTime(1.5, ctx.currentTime);

    // Warmth oscillator (low frequency resonance of curtain motion)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + duration);

    oscGain.gain.setValueAtTime(0.001, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    // Main envelope gain
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.001, ctx.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.25);
    mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    // Node connections
    noiseSource.connect(bandpass);
    bandpass.connect(mainGain);

    osc.connect(oscGain);
    oscGain.connect(mainGain);

    mainGain.connect(ctx.destination);

    // Start playback
    noiseSource.start(ctx.currentTime);
    osc.start(ctx.currentTime);

    noiseSource.stop(ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);

    setTimeout(() => {
      ctx.close();
    }, duration * 1000 + 100);
  } catch (err) {
    console.warn('Web Audio API unavailable or blocked:', err);
  }
}
