/**
 * RINGO — Local Playlists Manager
 * Full local CRUD for on-device playlists, track membership, and queue playback.
 */

const RingoPlaylists = (() => {
  let cachedPlaylists = [];
  let openedPlaylistId = null;
  let targetSoundForAdd = null;

  async function init() {
    cachedPlaylists = await RingoStorage.getPlaylists();
    setupEventListeners();
  }

  function setupEventListeners() {
    // New Playlist Modal
    const createBtn = document.getElementById('playlist-create-btn');
    const modal = document.getElementById('playlist-new-modal');
    const cancelBtn = document.getElementById('playlist-new-cancel');
    const saveBtn = document.getElementById('playlist-new-save');

    if (createBtn && modal) {
      createBtn.addEventListener('click', () => {
        document.getElementById('playlist-new-title').value = '';
        document.getElementById('playlist-new-desc').value = '';
        modal.classList.add('show');
      });
    }

    if (cancelBtn && modal) {
      cancelBtn.addEventListener('click', () => modal.classList.remove('show'));
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', handleCreateNewPlaylist);
    }

    // Add to Playlist Sheet Close
    const addSheet = document.getElementById('add-to-playlist-modal');
    const addCloseBtn = document.getElementById('add-playlist-close-btn');
    if (addCloseBtn && addSheet) {
      addCloseBtn.addEventListener('click', () => addSheet.classList.remove('show'));
    }

    // Add Track Inline Create Toggle
    const inlineCreateBtn = document.getElementById('add-playlist-inline-create-btn');
    const inlineForm = document.getElementById('add-playlist-inline-form');
    if (inlineCreateBtn && inlineForm) {
      inlineCreateBtn.addEventListener('click', () => {
        inlineForm.style.display = inlineForm.style.display === 'none' ? 'block' : 'none';
      });
    }

    const inlineSaveBtn = document.getElementById('add-playlist-inline-save');
    if (inlineSaveBtn) {
      inlineSaveBtn.addEventListener('click', handleInlineCreateAndAdd);
    }
  }

  async function handleCreateNewPlaylist() {
    const titleInput = document.getElementById('playlist-new-title');
    const descInput = document.getElementById('playlist-new-desc');
    const title = (titleInput && titleInput.value.trim()) || 'My Playlist';
    const desc = (descInput && descInput.value.trim()) || '';

    const newPl = {
      id: `pl_${Date.now()}`,
      title: title,
      description: desc,
      soundIds: [],
      iconName: 'queue_music',
      isSystem: false,
      createdAt: Date.now()
    };

    await RingoStorage.savePlaylist(newPl);
    cachedPlaylists.push(newPl);

    const modal = document.getElementById('playlist-new-modal');
    if (modal) modal.classList.remove('show');

    renderPlaylistsTab();
    RingoApp.showToast(`Created local playlist "${title}"`);
  }

  async function handleInlineCreateAndAdd() {
    const titleInput = document.getElementById('add-playlist-inline-title');
    const descInput = document.getElementById('add-playlist-inline-desc');
    const title = (titleInput && titleInput.value.trim()) || 'New Playlist';
    const desc = (descInput && descInput.value.trim()) || '';

    const newPl = {
      id: `pl_${Date.now()}`,
      title: title,
      description: desc,
      soundIds: targetSoundForAdd ? [targetSoundForAdd.id] : [],
      iconName: 'queue_music',
      isSystem: false,
      createdAt: Date.now()
    };

    await RingoStorage.savePlaylist(newPl);
    cachedPlaylists.push(newPl);

    const addSheet = document.getElementById('add-to-playlist-modal');
    if (addSheet) addSheet.classList.remove('show');

    renderPlaylistsTab();
    RingoApp.showToast(`Created playlist "${title}" and added track!`);
  }

  async function openAddToPlaylistSheet(sound) {
    targetSoundForAdd = sound;
    const sheet = document.getElementById('add-to-playlist-modal');
    if (!sheet) return;

    const titleEl = document.getElementById('add-playlist-sound-title');
    const artEl = document.getElementById('add-playlist-sound-art');
    if (titleEl) titleEl.textContent = `${sound.title} · ${sound.creator}`;
    if (artEl) artEl.src = sound.coverUrl || 'assets/images/ic_launcher.png';

    // Refresh playlists list
    cachedPlaylists = await RingoStorage.getPlaylists();
    const listContainer = document.getElementById('add-playlist-items-list');

    if (listContainer) {
      listContainer.innerHTML = cachedPlaylists.map(pl => {
        const contains = pl.soundIds.includes(sound.id);
        return `
          <div class="playlist-pick-item" data-id="${pl.id}" style="
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px; margin-bottom: 6px; background-color: #191424;
            border: 1px solid var(--subtle-border); border-radius: 12px; cursor: pointer;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="color: var(--lavender);">${RingoComponents.getIcon(pl.iconName || 'queue_music')}</div>
              <div>
                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">${escapeHtml(pl.title)}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${pl.soundIds.length} tracks</div>
              </div>
            </div>
            <div class="pick-checkbox" style="
              width: 22px; height: 22px; border-radius: 6px;
              border: 1.5px solid ${contains ? 'var(--lavender)' : 'var(--text-muted)'};
              background-color: ${contains ? 'var(--primary-violet)' : 'transparent'};
              display: flex; align-items: center; justify-content: center; color: #FFF;
            ">
              ${contains ? RingoComponents.getIcon('check') : ''}
            </div>
          </div>
        `;
      }).join('');

      listContainer.querySelectorAll('.playlist-pick-item').forEach(item => {
        item.addEventListener('click', async () => {
          const plId = item.dataset.id;
          await toggleSoundInPlaylist(plId, sound.id);
          openAddToPlaylistSheet(sound); // Re-render checkmark
        });
      });
    }

    sheet.classList.add('show');
  }

  async function toggleSoundInPlaylist(playlistId, soundId) {
    const pl = cachedPlaylists.find(x => x.id === playlistId);
    if (!pl) return;

    let added = false;
    if (pl.soundIds.includes(soundId)) {
      pl.soundIds = pl.soundIds.filter(id => id !== soundId);
      added = false;
    } else {
      pl.soundIds.push(soundId);
      added = true;
    }

    await RingoStorage.savePlaylist(pl);
    RingoApp.showToast(added ? `Added to "${pl.title}"` : `Removed from "${pl.title}"`);
    if (openedPlaylistId === playlistId) {
      renderPlaylistDetail(playlistId);
    }
  }

  async function renderPlaylistsTab() {
    const listContainer = document.getElementById('library-playlists-list');
    const detailContainer = document.getElementById('library-playlist-detail');
    if (!listContainer || !detailContainer) return;

    if (openedPlaylistId) {
      listContainer.style.display = 'none';
      detailContainer.style.display = 'block';
      renderPlaylistDetail(openedPlaylistId);
      return;
    }

    listContainer.style.display = 'block';
    detailContainer.style.display = 'none';

    cachedPlaylists = await RingoStorage.getPlaylists();

    const itemsContainer = document.getElementById('playlists-cards-wrapper');
    if (!itemsContainer) return;

    if (cachedPlaylists.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-state-card">
          ${RingoComponents.getIcon('queue_music', 'empty-state-icon')}
          <div class="empty-state-title">No Local Playlists</div>
          <div class="empty-state-desc">Tap "+ New Playlist" above to organize your custom sound collections.</div>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = cachedPlaylists.map(pl => {
      return `
        <div class="playlist-card-item" data-id="${pl.id}">
          <div class="playlist-card-left">
            <div class="playlist-icon-bubble">
              ${RingoComponents.getIcon(pl.iconName || 'queue_music')}
            </div>
            <div class="playlist-card-info">
              <div class="playlist-card-title">${escapeHtml(pl.title)}</div>
              <div class="playlist-card-desc">${escapeHtml(pl.description || 'Local Playlist')}</div>
              <div class="playlist-card-count">${pl.soundIds.length} ${pl.soundIds.length === 1 ? 'track' : 'tracks'} · Stored on device</div>
            </div>
          </div>
          <div style="color: var(--text-muted); padding: 4px;">
            ${RingoComponents.getIcon('chevron_right')}
          </div>
        </div>
      `;
    }).join('');

    itemsContainer.querySelectorAll('.playlist-card-item').forEach(card => {
      card.addEventListener('click', () => {
        openedPlaylistId = card.dataset.id;
        renderPlaylistsTab();
      });
    });
  }

  function renderPlaylistDetail(playlistId) {
    const pl = cachedPlaylists.find(x => x.id === playlistId);
    const detailContainer = document.getElementById('library-playlist-detail');
    if (!pl || !detailContainer) return;

    const allSounds = RingoAPI.getSounds();
    const soundsById = {};
    allSounds.forEach(s => { soundsById[s.id] = s; });

    const tracks = pl.soundIds.map(id => soundsById[id]).filter(Boolean);

    detailContainer.innerHTML = `
      <div class="playlist-detail-container">
        <div class="playlist-detail-back-bar">
          <button class="playlist-back-btn" id="playlist-detail-back-btn">
            ${RingoComponents.getIcon('arrow_back')}
            <span>All Local Playlists</span>
          </button>
          <span class="badge badge-offline">LOCAL ONLY</span>
        </div>

        <div class="playlist-detail-hero">
          <div class="playlist-hero-top">
            <div class="playlist-hero-cover">
              ${RingoComponents.getIcon(pl.iconName || 'queue_music')}
            </div>
            <div class="playlist-hero-info">
              <div class="playlist-hero-title">${escapeHtml(pl.title)}</div>
              <div class="playlist-hero-desc">${escapeHtml(pl.description || '')}</div>
              <div class="playlist-hero-tracks-meta">${tracks.length} ${tracks.length === 1 ? 'track' : 'tracks'} · Stored on this device</div>
            </div>
          </div>
          <div class="playlist-hero-actions">
            <button class="playlist-play-all-btn" id="playlist-hero-play-all" ${tracks.length === 0 ? 'disabled' : ''}>
              ${RingoComponents.getIcon('play')}
              <span>Play All</span>
            </button>
            <button class="playlist-add-tracks-btn" id="playlist-hero-add-tracks">
              ${RingoComponents.getIcon('add')}
              <span>Add Tracks</span>
            </button>
          </div>
        </div>

        <div class="playlist-tracks-list" id="playlist-tracks-container">
          ${tracks.length === 0 ? `
            <div class="empty-state-card" style="margin: 0;">
              ${RingoComponents.getIcon('queue_music', 'empty-state-icon')}
              <div class="empty-state-title">No tracks in this playlist yet</div>
              <div class="empty-state-desc">Tap "Add Tracks" above or use the three-dot menu on any sound to add it to this local playlist.</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Render SoundCards for each track in playlist
    const tracksContainer = document.getElementById('playlist-tracks-container');
    if (tracksContainer && tracks.length > 0) {
      tracks.forEach(track => {
        const card = RingoComponents.createSoundCard(track, {
          onPlay: () => {
            const idx = tracks.findIndex(t => t.id === track.id);
            RingoPlayerUI.setQueue(pl.title, tracks, idx);
          }
        });
        tracksContainer.appendChild(card);
      });
    }

    // Back Button
    const backBtn = document.getElementById('playlist-detail-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        openedPlaylistId = null;
        renderPlaylistsTab();
      });
    }

    // Play All Button
    const playAllBtn = document.getElementById('playlist-hero-play-all');
    if (playAllBtn && tracks.length > 0) {
      playAllBtn.addEventListener('click', () => {
        RingoPlayerUI.setQueue(pl.title, tracks, 0);
        RingoApp.showToast(`Playing playlist "${pl.title}" (${tracks.length} tracks)`);
      });
    }

    // Add Tracks Button
    const addTracksBtn = document.getElementById('playlist-hero-add-tracks');
    if (addTracksBtn) {
      addTracksBtn.addEventListener('click', () => {
        openAddTracksToPlaylistModal(pl);
      });
    }
  }

  function openAddTracksToPlaylistModal(playlist) {
    const modal = document.getElementById('playlist-pick-tracks-modal');
    if (!modal) return;

    const allSounds = RingoAPI.getSounds();
    const listEl = document.getElementById('playlist-pick-tracks-list');

    if (listEl) {
      listEl.innerHTML = allSounds.map(s => {
        const checked = playlist.soundIds.includes(s.id);
        return `
          <div class="pick-track-row" data-id="${s.id}" style="
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px; margin-bottom: 6px; background-color: #191424;
            border-radius: 12px; cursor: pointer; border: 1px solid var(--subtle-border);
          ">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${escapeHtml(s.title)}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">${escapeHtml(s.creator)} · ${s.durationFormatted}</div>
            </div>
            <div style="
              width: 22px; height: 22px; border-radius: 6px;
              border: 1.5px solid ${checked ? 'var(--lavender)' : 'var(--text-muted)'};
              background-color: ${checked ? 'var(--primary-violet)' : 'transparent'};
              display: flex; align-items: center; justify-content: center; color: #FFF;
            ">
              ${checked ? RingoComponents.getIcon('check') : ''}
            </div>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('.pick-track-row').forEach(row => {
        row.addEventListener('click', async () => {
          const soundId = row.dataset.id;
          await toggleSoundInPlaylist(playlist.id, soundId);
          openAddTracksToPlaylistModal(playlist); // re-render checks
        });
      });
    }

    const closeBtn = document.getElementById('playlist-pick-tracks-close');
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.remove('show');
    }

    modal.classList.add('show');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    openAddToPlaylistSheet,
    openAddToPlaylistModal: openAddToPlaylistSheet,
    renderPlaylistsTab,
    renderPlaylistsView(container) {
      renderPlaylistsTab();
    },
    toggleSoundInPlaylist,
    get openedPlaylistId() { return openedPlaylistId; },
    closePlaylistDetail() { openedPlaylistId = null; renderPlaylistsTab(); }
  };
})();
