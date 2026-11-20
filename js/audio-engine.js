/**
 * RINGO — Web Audio Engine & Playback Controller
 * Single persistent audio instance routing through 5-band Equalizer, Bass Boost,
 * Concert Hall Reverb, and Gain nodes.
 */

const RingoAudioEngine = (() => {
  let audioContext = null;
  let audioElement = null;
  let sourceNode = null;

  // Audio Graph Nodes
  let eqFilters = [];
  let bassBoostFilter = null;
  let reverbGain = null;
  let dryGain = null;
  let convolverNode = null;
  let masterGain = null;

  // Playback State
  let currentSound = null;
  let isPlaying = false;
  let isLooping = false;
  let currentBlobUrl = null;

  // Segment Playback State (for Studio / Ringtone Trimming)
  let segmentStartMs = null;
  let segmentEndMs = null;
  let segmentLoop = false;
  let segmentCheckInterval = null;

  // Listeners
  const stateChangeListeners = new Set();
  const timeUpdateListeners = new Set();
  let onDurationResolved = null;
  let onTrackCompleted = null;

  const BAND_FREQUENCIES = [60, 230, 910, 3600, 14000];

  function getAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  function initAudioGraph() {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!audioElement) {
      audioElement = new Audio();
      audioElement.preload = 'metadata';
      audioElement.crossOrigin = 'anonymous';

      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.addEventListener('play', () => setPlaying(true));
      audioElement.addEventListener('pause', () => setPlaying(false));
      audioElement.addEventListener('error', handleError);
    }

    if (!sourceNode && ctx) {
      try {
        sourceNode = ctx.createMediaElementSource(audioElement);

        // 1. 5-Band Biquad Filter Nodes
        eqFilters = BAND_FREQUENCIES.map((freq, i) => {
          const filter = ctx.createBiquadFilter();
          if (i === 0) {
            filter.type = 'lowshelf';
          } else if (i === BAND_FREQUENCIES.length - 1) {
            filter.type = 'highshelf';
          } else {
            filter.type = 'peaking';
            filter.Q.value = 1.0;
          }
          filter.frequency.value = freq;
          filter.gain.value = 0;
          return filter;
        });

        // 2. Dedicated Bass Boost Filter (peaking at 80Hz)
        bassBoostFilter = ctx.createBiquadFilter();
        bassBoostFilter.type = 'peaking';
        bassBoostFilter.frequency.value = 80;
        bassBoostFilter.Q.value = 1.4;
        bassBoostFilter.gain.value = 0;

        // 3. Reverb Path (Concert Hall Reverb)
        convolverNode = ctx.createConvolver();
        convolverNode.buffer = createImpulseResponse(ctx, 2.4, 2.0); // 2.4s decay
        reverbGain = ctx.createGain();
        reverbGain.gain.value = 0; // Off by default

        dryGain = ctx.createGain();
        dryGain.gain.value = 1.0;

        // 4. Master Volume Gain Node
        masterGain = ctx.createGain();
        masterGain.gain.value = 1.0;

        // Connect chain: Source -> EQ Filters -> Bass Boost
        let lastNode = sourceNode;
        eqFilters.forEach(f => {
          lastNode.connect(f);
          lastNode = f;
        });
        lastNode.connect(bassBoostFilter);

        // Split to Dry & Reverb
        bassBoostFilter.connect(dryGain);
        bassBoostFilter.connect(convolverNode);
        convolverNode.connect(reverbGain);

        dryGain.connect(masterGain);
        reverbGain.connect(masterGain);

        masterGain.connect(ctx.destination);
      } catch (err) {
        console.warn('Web Audio graph setup fallback:', err);
      }
    }
  }

  /**
   * Generates a synthetic acoustic impulse response for Concert Hall Reverb without external WAV assets.
   */
  function createImpulseResponse(ctx, durationSec, decay) {
    const rate = ctx.sampleRate;
    const length = rate * durationSec;
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const dec = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * dec;
      right[i] = (Math.random() * 2 - 1) * dec;
    }
    return impulse;
  }

  function handleLoadedMetadata() {
    if (audioElement && currentSound) {
      const durSec = audioElement.duration;
      if (durSec && isFinite(durSec) && durSec > 0) {
        const durMs = Math.round(durSec * 1000);
        if (onDurationResolved) {
          onDurationResolved(currentSound.id, durMs);
        }
      }
    }
    notifyState();
  }

  function handleTimeUpdate() {
    if (!audioElement) return;
    const posSec = audioElement.currentTime;
    const posMs = Math.round(posSec * 1000);
    const durSec = audioElement.duration;
    const durMs = (durSec && isFinite(durSec)) ? Math.round(durSec * 1000) : (currentSound ? currentSound.durationMs : 0);

    // Segment loop check for trimming
    if (segmentStartMs !== null && segmentEndMs !== null) {
      if (posMs >= segmentEndMs || posMs < segmentStartMs - 200) {
        if (segmentLoop) {
          audioElement.currentTime = segmentStartMs / 1000;
        } else {
          pause();
          audioElement.currentTime = segmentStartMs / 1000;
        }
      }
    }

    notifyTime(posMs, durMs);
  }

  function handleEnded() {
    if (isLooping && segmentStartMs === null) {
      audioElement.currentTime = 0;
      audioElement.play().catch(() => {});
    } else {
      setPlaying(false);
      if (onTrackCompleted && currentSound) {
        onTrackCompleted(currentSound.id);
      }
    }
  }

  function handleError(e) {
    console.warn('Audio playback error:', e);
    setPlaying(false);
  }

  function updateMediaSession(sound, isPlayingState) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    if (sound) {
      try {
        const coverArt = sound.coverUrl || 'assets/images/ic_launcher.png';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: sound.title || 'RINGO Track',
          artist: sound.creator || 'RINGO',
          album: sound.album || 'RINGO Music',
          artwork: [
            { src: coverArt, sizes: '96x96', type: 'image/jpeg' },
            { src: coverArt, sizes: '256x256', type: 'image/jpeg' },
            { src: coverArt, sizes: '512x512', type: 'image/jpeg' }
          ]
        });
      } catch (e) {
        console.warn('[MediaSession] metadata update failed:', e);
      }
    }

    try {
      navigator.mediaSession.playbackState = isPlayingState ? 'playing' : 'paused';
    } catch (e) {}

    const actionHandlers = [
      ['play', () => { if (currentSound) togglePlayPause(currentSound); }],
      ['pause', () => { pause(); }],
      ['stop', () => { stop(); }],
      ['previoustrack', () => { if (window.RingoPlayerUI) RingoPlayerUI.playPreviousQueueTrack(); }],
      ['nexttrack', () => { if (window.RingoPlayerUI) RingoPlayerUI.playNextQueueTrack(); }],
      ['seekto', (details) => { if (details && details.seekTime !== undefined) seekTo(details.seekTime * 1000); }]
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    });
  }

  function setPlaying(playing) {
    isPlaying = playing;
    updateMediaSession(currentSound, playing);
    notifyState();
  }

  // --- Public Playback Controls ---
  async function play(sound, startPositionMs = 0, isSegment = false) {
    initAudioGraph();
    getAudioContext();

    // Clear any segment bounds only when playing normal tracks
    if (!isSegment) {
      segmentStartMs = null;
      segmentEndMs = null;
      segmentLoop = false;
      clearInterval(segmentCheckInterval);
    }

    if (currentSound && currentSound.id === sound.id && audioElement && audioElement.src) {
      if (isPlaying && !isSegment) {
        pause();
        return;
      } else {
        if (startPositionMs >= 0) {
          try {
            audioElement.currentTime = startPositionMs / 1000;
          } catch (e) {}
        }
        audioElement.play().catch(e => console.warn('Play interrupted:', e));
        setPlaying(true);
        return;
      }
    }

    currentSound = sound;
    notifyState();

    // Clean up previous blob URL if needed
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
      currentBlobUrl = null;
    }

    // Check if downloaded offline in IndexedDB
    const downloaded = await RingoStorage.getDownload(sound.id);
    let audioSrc = sound.audioUrl;

    if (downloaded && downloaded.audioBlob) {
      currentBlobUrl = URL.createObjectURL(downloaded.audioBlob);
      audioSrc = currentBlobUrl;
    }

    if (!audioSrc) {
      console.warn('No audio source URL available for sound', sound.id);
      return;
    }

    audioElement.src = audioSrc;
    audioElement.loop = isLooping && !isSegment;

    const targetSec = startPositionMs > 0 ? (startPositionMs / 1000) : 0;
    const onMeta = () => {
      audioElement.removeEventListener('loadedmetadata', onMeta);
      try {
        if (targetSec > 0) audioElement.currentTime = targetSec;
      } catch (e) {}
    };
    audioElement.addEventListener('loadedmetadata', onMeta);
    try {
      if (targetSec > 0) audioElement.currentTime = targetSec;
    } catch (e) {}

    audioElement.play().catch(err => {
      console.warn('Audio play request failed (user gesture may be required):', err.message);
    });
  }

  function playSegment(sound, startMs, endMs, loop = true) {
    initAudioGraph();
    getAudioContext();

    segmentStartMs = Math.max(0, startMs);
    segmentEndMs = Math.max(segmentStartMs + 250, endMs);
    segmentLoop = loop;

    play(sound, segmentStartMs, true);

    // Fast ticker for sub-second trim loop precision
    clearInterval(segmentCheckInterval);
    segmentCheckInterval = setInterval(() => {
      if (audioElement && !audioElement.paused && segmentEndMs !== null) {
        const curMs = audioElement.currentTime * 1000;
        if (curMs >= segmentEndMs || curMs < (segmentStartMs - 500)) {
          if (segmentLoop) {
            audioElement.currentTime = segmentStartMs / 1000;
          } else {
            pause();
          }
        }
      }
    }, 25);
  }

  function updateSegmentBounds(startMs, endMs) {
    segmentStartMs = Math.max(0, startMs);
    segmentEndMs = Math.max(segmentStartMs + 250, endMs);
    if (audioElement && !audioElement.paused) {
      const curMs = audioElement.currentTime * 1000;
      if (curMs < segmentStartMs || curMs >= segmentEndMs) {
        audioElement.currentTime = segmentStartMs / 1000;
      }
    }
  }

  function pause() {
    if (audioElement) {
      audioElement.pause();
    }
  }

  function togglePlayPause(sound) {
    if (currentSound && currentSound.id === sound.id) {
      if (isPlaying) pause();
      else audioElement.play().catch(() => {});
    } else {
      play(sound);
    }
  }

  function stop() {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    clearInterval(segmentCheckInterval);
    segmentStartMs = null;
    segmentEndMs = null;
    setPlaying(false);
  }

  function seekTo(targetMs) {
    if (audioElement && audioElement.duration) {
      const targetSec = (targetMs / 1000);
      audioElement.currentTime = Math.max(0, Math.min(targetSec, audioElement.duration));
    }
  }

  function toggleLoop() {
    isLooping = !isLooping;
    if (audioElement) {
      audioElement.loop = isLooping && segmentStartMs === null;
    }
    notifyState();
    return isLooping;
  }

  function setVolume(volumeRatio) {
    if (masterGain) {
      masterGain.gain.value = Math.max(0, Math.min(2.0, volumeRatio));
    } else if (audioElement) {
      audioElement.volume = Math.max(0, Math.min(1.0, volumeRatio));
    }
  }

  function setPlaybackRate(rate) {
    if (audioElement) {
      audioElement.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
  }

  // --- Equalizer & Effects Controls ---
  function setEqualizerBand(bandIndex, levelDb) {
    initAudioGraph();
    if (eqFilters[bandIndex]) {
      eqFilters[bandIndex].gain.value = levelDb;
    }
  }

  function setBassBoost(percent) {
    initAudioGraph();
    if (bassBoostFilter) {
      // Map 0..100% to 0..12 dB
      bassBoostFilter.gain.value = (percent / 100) * 12;
    }
  }

  function setReverb(enabled) {
    initAudioGraph();
    if (reverbGain && dryGain) {
      if (enabled) {
        reverbGain.gain.value = 0.45;
        dryGain.gain.value = 0.85;
      } else {
        reverbGain.gain.value = 0;
        dryGain.gain.value = 1.0;
      }
    }
  }

  function getEQNodeForFrequencyResponse() {
    initAudioGraph();
    return {
      filters: eqFilters,
      frequencies: BAND_FREQUENCIES,
      context: getAudioContext()
    };
  }

  // --- State Notifications ---
  function notifyState() {
    const state = getState();
    stateChangeListeners.forEach(fn => fn(state));
  }

  function notifyTime(currentPosMs, durationMs) {
    timeUpdateListeners.forEach(fn => fn(currentPosMs, durationMs));
  }

  function onStateChange(listener) {
    stateChangeListeners.add(listener);
    listener(getState());
  }

  function onTimeUpdate(listener) {
    timeUpdateListeners.add(listener);
  }

  function getState() {
    const curSec = audioElement ? audioElement.currentTime : 0;
    const durSec = audioElement && isFinite(audioElement.duration) ? audioElement.duration : 0;
    return {
      currentSound,
      isPlaying,
      isLooping,
      currentPositionMs: Math.round(curSec * 1000),
      durationMs: durSec > 0 ? Math.round(durSec * 1000) : (currentSound ? currentSound.durationMs : 0)
    };
  }

  /**
   * Renders a trimmed audio slice into a 16-bit PCM WAV Blob using OfflineAudioContext.
   */
  async function renderTrimmedWavBlob(sound, startMs, endMs, options = {}) {
    initAudioGraph();
    const audioCtx = getAudioContext();
    let arrayBuffer = null;

    // 1. Try offline download from IndexedDB first
    const downloaded = await RingoStorage.getDownload(sound.id);
    if (downloaded && downloaded.audioBlob) {
      arrayBuffer = await downloaded.audioBlob.arrayBuffer();
    } else if (sound.audioBlob) {
      arrayBuffer = await sound.audioBlob.arrayBuffer();
    } else if (sound.audioUrl) {
      const resp = await fetch(sound.audioUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching audio source`);
      arrayBuffer = await resp.arrayBuffer();
    } else {
      throw new Error('No audio source available to trim.');
    }

    // Decode audio data (clone buffer to avoid detaching in some browser engines)
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

    const totalDurSec = decodedBuffer.duration;
    const sSec = Math.max(0, Math.min(totalDurSec - 0.25, (startMs || 0) / 1000));
    const eSec = Math.max(sSec + 0.25, Math.min(totalDurSec, (endMs || (totalDurSec * 1000)) / 1000));
    const trimDurSec = eSec - sSec;
    const sampleRate = decodedBuffer.sampleRate;
    const numChannels = decodedBuffer.numberOfChannels;
    const sliceFrames = Math.max(1, Math.round(trimDurSec * sampleRate));

    const offlineCtx = new OfflineAudioContext(numChannels, sliceFrames, sampleRate);
    const sliceBuffer = offlineCtx.createBuffer(numChannels, sliceFrames, sampleRate);
    const startFrame = Math.round(sSec * sampleRate);

    for (let c = 0; c < numChannels; c++) {
      const src = decodedBuffer.getChannelData(c);
      const dst = sliceBuffer.getChannelData(c);
      for (let i = 0; i < sliceFrames; i++) {
        const idx = startFrame + i;
        dst[i] = (idx < src.length) ? src[idx] : 0;
      }
    }

    const srcNode = offlineCtx.createBufferSource();
    srcNode.buffer = sliceBuffer;

    // Apply gentle micro-fade (40ms) or custom fade to eliminate speaker crackle
    const gainNode = offlineCtx.createGain();
    const fadeIn = options.fadeInSec !== undefined ? options.fadeInSec : 0.04;
    const fadeOut = options.fadeOutSec !== undefined ? options.fadeOutSec : 0.04;
    const volume = options.volume !== undefined ? options.volume : 1.0;

    gainNode.gain.setValueAtTime(0.001, 0);
    if (fadeIn > 0) {
      gainNode.gain.linearRampToValueAtTime(volume, Math.min(trimDurSec / 2, fadeIn));
    } else {
      gainNode.gain.setValueAtTime(volume, 0);
    }

    if (fadeOut > 0 && trimDurSec > fadeOut) {
      gainNode.gain.setValueAtTime(volume, trimDurSec - fadeOut);
      gainNode.gain.linearRampToValueAtTime(0.001, trimDurSec);
    }

    srcNode.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    srcNode.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    return encodeAudioBufferToWavBlob(renderedBuffer);
  }

  /**
   * Encodes an AudioBuffer into standard 16-bit PCM RIFF WAV format Blob.
   */
  function encodeAudioBufferToWavBlob(audioBuffer) {
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

    function writeString(offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataByteCount, true);
    writeString(8, 'WAVE');

    // fmt chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data chunk
    writeString(36, 'data');
    view.setUint32(40, dataByteCount, true);

    const channels = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(audioBuffer.getChannelData(c));
    }

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channels[c][i];
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  return {
    play,
    playSegment,
    updateSegmentBounds,
    renderTrimmedWavBlob,
    encodeAudioBufferToWavBlob,
    pause,
    togglePlayPause,
    stop,
    seekTo,
    toggleLoop,
    setVolume,
    setPlaybackRate,
    setEqualizerBand,
    setBassBoost,
    setReverb,
    getEQNodeForFrequencyResponse,
    onStateChange,
    onTimeUpdate,
    set onDurationResolved(fn) { onDurationResolved = fn; },
    get onDurationResolved() { return onDurationResolved; },
    set onTrackCompleted(fn) { onTrackCompleted = fn; },
    get onTrackCompleted() { return onTrackCompleted; },
    getState,
    getAudioContext
  };
})();

// Background Tab & OS Continuity: Prevent audio context from sleeping when switching tabs
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const ctx = RingoAudioEngine.getAudioContext();
    const state = RingoAudioEngine.getState();
    if (ctx && ctx.state === 'suspended' && state.isPlaying) {
      ctx.resume().catch(() => {});
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    const ctx = RingoAudioEngine.getAudioContext();
    const state = RingoAudioEngine.getState();
    if (ctx && ctx.state === 'suspended' && state.isPlaying) {
      ctx.resume().catch(() => {});
    }
  });
}
