/**
 * RINGO — Offline Downloads & Cache Manager
 * Fetches real audio Blobs, stores them in IndexedDB for 100% offline playback,
 * triggers device storage saving, and calculates cache statistics.
 */

const RingoDownloads = (() => {

  async function downloadTrack(sound) {
    if (sound.isDownloaded) {
      RingoApp.showToast(`"${sound.title}" is already saved offline (${sound.fileSize})`);
      return;
    }

    if (!sound.audioUrl) {
      RingoApp.showToast(`Audio source unavailable for "${sound.title}"`);
      return;
    }

    RingoApp.showToast(`Downloading "${sound.title}" to device storage...`);

    try {
      const response = await fetch(sound.audioUrl);
      if (!response.ok) {
        throw new Error(`Download HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      const fileSize = RingoStorage.formatBytes(audioBlob.size);

      // 1. Save in IndexedDB for instant in-browser offline playback
      await RingoStorage.saveDownload(sound, audioBlob);

      // 2. Also trigger device file download so it appears in the device's Music folder
      saveBlobToDeviceFile(audioBlob, sound.filename || `${sound.title}.mp3`);

      // 3. Update in-memory state & notify UI
      RingoAPI.updateSoundDownloadState(sound.id, true, fileSize);
      RingoApp.updateAllSoundCardButtons();
      updateStorageSummaries();

      RingoApp.showToast(`Saved "${sound.title}" to Mobile Storage (${fileSize})`);
    } catch (err) {
      console.warn('Download error:', err);
      RingoApp.showToast(`Download failed: ${err.message}`);
    }
  }

  function saveBlobToDeviceFile(blob, filename) {
    try {
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
    } catch (e) {
      console.warn('saveBlobToDeviceFile failed:', e);
    }
  }

  async function removeDownload(soundId) {
    await RingoStorage.removeDownload(soundId);
    RingoAPI.updateSoundDownloadState(soundId, false, 'Online');
    RingoApp.updateAllSoundCardButtons();
    updateStorageSummaries();
    renderDownloadsTab();
    RingoApp.showToast('Downloaded sound removed from offline cache.');
  }

  async function renderDownloadsTab() {
    const container = document.getElementById('library-downloads-list');
    if (!container) return;

    const downloads = await RingoStorage.getAllDownloads();

    if (downloads.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          ${RingoComponents.getIcon('download_done', 'empty-state-icon')}
          <div class="empty-state-title">No downloaded sounds yet</div>
          <div class="empty-state-desc">Tap the download icon on any song or ringtone to play offline without an internet connection.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    downloads.forEach(d => {
      const soundItem = {
        ...d,
        isDownloaded: true,
        waveformAmplitudes: [0.3, 0.6, 0.9, 0.7, 0.4, 0.8, 1.0, 0.6, 0.4, 0.8]
      };
      const card = RingoComponents.createSoundCard(soundItem, {
        isDownloadTab: true,
        onRemove: () => removeDownload(soundItem.id)
      });
      container.appendChild(card);
    });
  }

  async function updateStorageSummaries() {
    const downloads = await RingoStorage.getAllDownloads();
    let totalBytes = 0;
    downloads.forEach(d => {
      if (d.audioBlob && d.audioBlob.size) {
        totalBytes += d.audioBlob.size;
      }
    });

    const sizeStr = RingoStorage.formatBytes(totalBytes);
    const countStr = downloads.length === 1 ? '1 file' : `${downloads.length} files`;

    const summaryText = document.getElementById('storage-summary-count');
    if (summaryText) {
      summaryText.textContent = downloads.length === 0 ? '0 files downloaded' : `${countStr} (${sizeStr})`;
    }

    const profileCacheText = document.getElementById('profile-cache-size');
    if (profileCacheText) {
      profileCacheText.textContent = `Audio Cache: ${sizeStr}`;
    }
  }

  async function getTotalDownloadedBytes() {
    const downloads = await RingoStorage.getAllDownloads();
    let totalBytes = 0;
    downloads.forEach(d => {
      if (d.audioBlob && d.audioBlob.size) {
        totalBytes += d.audioBlob.size;
      }
    });
    return totalBytes;
  }

  async function getDownloadedSounds() {
    return await RingoStorage.getAllDownloads();
  }

  async function clearAllDownloads() {
    const downloads = await RingoStorage.getAllDownloads();
    for (const d of downloads) {
      await RingoStorage.removeDownload(d.id);
    }
    updateStorageSummaries();
    renderDownloadsTab();
  }

  return {
    downloadTrack,
    removeDownload,
    renderDownloadsTab,
    updateStorageSummaries,
    getTotalDownloadedBytes,
    getDownloadedSounds,
    clearAllDownloads
  };
})();
