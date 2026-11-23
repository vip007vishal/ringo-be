/**
 * RINGO — Offline Downloads & Cache Manager
 * Fetches real audio Blobs, stores them in IndexedDB for 100% offline playback,
 * triggers device storage saving, and calculates cache statistics.
 */

const RingoDownloads = (() => {

  async function downloadTrack(sound) {
    if (!sound) return;

    // Guarantee HTTPS URL strictly
    const secureUrl = (sound.audioUrl || '').replace(/^http:\/\//i, 'https://');
    if (!secureUrl) {
      RingoApp.showToast(`Audio source unavailable for "${sound.title}"`);
      return;
    }

    const filename = sound.filename || `${sound.title}.mp3`;

    // Notify user immediately - no redirect, stays completely seamless on the current screen
    RingoApp.showToast(`Downloading "${sound.title}" via HTTPS...`);

    // 1. Dispatch pure HTTPS download trigger (Android WebView DownloadListener / Native Bridge compatible)
    downloadViaHttps(secureUrl, filename, sound);

    // 2. Concurrently fetch via HTTPS for offline caching & seamless in-browser download
    try {
      const response = await fetch(secureUrl, {
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      const fileSize = RingoStorage.formatBytes(audioBlob.size);

      // Save in IndexedDB for instant in-browser offline playback
      await RingoStorage.saveDownload(sound, audioBlob);

      // Update in-memory state & notify UI
      RingoAPI.updateSoundDownloadState(sound.id, true, fileSize);
      RingoApp.updateAllSoundCardButtons();
      updateStorageSummaries();

      // Trigger local device file saving seamlessly without any page redirection or tab opening
      saveBlobToDeviceFile(audioBlob, filename);

      RingoApp.showToast(`Saved "${sound.title}" to device storage (${fileSize})`);
    } catch (err) {
      console.warn('Seamless download cache note:', err);
    }
  }

  /**
   * Triggers device download using a clean HTTPS URL without redirecting the page.
   * Compatible with Kotlin Android WebView DownloadManager & DownloadListener.
   */
  function downloadViaHttps(httpsUrl, filename, sound = null) {
    try {
      const secureUrl = httpsUrl.replace(/^http:\/\//i, 'https://');

      // 1. If Kotlin Android WebView exposes a JavaScript interface, pass HTTPS URL directly
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

      // 2. Dispatch custom DOM event with pure HTTPS URL for native webview hooks
      window.dispatchEvent(new CustomEvent('ringo:download', {
        detail: {
          url: secureUrl,
          filename: filename,
          title: sound ? sound.title : filename,
          mimeType: 'audio/mpeg'
        }
      }));

      // 3. Trigger hidden iframe request with HTTPS URI
      // An invisible subframe never navigates or redirects the main window,
      // while allowing Android WebView's DownloadListener.onDownloadStart to intercept the HTTPS URI.
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0';
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.src = secureUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 8000);
    } catch (e) {
      console.warn('downloadViaHttps failed:', e);
    }
  }

  /**
   * Saves blob locally without redirecting, navigating, or opening a new tab.
   */
  function saveBlobToDeviceFile(blob, filename) {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      // Intentionally NO target='_blank' so it never redirects or opens another page
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 2000);
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
