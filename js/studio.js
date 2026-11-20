/**
 * RINGO — Ringtone Studio Controller
 * Handles audio file import, microphone recording via MediaRecorder,
 * waveform trimming, audio processing rack, and client-side WAV master exporting.
 */

const RingoStudio = (() => {
  let activeAudioBuffer = null;
  let activeSoundTitle = 'Midnight Pulse (Studio Master)';
  let activeSourceSound = null;
  let activeDurationMs = 24000;

  // Trim Selection
  let startTrimRatio = 0.05;
  let endTrimRatio = 0.85;
  let playheadRatio = 0.05;
  let zoomLevel = 1.0;
  let scrollOffsetRatio = 0.0;

  // Effects Rack Values
  let fadeInSec = 1.0;
  let fadeOutSec = 1.5;
  let volumeBoost = 1.2;
  let playbackSpeed = 1.0;
  let isReverbEnabled = false;
  let selectedPreset = 'Balanced';

  // Recording State
  let mediaRecorder = null;
  let recordedChunks = [];
  let isRecording = false;
  let recordStartTime = 0;
  let recordTimerInterval = null;

  let waveformEditor = null;
  let isPreviewPlaying = false;

  function init() {
    setupWaveformEditor();
    setupEventListeners();
    loadDefaultSyntheticTrack();
    renderCreationsList();
  }

  function setupWaveformEditor() {
    const canvas = document.getElementById('studio-canvas');
    if (!canvas) return;

    waveformEditor = new RingoWaveform.StudioWaveformEditor(canvas, {
      startRatio: startTrimRatio,
      endRatio: endTrimRatio,
      playheadRatio: playheadRatio,
      zoomLevel: zoomLevel,
      scrollOffsetRatio: scrollOffsetRatio,
      onTrimChange: (start, end) => {
        startTrimRatio = start;
        endTrimRatio = end;
        updateTimeReadouts();
        if (isPreviewPlaying) {
          const sMs = Math.round(startTrimRatio * activeDurationMs);
          const eMs = Math.round(endTrimRatio * activeDurationMs);
          RingoAudioEngine.updateSegmentBounds(sMs, eMs);
        }
      },
      onPlayheadSeek: (ratio) => {
        playheadRatio = ratio;
        if (isPreviewPlaying) {
          const targetMs = Math.round(ratio * activeDurationMs);
          RingoAudioEngine.seekTo(targetMs);
        }
      },
      onZoomChange: (zoom, scroll) => {
        zoomLevel = zoom;
        scrollOffsetRatio = scroll;
        updateZoomReadouts();
      }
    });

    RingoAudioEngine.onTimeUpdate((currentMs) => {
      if (isPreviewPlaying && activeDurationMs > 0) {
        const ratio = currentMs / activeDurationMs;
        if (waveformEditor) waveformEditor.setPlayhead(ratio);
      }
    });

    RingoAudioEngine.onStateChange((state) => {
      isPreviewPlaying = state.isPlaying && state.currentSound && state.currentSound.id === 'studio_preview';
      updatePreviewButtonUI();
    });
  }

  function setupEventListeners() {
    // Import Audio File
    const fileInput = document.getElementById('studio-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', handleFileImport);
    }

    // Zoom Buttons
    const btnZoomIn = document.getElementById('studio-zoom-in');
    const btnZoomOut = document.getElementById('studio-zoom-out');
    const btnZoomFit = document.getElementById('studio-zoom-fit');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        zoomLevel = Math.min(10, zoomLevel * 1.5);
        if (waveformEditor) waveformEditor.setZoom(zoomLevel);
        updateZoomReadouts();
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        zoomLevel = Math.max(1, zoomLevel / 1.5);
        if (waveformEditor) waveformEditor.setZoom(zoomLevel, 0);
        updateZoomReadouts();
      });
    }

    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => {
        zoomLevel = 1.0;
        scrollOffsetRatio = 0.0;
        if (waveformEditor) waveformEditor.setZoom(1.0, 0.0);
        updateZoomReadouts();
      });
    }

    // Preset Trim Length Buttons
    document.querySelectorAll('.preset-dur-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const durSec = btn.dataset.dur === 'full' ? null : parseFloat(btn.dataset.dur);
        applyTrimDurationPreset(durSec);
        document.querySelectorAll('.preset-dur-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Preview Cut Button
    const previewBtn = document.getElementById('studio-preview-btn');
    if (previewBtn) {
      previewBtn.addEventListener('click', togglePreviewCut);
    }

    // Export Modal Buttons
    const exportOpenBtn = document.getElementById('studio-export-open-btn');
    const exportModal = document.getElementById('studio-export-modal');
    const exportCancelBtn = document.getElementById('studio-export-cancel-btn');
    const exportConfirmBtn = document.getElementById('studio-export-confirm-btn');

    if (exportOpenBtn && exportModal) {
      exportOpenBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('studio-export-name-input');
        if (nameInput) {
          nameInput.value = activeSoundTitle.replace(/[^A-Za-z0-9_]/g, '_') + '_Cut';
        }
        updateExportDurationSummary();
        exportModal.classList.add('show');
      });
    }

    if (exportCancelBtn && exportModal) {
      exportCancelBtn.addEventListener('click', () => exportModal.classList.remove('show'));
    }

    if (exportConfirmBtn) {
      exportConfirmBtn.addEventListener('click', executeExport);
    }

    // Reverb Toggle
    const reverbSwitch = document.getElementById('studio-reverb-switch');
    if (reverbSwitch) {
      reverbSwitch.addEventListener('change', (e) => {
        isReverbEnabled = e.target.checked;
        RingoAudioEngine.setReverb(isReverbEnabled);
      });
    }

    // Effects Sliders
    bindSlider('studio-fade-in-slider', 'studio-fade-in-val', (v) => { fadeInSec = v; }, (v) => `${v.toFixed(1)}s`);
    bindSlider('studio-fade-out-slider', 'studio-fade-out-val', (v) => { fadeOutSec = v; }, (v) => `${v.toFixed(1)}s`);
    bindSlider('studio-volume-slider', 'studio-volume-val', (v) => {
      volumeBoost = v;
      RingoAudioEngine.setVolume(v);
    }, (v) => `${Math.round(v * 100)}%`);
    bindSlider('studio-speed-slider', 'studio-speed-val', (v) => {
      playbackSpeed = v;
      RingoAudioEngine.setPlaybackRate(v);
    }, (v) => `${v.toFixed(1)}x`);

    // Studio EQ Presets
    document.querySelectorAll('.effects-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        selectedPreset = chip.dataset.preset;
        document.querySelectorAll('.effects-preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyStudioPreset(selectedPreset);
      });
    });
  }

  function bindSlider(sliderId, readoutId, onValChange, formatter) {
    const slider = document.getElementById(sliderId);
    const readout = document.getElementById(readoutId);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        onValChange(val);
        if (readout) readout.textContent = formatter(val);
      });
    }
  }

  function updateZoomReadouts() {
    const text = document.getElementById('studio-zoom-val');
    if (text) text.textContent = `${zoomLevel.toFixed(1)}x`;
  }

  function updateTimeReadouts() {
    const startSec = (startTrimRatio * (activeDurationMs / 1000));
    const endSec = (endTrimRatio * (activeDurationMs / 1000));
    const selSec = Math.max(0.5, endSec - startSec);

    const startLabel = document.getElementById('studio-start-readout');
    const endLabel = document.getElementById('studio-end-readout');
    const trimBadge = document.getElementById('studio-trim-badge');

    if (startLabel) startLabel.textContent = `Start: ${startSec.toFixed(1)}s`;
    if (endLabel) endLabel.textContent = `End: ${endSec.toFixed(1)}s`;
    if (trimBadge) trimBadge.textContent = `Trim: ${selSec.toFixed(1)}s`;
  }

  function updateExportDurationSummary() {
    const startSec = (startTrimRatio * (activeDurationMs / 1000));
    const endSec = (endTrimRatio * (activeDurationMs / 1000));
    const selSec = Math.max(0.5, endSec - startSec);
    const durLabel = document.getElementById('studio-export-duration-label');
    if (durLabel) durLabel.textContent = `Length: ${selSec.toFixed(1)} seconds`;
  }

  function applyTrimDurationPreset(targetSec) {
    if (targetSec === null) {
      startTrimRatio = 0.0;
      endTrimRatio = 1.0;
    } else {
      const durSec = activeDurationMs / 1000;
      const targetRatio = Math.min(1.0, targetSec / durSec);
      let s = startTrimRatio;
      let e = s + targetRatio;
      if (e > 1.0) {
        e = 1.0;
        s = Math.max(0, 1.0 - targetRatio);
      }
      startTrimRatio = s;
      endTrimRatio = e;
    }
    if (waveformEditor) {
      waveformEditor.setTrimBounds(startTrimRatio, endTrimRatio);
    }
    updateTimeReadouts();
  }

  function applyStudioPreset(presetName) {
    if (presetName === 'Bass Heavy') {
      RingoEqualizer.applyPreset('Bass Boost');
    } else if (presetName === 'Vocal Boost') {
      RingoEqualizer.applyPreset('Vocal');
    } else if (presetName === 'Treble Crisp') {
      RingoEqualizer.applyPreset('Rock');
    } else if (presetName === 'Chill Ambient') {
      RingoEqualizer.applyPreset('Classical');
      isReverbEnabled = true;
      const reverbSwitch = document.getElementById('studio-reverb-switch');
      if (reverbSwitch) reverbSwitch.checked = true;
      RingoAudioEngine.setReverb(true);
    } else {
      RingoEqualizer.applyPreset('Flat');
    }
  }

  // --- Audio Loading & Decoding ---
  async function loadAudioFromBlobOrUrl(blobOrUrl, title, sourceSound = null) {
    RingoApp.showToast(`Loading "${title}" into Studio...`);
    activeSoundTitle = title;
    activeSourceSound = sourceSound;

    const projectTitleElem = document.getElementById('studio-project-title');
    if (projectTitleElem) projectTitleElem.textContent = title;

    try {
      const audioCtx = RingoAudioEngine.getAudioContext();
      let arrayBuffer;

      if (blobOrUrl instanceof Blob) {
        arrayBuffer = await blobOrUrl.arrayBuffer();
      } else {
        const resp = await fetch(blobOrUrl);
        arrayBuffer = await resp.arrayBuffer();
      }

      activeAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      activeDurationMs = Math.round(activeAudioBuffer.duration * 1000);

      // Extract real amplitudes from buffer
      const amps = RingoWaveform.extractAmplitudesFromAudioBuffer(activeAudioBuffer, 120);

      startTrimRatio = 0.0;
      endTrimRatio = 1.0;
      playheadRatio = 0.0;
      zoomLevel = 1.0;
      scrollOffsetRatio = 0.0;

      if (waveformEditor) {
        waveformEditor.setAmplitudes(amps, activeDurationMs);
        waveformEditor.setTrimBounds(0, 1);
        waveformEditor.setPlayhead(0);
        waveformEditor.setZoom(1.0, 0.0);
      }

      updateTimeReadouts();
      updateZoomReadouts();
      RingoApp.showToast(`Loaded "${title}" ready for trimming!`);
    } catch (err) {
      console.warn('Audio decoding fallback:', err);
      RingoApp.showToast(`Could not decode audio. Using sample waveform.`);
      activeDurationMs = 24000;
      updateTimeReadouts();
    }
  }

  function handleFileImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    loadAudioFromBlobOrUrl(file, file.name);
    e.target.value = ''; // Reset input
  }

  /**
   * Generates a sample ambient harmonic audio buffer so the studio is immediately playable.
   */
  async function loadDefaultSyntheticTrack() {
    const audioCtx = RingoAudioEngine.getAudioContext();
    if (!audioCtx) return;

    try {
      const sampleRate = audioCtx.sampleRate;
      const durationSec = 24;
      const buffer = audioCtx.createBuffer(2, sampleRate * durationSec, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      // Smooth rhythmic synth pulse
      for (let i = 0; i < sampleRate * durationSec; i++) {
        const t = i / sampleRate;
        const bass = Math.sin(2 * Math.PI * 55 * t) * 0.3 * Math.exp(-((t % 0.5) * 4));
        const chord = (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 330 * t)) * 0.15;
        const hat = (Math.random() * 2 - 1) * 0.05 * Math.exp(-((t % 0.25) * 16));
        left[i] = (bass + chord + hat) * 0.8;
        right[i] = (bass + chord - hat) * 0.8;
      }

      activeAudioBuffer = buffer;
      activeDurationMs = 24000;
      const amps = RingoWaveform.extractAmplitudesFromAudioBuffer(buffer, 120);

      if (waveformEditor) {
        waveformEditor.setAmplitudes(amps, activeDurationMs);
        waveformEditor.setTrimBounds(startTrimRatio, endTrimRatio);
      }
      updateTimeReadouts();
    } catch (e) {}
  }

  // --- Microphone Recording via MediaRecorder ---
  async function toggleMicrophoneRecording() {
    if (isRecording) {
      stopMicrophoneRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm;codecs=opus' });
        const name = `Mic_Recording_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.wav`;
        await loadAudioFromBlobOrUrl(audioBlob, name);
      };

      mediaRecorder.start(100);
      isRecording = true;
      recordStartTime = Date.now();

      const banner = document.getElementById('studio-rec-banner');
      if (banner) banner.style.display = 'flex';

      clearInterval(recordTimerInterval);
      recordTimerInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - recordStartTime) / 1000);
        const m = Math.floor(elapsedSec / 60);
        const s = elapsedSec % 60;
        const timerText = document.getElementById('studio-rec-timer');
        if (timerText) timerText.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }, 500);

      RingoApp.showToast('Recording microphone audio...');
    } catch (err) {
      console.warn('Microphone permission error:', err);
      RingoApp.showToast('Microphone access is required to record audio.');
    }
  }

  function stopMicrophoneRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      clearInterval(recordTimerInterval);
      const banner = document.getElementById('studio-rec-banner');
      if (banner) banner.style.display = 'none';
    }
  }

  // --- Preview Segment Playback ---
  function togglePreviewCut() {
    if (isPreviewPlaying) {
      RingoAudioEngine.pause();
      return;
    }

    const sMs = Math.round(startTrimRatio * activeDurationMs);
    const eMs = Math.round(endTrimRatio * activeDurationMs);

    // Build a temporary sound model for preview
    const previewSound = {
      id: 'studio_preview',
      title: activeSoundTitle,
      creator: 'Studio Preview',
      durationMs: activeDurationMs,
      audioUrl: activeSourceSound ? activeSourceSound.audioUrl : null
    };

    if (activeAudioBuffer) {
      // Export a quick slice blob for playback
      renderAudioSliceBlob(activeAudioBuffer, sMs, eMs).then(blob => {
        const url = URL.createObjectURL(blob);
        previewSound.audioUrl = url;
        RingoAudioEngine.playSegment(previewSound, 0, (eMs - sMs), true);
      });
    } else if (activeSourceSound) {
      RingoAudioEngine.playSegment(activeSourceSound, sMs, eMs, true);
    }
  }

  function updatePreviewButtonUI() {
    const btn = document.getElementById('studio-preview-btn');
    if (!btn) return;
    if (isPreviewPlaying) {
      btn.innerHTML = `${RingoComponents.getIcon('pause')} <span>Pause Preview</span>`;
    } else {
      btn.innerHTML = `${RingoComponents.getIcon('play')} <span>Preview Cut</span>`;
    }
  }

  // --- Audio Export to WAV 16-Bit PCM ---
  async function executeExport() {
    const nameInput = document.getElementById('studio-export-name-input');
    const exportName = (nameInput && nameInput.value.trim()) || 'My_Custom_Ringtone';
    const exportModal = document.getElementById('studio-export-modal');

    RingoApp.showToast(`Rendering "${exportName}" with applied effects...`);

    const sMs = Math.round(startTrimRatio * activeDurationMs);
    const eMs = Math.round(endTrimRatio * activeDurationMs);
    const trimmedDurMs = eMs - sMs;

    try {
      let finalWavBlob;

      if (activeAudioBuffer) {
        finalWavBlob = await renderProcessedAudioBuffer(activeAudioBuffer, sMs, eMs);
      } else if (activeSourceSound) {
        finalWavBlob = await RingoAudioEngine.renderTrimmedWavBlob(activeSourceSound, sMs, eMs, {
          fadeInSec,
          fadeOutSec,
          volume: volumeBoost
        });
      } else {
        // Fallback synthetic buffer render
        const audioCtx = RingoAudioEngine.getAudioContext();
        const fallbackBuf = audioCtx.createBuffer(2, audioCtx.sampleRate * 5, audioCtx.sampleRate);
        finalWavBlob = encodeWavBlob(fallbackBuf);
      }

      // 1. Trigger browser device download
      downloadBlobToDevice(finalWavBlob, `${exportName}.wav`);

      // 2. Persist project into IndexedDB "My Creations"
      const newProject = {
        id: `studio_${Date.now()}`,
        title: exportName,
        sourceName: activeSoundTitle,
        durationMs: trimmedDurMs,
        startTrimMs: sMs,
        endTrimMs: eMs,
        fadeInSec: fadeInSec,
        fadeOutSec: fadeOutSec,
        volume: volumeBoost,
        equalizerPreset: selectedPreset,
        audioBlob: finalWavBlob,
        createdAt: Date.now()
      };

      await RingoStorage.saveCreation(newProject);
      renderCreationsList();

      if (exportModal) exportModal.classList.remove('show');
      RingoApp.showToast(`Successfully exported "${exportName}.wav" to device and My Creations!`);
    } catch (err) {
      console.error('Export failed:', err);
      RingoApp.showToast('Audio export failed: ' + err.message);
    }
  }

  /**
   * Renders trimmed slice through OfflineAudioContext applying Fade In, Fade Out, and Volume.
   */
  async function renderProcessedAudioBuffer(sourceBuffer, startMs, endMs) {
    const sampleRate = sourceBuffer.sampleRate;
    const startSample = Math.floor((startMs / 1000) * sampleRate);
    const endSample = Math.min(sourceBuffer.length, Math.floor((endMs / 1000) * sampleRate));
    const sliceLength = Math.max(sampleRate * 0.5, endSample - startSample);

    const offlineCtx = new OfflineAudioContext(sourceBuffer.numberOfChannels, sliceLength, sampleRate);

    // Buffer source with slice
    const sliceBuffer = offlineCtx.createBuffer(sourceBuffer.numberOfChannels, sliceLength, sampleRate);
    for (let c = 0; c < sourceBuffer.numberOfChannels; c++) {
      const srcData = sourceBuffer.getChannelData(c);
      const dstData = sliceBuffer.getChannelData(c);
      for (let i = 0; i < sliceLength; i++) {
        dstData[i] = (startSample + i < srcData.length) ? srcData[startSample + i] : 0;
      }
    }

    const srcNode = offlineCtx.createBufferSource();
    srcNode.buffer = sliceBuffer;

    // Gain node for Fade In / Out & Volume Boost
    const gainNode = offlineCtx.createGain();
    const durSec = sliceLength / sampleRate;

    gainNode.gain.setValueAtTime(0.001, 0);
    if (fadeInSec > 0) {
      gainNode.gain.linearRampToValueAtTime(volumeBoost, Math.min(durSec / 2, fadeInSec));
    } else {
      gainNode.gain.setValueAtTime(volumeBoost, 0);
    }

    if (fadeOutSec > 0 && durSec > fadeOutSec) {
      gainNode.gain.setValueAtTime(volumeBoost, durSec - fadeOutSec);
      gainNode.gain.linearRampToValueAtTime(0.001, durSec);
    }

    srcNode.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    srcNode.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    return encodeWavBlob(renderedBuffer);
  }

  async function renderAudioSliceBlob(sourceBuffer, startMs, endMs) {
    return renderProcessedAudioBuffer(sourceBuffer, startMs, endMs);
  }

  /**
   * Encodes an AudioBuffer into genuine 16-bit PCM WAV Blob.
   */
  function encodeWavBlob(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const numSamples = audioBuffer.length;
    const dataByteCount = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataByteCount);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataByteCount, true);
    writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataByteCount, true);

    // Interleave channel samples
    const channels = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(audioBuffer.getChannelData(c));
    }

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channels[c][i];
        sample = Math.max(-1, Math.min(1, sample));
        // Convert to 16-bit signed integer
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function downloadBlobToDevice(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // --- Saved Creations / Projects ---
  async function renderCreationsList() {
    const container = document.getElementById('studio-creations-list');
    if (!container) return;

    const creations = await RingoStorage.getAllCreations();
    if (creations.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="margin: 0; padding: 24px;">
          ${RingoComponents.getIcon('content_cut', 'empty-state-icon')}
          <div class="empty-state-title">No Studio Drafts Yet</div>
          <div class="empty-state-desc">Trim any track or record microphone audio and tap "Export" to save your custom ringtone creations here.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = creations.map(proj => {
      const durSec = (proj.durationMs / 1000).toFixed(1);
      return `
        <div class="creation-item-card" data-id="${proj.id}">
          <div class="creation-item-info">
            <div class="creation-item-title">${escapeHtml(proj.title)}</div>
            <div class="creation-item-meta">Source: ${escapeHtml(proj.sourceName)} · ${durSec}s · ${proj.equalizerPreset}</div>
          </div>
          <div class="creation-item-actions">
            <button class="creation-action-btn play" title="Preview" data-id="${proj.id}">
              ${RingoComponents.getIcon('play')}
            </button>
            <button class="creation-action-btn load" title="Edit in Studio" data-id="${proj.id}">
              ${RingoComponents.getIcon('content_cut')}
            </button>
            <button class="creation-action-btn delete" title="Delete" data-id="${proj.id}">
              ${RingoComponents.getIcon('delete')}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach actions
    container.querySelectorAll('.creation-action-btn.play').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const proj = creations.find(x => x.id === id);
        if (proj && proj.audioBlob) {
          const url = URL.createObjectURL(proj.audioBlob);
          RingoAudioEngine.play({
            id: proj.id,
            title: proj.title,
            creator: 'My Creation',
            durationMs: proj.durationMs,
            audioUrl: url
          });
        }
      });
    });

    container.querySelectorAll('.creation-action-btn.load').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const proj = creations.find(x => x.id === id);
        if (proj && proj.audioBlob) {
          await loadAudioFromBlobOrUrl(proj.audioBlob, proj.title);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    container.querySelectorAll('.creation-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        await RingoStorage.deleteCreation(id);
        renderCreationsList();
        RingoApp.showToast('Creation removed.');
      });
    });
  }

  /**
   * Opens the catalog sound selector bottom sheet for Studio editing.
   */
  async function openCatalogSelector() {
    const modal = document.getElementById('studio-catalog-modal');
    const container = document.getElementById('studio-catalog-list');
    if (!modal || !container) return;

    modal.classList.add('show');
    container.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const sounds = await RingoAPI.getSounds();
      if (!sounds || sounds.length === 0) {
        container.innerHTML = '<div style="color:var(--text-secondary); padding:16px; text-align:center;">No catalog tracks found.</div>';
        return;
      }

      container.innerHTML = sounds.map(snd => {
        const coverSrc = snd.coverUrl || 'assets/images/ic_launcher.png';
        return `
          <div class="creation-item-card studio-catalog-item" data-id="${snd.id}" style="cursor:pointer; padding:10px 12px; display:flex; align-items:center; justify-content:space-between; border-radius:12px; background:var(--elevated-card); margin-bottom:6px; border:1px solid var(--subtle-border);">
            <div style="display:flex; align-items:center; gap:10px; overflow:hidden; flex:1;">
              <img src="${coverSrc}" alt="" style="width:40px; height:40px; border-radius:8px; object-fit:cover; flex-shrink:0;" onerror="this.src='assets/images/ic_launcher.png'">
              <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <div style="font-size:13px; font-weight:600; color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(snd.title)}</div>
                <div style="font-size:11px; color:var(--text-secondary);">${escapeHtml(snd.creator)} · ${snd.durationFormatted}</div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" style="flex-shrink:0; padding:6px 12px; font-size:11px; border-color:rgba(139,92,246,0.4); color:var(--lavender); pointer-events:none;">
              Select &amp; Trim
            </button>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.studio-catalog-item').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.id;
          const snd = sounds.find(s => s.id === id);
          if (snd) {
            modal.classList.remove('show');
            loadAudioFromBlobOrUrl(snd.audioUrl, snd.title, snd);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      });
    } catch (err) {
      console.warn('Catalog load error:', err);
      container.innerHTML = '<div style="color:var(--text-secondary); padding:16px; text-align:center;">Failed to load catalog tracks.</div>';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    onActivated() {
      renderCreationsList();
    },
    loadAudioFromBlobOrUrl,
    openCatalogSelector,
    toggleMicrophoneRecording,
    stopMicrophoneRecording,
    togglePreviewCut,
    executeExport,
    renderCreationsList,
    applyTrimDurationPreset,
    get activeSoundTitle() { return activeSoundTitle; }
  };
})();
