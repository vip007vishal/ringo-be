/**
 * RINGO — Songs API & Sound Repository Client
 * Fetches and models catalog data from the official GitHub raw repository
 * with bulletproof multi-tier local and embedded fallback.
 */

const RingoAPI = (() => {
  const SONGS_ENDPOINT = 'https://raw.githubusercontent.com/vip007vishal/ringo-music/main/data/songs.json';

  // Indestructible embedded fallback songs catalog with extracted high-res covers and scraped metadata
  const FALLBACK_SONGS = [
    {
      id: 1,
      title: "Agasatha",
      artist: "Pradeep Kumar, Kalyani Nair",
      singers: "Pradeep Kumar, Kalyani Nair",
      album: "Cuckoo",
      composer: "Santhosh Narayanan",
      year: 2014,
      duration: 298,
      category: "Tamil",
      filename: "Agasatha.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Agasatha.mp3",
      cover: "assets/covers/song_1.jpg"
    },
    {
      id: 2,
      title: "Agayam Theepiditha",
      artist: "Santhosh Narayanan, Pradeep Kumar",
      singers: "Santhosh Narayanan, Pradeep Kumar",
      album: "Madras",
      composer: "Santhosh Narayanan",
      year: 2014,
      duration: 230,
      category: "Tamil",
      filename: "Agayam Theepiditha.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Agayam%20Theepiditha.mp3",
      cover: "assets/covers/song_2.jpg"
    },
    {
      id: 3,
      title: "Agent Vikram (Theme Score)",
      artist: "Anirudh Ravichander",
      singers: "Anirudh Ravichander",
      album: "Vikram",
      composer: "Anirudh Ravichander",
      year: 2022,
      duration: 190,
      category: "Tamil",
      filename: "Agent Vikram (Background Score)(MP3_320K).mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Agent%20Vikram%20(Background%20Score)(MP3_320K).mp3",
      cover: "assets/covers/song_3.png"
    },
    {
      id: 4,
      title: "Aila Aila",
      artist: "Aditya Rao, Natalie Di Luccio",
      singers: "Aditya Rao, Natalie Di Luccio",
      album: "I",
      composer: "A.R. Rahman",
      year: 2014,
      duration: 334,
      category: "Tamil",
      filename: "Aila-Aila.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Aila-Aila.mp3",
      cover: "assets/covers/song_4.jpg"
    },
    {
      id: 5,
      title: "Ailasa Ailasa",
      artist: "Anirudh Ravichander, Suchitra",
      singers: "Anirudh Ravichander, Suchitra",
      album: "Vanakkam Chennai",
      composer: "Anirudh Ravichander",
      year: 2013,
      duration: 246,
      category: "Tamil",
      filename: "Ailasa-Ailasa.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Ailasa-Ailasa.mp3",
      cover: "assets/covers/song_5.jpg"
    },
    {
      id: 6,
      title: "Kaariga",
      artist: "Sundaramurthy KS",
      singers: "Sundaramurthy KS",
      album: "Airaa",
      composer: "Sundaramurthy KS",
      year: 2019,
      duration: 261,
      category: "Tamil",
      filename: "Airaa _ Kaariga Lyric Video _ Nayanthara_Kalaiyarasan _ Sarjun KM _ Sundaramurthy KS _ Madhan Karky(MP3_320K).mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Airaa%20_%20Kaariga%20Lyric%20Video%20_%20Nayanthara_Kalaiyarasan%20_%20Sarjun%20KM%20_%20Sundaramurthy%20KS%20_%20Madhan%20Karky(MP3_320K).mp3",
      cover: "assets/covers/song_6.png"
    },
    {
      id: 7,
      title: "Badass",
      artist: "Anirudh Ravichander",
      singers: "Anirudh Ravichander",
      album: "Leo",
      composer: "Anirudh Ravichander",
      year: 2023,
      duration: 230,
      category: "Tamil",
      filename: "Badass-MassTamilan.dev.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Badass-MassTamilan.dev.mp3",
      cover: "assets/covers/song_7.jpg"
    },
    {
      id: 8,
      title: "Kattu Vazhi",
      artist: "Thiagarajan",
      singers: "Thiagarajan",
      album: "Mambattiyan",
      composer: "Thaman S",
      year: 2011,
      duration: 313,
      category: "Tamil",
      filename: "Kattu-Vazhi-MassTamilan.com.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Kattu-Vazhi-MassTamilan.com.mp3",
      cover: "assets/covers/song_8.jpg"
    },
    {
      id: 9,
      title: "Kavan",
      artist: "Navakkarai Naveen Prabanjam",
      singers: "Navakkarai Naveen Prabanjam",
      album: "Bachelor",
      composer: "G. V. Prakash Kumar, Dhibu Ninan Thomas",
      year: 2021,
      duration: 92,
      category: "Tamil",
      filename: "Kavan-MassTamilan.fm.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Kavan-MassTamilan.fm.mp3",
      cover: "assets/covers/song_9.jpg"
    },
    {
      id: 10,
      title: "Unna Ippo Paakkanum",
      artist: "D. Imman, Haricharan, Vandana Srinivasan",
      singers: "Haricharan, Vandana Srinivasan",
      album: "Kayal",
      composer: "D. Imman",
      year: 2014,
      duration: 255,
      category: "Tamil",
      filename: "Kayal - Unna Ippo Paakkanum Video _ Anandhi_ Chandran _ D. Imman(MP3_320K).mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Kayal%20-%20Unna%20Ippo%20Paakkanum%20Video%20_%20Anandhi_%20Chandran%20_%20D.%20Imman(MP3_320K).mp3",
      cover: "assets/covers/song_10.png"
    },
    {
      id: 11,
      title: "Adi Yendi Pulla",
      artist: "Yuvan Shankar Raja",
      singers: "Yuvan Shankar Raja",
      album: "Kazhugu 2",
      composer: "Yuvan Shankar Raja",
      year: 2019,
      duration: 220,
      category: "Tamil",
      filename: "Kazhugu 2 - Adi Yendi Pulla  Video Song _ Yuvan Shankar Raja _ Krishna _ Bindu Madhavi(MP3_320K).mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Kazhugu%202%20-%20Adi%20Yendi%20Pulla%20%20Video%20Song%20_%20Yuvan%20Shankar%20Raja%20_%20Krishna%20_%20Bindu%20Madhavi(MP3_320K).mp3",
      cover: "assets/covers/song_11.png"
    },
    {
      id: 12,
      title: "Keerthana Accident",
      artist: "G. V. Prakash Kumar",
      singers: "G. V. Prakash Kumar",
      album: "Bachelor",
      composer: "G. V. Prakash Kumar",
      year: 2021,
      duration: 47,
      category: "Tamil",
      filename: "Keerthana-Accident-MassTamilan.com.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Keerthana-Accident-MassTamilan.com.mp3",
      cover: "assets/covers/song_12.jpg"
    },
    {
      id: 13,
      title: "Keerthana Intro",
      artist: "G. V. Prakash Kumar",
      singers: "G. V. Prakash Kumar",
      album: "Bachelor",
      composer: "G. V. Prakash Kumar",
      year: 2021,
      duration: 28,
      category: "Tamil",
      filename: "Keerthana-Intro-MassTamilan.com.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Keerthana-Intro-MassTamilan.com.mp3",
      cover: "assets/covers/song_13.jpg"
    },
    {
      id: 14,
      title: "Keerthana",
      artist: "Hiphop Tamizha, Rakhooo",
      singers: "Hiphop Tamizha, Rakhooo",
      album: "Kadaisi Ulaga Por",
      composer: "Hiphop Tamizha",
      year: 2024,
      duration: 142,
      category: "Tamil",
      filename: "Keerthana.mp3",
      audio: "https://raw.githubusercontent.com/vip007vishal/ringo-music/main/songs/Keerthana.mp3",
      cover: "assets/covers/song_14.jpg"
    }
  ];

  let cachedSounds = [];
  let cachedCategories = [];
  let cachedCreators = [];
  let isFetching = false;

  const BASE_WAVEFORM = [
    0.28, 0.52, 0.76, 0.92, 0.64, 0.40, 0.84, 1.0, 0.72, 0.48,
    0.36, 0.68, 0.95, 0.82, 0.44, 0.62, 0.88, 0.74, 0.34, 0.56,
    0.80, 0.94, 0.60, 0.46, 0.72, 0.86, 0.98, 0.58, 0.42, 0.25
  ];

  function generateWaveformForId(id) {
    const shift = Math.abs(id || 0) % BASE_WAVEFORM.length;
    return [...BASE_WAVEFORM.slice(shift), ...BASE_WAVEFORM.slice(0, shift)];
  }

  function formatDurationMs(ms) {
    if (!ms || ms <= 0) return 'Stream';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function splitArtists(str) {
    if (!str || typeof str !== 'string') return [];
    return str
      .split(/[,/&|;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !isSitePlaceholder(s));
  }

  function isSitePlaceholder(name) {
    if (!name) return true;
    const lower = name.toLowerCase().trim();
    return /^(www\.)?(masstamilan|starmusiq|isaimini|tamiltunes|pagalworld|djpunjab|mr-jatt|songs\.pk|unknown artist|unknown)(\.[a-z]{2,})?$/.test(lower);
  }

  function getSoundType(category, filename) {
    const text = `${category || ''} ${filename || ''}`.toLowerCase();
    if (text.includes('notification') || text.includes('alert')) return 'NOTIFICATION';
    if (text.includes('alarm') || text.includes('wake')) return 'ALARM';
    if (text.includes('effect') || text.includes('sfx')) return 'EFFECT';
    return 'RINGTONE';
  }

  function getCategoryStyle(title) {
    const t = (title || '').toLowerCase();
    if (t.includes('music')) return { icon: 'music_note', color: '#8B5CF6' };
    if (t.includes('indian') || t.includes('tamil') || t.includes('hindi')) return { icon: 'audiotrack', color: '#F59E0B' };
    if (t.includes('movie') || t.includes('cinema')) return { icon: 'movie', color: '#EC4899' };
    if (t.includes('game') || t.includes('gaming')) return { icon: 'sports_esports', color: '#10B981' };
    if (t.includes('anime')) return { icon: 'auto_awesome', color: '#F43F5E' };
    if (t.includes('notification')) return { icon: 'notifications', color: '#06B6D4' };
    if (t.includes('alarm')) return { icon: 'alarm', color: '#F59E0B' };
    if (t.includes('nature')) return { icon: 'nature', color: '#10B981' };
    if (t.includes('ambient') || t.includes('relax')) return { icon: 'waves', color: '#6366F1' };
    if (t.includes('funny') || t.includes('comedy')) return { icon: 'sentiment_very_satisfied', color: '#FBBF24' };
    return { icon: 'graphic_eq', color: '#8B5CF6' };
  }

  /**
   * Maps SongDto from JSON response to SoundItem format.
   * Enriches with scraped ID3 metadata (album, composer, singers, high-res covers).
   */
  function mapDtoToSound(dto, downloadsMap = {}, favoritesSet = new Set()) {
    const numericId = dto.id || 0;
    const fallbackMeta = FALLBACK_SONGS.find(f => 
      f.id === numericId || 
      (f.filename && dto.filename && f.filename.toLowerCase() === dto.filename.toLowerCase()) || 
      (f.title && dto.title && f.title.toLowerCase() === dto.title.toLowerCase())
    );

    const effectiveDto = fallbackMeta ? {
      ...fallbackMeta,
      ...dto,
      singers: (dto.singers && !isSitePlaceholder(dto.singers)) ? dto.singers : fallbackMeta.singers,
      album: (dto.album && !isSitePlaceholder(dto.album)) ? dto.album : fallbackMeta.album,
      composer: (dto.composer && !isSitePlaceholder(dto.composer)) ? dto.composer : fallbackMeta.composer,
      year: dto.year || fallbackMeta.year,
      cover: dto.cover || fallbackMeta.cover
    } : dto;

    const soundId = `song_${numericId}`;
    const ext = (effectiveDto.filename ? effectiveDto.filename.split('.').pop() : 'mp3').toUpperCase();
    const durationMs = effectiveDto.duration ? effectiveDto.duration * 1000 : 0;
    const durationFormatted = formatDurationMs(durationMs);

    const singers = splitArtists(effectiveDto.singers || effectiveDto.artist);
    const album = (effectiveDto.album && !isSitePlaceholder(effectiveDto.album)) ? effectiveDto.album.trim() : '';
    const composer = (effectiveDto.composer && !isSitePlaceholder(effectiveDto.composer)) ? effectiveDto.composer.trim() : '';
    const effectiveCreator = singers.length > 0 ? singers.join(', ') : (effectiveDto.artist || 'RINGO Original');

    const isDownloaded = Boolean(downloadsMap[soundId]);
    const isFav = favoritesSet.has(soundId);

    return {
      id: soundId,
      rawId: numericId,
      title: effectiveDto.title || 'Untitled Sound',
      creator: effectiveCreator,
      category: effectiveDto.category || 'Tamil',
      subcategory: ext,
      durationFormatted: durationFormatted,
      durationMs: durationMs,
      album: album,
      singers: singers,
      composer: composer,
      year: effectiveDto.year ? String(effectiveDto.year) : '',
      coverUrl: effectiveDto.cover || (numericId ? `assets/covers/song_${numericId}.${(numericId === 3 || numericId === 6 || numericId === 10 || numericId === 11) ? 'png' : 'jpg'}` : 'assets/images/ic_launcher.png'),
      coverArtPath: null,
      format: `${ext} · Audio`,
      fileSize: isDownloaded ? (downloadsMap[soundId].fileSize || '3.2 MB') : 'Online',
      plays: 1200 + (numericId * 37) % 8500,
      downloads: 450 + (numericId * 23) % 4300,
      likes: 80 + (numericId * 17) % 1200,
      tags: [effectiveDto.category, album, ext].filter(Boolean),
      description: `${effectiveDto.title} by ${effectiveCreator} (${album || effectiveDto.category})`,
      license: '100% Free',
      language: effectiveDto.category || 'Tamil',
      soundType: getSoundType(effectiveDto.category, effectiveDto.filename),
      waveformAmplitudes: generateWaveformForId(numericId),
      audioUrl: effectiveDto.audio,
      filename: effectiveDto.filename || `${effectiveDto.title}.mp3`,
      isFavorite: isFav,
      isDownloaded: isDownloaded,
      isRingoOriginal: numericId === 1 || (effectiveDto.category && effectiveDto.category.toLowerCase().includes('original'))
    };
  }

  /**
   * Derives categories and artists from the sounds list.
   */
  function deriveMetadata(sounds) {
    if (!sounds || sounds.length === 0) return;

    // 1. Categories
    const groupMap = {};
    sounds.forEach(sound => {
      const cat = sound.category || 'Tamil';
      if (!groupMap[cat]) groupMap[cat] = [];
      groupMap[cat].push(sound);
    });

    cachedCategories = Object.keys(groupMap).map(catTitle => {
      const catItems = groupMap[catTitle];
      const style = getCategoryStyle(catTitle);
      const subcats = Array.from(new Set(catItems.map(s => s.subcategory).filter(Boolean)));
      return {
        id: `cat_${catTitle.toLowerCase().replace(/\s+/g, '_')}`,
        title: catTitle,
        name: catTitle,
        icon: style.icon,
        iconName: style.icon,
        description: `${catItems.length} tracks in ${catTitle}`,
        soundCount: catItems.length,
        color: style.color,
        subcategories: subcats
      };
    });

    // 2. Creators / Artists
    const artistAcc = {};
    const palette = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EC4899'];

    sounds.forEach(sound => {
      const allNames = [];
      if (sound.singers && sound.singers.length > 0) {
        sound.singers.forEach(s => allNames.push({ name: s, role: 'Singer' }));
      }
      if (sound.composer) {
        splitArtists(sound.composer).forEach(c => allNames.push({ name: c, role: 'Composer' }));
      }
      if (allNames.length === 0 && sound.creator) {
        splitArtists(sound.creator).forEach(a => allNames.push({ name: a, role: 'Artist' }));
      }

      allNames.forEach(({ name, role }) => {
        const cleanName = name.trim();
        if (!cleanName || isSitePlaceholder(cleanName)) return;
        const key = cleanName.toLowerCase();
        if (!artistAcc[key]) {
          artistAcc[key] = {
            displayName: cleanName,
            songIds: new Set(),
            roles: new Set(),
            albums: new Set(),
            coverUrl: sound.coverUrl
          };
        }
        artistAcc[key].songIds.add(sound.id);
        artistAcc[key].roles.add(role);
        if (sound.album) artistAcc[key].albums.add(sound.album);
      });
    });

    cachedCreators = Object.values(artistAcc)
      .sort((a, b) => b.songIds.size - a.songIds.size)
      .map((acc, idx) => {
        const rolesArr = Array.from(acc.roles);
        let roleLabel = 'Artist';
        if (rolesArr.includes('Composer') && rolesArr.includes('Singer')) {
          roleLabel = 'Composer & Singer';
        } else if (rolesArr.includes('Composer')) {
          roleLabel = 'Composer';
        } else if (rolesArr.includes('Singer')) {
          roleLabel = 'Singer';
        }

        return {
          id: `creator_${acc.displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          name: acc.displayName,
          handle: `@${acc.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          bio: `${acc.songIds.size} track(s) · ${roleLabel}`,
          uploadsCount: acc.songIds.size,
          avatarColor: palette[idx % palette.length],
          avatarUrl: acc.coverUrl,
          role: roleLabel,
          albums: Array.from(acc.albums),
          isVerified: true
        };
      });
  }

  /**
   * Fetches the catalog with multi-tier fallback:
   * 1. Remote GitHub raw endpoint (no custom headers to avoid CORS preflight 403)
   * 2. Local data/songs.json file
   * 3. LocalStorage catalog cache
   * 4. Embedded FALLBACK_SONGS array (indestructible guarantee)
   */
  async function fetchCatalog(userInitiated = false) {
    if (isFetching && cachedSounds.length > 0) return cachedSounds;
    isFetching = true;

    let downloads = [];
    try {
      if (typeof RingoStorage !== 'undefined' && RingoStorage.getAllDownloads) {
        downloads = (await RingoStorage.getAllDownloads()) || [];
      }
    } catch (e) {
      downloads = [];
    }

    const downloadsMap = {};
    downloads.forEach(d => { if (d && d.id) downloadsMap[d.id] = d; });

    let favoritesSet = new Set();
    try {
      if (typeof RingoStorage !== 'undefined' && RingoStorage.getFavorites) {
        favoritesSet = new Set(RingoStorage.getFavorites() || []);
      }
    } catch (e) {
      favoritesSet = new Set();
    }

    let songsData = null;

    // Strategy 1: Remote endpoint with simple GET (NO custom headers!)
    try {
      const url = `${SONGS_ENDPOINT}?_=${Date.now()}`;
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        if (json && Array.isArray(json.songs) && json.songs.length > 0) {
          songsData = json.songs;
          console.log('[RingoAPI] Remote fetch succeeded:', songsData.length, 'tracks.');
        }
      }
    } catch (netErr) {
      console.warn('[RingoAPI] Remote fetch failed, trying local fallback:', netErr.message);
    }

    // Strategy 2: Local data/songs.json
    if (!songsData) {
      try {
        const localResp = await fetch('data/songs.json');
        if (localResp.ok) {
          const json = await localResp.json();
          if (json && Array.isArray(json.songs) && json.songs.length > 0) {
            songsData = json.songs;
            console.log('[RingoAPI] Local data/songs.json fetch succeeded:', songsData.length, 'tracks.');
          }
        }
      } catch (localErr) {
        console.warn('[RingoAPI] Local fetch failed:', localErr.message);
      }
    }

    // Strategy 3: LocalStorage cache
    if (!songsData) {
      try {
        if (typeof RingoStorage !== 'undefined' && RingoStorage.getCatalogCache) {
          const cached = RingoStorage.getCatalogCache();
          if (cached && Array.isArray(cached) && cached.length > 0) {
            songsData = cached;
            console.log('[RingoAPI] Restored from LocalStorage cache:', songsData.length, 'tracks.');
          }
        }
      } catch (cErr) {}
    }

    // Strategy 4: Embedded Fallback Array
    if (!songsData || songsData.length === 0) {
      songsData = FALLBACK_SONGS;
      console.log('[RingoAPI] Using embedded fallback catalog:', songsData.length, 'tracks.');
    }

    // Enrich catalog with scraped metadata and extracted cover images
    const fallbackMap = {};
    FALLBACK_SONGS.forEach(f => { fallbackMap[f.id] = f; });
    songsData = songsData.map(song => {
      const fb = fallbackMap[song.id] || {};
      const needsTitleFix = !song.title || song.title.includes('ï¿') || song.title.includes('Video') || song.title.includes('');
      const needsAlbumFix = !song.album || song.album.includes('ï¿') || song.album.includes('MassTamilan') || song.album.includes('');
      return {
        ...fb,
        ...song,
        title: (needsTitleFix && fb.title) ? fb.title : (song.title || fb.title),
        album: (needsAlbumFix && fb.album) ? fb.album : (song.album || fb.album),
        cover: song.cover || fb.cover || `assets/covers/song_${song.id}.${(song.id === 3 || song.id === 6 || song.id === 10 || song.id === 11) ? 'png' : 'jpg'}`,
        artist: (song.artist && !song.artist.includes('')) ? song.artist : (fb.artist || song.artist),
        singers: (song.singers && !song.singers.includes('')) ? song.singers : (fb.singers || fb.artist || song.artist),
        composer: song.composer || fb.composer,
        year: song.year || fb.year
      };
    });

    const mappedSounds = songsData.map(dto => mapDtoToSound(dto, downloadsMap, favoritesSet));

    // Merge any offline downloaded tracks that might not be in remote catalog
    const mappedIds = new Set(mappedSounds.map(s => s.id));
    const extraOffline = downloads
      .filter(d => !mappedIds.has(d.id))
      .map(d => ({
        ...d,
        isDownloaded: true,
        isFavorite: favoritesSet.has(d.id),
        waveformAmplitudes: BASE_WAVEFORM
      }));

    cachedSounds = [...mappedSounds, ...extraOffline];
    deriveMetadata(cachedSounds);

    // Save to local cache
    try {
      if (typeof RingoStorage !== 'undefined' && RingoStorage.saveCatalogCache) {
        RingoStorage.saveCatalogCache(songsData);
      }
    } catch (e) {}

    isFetching = false;
    return cachedSounds;
  }

  function getSounds() {
    if (cachedSounds.length === 0) {
      cachedSounds = FALLBACK_SONGS.map(dto => mapDtoToSound(dto));
      deriveMetadata(cachedSounds);
    }
    return cachedSounds;
  }

  function getCategories() {
    if (cachedCategories.length === 0) {
      getSounds();
    }
    return cachedCategories;
  }

  function getCreators() {
    if (cachedCreators.length === 0) {
      getSounds();
    }
    return cachedCreators;
  }

  function updateSoundDownloadState(soundId, isDownloaded, fileSize) {
    cachedSounds = cachedSounds.map(s => {
      if (s.id === soundId) {
        return { ...s, isDownloaded, fileSize: fileSize || s.fileSize };
      }
      return s;
    });
  }

  function updateSoundFavoriteState(soundId, isFavorite) {
    cachedSounds = cachedSounds.map(s => {
      if (s.id === soundId) {
        return { ...s, isFavorite };
      }
      return s;
    });
  }

  function updateSoundDuration(soundId, durationMs) {
    if (!durationMs || durationMs <= 0) return;
    cachedSounds = cachedSounds.map(s => {
      if (s.id === soundId) {
        return {
          ...s,
          durationMs,
          durationFormatted: formatDurationMs(durationMs)
        };
      }
      return s;
    });
  }

  return {
    fetchCatalog,
    getSounds,
    getCategories,
    getCreators,
    deriveCategories: (sounds) => {
      if (cachedCategories.length === 0 && sounds) deriveMetadata(sounds);
      return cachedCategories;
    },
    deriveCreators: (sounds) => {
      if (cachedCreators.length === 0 && sounds) deriveMetadata(sounds);
      return cachedCreators;
    },
    updateSoundDownloadState,
    updateSoundFavoriteState,
    updateSoundDuration,
    formatDurationMs
  };
})();

if (typeof window !== 'undefined') {
  window.RingoAPI = RingoAPI;
}
