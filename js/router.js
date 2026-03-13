/**
 * Router - Client-side Routing
 * AmkyawDev AI Power Platform
 */

class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.beforeEach = null;
        this.afterEach = null;
    }

    /**
     * Add route
     */
    add(path, handler, name) {
        this.routes.push({
            path,
            handler,
            name,
            regex: this._pathToRegex(path)
        });
        return this;
    }

    /**
     * Convert path to regex
     */
    _pathToRegex(path) {
        const params = [];
        const regexPath = path
            .replace(/\//g, '\\/')
            .replace(/:\w+/g, (match) => {
                params.push(match.slice(1));
                return '([^\\/]+)';
            });
        return {
            pattern: new RegExp(`^${regexPath}$`),
            params
        };
    }

    /**
     * Match route
     */
    _match(path) {
        for (const route of this.routes) {
            const match = path.match(route.regex.pattern);
            if (match) {
                const params = {};
                route.regex.params.forEach((param, index) => {
                    params[param] = match[index + 1];
                });
                return { route, params };
            }
        }
        return null;
    }

    /**
     * Navigate to path
     */
    navigate(path, options = {}) {
        const { replace = false, state = {} } = options;
        
        if (replace) {
            window.history.replaceState(state, '', path);
        } else {
            window.history.pushState(state, '', path);
        }
        
        this._handleRoute(path);
    }

    /**
     * Handle route
     */
    async _handleRoute(path) {
        // Run beforeEach guard
        if (this.beforeEach) {
            const canContinue = await this.beforeEach(path);
            if (!canContinue) return;
        }

        const match = this._match(path);
        
        if (match) {
            this.currentRoute = match.route;
            
            // Update active nav links
            this._updateActiveLinks(path);
            
            // Call handler
            await match.route.handler(match.params);
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Run afterEach
            if (this.afterEach) {
                this.afterEach(match.route);
            }
        } else {
            // 404 handler
            this._handle404(path);
        }
    }

    /**
     * Update active navigation links
     */
    _updateActiveLinks(path) {
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === path || (href !== '/' && path.startsWith(href))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Handle 404
     */
    _handle404(path) {
        console.error(`Route not found: ${path}`);
        // Could redirect to 404 page
    }

    /**
     * Set before guard
     */
    beforeEach(guard) {
        this.beforeEach = guard;
        return this;
    }

    /**
     * Set after guard
     */
    afterEach(guard) {
        this.afterEach = guard;
        return this;
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Get current path
     */
    getCurrentPath() {
        return window.location.pathname;
    }

    /**
     * Start router
     */
    start() {
        // Handle back/forward navigation
        window.addEventListener('popstate', () => {
            this._handleRoute(window.location.pathname);
        });

        // Handle initial route
        this._handleRoute(window.location.pathname);

        // Handle link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.origin === window.location.origin) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });
    }

    /**
     * Redirect
     */
    redirect(path) {
        this.navigate(path);
    }

    /**
     * Replace current route
     */
    replace(path) {
        this.navigate(path, { replace: true });
    }
}

// Create router instance
const router = new Router();

// Export
if (typeof window !== 'undefined') {
    window.Router = Router;
    window.router = router;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Router, router };
}
