/* ============================================================
   Звук. Всё синтезируется через WebAudio — ассетов нет,
   поэтому архив остаётся лёгким, а загрузка мгновенной.
   ============================================================ */

const Sfx = {
  ctx: null,
  enabled: true,

  /** Контекст создаётся только после первого жеста пользователя */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
  },

  setEnabled(on) {
    this.enabled = !!on;
  },

  _tone(freq, dur, type, gainPeak, delay) {
    if (!this.enabled || !this.ctx) return;
    const t0 = this.ctx.currentTime + (delay || 0);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },

  slide() {
    this._tone(180, 0.06, 'sine', 0.05);
  },

  /** Тон растёт вместе с номиналом объекта — слияния звучат «крупнее» */
  merge(value) {
    const step = Math.min(Math.log2(value) - 2, 10);
    this._tone(300 + step * 52, 0.13, 'triangle', 0.09);
    this._tone(600 + step * 104, 0.09, 'sine', 0.035, 0.02);
  },

  discovery() {
    this._tone(523.25, 0.15, 'triangle', 0.08);
    this._tone(659.25, 0.15, 'triangle', 0.08, 0.09);
    this._tone(783.99, 0.28, 'triangle', 0.09, 0.18);
  },

  gameOver() {
    this._tone(240, 0.22, 'sine', 0.07);
    this._tone(160, 0.4, 'sine', 0.07, 0.14);
  },

  undo() {
    this._tone(420, 0.08, 'sine', 0.05);
    this._tone(300, 0.1, 'sine', 0.05, 0.05);
  }
};
