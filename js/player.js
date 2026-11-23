/**
 * RINGO — Mini Player & Full-Screen Player UI Manager
 * Synchronizes playback state, spinning vinyl artwork, interactive scrubber, and sound actions.
 */

var RingoPlayerUI = (() => {
  let isDraggingScrubber = false;
  let activePlaylistQueue = [];
  let activeQueueIndex = -1;
  let activePlaylistTitle = null;

  function init() {
    setupMiniPlayerEvents();
    setupFullPlayerEvents();

    RingoAudioEngine.onStateChange(updatePlayerState);
    RingoAudioEngine.onTimeUpdate(updateTimeTickers);

    RingoAudioEngine.onTrackCompleted = (completedId) => {
      playNextQueueTrack();
    };
  }

  function setupMiniPlayerEvents() {
    const miniCard = document.getElementById('mini-player-card');
    const miniPlayBtn = document.getElementById('mini-play-btn');
    const miniCloseBtn = document.getElementById('mini-close-btn');

    if (miniCard) {
      miniCard.addEventListener('click', (e) => {
        // Prevent opening full player if clicking play/pause or close
        if (e.target.closest('#mini-play-btn') || e.target.closest('#mini-close-btn')) return;
        openFullPlayer();
      });
    }

    if (miniPlayBtn) {
      miniPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const state = RingoAudioEngine.getState();
        if (state.currentSound) {
          RingoAudioEngine.togglePlayPause(state.currentSound);
        }
      });
    }

    if (miniCloseBtn) {
      miniCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        RingoAudioEngine.stop();
        hideMiniPlayer();
      });
    }
  }

  function setupFullPlayerEvents() {
    const closeBtn = document.getElementById('full-player-close-btn');
    const playBtn = document.getElementById('full-player-play-btn');
    const loopBtn = document.getElementById('full-player-loop-btn');
    const prevBtn = document.getElementById('full-player-prev-btn');
    const nextBtn = document.getElementById('full-player-next-btn');
    const favBtn = document.getElementById('full-player-fav-btn');
    const shareBtn = document.getElementById('full-player-share-btn');
    const eqBtn = document.getElementById('full-player-eq-btn');
    const playlistBtn = document.getElementById('full-player-playlist-btn');
    const setSoundBtn = document.getElementById('full-player-set-sound-btn');
    const downloadBtn = document.getElementById('full-player-download-btn');
    const reportBtn = document.getElementById('full-player-report-btn');
    const scrubber = document.getElementById('full-player-scrubber');
    const waveformCanvas = document.getElementById('full-player-waveform');

    if (closeBtn) closeBtn.addEventListener('click', closeFullPlayer);

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const state = RingoAudioEngine.getState();
        if (state.currentSound) {
          RingoAudioEngine.togglePlayPause(state.currentSound);
        }
      });
    }

    if (loopBtn) {
      loopBtn.addEventListener('click', () => {
        const isLoop = RingoAudioEngine.toggleLoop();
        loopBtn.classList.toggle('active', isLoop);
        loopBtn.innerHTML = RingoComponents.getIcon(isLoop ? 'repeat_one' : 'repeat');
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (activePlaylistQueue.length > 0 && activeQueueIndex > 0) {
          playPreviousQueueTrack();
        } else {
          // Rewind 5 seconds
          const state = RingoAudioEngine.getState();
          RingoAudioEngine.seekTo(Math.max(0, state.currentPositionMs - 5000));
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (activePlaylistQueue.length > 0 && activeQueueIndex < activePlaylistQueue.length - 1) {
          playNextQueueTrack();
        } else {
          // Forward 5 seconds
          const state = RingoAudioEngine.getState();
          RingoAudioEngine.seekTo(state.currentPositionMs + 5000);
        }
      });
    }

    if (favBtn) {
      favBtn.addEventListener('click', () => {
        const state = RingoAudioEngine.getState();
        if (!state.currentSound) return;
        const added = RingoStorage.toggleFavorite(state.currentSound.id);
        RingoAPI.updateSoundFavoriteState(state.currentSound.id, added);
        favBtn.classList.toggle('active', added);
        favBtn.innerHTML = RingoComponents.getIcon(added ? 'favorite' : 'favorite_border');
        RingoApp.showToast(added ? 'Added to personal Favorites!' : 'Removed from Favorites.');
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', handleShareCurrentSound);
    }

    if (eqBtn) {
      eqBtn.addEventListener('click', () => {
        RingoEqualizer.openModal();
      });
    }

    if (playlistBtn) {
      playlistBtn.addEventListener('click', () => {
        const state = RingoAudioEngine.getState();
        if (state.currentSound) {
          RingoPlaylists.openAddToPlaylistSheet(state.currentSound);
        }
      });
    }

    if (setSoundBtn) {
      setSoundBtn.addEventListener('click', () => {
        const state = RingoAudioEngine.getState();
        if (state.currentSound) {
          closeFullPlayer();
          RingoComponents.openSetRingtoneModal(state.currentSound);
        }
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const state = RingoAudioEngine.getState();
        if (state.currentSound) {
          RingoDownloads.downloadTrack(state.currentSound);
        }
      });
    }

    if (reportBtn) {
      reportBtn.addEventListener('click', () => {
        const state = RingoAudioEngine.getState();
        if (state.currentSound) {
          RingoComponents.openReportModal(state.currentSound);
        }
      });
    }

    // Scrubber interaction
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        isDraggingScrubber = true;
        const state = RingoAudioEngine.getState();
        const ratio = parseFloat(e.target.value) / 1000;
        const targetMs = Math.round(ratio * (state.durationMs || 1));
        const curLabel = document.getElementById('full-player-current-time');
        if (curLabel) curLabel.textContent = formatDuration(targetMs);
      });

      scrubber.addEventListener('change', (e) => {
        isDraggingScrubber = false;
        const state = RingoAudioEngine.getState();
        const ratio = parseFloat(e.target.value) / 1000;
        const targetMs = Math.round(ratio * (state.durationMs || 1));
        RingoAudioEngine.seekTo(targetMs);
      });
    }

    // Interactive Waveform Seeking
    if (waveformCanvas) {
      waveformCanvas.addEventListener('click', (e) => {
        const rect = waveformCanvas.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const state = RingoAudioEngine.getState();
        if (state.durationMs > 0) {
          RingoAudioEngine.seekTo(Math.round(ratio * state.durationMs));
        }
      });
    }
  }

  function setQueue(playlistTitle, tracksList, startIndex = 0) {
    activePlaylistTitle = playlistTitle;
    activePlaylistQueue = tracksList;
    activeQueueIndex = startIndex;
    if (startIndex >= 0 && startIndex < tracksList.length) {
      RingoAudioEngine.play(tracksList[startIndex]);
      RingoStorage.recordHistory(tracksList[startIndex]);
    }
  }

  function playNextQueueTrack() {
    if (activePlaylistQueue.length === 0) return;
    if (activeQueueIndex < activePlaylistQueue.length - 1) {
      activeQueueIndex++;
      const nextSound = activePlaylistQueue[activeQueueIndex];
      RingoAudioEngine.play(nextSound);
      RingoStorage.recordHistory(nextSound);
      RingoApp.showToast(`Playing next: "${nextSound.title}"`);
    }
  }

  function playPreviousQueueTrack() {
    if (activePlaylistQueue.length === 0) return;
    if (activeQueueIndex > 0) {
      activeQueueIndex--;
      const prevSound = activePlaylistQueue[activeQueueIndex];
      RingoAudioEngine.play(prevSound);
      RingoStorage.recordHistory(prevSound);
    }
  }

  function handleShareCurrentSound() {
    const state = RingoAudioEngine.getState();
    if (!state.currentSound) return;
    const sound = state.currentSound;

    if (navigator.share) {
      navigator.share({
        title: sound.title,
        text: `Listen to "${sound.title}" by ${sound.creator} on RINGO — 100% Free sound customization app!`,
        url: sound.audioUrl || window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`Listen to "${sound.title}" by ${sound.creator} on RINGO: ${sound.audioUrl || window.location.href}`)
        .then(() => RingoApp.showToast('Share link copied to clipboard!'))
        .catch(() => RingoApp.showToast('Sharing link prepared.'));
    }
  }

  // --- UI Synchronizations ---
  function updatePlayerState(state) {
    const sound = state.currentSound;
    const isPlaying = state.isPlaying;

    if (!sound) {
      hideMiniPlayer();
      return;
    }

    showMiniPlayer();

    // Dynamically update Featured Track Hero Card to display the currently playing track
    if (sound && window.RingoApp && RingoApp.updateFeaturedHeroTrack) {
      RingoApp.updateFeaturedHeroTrack(sound);
    }

    // 1. Update Mini Player DOM
    const miniTitle = document.getElementById('mini-player-title');
    const miniSubtitle = document.getElementById('mini-player-subtitle');
    const miniArt = document.getElementById('mini-player-art-img');
    const miniArtBox = document.getElementById('mini-player-art-box');
    const miniPlayBtn = document.getElementById('mini-play-btn');

    if (miniTitle) miniTitle.textContent = sound.title;
    if (miniSubtitle) {
      const parts = [sound.creator, sound.album, sound.durationFormatted].filter(Boolean);
      miniSubtitle.textContent = parts.join(' · ');
    }
    const miniArtFallback = miniArtBox ? miniArtBox.querySelector('.mini-cover-fallback') : null;
    if (miniArt) {
      if (sound.coverUrl) {
        miniArt.src = sound.coverUrl;
        miniArt.style.display = 'block';
        if (miniArtFallback) miniArtFallback.style.display = 'none';
      } else {
        miniArt.style.display = 'none';
        if (miniArtFallback) miniArtFallback.style.display = 'flex';
      }
      miniArt.onerror = () => {
        miniArt.style.display = 'none';
        if (miniArtFallback) miniArtFallback.style.display = 'flex';
      };
    }
    if (miniArtBox) {
      miniArtBox.classList.toggle('playing', isPlaying);
    }
    if (miniPlayBtn) {
      miniPlayBtn.innerHTML = RingoComponents.getIcon(isPlaying ? 'pause' : 'play');
    }

    // 2. Update Full-Screen Player DOM
    const fullTitle = document.getElementById('full-player-title');
    const fullArtist = document.getElementById('full-player-artist');
    const fullSpecSub = document.getElementById('full-player-spec-sub');
    const fullCover = document.getElementById('full-player-cover-img');
    const fullDisc = document.getElementById('full-player-disc');
    const fullPlayBtn = document.getElementById('full-player-play-btn');
    const fullFavBtn = document.getElementById('full-player-fav-btn');
    const fullDownloadBtn = document.getElementById('full-player-download-btn');
    const fullEqBtn = document.getElementById('full-player-eq-btn');
    const playlistTag = document.getElementById('full-player-playlist-name');

    if (fullTitle) fullTitle.textContent = sound.title;
    if (fullArtist) fullArtist.textContent = sound.creator;
    if (fullSpecSub) {
      const parts = [
        sound.album ? `Album: ${sound.album}` : null,
        sound.composer ? `Music: ${sound.composer}` : null,
        sound.year || null,
        sound.category || null,
        sound.format || 'MP3 · Audio'
      ].filter(Boolean);
      fullSpecSub.textContent = parts.join(' · ');
    }
    if (fullCover) {
      fullCover.src = sound.coverUrl || 'assets/images/ringo_logo.jpg';
      fullCover.style.display = 'block';
      const placeholderSvg = fullCover.parentElement ? fullCover.parentElement.querySelector('svg') : null;
      if (placeholderSvg) placeholderSvg.style.display = 'none';
    }
    if (fullDisc) {
      fullDisc.classList.toggle('spinning', isPlaying);
    }
    if (fullPlayBtn) {
      fullPlayBtn.innerHTML = RingoComponents.getIcon(isPlaying ? 'pause' : 'play');
    }
    if (fullFavBtn) {
      fullFavBtn.classList.toggle('active', sound.isFavorite);
      fullFavBtn.innerHTML = RingoComponents.getIcon(sound.isFavorite ? 'favorite' : 'favorite_border');
    }
    if (fullEqBtn) {
      fullEqBtn.classList.toggle('active', RingoEqualizer.isEnabled);
    }
    if (fullDownloadBtn) {
      const isDl = sound.isDownloaded;
      fullDownloadBtn.classList.toggle('downloaded', isDl);
      fullDownloadBtn.innerHTML = `
        ${RingoComponents.getIcon(isDl ? 'check' : 'download')}
        <span>${isDl ? 'Downloaded to Device' : `Download Offline (${sound.fileSize || 'MP3'})`}</span>
      `;
    }
    if (playlistTag) {
      playlistTag.textContent = activePlaylistTitle || '';
      playlistTag.style.display = activePlaylistTitle ? 'block' : 'none';
    }

    // Specifications Card in Full Player
    const specFormat = document.getElementById('spec-val-format');
    const specSize = document.getElementById('spec-val-size');
    const specYear = document.getElementById('spec-val-year');
    const specAlbum = document.getElementById('spec-val-album');
    const specSingers = document.getElementById('spec-val-singers');
    const specComposer = document.getElementById('spec-val-composer');

    if (specFormat) specFormat.textContent = sound.format || 'MP3 · Audio';
    if (specSize) specSize.textContent = sound.fileSize || 'Online';
    if (specYear) specYear.textContent = sound.year || '—';
    if (specAlbum) specAlbum.textContent = sound.album || '—';
    if (specSingers) specSingers.textContent = sound.singers && sound.singers.length > 0 ? sound.singers.join(', ') : sound.creator;
    if (specComposer) specComposer.textContent = sound.composer || '—';

    // Synchronize play buttons across sound cards
    document.querySelectorAll('.sound-card').forEach(card => {
      const cardId = card.dataset.id;
      const isThisPlaying = (cardId === sound.id && isPlaying);
      card.classList.toggle('playing', isThisPlaying);
      const btn = card.querySelector('.sound-art-btn');
      if (btn) btn.innerHTML = RingoComponents.getIcon(isThisPlaying ? 'pause' : 'play');
    });

    // Synchronize Featured Hero card
    const heroCard = document.querySelector('.featured-hero-card');
    if (heroCard) {
      const heroId = heroCard.dataset.id;
      const isHeroPlaying = Boolean(sound && heroId === sound.id && isPlaying);
      heroCard.classList.toggle('playing', isHeroPlaying);
      const heroBtn = heroCard.querySelector('.featured-play-btn');
      if (heroBtn) {
        heroBtn.innerHTML = RingoComponents.getIcon(isHeroPlaying ? 'pause' : 'play');
        heroBtn.setAttribute('aria-label', isHeroPlaying ? 'Pause' : 'Play');
        heroBtn.title = isHeroPlaying ? 'Pause' : 'Play';
      }
    }
  }

  function updateTimeTickers(posMs, durMs) {
    if (durMs <= 0) return;
    const progress = Math.max(0, Math.min(1, posMs / durMs));

    // Mini Player Progress Bar
    const miniFill = document.getElementById('mini-progress-fill');
    if (miniFill) {
      miniFill.style.width = `${(progress * 100).toFixed(1)}%`;
    }

    // Full Player Scrubber & Time Labels
    if (!isDraggingScrubber) {
      const scrubber = document.getElementById('full-player-scrubber');
      if (scrubber) scrubber.value = Math.round(progress * 1000);

      const curLabel = document.getElementById('full-player-current-time');
      const durLabel = document.getElementById('full-player-total-time');
      if (curLabel) curLabel.textContent = formatDuration(posMs);
      if (durLabel) durLabel.textContent = formatDuration(durMs);
    }

    // Full Player Waveform Visualizer Canvas
    const canvas = document.getElementById('full-player-waveform');
    if (canvas) {
      const state = RingoAudioEngine.getState();
      const amps = state.currentSound ? state.currentSound.waveformAmplitudes : [];
      RingoWaveform.drawCardWaveform(canvas, amps, progress, state.isPlaying, {
        activeColor: '#B58AFF',
        inactiveColor: '#2E263D'
      });
    }

    // Hero Waveform Visualizer & Live Time Counter
    const heroCard = document.querySelector('.featured-hero-card');
    if (heroCard) {
      const heroCanvas = heroCard.querySelector('.featured-waveform-canvas');
      const heroId = heroCard.dataset.id;
      const state = RingoAudioEngine.getState();
      const isHeroCurrent = Boolean(state.currentSound && heroId === state.currentSound.id);
      const heroProgress = isHeroCurrent ? progress : 0;

      if (heroCanvas) {
        const heroAmps = heroCanvas.amplitudes || (isHeroCurrent && state.currentSound ? state.currentSound.waveformAmplitudes : null);
        RingoWaveform.drawCardWaveform(heroCanvas, heroAmps, heroProgress, isHeroCurrent && state.isPlaying, {
          activeColor: '#B58AFF',
          inactiveColor: '#282138'
        });
      }

      const durLabel = heroCard.querySelector('.featured-hero-duration');
      if (durLabel) {
        if (isHeroCurrent && state.isPlaying) {
          durLabel.textContent = `${formatDuration(posMs)} / ${formatDuration(durMs)}`;
        } else if (heroCard.dataset.duration) {
          durLabel.textContent = heroCard.dataset.duration;
        }
      }
    }

    // Active Playing Sound Card Waveform Visualizer
    const curSound = RingoAudioEngine.getState().currentSound;
    if (curSound) {
      const activeCard = document.querySelector(`.sound-card.playing[data-id="${curSound.id}"]`);
      if (activeCard) {
        const cardCanvas = activeCard.querySelector('.sound-card-waveform');
        if (cardCanvas) {
          RingoWaveform.drawCardWaveform(cardCanvas, curSound.waveformAmplitudes, progress, isPlaying, {
            activeColor: '#B58AFF',
            inactiveColor: '#2C243C'
          });
        }
      }
    }
  }

  function showMiniPlayer() {
    const mini = document.getElementById('mini-player-container');
    if (mini) mini.classList.remove('hidden');
  }

  function hideMiniPlayer() {
    const mini = document.getElementById('mini-player-container');
    if (mini) mini.classList.add('hidden');
  }

  function openFullPlayer() {
    const modal = document.getElementById('full-player-modal');
    if (modal) {
      modal.classList.add('show');
      const state = RingoAudioEngine.getState();
      updatePlayerState(state);
    }
  }

  function closeFullPlayer() {
    const modal = document.getElementById('full-player-modal');
    if (modal && modal.classList.contains('show')) {
      modal.classList.remove('show');
    }
  }

  function formatDuration(ms) {
    if (!ms || ms <= 0) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function playTrack(sound) {
    if (!sound) return;
    RingoAudioEngine.togglePlayPause(sound);
    showMiniPlayer();
  }

  return {
    init,
    openFullPlayer,
    closeFullPlayer,
    showMiniPlayer,
    hideMiniPlayer,
    setQueue,
    playNextQueueTrack,
    playPreviousQueueTrack,
    playTrack
  };
})();

var RingoPlayer = RingoPlayerUI;
if (typeof window !== 'undefined') {
  window.RingoPlayerUI = RingoPlayerUI;
  window.RingoPlayer = RingoPlayerUI;
}

