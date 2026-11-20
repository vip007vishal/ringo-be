# RINGO — Mobile Web Application Recreation

Exact recreation of the native **RINGO** Android application as a mobile-first web application designed specifically for the Android WebView and standard static web hosting.

Built with **100% Pure Vanilla Web Standards**:
- **HTML5** (`index.html`)
- **CSS3** (`css/` design tokens, animations, responsive layouts)
- **Modern JavaScript ES6+** (`js/` modular architecture)
- **Web Audio API** (Hardware-accelerated 5-Band Equalizer, Acoustic Convolver Reverb, Master Gain, Real-Time Frequency Response Analysis)
- **Canvas API** (Interactive draggable waveform editor, dynamic audio bars visualizer)
- **MediaRecorder API** (Studio microphone recording)
- **IndexedDB & LocalStorage** (Full offline audio storage, user playlists, drafts, and preferences)

> **STRICT ZERO-FRAMEWORK COMPLIANCE**:
> No React, Vue, Angular, Svelte, TypeScript, Tailwind CSS, Bootstrap, Node.js, Python, or backend server runtimes. Deployable on standard static hosting, Apache, Nginx, or PHP web servers out-of-the-box.

---

## 1. Directory Structure

```text
ringo/
├── index.html                  # Mobile-first app layout & screens
├── assets/
│   ├── icons/                  # Icon assets
│   └── images/
│       ├── ic_launcher.png     # Android app launcher icon
│       ├── ic_launcher_round.png # Round launcher icon
│       └── ringo_logo.jpg      # Official RINGO foreground logo
├── css/
│   ├── style.css               # Design tokens, reset, typography, buttons, snackbars
│   ├── components.css          # Bottom pill nav, sound cards, hero card, modals
│   ├── player.css              # Persistent mini player & full-screen sheet
│   ├── studio.css              # Waveform editor, effects rack, recording banner
│   ├── library.css             # Library storage banner, playlist views, profile
│   └── responsive.css          # Mobile viewports (320px - 432px), safe areas
├── js/
│   ├── storage.js              # IndexedDB & LocalStorage offline engine
│   ├── api.js                  # Songs catalog, creators, & categories mapping
│   ├── audio-engine.js         # Web Audio API 5-Band EQ graph & DSP
│   ├── equalizer.js            # Equalizer UI, presets & frequency canvas
│   ├── waveform.js             # Canvas visualizer & interactive Studio editor
│   ├── downloads.js            # Blob caching, offline storage, file saving
│   ├── playlists.js            # Local playlists CRUD & management
│   ├── components.js           # SVG icon library & UI card factories
│   ├── player.js               # Mini player & full-screen vinyl player controller
│   ├── studio.js               # Audio import, recording, DSP & 16-bit WAV exporter
│   ├── router.js               # Client-side 5-tab router & history management
│   └── app.js                  # App bootstrap, multi-language & screen controllers
└── README.md
```

---

## 2. Design System & Palette

Extracted verbatim from the native Android Jetpack Compose source code (`com.example.ringo.ui.theme`):

| Token | Hex / Value | Description |
|---|---|---|
| `Obsidian` | `#09080D` | Core root background shade |
| `SurfaceDark` | `#15121C` | Secondary background surface |
| `ElevatedDark` | `#21192C` | Card and modal container background |
| `ElevatedCard` | `#1A1624` | Nested card containers |
| `PrimaryViolet` | `#8B5CF6` | Primary action buttons and focus states |
| `Lavender` | `#B58AFF` | Secondary violet highlights and icons |
| `CyanAccent` | `#06B6D4` | Accents, badges, active equalizer frequencies |
| `PinkAccent` | `#EC4899` | Destructive actions and heart highlights |
| `GoldAccent` | `#F59E0B` | RINGO Original badge icon |
| `EmeraldSuccess` | `#10B981` | 100% Free / Offline indicators |
| `TextPrimary` | `#F5F1FA` | Primary titles and high-contrast text |
| `TextSecondary` | `#9E97B0` | Subtitles, artists, and secondary text |
| `TextMuted` | `#6B657D` | Placeholders and subtle captions |
| `CardBorder` | `rgba(139, 92, 246, 0.15)` | Primary container border |
| `SubtleBorder` | `rgba(255, 255, 255, 0.10)` | Delicate divider borders |

---

## 3. WebView Boundary & Architecture

