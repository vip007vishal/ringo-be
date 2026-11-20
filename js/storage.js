/**
 * RINGO — Storage & IndexedDB Persistence Manager
 * Handles LocalStorage (preferences, favorites, EQ) and IndexedDB (offline audio Blobs, creations, playlists).
 */

const RingoStorage = (() => {
  const DB_NAME = 'ringo_offline_db';
  const DB_VERSION = 1;
  let dbInstance = null;

  // LocalStorage keys
  const KEYS = {
    FAVORITES: 'ringo_favorites',
    HISTORY: 'ringo_history',
    EQ_SETTINGS: 'ringo_eq_settings',
    PREFERENCES: 'ringo_preferences',
    CATALOG_CACHE: 'ringo_catalog_cache'
  };

  /**
   * Initializes IndexedDB with stores for downloads, creations, playlists, and songs.
   */
  async function initDB() {
    if (dbInstance) return dbInstance;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store for downloaded audio files & blobs
        if (!db.objectStoreNames.contains('downloads')) {
          db.createObjectStore('downloads', { keyPath: 'id' });
        }

        // Store for Studio user projects / exported cuts
        if (!db.objectStoreNames.contains('creations')) {
          db.createObjectStore('creations', { keyPath: 'id' });
        }

        // Store for local-only playlists
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        resolve(null); // gracefully fallback to memory / localStorage
      };
    });
  }

  // --- IndexedDB Operations Helper ---
  async function getStore(storeName, mode = 'readonly') {
    const db = await initDB();
    if (!db) return null;
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // --- Downloads (Audio Blobs) ---
  async function saveDownload(sound, audioBlob) {
    try {
      const store = await getStore('downloads', 'readwrite');
      if (!store) return false;
      const downloadRecord = {
        id: sound.id,
        title: sound.title,
        creator: sound.creator,
        album: sound.album || '',
        singers: sound.singers || [],
        composer: sound.composer || '',
        year: sound.year || '',
        category: sound.category || 'Music',
        subcategory: sound.subcategory || 'MP3',
        durationFormatted: sound.durationFormatted || 'Stream',
        durationMs: sound.durationMs || 0,
        audioBlob: audioBlob,
        fileSize: formatBytes(audioBlob.size),
        filename: sound.filename || `${sound.id}.mp3`,
        audioUrl: sound.audioUrl || null,
        coverUrl: sound.coverUrl || null,
        downloadedAt: Date.now()
      };
      return new Promise((resolve) => {
        const req = store.put(downloadRecord);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn('saveDownload failed:', e);
      return false;
    }
  }

  async function getDownload(soundId) {
    try {
      const store = await getStore('downloads', 'readonly');
      if (!store) return null;
      return new Promise((resolve) => {
        const req = store.get(soundId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async function getAllDownloads() {
    try {
      const store = await getStore('downloads', 'readonly');
      if (!store) return [];
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  async function removeDownload(soundId) {
    try {
      const store = await getStore('downloads', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.delete(soundId);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  // --- Studio Creations / Custom Cuts ---
  async function saveCreation(project) {
    try {
      const store = await getStore('creations', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.put(project);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  async function getAllCreations() {
    try {
      const store = await getStore('creations', 'readonly');
      if (!store) return [];
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const res = req.result || [];
          res.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          resolve(res);
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  async function deleteCreation(id) {
    try {
      const store = await getStore('creations', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  // --- Local Playlists ---
  const DEFAULT_PLAYLISTS = [
    {
      id: 'pl_ringers',
      title: 'My Call Ringtones',
      description: 'Saved ringtones from your catalog.',
      soundIds: [],
      iconName: 'call',
      isSystem: true,
      createdAt: 1000
    },
    {
      id: 'pl_notifs',
      title: 'Notification Collection',
      description: 'Alert tones for daily messaging.',
      soundIds: [],
      iconName: 'notifications',
      isSystem: true,
      createdAt: 2000
    },
    {
      id: 'pl_alarms',
      title: 'Morning Alarms',
      description: 'Wake-up alarms and morning sounds.',
      soundIds: [],
      iconName: 'alarm',
      isSystem: true,
      createdAt: 3000
    }
  ];

  async function getPlaylists() {
    try {
      const store = await getStore('playlists', 'readonly');
      if (!store) return DEFAULT_PLAYLISTS;
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = async () => {
          const list = req.result;
          if (!list || list.length === 0) {
            // Seed default playlists
            await seedDefaultPlaylists();
            resolve(DEFAULT_PLAYLISTS);
          } else {
            resolve(list);
          }
        };
        req.onerror = () => resolve(DEFAULT_PLAYLISTS);
      });
    } catch (e) {
      return DEFAULT_PLAYLISTS;
    }
  }

  async function seedDefaultPlaylists() {
    try {
      const store = await getStore('playlists', 'readwrite');
      if (!store) return;
      for (const pl of DEFAULT_PLAYLISTS) {
        store.put(pl);
      }
    } catch (e) {}
  }

  async function savePlaylist(playlist) {
    try {
      const store = await getStore('playlists', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.put(playlist);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  async function deletePlaylist(playlistId) {
    try {
      const store = await getStore('playlists', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.delete(playlistId);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  // --- LocalStorage Metadata Methods ---
  function getFavorites() {
    try {
      const raw = localStorage.getItem(KEYS.FAVORITES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function toggleFavorite(soundId) {
    const favs = new Set(getFavorites());
    let added = false;
    if (favs.has(soundId)) {
      favs.delete(soundId);
      added = false;
    } else {
      favs.add(soundId);
      added = true;
    }
    try {
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify(Array.from(favs)));
    } catch (e) {}
    return added;
  }

  function isFavorite(soundId) {
    const favs = new Set(getFavorites());
    return favs.has(soundId);
  }

  function getHistory() {
    try {
      const raw = localStorage.getItem(KEYS.HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function recordHistory(sound) {
    try {
      let list = getHistory();
      list = list.filter(item => item.id !== sound.id);
      list.unshift({
        id: sound.id,
        title: sound.title,
        creator: sound.creator,
        album: sound.album || '',
        category: sound.category || 'Music',
        durationFormatted: sound.durationFormatted || 'Stream',
        audioUrl: sound.audioUrl || '',
        coverUrl: sound.coverUrl || null,
        playedAt: Date.now()
      });
      // Keep up to 50 recent items
      if (list.length > 50) list = list.slice(0, 50);
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(list));
    } catch (e) {}
  }

  function clearHistory() {
    try {
      localStorage.removeItem(KEYS.HISTORY);
    } catch (e) {}
  }

  function getEqualizerSettings() {
    try {
      const raw = localStorage.getItem(KEYS.EQ_SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      isEnabled: false,
      selectedPreset: 'Flat',
      bandLevelsDb: [0, 0, 0, 0, 0],
      bassBoostPercent: 0
    };
  }

  function saveEqualizerSettings(settings) {
    try {
      localStorage.setItem(KEYS.EQ_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }

  function getUserPreferences() {
    try {
      const raw = localStorage.getItem(KEYS.PREFERENCES);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      appLanguage: 'English',
      soundLanguage: 'All (English, Tamil, Hindi...)',
      autoPlayPreviews: true,
      highBitrate: true
    };
  }

  function saveUserPreferences(prefs) {
    try {
      localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {}
  }

  function getUserPreference(key, defaultValue) {
    const prefs = getUserPreferences();
    return (prefs && prefs[key] !== undefined) ? prefs[key] : defaultValue;
  }

  function setUserPreference(key, value) {
    const prefs = getUserPreferences();
    prefs[key] = value;
    saveUserPreferences(prefs);
  }

  function isDownloaded(soundId) {
    // Synchronous check against local download state if available
    try {
      const raw = localStorage.getItem('ringo_downloads_meta');
      if (raw) {
        const set = new Set(JSON.parse(raw));
        return set.has(soundId);
      }
    } catch (e) {}
    return false;
  }

  function getCatalogCache() {
    try {
      const raw = localStorage.getItem(KEYS.CATALOG_CACHE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveCatalogCache(songs) {
    try {
      localStorage.setItem(KEYS.CATALOG_CACHE, JSON.stringify(songs));
    } catch (e) {}
  }

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB';
    return bytes + ' B';
  }

  return {
    initDB,
    saveDownload,
    getDownload,
    getAllDownloads,
    removeDownload,
    isDownloaded,
    saveCreation,
    getAllCreations,
    getCreations: getAllCreations,
    deleteCreation,
    getPlaylists,
    savePlaylist,
    deletePlaylist,
    getFavorites,
    toggleFavorite,
    isFavorite,
    getHistory,
    recordHistory,
    clearHistory,
    getEqualizerSettings,
    saveEqualizerSettings,
    getUserPreferences,
    saveUserPreferences,
    getUserPreference,
    setUserPreference,
    getCatalogCache,
    saveCatalogCache,
    formatBytes
  };
})();
