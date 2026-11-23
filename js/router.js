/**
 * RINGO - Client-Side Router
 * Handles seamless 5-tab switching (Home, Explore, Create, Library, Profile)
 * Supports browser history, Android WebView back button navigation, and deep linking
 */

var RingoRouter;
(function (window) {
    'use strict';

    const SCREENS = ['home', 'explore', 'create', 'library', 'profile'];
    let currentScreen = 'home';
    let navigationHistory = ['home'];
    const screenScrollPositions = {
        home: 0,
        explore: 0,
        create: 0,
        library: 0,
        profile: 0
    };

    RingoRouter = {
        /**
         * Initialize the router, binding hash changes and nav items
         */
        init() {
            // Bind delegated click handler for any nav buttons (including floating pills and action cards)
            document.addEventListener('click', (e) => {
                const navBtn = e.target.closest('[data-target]');
                if (navBtn) {
                    const target = navBtn.getAttribute('data-target');
                    if (target && SCREENS.includes(target.toLowerCase())) {
                        e.preventDefault();
                        this.navigate(target);
                    }
                }
            });

            // Listen to browser hash changes (Android WebView back/forward button support)
            window.addEventListener('hashchange', () => {
                this.handleRouteFromHash();
            });

            window.addEventListener('popstate', () => {
                this.handleRouteFromHash();
            });

            // Initial route from URL hash or default to home
            this.handleRouteFromHash();
        },

        /**
         * Parse current hash and switch screens
         */
        handleRouteFromHash() {
            const hash = window.location.hash.replace(/^#\/?/, '').trim();
            if (!hash) {
                this.navigate('home', null, false);
                return;
            }

            const [path, queryString] = hash.split('?');
            const targetScreen = path.toLowerCase();
            const params = new URLSearchParams(queryString || '');

            if (SCREENS.includes(targetScreen)) {
                this.navigate(targetScreen, params, false);
            } else {
                this.navigate('home', null, false);
            }
        },

        /**
         * Navigate to a screen
         * @param {string} screenId - 'home' | 'explore' | 'create' | 'library' | 'profile'
         * @param {URLSearchParams|object} [params] - optional query parameters
         * @param {boolean} [pushState=true] - whether to update browser history
         */
        navigate(screenId, params = null, pushState = true) {
            const target = screenId.toLowerCase();
            if (!SCREENS.includes(target)) return;

            const previousScreen = currentScreen;
            currentScreen = target;

            // Preserve scroll position of departing screen
            const prevEl = document.getElementById(`screen-${previousScreen}`);
            if (prevEl) {
                screenScrollPositions[previousScreen] = prevEl.scrollTop;
            }

            // Update browser URL hash if requested
            if (pushState) {
                let hashUrl = `#/${target}`;
                if (params) {
                    const qs = params instanceof URLSearchParams ? params.toString() : new URLSearchParams(params).toString();
                    if (qs) hashUrl += `?${qs}`;
                }
                if (window.location.hash !== hashUrl) {
                    window.history.pushState({ screen: target }, '', hashUrl);
                }
            }

            // Update navigation pill bar active state
            document.querySelectorAll('.pill-nav-item').forEach(btn => {
                const isMatch = btn.getAttribute('data-target') === target;
                btn.classList.toggle('active', isMatch);
                btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
            });

            // Switch screen visibility with smooth crossfade
            let targetEl = null;
            SCREENS.forEach(id => {
                const el = document.getElementById(`screen-${id}`);
                if (el) {
                    if (id === target) {
                        el.classList.add('active');
                        el.style.display = 'block';
                        el.removeAttribute('inert');
                        targetEl = el;
                    } else {
                        el.classList.remove('active');
                        el.style.display = 'none';
                        el.setAttribute('inert', '');
                    }
                }
            });

            // Maintain independent scroll position for each screen
            if (targetEl) {
                if (params && (params.tab || params.genre || params.search)) {
                    targetEl.scrollTop = 0;
                } else if (screenScrollPositions[target] !== undefined) {
                    targetEl.scrollTop = screenScrollPositions[target];
                }
            }

            // Notify screen specific handlers
            this.onScreenActivated(target, params, previousScreen);
        },

        /**
         * Screen activation triggers
         */
        onScreenActivated(screenId, params, previousScreen) {
            // Screen specific lifecycle updates
            switch (screenId) {
                case 'home':
                    if (window.RingoApp && typeof window.RingoApp.refreshHome === 'function') {
                        window.RingoApp.refreshHome();
                    }
                    break;

                case 'explore':
                    if (window.RingoApp && typeof window.RingoApp.refreshExplore === 'function') {
                        const genre = params ? (params instanceof URLSearchParams ? params.get('genre') : params.genre) : null;
                        const query = params ? (params instanceof URLSearchParams ? params.get('search') : params.search) : null;
                        window.RingoApp.refreshExplore({ genre, query });
                    }
                    break;

                case 'create':
                    // Pause playback if desired or refresh studio project
                    if (window.RingoStudio && typeof window.RingoStudio.onActivated === 'function') {
                        window.RingoStudio.onActivated();
                    }
                    break;

                case 'library':
                    if (window.RingoApp && typeof window.RingoApp.refreshLibrary === 'function') {
                        const tab = params ? (params instanceof URLSearchParams ? params.get('tab') : params.tab) : null;
                        window.RingoApp.refreshLibrary(tab);
                    }
                    break;

                case 'profile':
                    if (window.RingoApp && typeof window.RingoApp.refreshProfile === 'function') {
                        window.RingoApp.refreshProfile();
                    }
                    break;
            }

            // Emit custom screen change event
            const event = new CustomEvent('ringo:screenchange', {
                detail: { screen: screenId, previousScreen, params }
            });
            window.dispatchEvent(event);
        },

        /**
         * Get active screen name
         */
        getCurrentScreen() {
            return currentScreen;
        }
    };

    window.RingoRouter = RingoRouter;
})(typeof window !== 'undefined' ? window : globalThis);
if (typeof window !== 'undefined') {
    window.RingoRouter = RingoRouter;
}