As specified in **Section 5** of the project requirements:
1. **No Duplicate Outer Header**: The Android WebView provides the external status header. The web page renders internal content starting with the in-view brand badge, search, and featured track hero.
2. **No Duplicate Browser Navigation Footer**: The web page renders RINGO's five internal destinations (Home, Explore, Create, Library, Profile) via a floating pill navigation bar and a persistent mini audio player.
3. **Android Back Button Integration**: The client-side router (`js/router.js`) syncs with browser history (`pushState` and `hashchange`). Android WebView back presses navigate backward between tabs and dismiss active modals.

---

## 4. Key Functional Modules

### A. Web Audio Engine & Equalizer (`audio-engine.js`, `equalizer.js`)
- Single unified audio context with hardware-accelerated nodes:
  - 5-Band BiquadFilter peaking filters: `60Hz`, `230Hz`, `910Hz`, `3600Hz`, `14000Hz`
  - Dynamic Low-shelf Bass Boost node with variable gain
  - Acoustic Convolver Reverb with synthetic impulse response
  - AnalyserNode providing real-time frequency response curves rendered to HTML5 Canvas
- Presets: *Flat, Bass Boost, Pop, Rock, Vocal, Jazz, Classical*.

### B. Ringtone Studio & Audio Export (`studio.js`, `waveform.js`)
- **Audio Import**: Decodes MP3, WAV, AAC, M4A, OGG, and FLAC via `AudioContext.decodeAudioData()`.
- **Microphone Recording**: Captures audio streams using the `MediaRecorder API` with live duration tracking.
- **Interactive Waveform Canvas**:
  - Touch-friendly draggable start and end trim handles
  - Playhead scrubbing
  - Zoom controls (1.0x to 10.0x) with horizontal pan slider
- **DSP Effects Rack**:
  - Fade-in (0–5s) and Fade-out (0–5s)
  - Volume boost (up to 250%)
  - Playback speed / pitch adjustment (0.5x–2.0x)
  - Dedicated Bass Boost and Concert Hall Reverb toggle
- **Pure Client-Side 16-Bit WAV Master Exporter**:
  - Uses `ArrayBuffer` and `DataView` to encode a 44-byte RIFF/WAVE header and 16-bit PCM samples
  - Zero external libraries or server-side dependencies
  - Saves directly to IndexedDB drafts and triggers browser download.

### C. Persistent Mini Player & Vinyl Disc Sheet (`player.js`)
- Mini player stays pinned above the floating pill navigation across all tabs.
- Expanding launches the full-screen player sheet with a spinning vinyl disc animation, seekable scrubber, audio metadata, shuffle, loop, and quick actions.

### D. Offline Storage & Playlists (`storage.js`, `downloads.js`, `playlists.js`)
- IndexedDB database `ringo_offline_db` with stores:
  - `downloads`: cached raw audio blobs with metadata
  - `creations`: exported studio master ringtones
  - `playlists`: user-created playlists with track ID arrays
- Automatic cache size tracking displayed in Library and Profile.
- Audio playback seamlessly falls back to offline IndexedDB blobs when the device loses network connectivity.

### E. Multi-Language Support (`app.js`)
- Full UI localization dictionary supporting 6 languages:
  - **English**
  - **Tamil (தமிழ்)**
  - **Hindi (हिन्दी)**
  - **Telugu (తెలుగు)**
  - **Malayalam (മലയാളം)**
  - **Kannada (ಕನ್ನಡ)**

---

## 5. Android WebView Configuration

To embed this web application in an Android application:

```kotlin
val webView = findViewById<WebView>(R.id.webView)
webView.settings.apply {
    javaScriptEnabled = true
    domStorageEnabled = true
    databaseEnabled = true
    mediaPlaybackRequiresUserGesture = false
    allowFileAccess = true
    useWideViewPort = true
    loadWithOverviewMode = true
}

// Support audio recording permissions
webView.webChromeClient = object : WebChromeClient() {
    override fun onPermissionRequest(request: PermissionRequest) {
        request.grant(request.resources)
    }
}

webView.loadUrl("https://your-domain.com/index.html")
```

---

## 6. Deployment

Deploy the `ringo/` directory directly to any web server:
- **Apache / Nginx**: Place files in `public_html` or web root.
- **GitHub Pages**: Push repository and enable Pages on root branch.
- **Netlify / Vercel / Cloudflare Pages**: Deploy as a static site without build command.
- **PHP Hosting**: Works immediately on any shared or VPS host. No PHP runtime or Node.js required.
