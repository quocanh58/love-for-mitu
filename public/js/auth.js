const AUTH_KEY = 'love_token';
const AUTH_TIMESTAMP = 'love_auth_active';
const LOGIN_URL = '/api/login';
const SESSION_DURATION = 30 * 60 * 1000; // 30 Minutes

const auth = {
    // Check if user is logged in. If not, redirect to index.
    checkAuth: () => {
        const token = sessionStorage.getItem(AUTH_KEY);
        const lastActive = sessionStorage.getItem(AUTH_TIMESTAMP);
        const now = Date.now();

        if (!token || !lastActive || (now - lastActive > SESSION_DURATION)) {
            auth.logout();
            return null;
        }

        return token;
    },

    // Check if user is already logged in (for index page)
    isLoggedIn: () => {
        const token = sessionStorage.getItem(AUTH_KEY);
        const lastActive = sessionStorage.getItem(AUTH_TIMESTAMP);
        const now = Date.now();

        if (token && lastActive && (now - lastActive <= SESSION_DURATION)) {
             return true;
        }
        return false;
    },

    // Login function
    login: async (password) => {
        try {
            const res = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            if (res.ok) {
                const data = await res.json();
                sessionStorage.setItem(AUTH_KEY, data.token);
                sessionStorage.setItem(AUTH_TIMESTAMP, Date.now());
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // Logout function
    logout: () => {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_TIMESTAMP);
        // Only redirect if not already on index
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
             window.location.href = 'index.html';
        }
    },

    // Fetch wrapper with Auth Header
    fetchProtected: async (url, options = {}) => {
        const token = sessionStorage.getItem(AUTH_KEY);
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        return fetch(url, { ...options, headers });
    },

    // Load Image as Blob and set src
    loadImage: async (imgElement, filename) => {
        try {
            const res = await auth.fetchProtected(`/api/images/${filename}`);
            if (res.ok) {
                const blob = await res.blob();
                const objectURL = URL.createObjectURL(blob);
                imgElement.src = objectURL;
            } else {
                imgElement.src = ''; 
            }
        } catch (e) {
            console.error('Failed to load image:', filename);
        }
    }
};

// Expose globally
window.auth = auth;

// Periodic Session Check (Every 1 minute)
setInterval(() => {
    // Only check if we think we are logged in, to assume auto-logout
    if (sessionStorage.getItem(AUTH_KEY)) {
        auth.checkAuth();
    }
}, 60000);
