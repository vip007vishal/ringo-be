/**
 * RINGO — Offline Downloads & Cache Manager
 * Fetches real audio Blobs, stores them in IndexedDB for 100% offline playback,
 * triggers device storage saving, and calculates cache statistics.
 */

const RingoDownloads = (() => {

  async function downloadTrack(sound) {
    if (!sound) return;

    const secureUrl = (sound.audioUrl || '').replace(/^http:\/\//i, 'https://');
    if (!secureUrl) {
      RingoApp.showToast(`Audio source unavailable for "${sound.title}"`);
      return;
    }

    const filename = sound.filename || `${sound.title}.mp3`;

    // 1. Trigger pure HTTPS download so Kotlin Android WebView DownloadManager receives an https:// URL
    downloadViaHttps(secureUrl, filename);

    if (sound.isDownloaded) {
      RingoApp.showToast(`Downloading "${sound.title}" via HTTPS (Cached: ${sound.fileSize})`);
      return;
    }

    RingoApp.showToast(`Downloading "${sound.title}" via HTTPS...`);

    // 2. Fetch and persist in IndexedDB for offline in-app playback
    try {
      const response = await fetch(secureUrl);
      if (!response.ok) {
        throw new Error(`Download HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      const fileSize = RingoStorage.formatBytes(audioBlob.size);

      // Save in IndexedDB for instant in-browser offline playback
      await RingoStorage.saveDownload(sound, audioBlob);

      // Update in-memory state & notify UI
      RingoAPI.updateSoundDownloadState(sound.id, true, fileSize);
      RingoApp.updateAllSoundCardButtons();
      updateStorageSummaries();

      RingoApp.showToast(`Saved "${sound.title}" to device cache (${fileSize})`);
    } catch (err) {
      console.warn('Offline cache error:', err);
    }
  }

  /**
   * Triggers device download using a clean HTTPS URL.
   * Kotlin Android WebView DownloadManager strictly requires https:// schemes (rejects blob: URLs).
   */
  function downloadViaHttps(httpsUrl, filename) {
    try {
      const secureUrl = httpsUrl.replace(/^http:\/\//i, 'https://');

      // If Kotlin Android WebView exposes a JavaScript interface, pass HTTPS URL directly
      if (window.Android && typeof window.Android.downloadSong === 'function') {
        window.Android.downloadSong(secureUrl, filename);
        return;
      }
      if (window.Android && typeof window.Android.downloadFile === 'function') {
        window.Android.downloadFile(secureUrl, filename);
        return;
      }
      if (window.AndroidBridge && typeof window.AndroidBridge.download === 'function') {
        window.AndroidBridge.download(secureUrl, filename);
        return;
      }

      // Standard browser & WebView DownloadListener trigger
      const a = document.createElement('a');
      a.href = secureUrl;
      a.download = filename || 'audio.mp3';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
      }, 1000);
    } catch (e) {
      console.warn('downloadViaHttps failed:', e);
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
        if (a.parentNode) {
          document.body.removeChild(a);
        }
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
