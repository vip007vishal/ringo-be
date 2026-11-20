/**
 * RINGO — Canvas Audio Waveform Engine
 * Interactive Studio Waveform Editor & Card Audio Visualizers.
 */

const RingoWaveform = (() => {

  /**
   * Draws a static or animated waveform for a sound card or player.
   */
  function drawCardWaveform(canvas, amplitudes, progress = 0, isPlaying = false, options = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const amps = Array.isArray(amplitudes) && amplitudes.length > 0
      ? amplitudes
      : [0.3, 0.5, 0.8, 0.95, 0.7, 0.4, 0.85, 1.0, 0.65, 0.45, 0.75, 0.9, 0.6, 0.35, 0.8];

    const totalBars = amps.length;
    const slotW = w / totalBars;
    const barWidth = Math.max(1.5 * dpr, slotW * 0.65);
    const offset = (slotW - barWidth) / 2;
    const activeColor = options.activeColor || '#B58AFF';
    const inactiveColor = options.inactiveColor || '#2C243C';

    for (let i = 0; i < totalBars; i++) {
      let amp = amps[i];
      // Micro-pulse animation when playing
      if (isPlaying) {
        const pulse = 1 + Math.sin(Date.now() / 250 + i * 0.4) * 0.12;
        amp = Math.min(1.0, amp * pulse);
      }

      const barHeight = Math.max(4 * dpr, h * 0.82 * amp);
      const x = i * slotW + offset;
      const y = (h - barHeight) / 2;
      const isPlayed = (i / totalBars) <= progress;

      ctx.fillStyle = isPlayed ? activeColor : inactiveColor;
      drawRoundedRect(ctx, x, y, barWidth, barHeight, barWidth / 2);
    }
  }

  /**
   * Interactive Studio Waveform Editor instance attached to a canvas container.
   */
  class StudioWaveformEditor {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.amplitudes = options.amplitudes || [];
      this.durationMs = options.durationMs || 30000;
      this.startRatio = options.startRatio || 0.0;
      this.endRatio = options.endRatio || 1.0;
      this.playheadRatio = options.playheadRatio || 0.0;
      this.zoomLevel = options.zoomLevel || 1.0;
      this.scrollOffsetRatio = options.scrollOffsetRatio || 0.0;
      this.minGapRatio = 0.02;

      this.onTrimChange = options.onTrimChange || null;
      this.onPlayheadSeek = options.onPlayheadSeek || null;
      this.onZoomChange = options.onZoomChange || null;

      this.activeDrag = null; // 'start', 'end', 'playhead', or 'pinch'
      this.dragStartX = 0;
      this.lastPinchDist = 0;

      // Prevent mobile touch gesture conflicts
      this.canvas.style.touchAction = 'none';

      this.initEvents();
      this.resize();
    }

    setAmplitudes(amps, durationMs) {
      this.amplitudes = amps;
      if (durationMs) this.durationMs = durationMs;
      this.draw();
    }

    setTrimBounds(startRatio, endRatio) {
      this.startRatio = Math.max(0, Math.min(1 - this.minGapRatio, startRatio));
      this.endRatio = Math.max(this.startRatio + this.minGapRatio, Math.min(1, endRatio));
      this.draw();
    }

    setPlayhead(ratio) {
      this.playheadRatio = Math.max(0, Math.min(1, ratio));
      this.draw();
    }

    setZoom(level, scrollRatio) {
      this.zoomLevel = Math.max(1, Math.min(10, level));
      if (typeof scrollRatio === 'number') {
        const viewSpan = 1 / this.zoomLevel;
        this.scrollOffsetRatio = Math.max(0, Math.min(1 - viewSpan, scrollRatio));
      }
      this.draw();
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const parentW = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect().width : 0;
      const effectiveW = rect.width > 0 ? rect.width : (parentW > 0 ? parentW - 24 : 320);
      const effectiveH = rect.height > 0 ? rect.height : 70;

      this.canvas.width = Math.round(effectiveW * dpr);
      this.canvas.height = Math.round(effectiveH * dpr);
      this.draw();
    }

    initEvents() {
      const getTouchPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        }
        const width = rect.width > 0 ? rect.width : (this.canvas.width / (window.devicePixelRatio || 1)) || 320;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
          width: width
        };
      };

      const handlePointerDown = (e) => {
        if (e.touches && e.touches.length === 2) {
          this.activeDrag = 'pinch';
          this.lastPinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          return;
        }

        const pos = getTouchPos(e);
        const width = pos.width;
        const viewSpan = 1 / this.zoomLevel;
        const viewStart = this.scrollOffsetRatio;

        const startScreenX = ((this.startRatio - viewStart) / viewSpan) * width;
        const endScreenX = ((this.endRatio - viewStart) / viewSpan) * width;
        const hitDistance = 36; // Generous 36px touch target for mobile fingertips

        const distStart = Math.abs(pos.x - startScreenX);
        const distEnd = Math.abs(pos.x - endScreenX);

        if (distStart <= hitDistance && distStart <= distEnd) {
          this.activeDrag = 'start';
        } else if (distEnd <= hitDistance) {
          this.activeDrag = 'end';
        } else if (pos.x < startScreenX) {
          // Tapped outside left of start handle -> reposition start handle immediately
          this.activeDrag = 'start';
          const ratio = Math.max(0, Math.min(this.endRatio - this.minGapRatio, viewStart + (pos.x / width) * viewSpan));
          this.startRatio = ratio;
          if (this.onTrimChange) this.onTrimChange(this.startRatio, this.endRatio);
          this.draw();
        } else if (pos.x > endScreenX) {
          // Tapped outside right of end handle -> reposition end handle immediately
          this.activeDrag = 'end';
          const ratio = Math.max(this.startRatio + this.minGapRatio, Math.min(1, viewStart + (pos.x / width) * viewSpan));
          this.endRatio = ratio;
          if (this.onTrimChange) this.onTrimChange(this.startRatio, this.endRatio);
          this.draw();
        } else {
          // Tapped inside the selection: if near either edge, drag handle; otherwise seek playhead
          const selWidth = endScreenX - startScreenX;
          if (distStart < distEnd && distStart < selWidth * 0.35) {
            this.activeDrag = 'start';
          } else if (distEnd < selWidth * 0.35) {
            this.activeDrag = 'end';
          } else {
            const ratio = (viewStart + (pos.x / width) * viewSpan);
            this.activeDrag = 'playhead';
            const clamped = Math.max(this.startRatio, Math.min(this.endRatio, ratio));
            this.setPlayhead(clamped);
            if (this.onPlayheadSeek) this.onPlayheadSeek(clamped);
          }
        }
      };

      const handlePointerMove = (e) => {
        if (!this.activeDrag) return;

        if (this.activeDrag === 'pinch' && e.touches && e.touches.length === 2) {
          const curDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (this.lastPinchDist > 0) {
            const factor = curDist / this.lastPinchDist;
            const newZoom = Math.max(1, Math.min(10, this.zoomLevel * factor));
            this.setZoom(newZoom);
            if (this.onZoomChange) this.onZoomChange(newZoom, this.scrollOffsetRatio);
          }
          this.lastPinchDist = curDist;
          return;
        }

        const pos = getTouchPos(e);
        const width = pos.width;
        const viewSpan = 1 / this.zoomLevel;
        const viewStart = this.scrollOffsetRatio;
        const currentRatio = Math.max(0, Math.min(1, viewStart + (pos.x / width) * viewSpan));

        if (this.activeDrag === 'start') {
          this.startRatio = Math.min(this.endRatio - this.minGapRatio, Math.max(0, currentRatio));
          if (this.onTrimChange) this.onTrimChange(this.startRatio, this.endRatio);
          this.draw();
        } else if (this.activeDrag === 'end') {
          this.endRatio = Math.max(this.startRatio + this.minGapRatio, Math.min(1, currentRatio));
          if (this.onTrimChange) this.onTrimChange(this.startRatio, this.endRatio);
          this.draw();
        } else if (this.activeDrag === 'playhead') {
          const clamped = Math.max(this.startRatio, Math.min(this.endRatio, currentRatio));
          this.setPlayhead(clamped);
          if (this.onPlayheadSeek) this.onPlayheadSeek(clamped);
        }
      };

      const handlePointerUp = () => {
        this.activeDrag = null;
        this.lastPinchDist = 0;
      };

      // Mouse Listeners
      this.canvas.addEventListener('mousedown', handlePointerDown);
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);

      // Touch Listeners: bind touchmove & touchend to window for uninterrupted edge-to-edge mobile dragging
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePointerDown(e);
      }, { passive: false });

      const onWindowTouchMove = (e) => {
        if (this.activeDrag) {
          if (e.cancelable) e.preventDefault();
          handlePointerMove(e);
        }
      };

      const onWindowTouchEnd = (e) => {
        if (this.activeDrag) {
          handlePointerUp(e);
        }
      };

      window.addEventListener('touchmove', onWindowTouchMove, { passive: false });
      window.addEventListener('touchend', onWindowTouchEnd);
      window.addEventListener('touchcancel', onWindowTouchEnd);
    }

    draw() {
      const ctx = this.ctx;
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const targetW = Math.round(rect.width * dpr);
        const targetH = Math.round(rect.height * dpr);
        if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
          this.canvas.width = targetW;
          this.canvas.height = targetH;
        }
      }

      const w = this.canvas.width;
      const h = this.canvas.height;
      if (w <= 0 || h <= 0) return;

      ctx.clearRect(0, 0, w, h);

      const viewSpan = 1 / this.zoomLevel;
      const viewStart = this.scrollOffsetRatio;
      const virtualWidth = w * this.zoomLevel;
      const originX = -viewStart * virtualWidth;

      const startX = ((this.startRatio - viewStart) / viewSpan) * w;
      const endX = ((this.endRatio - viewStart) / viewSpan) * w;
      const playheadX = ((this.playheadRatio - viewStart) / viewSpan) * w;

      const clampedSelStartX = Math.max(0, Math.min(w, startX));
      const clampedSelEndX = Math.max(clampedSelStartX, Math.min(w, endX));

      // 1. Dark dimmed regions outside selection
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      if (clampedSelStartX > 0) {
        ctx.fillRect(0, 0, clampedSelStartX, h);
      }
      if (clampedSelEndX < w) {
        ctx.fillRect(clampedSelEndX, 0, w - clampedSelEndX, h);
      }

      // 2. Selected Region Background Gradient
      if (clampedSelEndX > clampedSelStartX) {
        const selGrad = ctx.createLinearGradient(clampedSelStartX, 0, clampedSelEndX, 0);
        selGrad.addColorStop(0, 'rgba(139, 92, 246, 0.28)');
        selGrad.addColorStop(1, 'rgba(181, 138, 255, 0.22)');
        ctx.fillStyle = selGrad;
        ctx.fillRect(clampedSelStartX, 0, clampedSelEndX - clampedSelStartX, h);
      }

      // 3. Waveform Amplitudes Bars
      const amps = this.amplitudes.length > 0 ? this.amplitudes : RingoWaveform.defaultWaveform();
      const totalBars = amps.length;
      const slotW = virtualWidth / totalBars;
      const barW = Math.max(1.5 * dpr, Math.min(8 * dpr, slotW * 0.65));
      const barOffset = (slotW - barW) / 2;

      for (let i = 0; i < totalBars; i++) {
        const x = originX + i * slotW + barOffset;
        if (x + barW < 0 || x > w) continue;

        const amp = Math.max(0.08, Math.min(1.0, amps[i]));
        const barH = Math.max(6 * dpr, h * 0.72 * amp);
        const y = (h - barH) / 2;
        const barRatio = (i + 0.5) / totalBars;
        const isInsideSelection = barRatio >= this.startRatio && barRatio <= this.endRatio;

        ctx.fillStyle = isInsideSelection ? '#B58AFF' : '#3E3652';
        drawRoundedRect(ctx, x, y, barW, barH, barW / 2);
      }

      // 4. Start Handle Line & Knob
      if (startX >= -10 && startX <= w + 10) {
        // Vertical line
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 2.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, h);
        ctx.stroke();

        // Top Flag / Handle Knob
        ctx.fillStyle = '#06B6D4';
        ctx.beginPath();
        ctx.arc(startX, 14 * dpr, 7 * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#09080D';
        ctx.font = `bold ${8 * dpr}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', startX, 14 * dpr);
      }

      // 5. End Handle Line & Knob
      if (endX >= -10 && endX <= w + 10) {
        // Vertical line
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX, h);
        ctx.stroke();

        // Top Flag / Handle Knob
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.arc(endX, 14 * dpr, 7 * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${8 * dpr}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', endX, 14 * dpr);
      }

      // 6. Active Playhead Scrubbing Line
      if (playheadX >= 0 && playheadX <= w) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, h);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(playheadX, h - 10 * dpr, 4 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  function defaultWaveform() {
    return [
      0.2, 0.4, 0.7, 0.9, 0.6, 0.3, 0.8, 1.0, 0.75, 0.5,
      0.35, 0.65, 0.95, 0.85, 0.4, 0.6, 0.9, 0.7, 0.3, 0.5,
      0.8, 0.95, 0.6, 0.45, 0.7, 0.85, 1.0, 0.6, 0.4, 0.2
    ];
  }

  /**
   * Decodes an AudioBuffer into an array of normalized amplitude peaks (e.g. 100-120 bars).
   */
  function extractAmplitudesFromAudioBuffer(audioBuffer, numBars = 120) {
    if (!audioBuffer) return defaultWaveform();
    const rawData = audioBuffer.getChannelData(0);
    const totalSamples = rawData.length;
    const blockSize = Math.floor(totalSamples / numBars);
    const amplitudes = [];

    let maxPeak = 0.001;
    for (let i = 0; i < numBars; i++) {
      const start = i * blockSize;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        const val = Math.abs(rawData[start + j]);
        if (val > sum) sum = val;
      }
      amplitudes.push(sum);
      if (sum > maxPeak) maxPeak = sum;
    }

    return amplitudes.map(v => Math.max(0.1, v / maxPeak));
  }

  return {
    drawCardWaveform,
    StudioWaveformEditor,
    extractAmplitudesFromAudioBuffer,
    defaultWaveform
  };
})();
