/**
 * Premium Wallpaper Tab - Web Audio Ambient Soundscape
 * Pure Vanilla JS Web Audio API synthesizer.
 * Generates relaxing ambient soundscapes without external MP3/WAV files.
 */

window.SoundscapeManager = {
  ctx: null,
  isPlaying: false,
  currentTrack: 'nature', // 'nature' | 'space' | 'tech'
  nodes: [],

  init() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return true;
  },

  toggle(trackType = 'nature') {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(trackType);
      return true;
    }
  },

  start(trackType) {
    if (!this.init()) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop(); // Clear any existing
    this.currentTrack = trackType || 'nature';
    this.isPlaying = true;

    try {
      if (this.currentTrack === 'space') {
        this.createCosmicDrone();
      } else if (this.currentTrack === 'technology') {
        this.createTechPulse();
      } else {
        this.createNatureBreeze();
      }
    } catch (e) {
      console.warn('Soundscape synth error:', e);
    }
  },

  stop() {
    this.nodes.forEach(n => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    this.nodes = [];
    this.isPlaying = false;
  },

  createNatureBreeze() {
    // Pink noise buffer with lowpass sweep for mountain wind
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.11;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    this.nodes.push(noise, filter, gain);
  },

  createCosmicDrone() {
    // Deep harmonic dual sinewaves
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, this.ctx.currentTime); // 108Hz cosmic hum

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(162, this.ctx.currentTime); // Perfect fifth harmonic

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    this.nodes.push(osc1, osc2, gain);
  },

  createTechPulse() {
    // Sub-bass warm pulse
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    this.nodes.push(osc, filter, gain);
  }
};
