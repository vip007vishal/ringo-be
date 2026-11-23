/**
 * RINGO - Main Application Controller
 * Recreates the complete native Android RINGO application experience.
 * Manages Catalog, Screens, Navigation, Search, Filter, Language, and Modals.
 */

(function (window) {
    'use strict';

    // Translations Dictionary for 6 Supported Languages
    const TRANSLATIONS = {
        'English': {
            app_title: 'RINGO',
            tagline: 'Your Sound. Your Identity.',
            featured_track: 'FEATURED TRACK',
            ringo_original: 'RINGO ORIGINAL',
            set_as_sound: 'Set as Sound',
            songs_and_ringtones: 'Songs & Ringtones',
            featured_artists: 'Featured Artists',
            see_all: 'See All',
            discover_explore: 'Discover & Explore',
            explore_subtitle: 'Find high-fidelity ringtones, notifications, and audio effects',
            search_placeholder: 'Search songs, artists, or categories...',
            all_sounds: 'All Sounds',
            ringtones: 'Ringtones',
            notifications: 'Notifications',
            alarms: 'Alarms',
            sound_effects: 'Sound Effects',
            downloads: 'Downloads',
            ringtone_studio: 'Ringtone Studio',
            studio_subtitle: 'Craft, trim, and apply studio sound effects',
            your_library: 'Your Library',
            library_subtitle: 'Manage downloaded sounds, playlists and custom cuts',
            favorites: 'Favorites',
            playlists: 'Playlists',
            my_creations: 'My Creations',
            history: 'History',
            profile: 'Profile',
            guest_pass: 'GUEST PASS',
            free_forever: '100% Free · No Login Required for Core Features',
            offline_cache: 'Offline Sound Cache',
            all_categories: 'All Categories',
            sort_popular: 'Most Popular',
            sort_newest: 'Newest First',
            matching_sounds: 'sounds found',
            no_results: 'No matching sounds found',
            reset_filters: 'Reset Filters',
            clear_cache: 'Clear',
            cache_cleared: 'Audio cache cleared successfully!'
        },
        'Tamil (தமிழ்)': {
            app_title: 'ரிங்கோ',
            tagline: 'உங்கள் ஒலி. உங்கள் அடையாளம்.',
            featured_track: 'சிறப்பு பாடல்',
            ringo_original: 'ரிங்கோ அசல்',
            set_as_sound: 'ஒலியாக அமை',
            songs_and_ringtones: 'பாடல்கள் மற்றும் ரிங்டோன்கள்',
            featured_artists: 'சிறப்புக் கலைஞர்கள்',
            see_all: 'அனைத்தும்',
            discover_explore: 'கண்டறி & ஆராய்',
            explore_subtitle: 'உயர்தர ரிங்டோன்கள், அறிவிப்பு ஒலிகள் மற்றும் விளைவுகள்',
            search_placeholder: 'பாடல், கலைஞர் அல்லது வகையைத் தேடுங்கள்...',
            all_sounds: 'அனைத்து ஒலிகள்',
            ringtones: 'ரிங்டோன்கள்',
            notifications: 'அறிவிப்புகள்',
            alarms: 'அலாரங்கள்',
            sound_effects: 'ஒலி விளைவுகள்',
            downloads: 'பதிவிறக்கங்கள்',
            ringtone_studio: 'ரிங்டோன் ஸ்டுடியோ',
            studio_subtitle: 'ஒலிகளை வெட்டி, எஃபெக்ட்ஸ் சேர்க்கவும்',
            your_library: 'உங்கள் நூலகம்',
            library_subtitle: 'பதிவிறக்கங்கள், பிளேலிஸ்ட்கள் மற்றும் உங்கள் படைப்புகள்',
            favorites: 'விருப்பமானவை',
            playlists: 'பிளேலிஸ்ட்கள்',
            my_creations: 'என் படைப்புகள்',
            history: 'வரலாறு',
            profile: 'சுயவிவரம்',
            guest_pass: 'இலவச அனுமதி',
            free_forever: '100% இலவசம் · உள்நுழைவு தேவையில்லை',
            offline_cache: 'ஆஃப்லைன் சேமிப்பு',
            all_categories: 'அனைத்து பிரிவுகள்',
            sort_popular: 'பிரபலமானவை',
            sort_newest: 'புதியவை',
            matching_sounds: 'ஒலிகள் கிடைத்தன',
            no_results: 'பொருந்தும் ஒலிகள் கிடைக்கவில்லை',
            reset_filters: 'வடிப்பான்களை மீட்டமை',
            clear_cache: 'அழி',
            cache_cleared: 'ஆடியோ கேச் வெற்றிகரமாக அழிக்கப்பட்டது!'
        },
        'Hindi (हिन्दी)': {
            app_title: 'रिंगो',
            tagline: 'आपकी ध्वनि। आपकी पहचान।',
            featured_track: 'विशेष ट्रैक',
            ringo_original: 'रिंगो ओरिजिनल',
            set_as_sound: 'रिंगटोन सेट करें',
            songs_and_ringtones: 'गाने और रिंगटोन्स',
            featured_artists: 'प्रमुख कलाकार',
            see_all: 'सभी देखें',
            discover_explore: 'खोजें और एक्सप्लोर करें',
            explore_subtitle: 'उच्च-गुणवत्ता वाले रिंगटोन और ध्वनि प्रभाव खोजें',
            search_placeholder: 'गाने, कलाकार या श्रेणी खोजें...',
            all_sounds: 'सभी ध्वनियाँ',
            ringtones: 'रिंगटोन्स',
            notifications: 'नोटिफिकेशन',
            alarms: 'अलार्म',
            sound_effects: 'साउंड इफेक्ट्स',
            downloads: 'डाउनलोड्स',
            ringtone_studio: 'रिंगटोन स्टूडियो',
            studio_subtitle: 'ध्वनि संपादित करें और प्रभाव जोड़ें',
            your_library: 'आपकी लाइब्रेरी',
            library_subtitle: 'डाउनलोड और प्लेलिस्ट प्रबंधित करें',
            favorites: 'पसंदीदा',
            playlists: 'प्लेलिस्ट',
            my_creations: 'मेरी रचनाएँ',
            history: 'इतिहास',
            profile: 'प्रोफ़ाइल',
            guest_pass: 'गेस्ट पास',
            free_forever: '100% मुफ़्त · किसी लॉगिन की आवश्यकता नहीं',
            offline_cache: 'ऑफ़लाइन कैश',
            all_categories: 'सभी श्रेणियां',
            sort_popular: 'सर्वाधिक लोकप्रिय',
            sort_newest: 'नवीनतम',
            matching_sounds: 'ध्वनियाँ मिलीं',
            no_results: 'कोई ध्वनि नहीं मिली',
            reset_filters: 'फ़िल्टर रीसेट करें',
            clear_cache: 'साफ़ करें',
            cache_cleared: 'ऑडियो कैश सफलतापूर्वक साफ़ किया गया!'
        },
        'Telugu (తెలుగు)': {
            app_title: 'రింగో',
            tagline: 'మీ ధ్వని. మీ గుర్తింపు.',
            featured_track: 'ప్రత్యేక ట్రాక్',
            ringo_original: 'రింగో ఒరిజినల్',
            set_as_sound: 'ధ్వనిగా సెట్ చేయండి',
            songs_and_ringtones: 'పాటలు మరియు రింగ్‌టోన్లు',
            featured_artists: 'ప్రముఖ కళాకారులు',
            see_all: 'అన్నీ చూడండి',
            discover_explore: 'అన్వేషించండి',
            explore_subtitle: 'హై-ఫిడిలిటీ రింగ్‌టోన్‌లు మరియు సౌండ్ ఎఫెక్ట్‌లను కనుగొనండి',
            search_placeholder: 'పాటలు, కళాకారులు లేదా వర్గాలను శోధించండి...',
            all_sounds: 'అన్ని శబ్దాలు',
            ringtones: 'రింగ్‌టోన్లు',
            notifications: 'నోటిఫికేషన్లు',
            alarms: 'అలారాలు',
            sound_effects: 'సౌండ్ ఎఫెక్ట్స్',
            downloads: 'డౌన్‌లోడ్‌లు',
            ringtone_studio: 'రింగ్‌టోన్ స్టూడియో',
            studio_subtitle: 'సౌండ్‌లను ట్రిమ్ చేసి ఎఫెక్ట్స్ జోడించండి',
            your_library: 'మీ లైబ్రరీ',
            library_subtitle: 'డౌన్‌లోడ్‌లు మరియు ప్లేలిస్ట్‌లను నిర్వహించండి',
            favorites: 'ఇష్టమైనవి',
            playlists: 'ప్లేలిస్ట్‌లు',
            my_creations: 'నా సృష్టిలు',
            history: 'చరిత్ర',
            profile: 'ప్రొఫైల్',
            guest_pass: 'గెస్ట్ పాస్',
            free_forever: '100% ఉచితం · లాగిన్ అవసరం లేదు',
            offline_cache: 'ఆఫ్‌లైన్ కాష్',
            all_categories: 'అన్ని వర్గాలు',
            sort_popular: 'అత్యంత ప్రజాదరణ పొందినవి',
            sort_newest: 'సరికొత్తవి',
            matching_sounds: 'శబ్దాలు దొరికాయి',
            no_results: 'శబ్దాలు ఏవీ కనుగొనబడలేదు',
            reset_filters: 'ఫిల్టర్‌లను రీసెట్ చేయండి',
            clear_cache: 'క్లియర్ చేయండి',
            cache_cleared: 'ఆడియో కాష్ క్లియర్ చేయబడింది!'
        },
        'Malayalam (മലയാളം)': {
            app_title: 'റിംഗോ',
            tagline: 'നിങ്ങളുടെ ശബ്ദം. നിങ്ങളുടെ വ്യക്തിത്വം.',
            featured_track: 'പ്രത്യേക ട്രാക്ക്',
            ringo_original: 'റിംഗോ ഒറിജിനൽ',
            set_as_sound: 'ശബ്ദമായി സജ്ജീകരിക്കുക',
            songs_and_ringtones: 'ഗാനങ്ങളും റിംഗ്‌ടോണുകളും',
            featured_artists: 'പ്രമുഖ കലാകാരന്മാർ',
            see_all: 'എല്ലാം കാണുക',
            discover_explore: 'കണ്ടെത്തുക',
            explore_subtitle: 'മികച്ച റിംഗ്‌ടോണുകളും ശബ്ദ ഇഫക്റ്റുകളും കണ്ടെത്തുക',
            search_placeholder: 'ഗാനങ്ങൾ, കലാകാരന്മാർ അല്ലെങ്കിൽ വിഭാഗങ്ങൾ തിരയുക...',
            all_sounds: 'എല്ലാ ശബ്ദങ്ങളും',
            ringtones: 'റിംഗ്‌ടോണുകൾ',
            notifications: 'അറിയിപ്പുകൾ',
            alarms: 'അലാറങ്ങൾ',
            sound_effects: 'സൗണ്ട് ഇഫക്റ്റുകൾ',
            downloads: 'ഡൗൺലോഡുകൾ',
            ringtone_studio: 'റിംഗ്‌ടോൺ സ്റ്റുഡിയോ',
            studio_subtitle: 'ശബ്ദങ്ങൾ ട്രിം ചെയ്യുകയും മാറ്റങ്ങൾ വരുത്തുകയും ചെയ്യുക',
            your_library: 'നിങ്ങളുടെ ലൈബ്രറി',
            library_subtitle: 'ഡൗൺലോഡുകളും പ്ലേലിസ്റ്റുകളും നിയന്ത്രിക്കുക',
            favorites: 'ഇഷ്ടപ്പെട്ടവ',
            playlists: 'പ്ലേലിസ്റ്റുകൾ',
            my_creations: 'എന്റെ സൃഷ്ടികൾ',
            history: 'ചരിത്രം',
            profile: 'പ്രൊഫൈൽ',
            guest_pass: 'സൗജന്യ പാസ്',
            free_forever: '100% സൗജന്യം · ലോഗിൻ ആവശ്യമില്ല',
            offline_cache: 'ഓഫ്‌ലൈൻ കാഷെ',
            all_categories: 'എല്ലാ വിഭാഗങ്ങളും',
            sort_popular: 'ഏറ്റവും ജനപ്രിയമായവ',
            sort_newest: 'പുതിയവ',
            matching_sounds: 'ശബ്ദങ്ങൾ കണ്ടെത്തി',
            no_results: 'ശബ്ദങ്ങളൊന്നും കണ്ടെത്തിയില്ല',
            reset_filters: 'ഫിൽട്ടറുകൾ പുനഃസജ്ജമാക്കുക',
            clear_cache: 'മായ്ക്കുക',
            cache_cleared: 'ഓഡിയോ കാഷെ മായ്‌ച്ചു!'
        },
        'Kannada (ಕನ್ನಡ)': {
            app_title: 'ರಿಂಗೋ',
            tagline: 'ನಿಮ್ಮ ಧ್ವನಿ. ನಿಮ್ಮ ಗುರುತು.',
            featured_track: 'ವಿಶೇಷ ಟ್ರ್ಯಾಕ್',
            ringo_original: 'ರಿಂಗೋ ಒರಿಜಿನಲ್',
            set_as_sound: 'ಧ್ವನಿಯಾಗಿ ಹೊಂದಿಸಿ',
            songs_and_ringtones: 'ಹಾಡುಗಳು ಮತ್ತು ರಿಂಗ್‌ಟೋನ್‌ಗಳು',
            featured_artists: 'ಪ್ರಮುಖ ಕಲಾವಿದರು',
            see_all: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
            discover_explore: 'ಅನ್ವೇಷಿಸಿ',
            explore_subtitle: 'ಉತ್ತಮ ಗುಣಮಟ್ಟದ ರಿಂಗ್‌ಟೋನ್‌ಗಳು ಮತ್ತು ಧ್ವನಿ ಪರಿಣಾಮಗಳು',
            search_placeholder: 'ಹಾಡುಗಳು, ಕಲಾವಿದರು ಅಥವಾ ವರ್ಗಗಳನ್ನು ಹುಡುಕಿ...',
            all_sounds: 'ಎಲ್ಲಾ ಧ್ವನಿಗಳು',
            ringtones: 'ರಿಂಗ್‌ಟೋನ್‌ಗಳು',
            notifications: 'ಅಧಿಸೂಚನೆಗಳು',
            alarms: 'ಅಲಾರಂಗಳು',
            sound_effects: 'ಧ್ವನಿ ಪರಿಣಾಮಗಳು',
            downloads: 'ಡೌನ್‌ಲೋಡ್‌ಗಳು',
            ringtone_studio: 'ರಿಂಗ್‌ಟೋನ್ ಸ್ಟುಡಿಯೋ',
            studio_subtitle: 'ಧ್ವನಿಗಳನ್ನು ಕತ್ತರಿಸಿ ಮತ್ತು ಪರಿಣಾಮಗಳನ್ನು ಅನ್ವಯಿಸಿ',
            your_library: 'ನಿಮ್ಮ ಲೈಬ್ರರಿ',
            library_subtitle: 'ಡೌನ್‌ಲೋಡ್‌ಗಳು ಮತ್ತು ಪ್ಲೇಪಟ್ಟಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
            favorites: 'ಮೆಚ್ಚಿನವುಗಳು',
            playlists: 'ಪ್ಲೇಪಟ್ಟಿಗಳು',
            my_creations: 'ನನ್ನ ಸೃಷ್ಟಿಗಳು',
            history: 'ಇತಿಹಾಸ',
            profile: 'ಪ್ರೊಫೈಲ್',
            guest_pass: 'ಅತಿಥಿ ಪಾಸ್',
            free_forever: '100% ಉಚಿತ · ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ',
            offline_cache: 'ಆಫ್‌ಲೈನ್ ಸಂಗ್ರಹ',
            all_categories: 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
            sort_popular: 'ಅತ್ಯಂತ ಜನಪ್ರಿಯ',
            sort_newest: 'ಹೊಸದು',
            matching_sounds: 'ಧ್ವನಿಗಳು ಸಿಕ್ಕಿವೆ',
            no_results: 'ಯಾವುದೇ ಧ್ವನಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
            reset_filters: 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ',
            clear_cache: 'ತೆರವುಗೊಳಿಸಿ',
            cache_cleared: 'ಆಡಿಯೋ ಸಂಗ್ರಹವನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ!'
        }
    };

    // State Variables
    let allSounds = [];
    let categoriesList = [];
    let creatorsList = [];
    let currentAppLanguage = 'English';
    let currentSoundLanguage = 'All';
    let isOnline = navigator.onLine;

    // Explore Filtering State
    let exploreSearchQuery = '';
    let exploreTypeFilter = 'All';
    let exploreSelectedCategory = null;
    let exploreSelectedSubcategory = null;
    let exploreSelectedLanguage = 'All';
    let exploreSortBy = 'Popular';

    // Library State
    let activeLibraryTab = 'downloads';

    const RingoApp = {
        /**
         * Initialize the entire application
         */
        async init() {
            console.log('[RingoApp] Initializing RINGO Web Experience...');

            // 1. Initialize Storage & Preferences
            try {
                const savedLang = RingoStorage.getUserPreference('appLanguage', 'English');
                this.setLanguage(savedLang, false);
            } catch (e) {
                console.warn('[RingoApp] Storage preference error:', e);
            }

            // 2. Initialize Offline / Online Listeners
            try {
                this.initConnectivityListeners();
            } catch (e) {
                console.warn('[RingoApp] Connectivity listener error:', e);
            }

            // 3. Load Catalog (Guaranteed to return songs via multi-tier fallback)
            await this.loadCatalog();

            // 4. Initialize Core Subsystems with resilient error barriers
            try { RingoEqualizer.init(); } catch (e) { console.warn('[RingoApp] Equalizer init error:', e); }
            try { RingoPlayer.init(); } catch (e) { console.warn('[RingoApp] Player init error:', e); }
            try { RingoStudio.init(); } catch (e) { console.warn('[RingoApp] Studio init error:', e); }
            try { RingoRouter.init(); } catch (e) { console.warn('[RingoApp] Router init error:', e); }

            // 5. Setup Link Interception & Restore Playback Session Across Redirects
            try { this.setupGlobalLinkInterception(); } catch (e) {}
            try {
                if (typeof RingoAudioEngine !== 'undefined' && typeof RingoAudioEngine.restorePlaybackSession === 'function') {
                    RingoAudioEngine.restorePlaybackSession();
                }
            } catch (e) {
                console.warn('[RingoApp] Playback session restore error:', e);
            }

            // 6. Initial Renderings
            this.renderHomeScreen();
            this.renderExploreScreen();
            this.renderLibraryScreen();
            this.renderProfileScreen();

            // 7. Setup Global Click Handlers for Sound Actions
            try {
                this.setupGlobalActionHandlers();
            } catch (e) {
                console.warn('[RingoApp] Global action handlers error:', e);
            }

            console.log('[RingoApp] RINGO initialized successfully.');
        },

        /**
         * Load songs from RingoAPI with IndexedDB fallback
         */
        async loadCatalog() {
            try {
                allSounds = await RingoAPI.fetchCatalog();
            } catch (err) {
                console.warn('[RingoApp] API fetch error, using fallback:', err);
                allSounds = RingoAPI.getSounds();
            }
            if (!allSounds || allSounds.length === 0) {
                allSounds = RingoAPI.getSounds();
            }
            categoriesList = RingoAPI.getCategories();
            creatorsList = RingoAPI.getCreators();
            console.log(`[RingoApp] Catalog initialized with ${allSounds.length} sounds, ${categoriesList.length} categories, ${creatorsList.length} creators.`);
        },

        /**
         * Get translation text by key
         */
        t(key) {
            const dict = TRANSLATIONS[currentAppLanguage] || TRANSLATIONS['English'];
            return dict[key] || TRANSLATIONS['English'][key] || key;
        },

        /**
         * Set interface language
         */
        setLanguage(lang, updateUI = true) {
            if (!TRANSLATIONS[lang]) lang = 'English';
            currentAppLanguage = lang;
            RingoStorage.setUserPreference('appLanguage', lang);

            if (updateUI) {
                this.updateLocalizedText();
                this.renderHomeScreen();
                this.renderExploreScreen();
                this.renderProfileScreen();
                this.showToast(`Language updated to ${lang}`);
            }
        },

        /**
         * Update static localized DOM elements
         */
        updateLocalizedText() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (key) {
                    el.textContent = this.t(key);
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (key) {
                    el.setAttribute('placeholder', this.t(key));
                }
            });
        },

        /**
         * Network connectivity listener
         */
        initConnectivityListeners() {
            const banner = document.getElementById('offline-status-banner');
            const updateStatus = () => {
                isOnline = navigator.onLine;
                if (banner) {
                    banner.style.display = isOnline ? 'none' : 'flex';
                }
            };
            window.addEventListener('online', updateStatus);
            window.addEventListener('offline', updateStatus);
            updateStatus();
        },

        /**
         * Render the Home Screen
         */
        renderHomeScreen() {
            const homeView = document.getElementById('screen-home');
            if (!homeView) return;

            // 1. Featured Ringtone Hero Card
            const featuredHeroContainer = document.getElementById('home-featured-hero-container');
            if (featuredHeroContainer) {
                const currentPlaying = (typeof RingoAudioEngine !== 'undefined') ? RingoAudioEngine.getState().currentSound : null;
                const featuredSound = currentPlaying || allSounds.find(s => s.isRingoOriginal) || allSounds[0];
                if (featuredSound) {
                    featuredHeroContainer.innerHTML = '';
                    const heroCard = RingoComponents.createFeaturedHeroCard(featuredSound);
                    featuredHeroContainer.appendChild(heroCard);
                    const heroLabel = document.getElementById('featured-hero-label');
                    if (heroLabel) {
                        heroLabel.textContent = currentPlaying ? 'NOW PLAYING' : this.t('featured_track');
                    }
                } else {
                    featuredHeroContainer.innerHTML = '<div class="empty-state">No featured track available.</div>';
                }
            }

            // 2. Quick Category Chips
            const quickChipsContainer = document.getElementById('home-category-chips');
            if (quickChipsContainer) {
                quickChipsContainer.innerHTML = '';
                const allChip = document.createElement('div');
                allChip.className = 'category-chip active';
                allChip.textContent = this.t('all_sounds');
                allChip.onclick = () => RingoRouter.navigate('explore');
                quickChipsContainer.appendChild(allChip);

                categoriesList.slice(0, 10).forEach(cat => {
                    const chip = document.createElement('div');
                    chip.className = 'category-chip';
                    chip.textContent = cat.name;
                    chip.onclick = () => {
                        RingoRouter.navigate('explore', { genre: cat.name });
                    };
                    quickChipsContainer.appendChild(chip);
                });
            }

            // 3. Songs & Ringtones Catalog List
            const catalogListContainer = document.getElementById('home-catalog-list');
            if (catalogListContainer) {
                catalogListContainer.innerHTML = '';
                const sortedCatalog = [...allSounds].sort((a, b) => b.plays - a.plays);
                sortedCatalog.forEach(sound => {
                    const card = RingoComponents.createSoundCard(sound, {
                        showCategory: true,
                        showBadges: true
                    });
                    catalogListContainer.appendChild(card);
                });
            }

            // 4. Featured Artists Carousel
            const artistsContainer = document.getElementById('home-featured-artists-list');
            if (artistsContainer) {
                artistsContainer.innerHTML = '';
                creatorsList.forEach(creator => {
                    const card = RingoComponents.createCreatorCard(creator, (selectedCreator) => {
                        RingoRouter.navigate('explore', { search: selectedCreator.name });
                    });
                    artistsContainer.appendChild(card);
                });
            }

            // 5. Quick Search Bar on Home
            const homeSearchInput = document.getElementById('home-search-input');
            if (homeSearchInput) {
                homeSearchInput.onkeydown = (e) => {
                    if (e.key === 'Enter') {
                        const q = homeSearchInput.value.trim();
                        if (q) {
                            RingoRouter.navigate('explore', { search: q });
                        }
                    }
                };
            }
        },

        /**
         * Render the Explore Screen
         */
        renderExploreScreen() {
            const exploreView = document.getElementById('screen-explore');
            if (!exploreView) return;

            // 1. Search Field
            const exploreSearchInput = document.getElementById('explore-search-input');
            const exploreSearchClear = document.getElementById('explore-search-clear');
            if (exploreSearchInput) {
                exploreSearchInput.value = exploreSearchQuery;
                exploreSearchInput.oninput = (e) => {
                    exploreSearchQuery = e.target.value;
                    if (exploreSearchClear) {
                        exploreSearchClear.style.display = exploreSearchQuery ? 'flex' : 'none';
                    }
                    this.applyExploreFilters();
                };
            }
            if (exploreSearchClear) {
                exploreSearchClear.style.display = exploreSearchQuery ? 'flex' : 'none';
                exploreSearchClear.onclick = () => {
                    exploreSearchQuery = '';
                    if (exploreSearchInput) exploreSearchInput.value = '';
                    exploreSearchClear.style.display = 'none';
                    this.applyExploreFilters();
                };
            }

            // 2. Type Filter Tabs (All, Ringtones, Notifications, Alarms, Sound Effects)
            const typeTabsContainer = document.getElementById('explore-type-tabs');
            if (typeTabsContainer) {
                typeTabsContainer.querySelectorAll('.filter-tab').forEach(tab => {
                    if (!tab) return;
                    tab.onclick = () => {
                        typeTabsContainer.querySelectorAll('.filter-tab').forEach(t => { if (t && t.classList) t.classList.remove('active'); });
                        if (tab.classList) tab.classList.add('active');
                        exploreTypeFilter = tab.getAttribute('data-type') || 'All';
                        this.applyExploreFilters();
                    };
                });
            }

            // 3. Category Horizontal Cards
            const categoryCardsContainer = document.getElementById('explore-categories-carousel');
            if (categoryCardsContainer) {
                categoryCardsContainer.innerHTML = '';
                categoriesList.forEach(cat => {
                    const card = RingoComponents.createCategoryCard(cat, (selectedCat) => {
                        if (exploreSelectedCategory === selectedCat.id) {
                            exploreSelectedCategory = null;
                            exploreSelectedSubcategory = null;
                        } else {
                            exploreSelectedCategory = selectedCat.id;
                            exploreSelectedSubcategory = null;
                        }
                        this.renderExploreSubcategories();
                        this.applyExploreFilters();
                    });
                    if (exploreSelectedCategory === cat.id) {
                        card.classList.add('selected');
                    }
                    categoryCardsContainer.appendChild(card);
                });
            }

            // 4. Subcategories Row
            this.renderExploreSubcategories();

            // 5. Sort Selector
            const sortSelect = document.getElementById('explore-sort-select');
            if (sortSelect) {
                sortSelect.value = exploreSortBy;
                sortSelect.onchange = (e) => {
                    exploreSortBy = e.target.value;
                    this.applyExploreFilters();
                };
            }

            // 6. Language Pills Row
            const langPillsContainer = document.getElementById('explore-language-pills');
            if (langPillsContainer) {
                langPillsContainer.querySelectorAll('.lang-pill').forEach(pill => {
                    if (!pill) return;
                    pill.onclick = () => {
                        langPillsContainer.querySelectorAll('.lang-pill').forEach(p => { if (p && p.classList) p.classList.remove('active'); });
                        if (pill.classList) pill.classList.add('active');
                        exploreSelectedLanguage = pill.getAttribute('data-lang') || 'All';
                        this.applyExploreFilters();
                    };
                });
            }

            // 7. Initial Filter Execution
            this.applyExploreFilters();
        },

        /**
         * Render subcategory chips for selected category
         */
        renderExploreSubcategories() {
            const subcatsContainer = document.getElementById('explore-subcategories-container');
            if (!subcatsContainer) return;

            if (!exploreSelectedCategory) {
                subcatsContainer.style.display = 'none';
                subcatsContainer.innerHTML = '';
                return;
            }

            const currentCat = categoriesList.find(c => c.id === exploreSelectedCategory);
            if (!currentCat || !currentCat.subcategories || currentCat.subcategories.length === 0) {
                subcatsContainer.style.display = 'none';
                subcatsContainer.innerHTML = '';
                return;
            }

            subcatsContainer.style.display = 'flex';
            subcatsContainer.innerHTML = '';

            const allSubChip = document.createElement('div');
            allSubChip.className = `subcategory-chip ${!exploreSelectedSubcategory ? 'active' : ''}`;
            allSubChip.textContent = 'All ' + currentCat.name;
            allSubChip.onclick = () => {
                exploreSelectedSubcategory = null;
                this.renderExploreSubcategories();
                this.applyExploreFilters();
            };
            subcatsContainer.appendChild(allSubChip);

            currentCat.subcategories.forEach(sub => {
                const chip = document.createElement('div');
                chip.className = `subcategory-chip ${exploreSelectedSubcategory === sub ? 'active' : ''}`;
                chip.textContent = sub;
                chip.onclick = () => {
                    exploreSelectedSubcategory = (exploreSelectedSubcategory === sub) ? null : sub;
                    this.renderExploreSubcategories();
                    this.applyExploreFilters();
                };
                subcatsContainer.appendChild(chip);
            });
        },

        /**
         * Apply filters and render results in Explore Screen
         */
        applyExploreFilters() {
            const resultsList = document.getElementById('explore-results-list');
            const countLabel = document.getElementById('explore-results-count');
            if (!resultsList) return;

            let filtered = [...allSounds];

            // 1. Text Search Filter
            if (exploreSearchQuery.trim()) {
                const q = exploreSearchQuery.trim().toLowerCase();
                filtered = filtered.filter(item => {
                    return (
                        (item.title && item.title.toLowerCase().includes(q)) ||
                        (item.creator && item.creator.toLowerCase().includes(q)) ||
                        (item.album && item.album.toLowerCase().includes(q)) ||
                        (item.category && item.category.toLowerCase().includes(q)) ||
                        (item.subcategory && item.subcategory.toLowerCase().includes(q)) ||
                        (item.language && item.language.toLowerCase().includes(q)) ||
                        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
                    );
                });
            }

            // 2. Type Filter (Ringtones, Notifications, Alarms, Sound Effects)
            if (exploreTypeFilter !== 'All') {
                filtered = filtered.filter(item => {
                    const type = (item.type || '').toLowerCase();
                    const cat = (item.category || '').toLowerCase();
                    if (exploreTypeFilter === 'Ringtones') {
                        return type === 'ringtone' || (!type.includes('notification') && !type.includes('alarm') && !type.includes('effect'));
                    }
                    if (exploreTypeFilter === 'Notifications') {
                        return type.includes('notification') || cat.includes('notification') || (item.duration && item.duration < 6);
                    }
                    if (exploreTypeFilter === 'Alarms') {
                        return type.includes('alarm') || cat.includes('alarm');
                    }
                    if (exploreTypeFilter === 'Sound Effects') {
                        return type.includes('effect') || cat.includes('effect') || cat.includes('sound fx') || cat.includes('nature');
                    }
                    return true;
                });
            }

            // 3. Category Filter
            if (exploreSelectedCategory) {
                const selectedCatObj = categoriesList.find(c => c.id === exploreSelectedCategory);
                if (selectedCatObj) {
                    filtered = filtered.filter(item => {
                        return (item.category && item.category.toLowerCase() === selectedCatObj.name.toLowerCase());
                    });
                }
            }

            // 4. Subcategory Filter
            if (exploreSelectedSubcategory) {
                filtered = filtered.filter(item => {
                    return (item.subcategory && item.subcategory.toLowerCase() === exploreSelectedSubcategory.toLowerCase());
                });
            }

            // 5. Language Filter
            if (exploreSelectedLanguage !== 'All') {
                filtered = filtered.filter(item => {
                    return (item.language && item.language.toLowerCase().includes(exploreSelectedLanguage.toLowerCase()));
                });
            }

            // 6. Sorting
            if (exploreSortBy === 'Popular') {
                filtered.sort((a, b) => (b.plays || 0) - (a.plays || 0));
            } else if (exploreSortBy === 'Newest') {
                filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            }

            // Update Counter
            if (countLabel) {
                countLabel.textContent = `${filtered.length} ${this.t('matching_sounds')}`;
            }

            // Render Results Cards
            resultsList.innerHTML = '';
            if (filtered.length === 0) {
                resultsList.innerHTML = `
                    <div class="empty-state-card">
                        <div class="empty-state-icon">${RingoComponents.svgIcons.search}</div>
                        <div class="empty-state-title">${this.t('no_results')}</div>
                        <div class="empty-state-subtitle">Try adjusting your search terms or filters</div>
                        <button class="btn btn-primary btn-sm" id="btn-reset-explore-filters" style="margin-top: 14px;">
                            ${this.t('reset_filters')}
                        </button>
                    </div>
                `;
                const resetBtn = document.getElementById('btn-reset-explore-filters');
                if (resetBtn) {
                    resetBtn.onclick = () => {
                        exploreSearchQuery = '';
                        exploreTypeFilter = 'All';
                        exploreSelectedCategory = null;
                        exploreSelectedSubcategory = null;
                        exploreSelectedLanguage = 'All';
                        exploreSortBy = 'Popular';
                        this.renderExploreScreen();
                    };
                }
            } else {
                filtered.forEach(sound => {
                    const card = RingoComponents.createSoundCard(sound, {
                        showCategory: true,
                        showBadges: true
                    });
                    resultsList.appendChild(card);
                });
            }
        },

        /**
         * Render the Library Screen
         */
        async renderLibraryScreen(targetTab = null) {
            const libraryView = document.getElementById('screen-library');
            if (!libraryView) return;

            if (targetTab) {
                activeLibraryTab = targetTab;
            }

            // Update Storage Summary Banner
            const storageSummaryEl = document.getElementById('storage-summary-count');
            if (storageSummaryEl) {
                const totalBytes = await RingoDownloads.getTotalDownloadedBytes();
                const totalTracks = (await RingoDownloads.getDownloadedSounds()).length;
                const sizeStr = (totalBytes >= 1048576) ?
                    `${(totalBytes / 1048576).toFixed(1)} MB` :
                    `${Math.round(totalBytes / 1024)} KB`;

                storageSummaryEl.textContent = (totalTracks === 0) ?
                    '0 files downloaded' :
                    `${totalTracks} files (${sizeStr})`;
            }

            // Bind Library Navigation Tabs
            const tabButtons = libraryView.querySelectorAll('.library-tab-button');
            if (tabButtons) {
                tabButtons.forEach(btn => {
                    if (!btn || !btn.classList) return;
                    const tabKey = btn.getAttribute('data-tab');
                    btn.classList.toggle('active', tabKey === activeLibraryTab);
                    btn.onclick = () => {
                        activeLibraryTab = tabKey;
                        tabButtons.forEach(b => { if (b && b.classList) b.classList.remove('active'); });
                        btn.classList.add('active');
                        this.renderLibraryTabContent();
                    };
                });
            }

            this.renderLibraryTabContent();
        },

        /**
         * Render active library tab content
         */
        async renderLibraryTabContent() {
            const container = document.getElementById('library-tab-content-container');
            if (!container) return;

            container.innerHTML = '<div class="loading-spinner"></div>';

            switch (activeLibraryTab) {
                case 'downloads': {
                    const downloads = await RingoDownloads.getDownloadedSounds();
                    container.innerHTML = '';
                    if (downloads.length === 0) {
                        container.innerHTML = `
                            <div class="empty-state-card">
                                <div class="empty-state-icon">${RingoComponents.svgIcons.download}</div>
                                <div class="empty-state-title">No Offline Downloads Yet</div>
                                <div class="empty-state-subtitle">Tap download on any sound card to save it for offline listening</div>
                                <button class="btn btn-primary btn-sm" onclick="RingoRouter.navigate('explore')" style="margin-top: 14px;">Browse Sounds</button>
                            </div>
                        `;
                    } else {
                        downloads.forEach(sound => {
                            const card = RingoComponents.createSoundCard(sound, { showCategory: true });
                            container.appendChild(card);
                        });
                    }
                    break;
                }

                case 'favorites': {
                    const favIds = RingoStorage.getFavorites();
                    const favSounds = allSounds.filter(s => favIds.includes(s.id));
                    container.innerHTML = '';
                    if (favSounds.length === 0) {
                        container.innerHTML = `
                            <div class="empty-state-card">
                                <div class="empty-state-icon">${RingoComponents.svgIcons.favoriteFilled}</div>
                                <div class="empty-state-title">No Favorites Marked</div>
                                <div class="empty-state-subtitle">Heart your top ringtones and songs to save them in this list</div>
                                <button class="btn btn-primary btn-sm" onclick="RingoRouter.navigate('explore')" style="margin-top: 14px;">Explore Ringtones</button>
                            </div>
                        `;
                    } else {
                        favSounds.forEach(sound => {
                            const card = RingoComponents.createSoundCard(sound, { showCategory: true });
                            container.appendChild(card);
                        });
                    }
                    break;
                }

                case 'playlists': {
                    RingoPlaylists.renderPlaylistsView(container);
                    break;
                }

                case 'creations': {
                    const creations = await RingoStorage.getCreations();
                    container.innerHTML = '';
                    if (creations.length === 0) {
                        container.innerHTML = `
                            <div class="empty-state-card">
                                <div class="empty-state-icon">${RingoComponents.getIcon('tune')}</div>
                                <div class="empty-state-title">No Custom Cuts Yet</div>
                                <div class="empty-state-subtitle">Use Ringtone Studio to trim, apply effects, and export your personal ringtones</div>
                                <button class="btn btn-primary btn-sm" onclick="RingoRouter.navigate('create')" style="margin-top: 14px;">Open Studio</button>
                            </div>
                        `;
                    } else {
                        creations.forEach(proj => {
                            const itemCard = document.createElement('div');
                            itemCard.className = 'creation-item-card';
                            itemCard.style.margin = '6px 16px';
                            const durSec = (proj.durationMs ? proj.durationMs / 1000 : 0).toFixed(1);

                            itemCard.innerHTML = `
                                <div class="creation-item-info">
                                    <div class="creation-item-title">${escapeHtml(proj.title)}</div>
                                    <div class="creation-item-meta">Source: ${escapeHtml(proj.sourceName || 'Studio Cut')} · ${durSec}s · ${escapeHtml(proj.equalizerPreset || 'Balanced')}</div>
                                </div>
                                <div class="creation-item-actions">
                                    <button class="creation-action-btn btn-play-creation" title="Play">
                                        ${RingoComponents.getIcon('play')}
                                    </button>
                                    <button class="btn btn-secondary btn-sm btn-set-creation" style="padding: 5px 10px; font-size: 11px; color: var(--lavender); border-color: rgba(139, 92, 246, 0.4); display: flex; align-items: center; gap: 4px;">
                                        ${RingoComponents.getIcon('ring_volume')} <span>Set as Sound</span>
                                    </button>
                                    <button class="creation-action-btn delete btn-delete-creation" title="Delete">
                                        ${RingoComponents.getIcon('delete')}
                                    </button>
                                </div>
                            `;

                            // Creation SoundItem adapter for playback
                            const creationSoundItem = {
                                id: proj.id,
                                title: proj.title,
                                creator: proj.sourceName || 'My Creation',
                                album: 'Studio Master',
                                audioBlob: proj.audioBlob,
                                duration: proj.durationMs ? proj.durationMs / 1000 : 0,
                                durationFormatted: `${durSec}s`,
                                waveformAmplitudes: proj.waveformAmplitudes || [0.4, 0.7, 0.9, 0.6, 0.8, 1.0, 0.5]
                            };

                            itemCard.querySelector('.btn-play-creation').onclick = (e) => {
                                e.stopPropagation();
                                RingoAudioEngine.play(creationSoundItem);
                            };

                            itemCard.querySelector('.btn-set-creation').onclick = (e) => {
                                e.stopPropagation();
                                RingoComponents.openSetRingtoneModal(creationSoundItem);
                            };

                            itemCard.querySelector('.btn-delete-creation').onclick = async (e) => {
                                e.stopPropagation();
                                if (confirm(`Delete creation "${proj.title}"?`)) {
                                    await RingoStorage.deleteCreation(proj.id);
                                    RingoApp.showToast('Creation removed');
                                    RingoApp.renderLibraryTabContent();
                                }
                            };

                            container.appendChild(itemCard);
                        });
                    }
                    break;
                }

                case 'history': {
                    const history = RingoStorage.getHistory();
                    container.innerHTML = '';
                    if (history.length === 0) {
                        container.innerHTML = `
                            <div class="empty-state-card">
                                <div class="empty-state-icon">${RingoComponents.getIcon('music_note')}</div>
                                <div class="empty-state-title">No Playback History</div>
                                <div class="empty-state-subtitle">Tracks you listen to will appear here automatically</div>
                            </div>
                        `;
                    } else {
                        const clearHeader = document.createElement('div');
                        clearHeader.style.cssText = 'display:flex; justify-content:flex-end; padding:8px 16px;';
                        clearHeader.innerHTML = `
                            <button class="btn btn-ghost btn-sm" id="btn-clear-history" style="color:var(--pink-accent);">
                                Clear History
                            </button>
                        `;
                        container.appendChild(clearHeader);
                        clearHeader.querySelector('#btn-clear-history').onclick = () => {
                            RingoStorage.clearHistory();
                            RingoApp.showToast('Playback history cleared');
                            RingoApp.renderLibraryTabContent();
                        };

                        history.forEach(sound => {
                            const card = RingoComponents.createSoundCard(sound, { showCategory: false });
                            container.appendChild(card);
                        });
                    }
                    break;
                }
            }
        },

        /**
         * Render the Profile Screen
         */
        renderProfileScreen() {
            const profileView = document.getElementById('screen-profile');
            if (!profileView) return;

            // App Language Label
            const appLangLabel = document.getElementById('profile-app-language-label');
            if (appLangLabel) {
                appLangLabel.textContent = currentAppLanguage;
            }

            // Content Language Label
            const contentLangLabel = document.getElementById('profile-content-language-label');
            if (contentLangLabel) {
                contentLangLabel.textContent = currentSoundLanguage;
            }

            // Audio Quality Switch
            const bitrateSwitch = document.getElementById('profile-bitrate-switch');
            if (bitrateSwitch) {
                bitrateSwitch.checked = RingoStorage.getUserPreference('highBitrate', true);
                bitrateSwitch.onchange = (e) => {
                    RingoStorage.setUserPreference('highBitrate', e.target.checked);
                    RingoApp.showToast(e.target.checked ? 'High Bitrate 320kbps enabled' : 'Standard Bitrate active');
                };
            }

            // Auto-Play Switch
            const autoPlaySwitch = document.getElementById('profile-autoplay-switch');
            if (autoPlaySwitch) {
                autoPlaySwitch.checked = RingoStorage.getUserPreference('autoPlayPreviews', true);
                autoPlaySwitch.onchange = (e) => {
                    RingoStorage.setUserPreference('autoPlayPreviews', e.target.checked);
                    RingoApp.showToast(e.target.checked ? 'Auto-Play Previews enabled' : 'Auto-Play Previews disabled');
                };
            }

            // Audio Cache Size Label
            this.updateProfileCacheSize();

            // Clear Cache Button
            const clearCacheBtn = document.getElementById('btn-profile-clear-cache');
            if (clearCacheBtn) {
                clearCacheBtn.onclick = async () => {
                    await RingoDownloads.clearAllDownloads();
                    await this.updateProfileCacheSize();
                    this.showToast(this.t('cache_cleared'));
                };
            }

            // Language Selector Click
            const langCard = document.getElementById('profile-language-card');
            if (langCard) {
                langCard.onclick = () => this.openLanguageModal();
            }

            // Equalizer Shortcut Click
            const eqCard = document.getElementById('profile-equalizer-card');
            if (eqCard) {
                eqCard.onclick = () => RingoEqualizer.openModal();
            }

            // About Manifesto Click
            const aboutCard = document.getElementById('profile-about-card');
            if (aboutCard) {
                aboutCard.onclick = () => this.openAboutModal();
            }
        },

        /**
         * Update Audio Cache size display in Profile
         */
        async updateProfileCacheSize() {
            const cacheLabel = document.getElementById('profile-cache-size');
            if (cacheLabel) {
                const totalBytes = await RingoDownloads.getTotalDownloadedBytes();
                const mb = (totalBytes / 1048576).toFixed(1);
                cacheLabel.textContent = `Audio Cache: ${mb} MB`;
            }
        },

        /**
         * Open Language Selector Dialog
         */
        openLanguageModal() {
            const modal = document.getElementById('language-select-modal');
            if (!modal) return;

            const languages = [
                'English',
                'Tamil (தமிழ்)',
                'Hindi (हिन्दी)',
                'Telugu (తెలుగు)',
                'Malayalam (മലയാളം)',
                'Kannada (ಕನ್ನಡ)'
            ];

            const listContainer = modal.querySelector('.language-options-list');
            if (listContainer) {
                listContainer.innerHTML = '';
                languages.forEach(lang => {
                    const item = document.createElement('div');
                    item.className = `modal-list-item ${lang === currentAppLanguage ? 'selected' : ''}`;
                    item.innerHTML = `
                        <span>${lang}</span>
                        ${lang === currentAppLanguage ? `<span class="check-icon">${RingoComponents.svgIcons.check}</span>` : ''}
                    `;
                    item.onclick = () => {
                        this.setLanguage(lang);
                        modal.classList.remove('active');
                    };
                    listContainer.appendChild(item);
                });
            }

            modal.classList.add('active');
            const closeBtn = modal.querySelector('.modal-close-btn');
            if (closeBtn) {
                closeBtn.onclick = () => modal.classList.remove('active');
            }
        },

        /**
         * Open About / 100% Free Manifesto Modal
         */
        openAboutModal() {
            const modal = document.getElementById('about-ringo-modal');
            if (!modal) return;
            modal.classList.add('active');
            const closeBtn = modal.querySelector('.modal-close-btn');
            if (closeBtn) {
                closeBtn.onclick = () => modal.classList.remove('active');
            }
        },

        /**
         * Setup global delegators for sound card actions
         */
        setupGlobalActionHandlers() {
            // Listen for custom trigger events
            window.addEventListener('ringo:setsound', (e) => {
                const sound = e.detail;
                if (sound) RingoComponents.openSetRingtoneModal(sound);
            });

            window.addEventListener('ringo:addtoplaylist', (e) => {
                const sound = e.detail;
                if (sound) RingoPlaylists.openAddToPlaylistModal(sound);
            });

            window.addEventListener('ringo:report', (e) => {
                const sound = e.detail;
                if (sound) RingoComponents.openReportModal(sound);
            });
        },

        /**
         * Intercept in-app link clicks so pages and tabs switch without full browser reloading
         */
        setupGlobalLinkInterception() {
            document.addEventListener('click', (e) => {
                const a = e.target.closest('a');
                if (!a) return;
                const href = a.getAttribute('href');
                if (!href) return;

                if (href.startsWith('#')) {
                    e.preventDefault();
                    const route = href.replace(/^#\/?/, '').split('?')[0];
                    if (route && typeof RingoRouter !== 'undefined') {
                        RingoRouter.navigate(route);
                    }
                }
            });
        },

        /**
         * Show toast notification
         */
        showToast(message, type = 'info') {
            let container = document.getElementById('toast-notifications-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-notifications-container';
                container.className = 'toast-notifications-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast-pill ${type}`;
            toast.textContent = message;

            container.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        /**
         * Refresh handlers called by router
         */
        refreshHome() {
            const catalogList = document.getElementById('home-catalog-list');
            if (!catalogList || catalogList.children.length === 0) {
                this.renderHomeScreen();
            } else {
                const cur = (typeof RingoAudioEngine !== 'undefined') ? RingoAudioEngine.getState().currentSound : null;
                if (cur) {
                    this.updateFeaturedHeroTrack(cur);
                }
                this.updateAllSoundCardButtons();
            }
        },

        refreshExplore(params) {
            if (params) {
                if (params.genre) {
                    exploreSelectedCategory = params.genre;
                }
                if (params.query) {
                    exploreSearchQuery = params.query;
                }
            }
            this.renderExploreScreen();
        },

        refreshLibrary(tab) {
            this.renderLibraryScreen(tab);
        },

        refreshProfile() {
            this.renderProfileScreen();
        },

        /**
         * Refresh all sound cards on screen when downloads or favorites change
         */
        updateAllSoundCardButtons() {
            document.querySelectorAll('.sound-card').forEach(card => {
                const id = card.dataset.id;
                if (!id) return;
                const isDl = RingoStorage.isDownloaded(id);
                const isFav = RingoStorage.isFavorite(id);

                const dlBtn = card.querySelector('.sound-action-icon.download');
                if (dlBtn) {
                    dlBtn.classList.toggle('downloaded', isDl);
                    dlBtn.innerHTML = RingoComponents.getIcon(isDl ? 'download_done' : 'download');
                }

                const favBtn = card.querySelector('.sound-action-icon.favorite');
                if (favBtn) {
                    favBtn.classList.toggle('active', isFav);
                    favBtn.innerHTML = RingoComponents.getIcon(isFav ? 'favorite' : 'favorite_border');
                }
            });

            // Synchronize Featured Hero Card download button
            const heroCard = document.querySelector('.featured-hero-card');
            if (heroCard && heroCard.dataset.id) {
                const isDl = RingoStorage.isDownloaded(heroCard.dataset.id);
                const heroDlBtn = heroCard.querySelector('.featured-download-btn');
                if (heroDlBtn) {
                    heroDlBtn.classList.toggle('downloaded', isDl);
                    heroDlBtn.innerHTML = RingoComponents.getIcon(isDl ? 'download_done' : 'download');
                }
            }
        },

        /**
         * Update Featured Hero Track dynamically to display the currently playing track
         */
        updateFeaturedHeroTrack(sound) {
            const featuredHeroContainer = document.getElementById('home-featured-hero-container');
            const heroLabel = document.getElementById('featured-hero-label');
            if (!featuredHeroContainer) return;

            const targetSound = sound || ((typeof RingoAudioEngine !== 'undefined') ? RingoAudioEngine.getState().currentSound : null) || allSounds.find(s => s.isRingoOriginal) || allSounds[0];
            if (!targetSound) return;

            // If existing hero card is already this sound, just make sure label and card classes are synced
            const existingCard = featuredHeroContainer.querySelector('.featured-hero-card');
            if (existingCard && existingCard.dataset.id === targetSound.id) {
                if (heroLabel) {
                    heroLabel.textContent = sound ? 'NOW PLAYING' : this.t('featured_track');
                }
                return;
            }

            featuredHeroContainer.innerHTML = '';
            const heroCard = RingoComponents.createFeaturedHeroCard(targetSound);
            featuredHeroContainer.appendChild(heroCard);

            if (heroLabel) {
                heroLabel.textContent = sound ? 'NOW PLAYING' : this.t('featured_track');
            }
        },

        /**
         * Expose all sounds catalog
         */
        getAllSounds() {
            return allSounds;
        }
    };

    window.RingoApp = RingoApp;

    // Bootstrap on DOMContentLoaded or immediately if DOM is already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            RingoApp.init();
        });
    } else {
        // DOM already loaded, initialize immediately
        setTimeout(() => RingoApp.init(), 0);
    }

})(window);
