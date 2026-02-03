const AUTH_KEY = 'love_token';
const LOGIN_URL = '/api/login';

const auth = {
    // Check if user is logged in. If not, redirect to index.
    checkAuth: () => {
        const token = localStorage.getItem(AUTH_KEY);
        if (!token) {
            window.location.href = '/index.html';
            return null;
        }
        return token;
    },

    // Check if user is already logged in (for index page)
    isLoggedIn: () => {
        return !!localStorage.getItem(AUTH_KEY);
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
                localStorage.setItem(AUTH_KEY, data.token);
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
        localStorage.removeItem(AUTH_KEY);
        window.location.href = '/index.html';
    },

    // Fetch wrapper with Auth Header
    fetchProtected: async (url, options = {}) => {
        const token = localStorage.getItem(AUTH_KEY);
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
