/**
 * RINGO — Reusable UI Components, SVG Icons & Modal Dialogs
 * Matches exact Android Compose components: SoundCard, SetRingtoneDialog, ReportDialog.
 */

const RingoComponents = (() => {

  // Clean, crisp Google Material SVG Icons matching Android Compose ImageVectors
  const SVG_ICONS = {
    graphic_eq: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18h2V6H7v12zm4 4h2V2h-2v20zm-8-8h2v-4H3v4zm12 4h2V6h-2v12zm4-8v4h2v-4h-2z"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
    explore: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
    content_cut: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z"/></svg>`,
    library_music: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/></svg>`,
    person: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    equalizer: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    clear: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`,
    download_done: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.13 5.41l-1.41-1.41-9.19 9.19-4.25-4.24-1.41 1.41 5.66 5.66zM5 18v2h14v-2H5z"/></svg>`,
    favorite: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    favorite_border: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>`,
    more_vert: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
    ring_volume: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.71 16.67C20.66 13.78 16.54 12 12 12P6.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73s3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.67 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.27-.11-.52-.29-.7zM21.16 6.26l-1.41-1.41-4.24 4.24 1.41 1.41 4.24-4.24zM8.49 9.09L4.25 4.85 2.84 6.26l4.24 4.24 1.41-1.41zM13 1h-2v6h2V1z"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>`,
    repeat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
    repeat_one: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`,
    replay_5: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.5 6.5h3v1h-2v1h2v2h-3v-1h2v-1h-2v-2z"/></svg>`,
    skip_next: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
    skip_previous: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`,
    queue_music: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>`,
    playlist_add: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/></svg>`,
    cloud_off: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.57 0 11.48 0 15c0 3.86 3.14 7 7 7h11.73l2 2 1.27-1.27L4.27 4 3 5.27zM7.73 10l8 8H7c-2.76 0-5-2.24-5-5s2.24-5 5-5h.73z"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
    electric_bolt: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 2L3 14h7v8l12-12h-7z"/></svg>`,
    verified: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/></svg>`,
    tune: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>`,
    folder_open: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    storage: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/></svg>`,
    arrow_back: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
    language: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>`,
    headphones: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>`,
    chevron_right: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`,
    music_note: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
    audiotrack: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/></svg>`,
    movie: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>`,
    sports_esports: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
    auto_awesome: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/></svg>`,
    notifications: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
    alarm: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>`,
    nature: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 16.12h-.03c3.49-.4 6.2-3.36 6.2-6.95 0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H5v2h14v-2h-6v-3.88z"/></svg>`,
    waves: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 18c-3.86 0-7-3.14-7-7 0-.55-.45-1-1-1s-1 .45-1 1c0 4.96 4.04 9 9 9s9-4.04 9-9c0-.55-.45-1-1-1s-1 .45-1 1c0 3.86-3.14 7-7 7zm0-4c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-8c.55 0 1-.45 1-1 0-2.76-2.24-5-5-5s-5 2.24-5 5c0 .55.45 1 1 1s1-.45 1-1c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .55.45 1 1 1z"/></svg>`,
    sentiment_very_satisfied: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-3.5-9.5c.83 0 1.5-.67 1.5-1.5S9.33 7.5 8.5 7.5 7 8.17 7 9s.67 1.5 1.5 1.5zm7 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>`
  };

  function getIcon(name, className = '') {
    const svg = SVG_ICONS[name] || SVG_ICONS.graphic_eq;
    if (className) {
      return svg.replace('<svg ', `<svg class="${className}" `);
    }
    return svg;
  }

  /**
   * Builds an exact SoundCard component matching Android SoundCard.kt
   */
  function createSoundCard(sound, options = {}) {
    const card = document.createElement('div');
    card.className = 'sound-card';
    card.dataset.id = sound.id;

    const isFav = RingoStorage.isFavorite(sound.id);
    const isDl = sound.isDownloaded;

    card.innerHTML = `
      <div class="sound-card-header">
        <div class="sound-art-box">
          <img class="sound-art-img" src="${sound.coverUrl || 'assets/images/ic_launcher.png'}" alt="${escapeHtml(sound.title)}" onerror="this.src='assets/images/ic_launcher.png'">
          <div class="sound-art-overlay">
            <button class="sound-art-btn" title="Play">
              ${getIcon('play')}
            </button>
          </div>
        </div>

        <div class="sound-info-col">
          <div class="sound-title-row">
            <div class="sound-title">${escapeHtml(sound.title)}</div>
            ${sound.isRingoOriginal ? `<span class="badge badge-original">ORIGINAL</span>` : ''}
          </div>
          <div class="sound-subtitle-row">
            <span class="sound-artist">${escapeHtml(sound.album ? `${sound.creator} · ${sound.album}` : sound.creator)}</span>
            <span class="sound-meta-dot">•</span>
            <span class="sound-duration">${sound.durationFormatted}</span>
          </div>
        </div>

        <div class="sound-card-actions">
          <button class="sound-action-icon download ${isDl ? 'downloaded' : ''}" title="${isDl ? 'Downloaded' : 'Download to device'}">
            ${getIcon(isDl ? 'download_done' : 'download')}
          </button>
          <button class="sound-action-icon ringtone" title="Set as Sound / Trim">
            ${getIcon('ring_volume')}
          </button>
          <button class="sound-action-icon favorite ${isFav ? 'active' : ''}" title="Favorite">
            ${getIcon(isFav ? 'favorite' : 'favorite_border')}
          </button>
          <div class="sound-menu-wrapper">
            <button class="sound-action-icon overflow-btn" title="More options">
              ${getIcon('more_vert')}
            </button>
            <div class="sound-menu-dropdown">
              <button class="sound-menu-item menu-set-ringtone">
                ${getIcon('ring_volume')} <span>Set as Ringtone / Alert</span>
              </button>
              <button class="sound-menu-item menu-download">
                ${getIcon(isDl ? 'download_done' : 'download')} <span>${isDl ? 'Saved in Mobile Storage' : 'Download to Mobile Storage'}</span>
              </button>
              <button class="sound-menu-item menu-add-playlist">
                ${getIcon('playlist_add')} <span>Add to Playlist</span>
              </button>
              <button class="sound-menu-item danger menu-report">
                ${getIcon('info')} <span>Report Sound</span>
              </button>
              ${options.isDownloadTab ? `
                <button class="sound-menu-item danger menu-remove-download">
                  ${getIcon('delete')} <span>Delete Download</span>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <canvas class="sound-card-waveform" height="24"></canvas>

      <div class="sound-card-footer">
        <div class="sound-tags-row">
          <span class="sound-tag-chip">${escapeHtml(sound.category)}</span>
          ${sound.album ? `<span class="sound-tag-chip">${escapeHtml(sound.album)}</span>` : ''}
          ${sound.composer ? `<span class="sound-tag-chip composer-chip">MD: ${escapeHtml(sound.composer)}</span>` : ''}
          <span class="sound-tag-chip">${escapeHtml(sound.subcategory || 'MP3')}</span>
        </div>
        <div class="sound-stat-text">${sound.downloads} DLs · ${sound.fileSize || '3.2 MB'}</div>
      </div>
    `;

    // Render compact waveform on card canvas
    const canvas = card.querySelector('.sound-card-waveform');
    if (canvas) {
      setTimeout(() => {
        RingoWaveform.drawCardWaveform(canvas, sound.waveformAmplitudes, 0, false, {
          activeColor: '#B58AFF',
          inactiveColor: '#2C243C'
        });
      }, 20);
    }

    // Attach Event Listeners
    const artBtn = card.querySelector('.sound-art-btn');
    const playHandler = (e) => {
      e.stopPropagation();
      if (options.onPlay) {
        options.onPlay();
      } else {
        RingoAudioEngine.togglePlayPause(sound);
        RingoStorage.recordHistory(sound);
      }
    };
    artBtn.addEventListener('click', playHandler);

    card.addEventListener('click', (e) => {
      if (e.target.closest('.sound-card-actions') || e.target.closest('.sound-art-box')) return;
      // Open full player on card body click
      RingoAudioEngine.play(sound);
      RingoStorage.recordHistory(sound);
      RingoPlayerUI.openFullPlayer();
    });

    // Download Button
    const dlBtn = card.querySelector('.sound-action-icon.download');
    dlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      RingoDownloads.downloadTrack(sound);
    });

    // Ringtone Set Button
    const ringBtn = card.querySelector('.sound-action-icon.ringtone');
    ringBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSetRingtoneModal(sound);
    });

    // Favorite Button
    const favBtn = card.querySelector('.sound-action-icon.favorite');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const added = RingoStorage.toggleFavorite(sound.id);
      RingoAPI.updateSoundFavoriteState(sound.id, added);
      favBtn.classList.toggle('active', added);
      favBtn.innerHTML = getIcon(added ? 'favorite' : 'favorite_border');
      RingoApp.showToast(added ? 'Added to Favorites' : 'Removed from Favorites');
    });

    // Overflow Menu
    const overflowBtn = card.querySelector('.overflow-btn');
    const dropdown = card.querySelector('.sound-menu-dropdown');
    overflowBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.sound-menu-dropdown.show').forEach(m => {
        if (m !== dropdown) m.classList.remove('show');
      });
      dropdown.classList.toggle('show');
    });

    // Menu Actions
    dropdown.querySelector('.menu-set-ringtone').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('show');
      openSetRingtoneModal(sound);
    });

    dropdown.querySelector('.menu-download').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('show');
      RingoDownloads.downloadTrack(sound);
    });

    dropdown.querySelector('.menu-add-playlist').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('show');
      RingoPlaylists.openAddToPlaylistSheet(sound);
    });

    dropdown.querySelector('.menu-report').addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('show');
      openReportModal(sound);
    });

    const removeBtn = dropdown.querySelector('.menu-remove-download');
    if (removeBtn && options.onRemove) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.remove('show');
        options.onRemove();
      });
    }

    return card;
  }

  /**
   * Recreates SetRingtoneDialog.kt as a mobile modal with trimming, preview, and genuine Android guide.
   */
  function openSetRingtoneModal(sound) {
    const modal = document.getElementById('set-ringtone-modal');
    if (!modal) return;

    RingoAudioEngine.stop(); // Stop any background playback

    const titleEl = document.getElementById('set-ringtone-title');
    const descEl = document.getElementById('set-ringtone-desc');
    if (titleEl) titleEl.textContent = sound.title;
    if (descEl) descEl.textContent = `${sound.creator} · ${sound.durationFormatted}`;

    let trimStartRatio = 0.0;
    let trimEndRatio = 1.0;
    const totalMs = sound.durationMs > 0 ? sound.durationMs : 30000;

    // Show modal first so canvas has real rendered dimensions in viewport
    modal.classList.add('show');

    const canvas = document.getElementById('set-ringtone-waveform');
    let editor = null;
    let isPreviewing = false;

    if (canvas) {
      editor = new RingoWaveform.StudioWaveformEditor(canvas, {
        amplitudes: sound.waveformAmplitudes,
        durationMs: totalMs,
        startRatio: 0,
        endRatio: 1,
        onTrimChange: (s, e) => {
          trimStartRatio = s;
          trimEndRatio = e;
          updateTrimLabels();
          if (isPreviewing) {
            const sMs = Math.round(trimStartRatio * totalMs);
            const eMs = Math.round(trimEndRatio * totalMs);
            RingoAudioEngine.updateSegmentBounds(sMs, eMs);
          }
        },
        onPlayheadSeek: (ratio) => {
          if (isPreviewing) {
            const seekMs = Math.round(ratio * totalMs);
            RingoAudioEngine.seekTo(seekMs);
          }
        }
      });

      // Ensure crisp canvas dimensions once DOM paint finishes
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (editor) editor.resize();
        }, 40);
      });
    }

    function updateTrimLabels() {
      const sSec = (trimStartRatio * (totalMs / 1000)).toFixed(1);
      const eSec = (trimEndRatio * (totalMs / 1000)).toFixed(1);
      const selSec = Math.max(0.5, (trimEndRatio - trimStartRatio) * (totalMs / 1000)).toFixed(1);

      const sLabel = document.getElementById('set-ringtone-start-time');
      const eLabel = document.getElementById('set-ringtone-end-time');
      const selLabel = document.getElementById('set-ringtone-duration-badge');

      if (sLabel) sLabel.textContent = `Start: ${sSec}s`;
      if (eLabel) eLabel.textContent = `End: ${eSec}s`;
      if (selLabel) selLabel.textContent = `Clip: ${selSec}s`;
    }

    updateTrimLabels();

    // Preset buttons (Full, 5s Alert, 15s Clip, 30s Ring)
    modal.querySelectorAll('.preset-ring-dur').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.preset-ring-dur').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const val = btn.dataset.dur;
        if (val === 'full') {
          trimStartRatio = 0.0;
          trimEndRatio = 1.0;
        } else {
          const targetSec = parseFloat(val);
          const ratio = Math.min(1.0, targetSec / (totalMs / 1000));
          trimStartRatio = 0.0;
          trimEndRatio = ratio;
        }
        if (editor) editor.setTrimBounds(trimStartRatio, trimEndRatio);
        updateTrimLabels();

        if (isPreviewing) {
          const sMs = Math.round(trimStartRatio * totalMs);
          const eMs = Math.round(trimEndRatio * totalMs);
          RingoAudioEngine.updateSegmentBounds(sMs, eMs);
        }
      };
    });

    // Preview Cut Button
    const previewBtn = document.getElementById('set-ringtone-preview-btn');
    if (previewBtn) {
      previewBtn.innerHTML = `${getIcon('play')} <span>Preview Cut</span>`;
      previewBtn.onclick = () => {
        if (isPreviewing) {
          RingoAudioEngine.pause();
          isPreviewing = false;
          previewBtn.innerHTML = `${getIcon('play')} <span>Preview Cut</span>`;
        } else {
          const sMs = Math.round(trimStartRatio * totalMs);
          const eMs = Math.round(trimEndRatio * totalMs);
          RingoAudioEngine.playSegment(sound, sMs, eMs, true);
          isPreviewing = true;
          previewBtn.innerHTML = `${getIcon('pause')} <span>Pause Preview</span>`;
        }
      };
    }

    // Hook state changes for preview button and playhead
    RingoAudioEngine.onTimeUpdate((curMs) => {
      if (isPreviewing && totalMs > 0 && editor) {
        editor.setPlayhead(curMs / totalMs);
      }
    });

    RingoAudioEngine.onStateChange((state) => {
      if (!state.isPlaying && isPreviewing) {
        isPreviewing = false;
        if (previewBtn) previewBtn.innerHTML = `${getIcon('play')} <span>Preview Cut</span>`;
      }
    });

    // Set as Ringtone Action (Genuine Web Audio Trimming & WAV Export)
    const setActionBtn = document.getElementById('set-ringtone-apply-btn');
    if (setActionBtn) {
      setActionBtn.onclick = async () => {
        const sMs = Math.round(trimStartRatio * totalMs);
        const eMs = Math.round(trimEndRatio * totalMs);
        const trimmedDurMs = eMs - sMs;
        const safeTitle = (sound.title || 'Sound').replace(/[^A-Za-z0-9_]/g, '_');
        const filename = `${safeTitle}_Ringtone.wav`;

        setActionBtn.disabled = true;
        const prevText = setActionBtn.innerHTML;
        setActionBtn.textContent = 'Rendering Cut...';
        RingoApp.showToast('Rendering trimmed 16-bit PCM ringtone audio...');

        try {
          // Render genuine trimmed slice via Web Audio OfflineAudioContext
          const wavBlob = await RingoAudioEngine.renderTrimmedWavBlob(sound, sMs, eMs);

          // 1. Download trimmed WAV file directly to user device
          const downloadUrl = URL.createObjectURL(wavBlob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
          }, 1500);

          // 2. Persist trimmed project locally in IndexedDB "My Creations"
          await RingoStorage.saveCreation({
            id: `cut_${Date.now()}`,
            title: `${sound.title} (Ringtone Cut)`,
            sourceName: sound.title,
            durationMs: trimmedDurMs,
            startTrimMs: sMs,
            endTrimMs: eMs,
            fadeInSec: 0.04,
            fadeOutSec: 0.04,
            volume: 1.0,
            equalizerPreset: 'Balanced',
            audioBlob: wavBlob,
            createdAt: Date.now()
          });

          RingoAudioEngine.stop();
          isPreviewing = false;
          modal.classList.remove('show');
          openAndroidRingtoneGuideModal(sound.title);
          RingoApp.showToast(`Saved & downloaded "${filename}"!`);
        } catch (err) {
          console.error('Ringtone render error:', err);
          RingoApp.showToast('Trimming error: ' + err.message);
        } finally {
          setActionBtn.disabled = false;
          setActionBtn.innerHTML = prevText;
        }
      };
    }

    const closeBtn = document.getElementById('set-ringtone-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        RingoAudioEngine.stop();
        isPreviewing = false;
        modal.classList.remove('show');
      };
    }
  }

  /**
   * Explains how to set the exported sound in Android settings.
   */
  function openAndroidRingtoneGuideModal(trackTitle) {
    const guideModal = document.getElementById('android-ringtone-guide-modal');
    if (!guideModal) return;

    const titleEl = document.getElementById('guide-track-title');
    if (titleEl) titleEl.textContent = trackTitle;

    const okBtn = document.getElementById('guide-ok-btn');
    if (okBtn) okBtn.onclick = () => guideModal.classList.remove('show');

    guideModal.classList.add('show');
  }

  /**
   * Recreates ReportDialog.kt
   */
  function openReportModal(sound) {
    const modal = document.getElementById('report-dialog-modal');
    if (!modal) return;

    const titleEl = document.getElementById('report-sound-title');
    if (titleEl) titleEl.textContent = `"${sound.title}" by ${sound.creator}`;

    const cancelBtn = document.getElementById('report-cancel-btn');
    const submitBtn = document.getElementById('report-submit-btn');

    if (cancelBtn) cancelBtn.onclick = () => modal.classList.remove('show');

    if (submitBtn) {
      submitBtn.onclick = () => {
        modal.classList.remove('show');
        RingoApp.showToast('Report submitted for moderation review. Thank you!');
      };
    }

    modal.classList.add('show');
  }

  /**
   * Recreates the Featured Hero Card from HomeScreen.kt
   */
  function createFeaturedHeroCard(sound) {
    const card = document.createElement('div');
    card.className = 'featured-hero-card';
    card.dataset.id = sound.id;
    card.dataset.duration = sound.durationFormatted || '00:30';

    const isFav = RingoStorage.isFavorite(sound.id);
    const isDl = sound.isDownloaded;

    card.innerHTML = `
      <div class="featured-hero-top">
        <div class="featured-hero-badge">
          ${getIcon('electric_bolt')}
          <span>${sound.isRingoOriginal ? 'RINGO ORIGINAL' : (sound.category || 'FEATURED').toUpperCase()}</span>
        </div>
        <span class="featured-hero-duration">${sound.durationFormatted || '00:30'}</span>
      </div>

      <div class="featured-hero-info">
        <div class="featured-hero-art">
          <img src="${sound.coverUrl || 'assets/images/ic_launcher.png'}" alt="${escapeHtml(sound.title)}" onerror="this.onerror=null; this.src='assets/images/ic_launcher.png'">
        </div>
        <div class="featured-hero-text">
          <h3 class="featured-hero-title">${escapeHtml(sound.title)}</h3>
          <p class="featured-hero-artist">${escapeHtml(sound.album ? `${sound.creator} · ${sound.album}` : sound.creator)}</p>
        </div>
      </div>

      <canvas class="featured-waveform-canvas" id="featured-waveform-canvas" data-id="${sound.id}" width="340" height="36" style="width:100%; height:36px; cursor: pointer;"></canvas>

      <div class="featured-hero-actions">
        <div class="featured-actions-left">
          <button class="featured-play-btn" id="featured-play-btn" title="Play" aria-label="Play Featured Sound">
            ${getIcon('play')}
          </button>
          <button class="featured-download-btn dl-btn ${isDl ? 'downloaded' : ''}" title="Download" aria-label="Download Featured Sound">
            ${getIcon(isDl ? 'download_done' : 'download')}
          </button>
        </div>
        <button class="featured-set-btn featured-set-sound-btn" aria-label="Set as Sound">
          ${getIcon('ring_volume')}
          <span>Set as Sound</span>
        </button>
      </div>
    `;

    // Render waveform preview on card canvas & bind amplitudes
    const canvas = card.querySelector('#featured-waveform-canvas');
    if (canvas) {
      canvas.amplitudes = sound.waveformAmplitudes;
      setTimeout(() => {
        RingoWaveform.drawCardWaveform(canvas, sound.waveformAmplitudes, 0, false, {
          activeColor: '#B58AFF',
          inactiveColor: '#282138'
        });
      }, 50);

      // Interactive scrub/seek directly from the Hero Waveform
      const handleCanvasSeek = (e) => {
        e.stopPropagation();
        const rect = canvas.getBoundingClientRect();
        const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const totalMs = sound.durationMs || 30000;
        const targetMs = Math.round(ratio * totalMs);

        const state = RingoAudioEngine.getState();
        if (!state.currentSound || state.currentSound.id !== sound.id) {
          RingoAudioEngine.play(sound, targetMs);
        } else {
          RingoAudioEngine.seekTo(targetMs);
          if (!state.isPlaying) {
            RingoAudioEngine.play(sound, targetMs);
          }
        }
        if (window.RingoPlayerUI) RingoPlayerUI.showMiniPlayer();
      };

      canvas.addEventListener('click', handleCanvasSeek);
    }

    // Sync initial playback state if already playing
    const curState = RingoAudioEngine.getState();
    if (curState.currentSound && curState.currentSound.id === sound.id && curState.isPlaying) {
      card.classList.add('playing');
      const pb = card.querySelector('.featured-play-btn');
      if (pb) pb.innerHTML = getIcon('pause');
    }

    // Click on Card body: Plays sound and opens player sheet (exact match with Compose HomeScreen.kt:417 onSoundClick)
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('canvas')) return;
      const state = RingoAudioEngine.getState();
      if (!state.currentSound || state.currentSound.id !== sound.id) {
        RingoAudioEngine.play(sound);
      }
      if (window.RingoPlayerUI) {
        RingoPlayerUI.showMiniPlayer();
        RingoPlayerUI.openFullPlayer();
      }
    });

    // Play/Pause button
    const playBtn = card.querySelector('.featured-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        RingoAudioEngine.togglePlayPause(sound);
        if (window.RingoPlayerUI) RingoPlayerUI.showMiniPlayer();
      });
    }

    // Download button
    const dlBtn = card.querySelector('.featured-download-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        RingoDownloads.downloadTrack(sound);
      });
    }

    // Set as Sound (Trim modal)
    const setBtn = card.querySelector('.featured-set-sound-btn');
    if (setBtn) {
      setBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSetRingtoneModal(sound);
      });
    }

    return card;
  }

  /**
   * Recreates Creator Card from HomeScreen.kt
   */
  function createCreatorCard(creator, onSelect) {
    const card = document.createElement('div');
    card.className = 'creator-card';
    card.innerHTML = `
      <div class="creator-avatar">
        ${creator.avatarUrl ? `<img src="${creator.avatarUrl}" alt="${escapeHtml(creator.name)}" onerror="this.style.display='none'">` : `<span>${escapeHtml((creator.name || 'R').charAt(0))}</span>`}
      </div>
      <div class="creator-name-row">
        <span class="creator-name">${escapeHtml(creator.name)}</span>
        <svg class="creator-verified-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z"/>
        </svg>
      </div>
      <div class="creator-meta">${creator.uploadsCount || creator.tracksCount || 1} tracks · ${creator.role || 'Artist'}</div>
    `;
    card.addEventListener('click', () => {
      if (typeof onSelect === 'function') onSelect(creator);
    });
    return card;
  }

  /**
   * Recreates Category Card from ExploreScreen.kt
   */
  function createCategoryCard(category, onSelect) {
    const card = document.createElement('div');
    card.className = 'category-explore-card';
    card.dataset.id = category.id;
    card.innerHTML = `
      <div class="category-icon-bubble">
        ${getIcon(category.icon || 'music_note')}
      </div>
      <div class="category-card-title">${escapeHtml(category.name || category.title)}</div>
      <span class="category-card-count">${category.soundCount || 0} sounds</span>
    `;
    card.addEventListener('click', () => {
      if (typeof onSelect === 'function') onSelect(category);
    });
    return card;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    getIcon,
    createSoundCard,
    createFeaturedHeroCard,
    createCreatorCard,
    createCategoryCard,
    openSetRingtoneModal,
    openAndroidRingtoneGuideModal,
    openReportModal,
    escapeHtml,
    svgIcons: {
      search: SVG_ICONS.search,
      download: SVG_ICONS.download,
      favoriteFilled: SVG_ICONS.favorite,
      favoriteBorder: SVG_ICONS.favorite_border,
      tune: SVG_ICONS.tune,
      play: SVG_ICONS.play,
      pause: SVG_ICONS.pause,
      ringtone: SVG_ICONS.ring_volume,
      close: SVG_ICONS.close,
      music: SVG_ICONS.music_note,
      check: SVG_ICONS.check
    }
  };
})();
