/**
 * RINGO — 5-Band Audio Equalizer Controller & Canvas Curve Visualizer
 * Supports 7 Presets, 5 independent frequency bands (-12 to +12 dB), Bass Boost,
 * and real-time frequency response curve rendering.
 */

const RingoEqualizer = (() => {
  const PRESETS = [
    { name: 'Flat', bands: [0, 0, 0, 0, 0], bass: 0 },
    { name: 'Bass Boost', bands: [7, 4.5, 0, 1, 2], bass: 65 },
    { name: 'Pop', bands: [-1, 3, 5, 3, -1], bass: 20 },
    { name: 'Rock', bands: [5, 3, -1, 3, 5], bass: 35 },
    { name: 'Vocal', bands: [-2, 1.5, 5.5, 4.5, 1], bass: 10 },
    { name: 'Jazz', bands: [3.5, 2, -1.5, 2.5, 4], bass: 25 },
    { name: 'Classical', bands: [4, 2.5, -1, 3, 4.5], bass: 15 }
  ];

  const BAND_LABELS = ['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz'];

  let isEnabled = false;
  let selectedPreset = 'Flat';
  let bandLevelsDb = [0, 0, 0, 0, 0];
  let bassBoostPercent = 0;

  function init() {
    const saved = RingoStorage.getEqualizerSettings();
    if (saved) {
      isEnabled = Boolean(saved.isEnabled);
      selectedPreset = saved.selectedPreset || 'Flat';
      bandLevelsDb = Array.isArray(saved.bandLevelsDb) && saved.bandLevelsDb.length === 5 ? saved.bandLevelsDb : [0, 0, 0, 0, 0];
      bassBoostPercent = saved.bassBoostPercent || 0;
    }

    const presetsContainer = document.getElementById('eq-presets-container');
    if (presetsContainer && !presetsContainer._bound) {
      presetsContainer._bound = true;
      presetsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.eq-preset-chip');
        if (btn) {
          const preset = btn.getAttribute('data-preset');
          if (preset) applyPreset(preset);
        }
      });
    }

    applyToAudioEngine();
    renderUI();
  }

  function applyToAudioEngine() {
    if (isEnabled) {
      bandLevelsDb.forEach((db, idx) => {
        RingoAudioEngine.setEqualizerBand(idx, db);
      });
      RingoAudioEngine.setBassBoost(bassBoostPercent);
    } else {
      // Flat bypass when disabled
      for (let i = 0; i < 5; i++) {
        RingoAudioEngine.setEqualizerBand(i, 0);
      }
      RingoAudioEngine.setBassBoost(0);
    }
    drawResponseCurve();
  }

  function persist() {
    RingoStorage.saveEqualizerSettings({
      isEnabled,
      selectedPreset,
      bandLevelsDb,
      bassBoostPercent
    });
  }

  function setEnabled(enabled) {
    isEnabled = enabled;
    applyToAudioEngine();
    persist();
    renderUI();
  }

  function applyPreset(presetName) {
    const p = PRESETS.find(x => x.name.toLowerCase() === presetName.toLowerCase());
    if (!p) return;
    isEnabled = true;
    selectedPreset = p.name;
    bandLevelsDb = [...p.bands];
    bassBoostPercent = p.bass;

    applyToAudioEngine();
    persist();
    renderUI();
  }

  function setBandLevel(bandIndex, db) {
    if (bandIndex < 0 || bandIndex >= 5) return;
    isEnabled = true;
    selectedPreset = 'Custom';
    bandLevelsDb[bandIndex] = Math.round(db * 2) / 2; // 0.5 dB step

    applyToAudioEngine();
    persist();
    renderUI();
  }

  function setBassBoost(percent) {
    isEnabled = true;
    bassBoostPercent = Math.max(0, Math.min(100, Math.round(percent)));
    if (selectedPreset === 'Flat' && bassBoostPercent > 0) {
      selectedPreset = 'Custom';
    }

    applyToAudioEngine();
    persist();
    renderUI();
  }

  function resetFlat() {
    isEnabled = true;
    selectedPreset = 'Flat';
    bandLevelsDb = [0, 0, 0, 0, 0];
    bassBoostPercent = 0;

    applyToAudioEngine();
    persist();
    renderUI();
  }

  /**
   * Draws a smooth frequency response curve on the canvas using the current band gains.
   */
  function drawResponseCurve() {
    const canvas = document.getElementById('eq-response-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const centerY = h / 2;
    const minDb = -12;
    const maxDb = 12;

    // Center 0 dB reference line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.stroke();

    // +6 dB and -6 dB dashed grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    const yPlus6 = centerY - ((6 / maxDb) * (h * 0.42));
    const yMinus6 = centerY - ((-6 / maxDb) * (h * 0.42));
    ctx.beginPath();
    ctx.moveTo(0, yPlus6); ctx.lineTo(w, yPlus6);
    ctx.moveTo(0, yMinus6); ctx.lineTo(w, yMinus6);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve control points
    const effectiveGains = isEnabled ? [...bandLevelsDb] : [0, 0, 0, 0, 0];
    if (isEnabled && bassBoostPercent > 0) {
      effectiveGains[0] += (bassBoostPercent / 100) * 4.5;
    }

    const points = effectiveGains.map((db, idx) => {
      const x = ((idx + 0.5) / 5) * w;
      const clampedDb = Math.max(minDb, Math.min(maxDb, db));
      const y = centerY - ((clampedDb / maxDb) * (h * 0.42));
      return { x, y };
    });

    // Draw Smooth Spline / Curve
    ctx.beginPath();
    ctx.moveTo(0, points[0].y);
    ctx.lineTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx1 = (p0.x + p1.x) / 2;
      const cpy1 = p0.y;
      const cpx2 = (p0.x + p1.x) / 2;
      const cpy2 = p1.y;
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, p1.x, p1.y);
    }
    ctx.lineTo(w, points[points.length - 1].y);

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    if (isEnabled) {
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.20)');
      gradient.addColorStop(1, 'rgba(9, 8, 13, 0.05)');
    } else {
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      gradient.addColorStop(1, 'rgba(9, 8, 13, 0.02)');
    }

    ctx.save();
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    // Stroke Curve Line
    ctx.beginPath();
    ctx.moveTo(0, points[0].y);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx1 = (p0.x + p1.x) / 2;
      const cpy1 = p0.y;
      const cpx2 = (p0.x + p1.x) / 2;
      const cpy2 = p1.y;
      ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, p1.x, p1.y);
    }
    ctx.lineTo(w, points[points.length - 1].y);

    ctx.strokeStyle = isEnabled ? '#06B6D4' : '#6B657D';
    ctx.lineWidth = 2.5 * dpr;
    ctx.stroke();

    // Draw Dots on control frequencies
    points.forEach(p => {
      ctx.fillStyle = isEnabled ? '#B58AFF' : '#6B657D';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Updates all HTML elements inside the Equalizer Modal.
   */
  function renderUI() {
    const masterSwitch = document.getElementById('eq-master-switch');
    if (masterSwitch) masterSwitch.checked = isEnabled;

    const statusSub = document.getElementById('eq-status-subtitle');
    if (statusSub) {
      if (isEnabled) {
        statusSub.textContent = `Active · ${selectedPreset} · Saved on device`;
        statusSub.classList.add('active');
      } else {
        statusSub.textContent = 'Off · Enable to customize playback sound';
        statusSub.classList.remove('active');
      }
    }

    const iconBubble = document.getElementById('eq-icon-bubble');
    if (iconBubble) {
      iconBubble.classList.toggle('active', isEnabled);
    }

    const graphCard = document.getElementById('eq-graph-card');
    if (graphCard) {
      graphCard.classList.toggle('active', isEnabled);
    }

    // Presets Row
    const presetsContainer = document.getElementById('eq-presets-container');
    if (presetsContainer) {
      presetsContainer.innerHTML = PRESETS.map(p => {
        const isSel = selectedPreset.toLowerCase() === p.name.toLowerCase() && isEnabled;
        return `<button class="eq-preset-chip ${isSel ? 'active' : ''}" data-preset="${p.name}">${p.name}</button>`;
      }).join('');
    }

    // 5 Sliders
    for (let i = 0; i < 5; i++) {
      const slider = document.getElementById(`eq-slider-${i}`);
      const readout = document.getElementById(`eq-readout-${i}`);
      const val = bandLevelsDb[i];
      if (slider) slider.value = val;
      if (readout) {
        readout.textContent = val > 0 ? `+${val.toFixed(1)} dB` : `${val.toFixed(1)} dB`;
        readout.style.color = isEnabled ? (val !== 0 ? 'var(--cyan-accent)' : 'var(--lavender)') : 'var(--text-muted)';
      }
    }

    // Bass Boost Slider
    const bassSlider = document.getElementById('eq-bass-slider');
    const bassReadout = document.getElementById('eq-bass-readout');
    if (bassSlider) bassSlider.value = bassBoostPercent;
    if (bassReadout) {
      bassReadout.textContent = `${bassBoostPercent}%`;
      bassReadout.style.color = isEnabled && bassBoostPercent > 0 ? 'var(--cyan-accent)' : 'var(--text-muted)';
    }

    drawResponseCurve();
  }

  function openModal() {
    const modal = document.getElementById('equalizer-modal');
    if (modal) {
      modal.classList.add('show');
      renderUI();
      setTimeout(drawResponseCurve, 50);
    }
  }

  function closeModal() {
    const modal = document.getElementById('equalizer-modal');
    if (modal) modal.classList.remove('show');
  }

  return {
    init,
    openModal,
    closeModal,
    setEnabled,
    applyPreset,
    setBandLevel,
    setBassBoost,
    resetFlat,
    drawResponseCurve,
    get isEnabled() { return isEnabled; },
    getIsEnabled: () => isEnabled,
    get selectedPreset() { return selectedPreset; },
    get bandLevelsDb() { return bandLevelsDb; },
    get bassBoostPercent() { return bassBoostPercent; }
  };
})();
