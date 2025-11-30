/**
 * Shared Logic for Worker Platform
 * Handles LocalStorage, Authentication, and common UI tasks.
 */

class Storage {
    static USERS_KEY = 'app_users';
    static CURRENT_USER_KEY = 'app_current_user';
    static FAVORITES_KEY = 'app_favorites';

    static getUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : [];
    }

    static saveUser(user) {
        const users = this.getUsers();
        // Check if phone already exists
        const existing = users.find(u => u.phone === user.phone);
        if (existing) {
            // Update existing
            const index = users.indexOf(existing);
            users[index] = { ...existing, ...user };
        } else {
            // Add new
            users.push(user);
        }
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    static getCurrentUser() {
        const user = localStorage.getItem(this.CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    static setCurrentUser(user) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    }

    static logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    static getWorkers() {
        return this.getUsers().filter(u => u.role === 'worker');
    }

    // Favorites Logic
    static getFavorites() {
        const favs = localStorage.getItem(this.FAVORITES_KEY);
        return favs ? JSON.parse(favs) : {};
    }

    static toggleFavorite(workerPhone) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const favs = this.getFavorites();
        const userFavs = favs[currentUser.phone] || [];

        const index = userFavs.indexOf(workerPhone);
        let isAdded = false;

        if (index === -1) {
            userFavs.push(workerPhone);
            isAdded = true;
        } else {
            userFavs.splice(index, 1);
            isAdded = false;
        }

        favs[currentUser.phone] = userFavs;
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favs));
        return isAdded;
    }

    static isFavorite(workerPhone) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const favs = this.getFavorites();
        const userFavs = favs[currentUser.phone] || [];
        return userFavs.includes(workerPhone);
    }
}

class Auth {
    static register(name, phone, password, role) {
        const users = Storage.getUsers();
        if (users.find(u => u.phone === phone)) {
            throw new Error('Phone number already registered');
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            phone,
            password, // In a real app, hash this!
            role, // 'user' or 'worker'
            jobTitle: '', // Only for workers
            description: '' // Only for workers
        };

        Storage.saveUser(newUser);
        Storage.setCurrentUser(newUser);
        UI.showToast(`Welcome, ${name}! Account created.`, 'success');
        return newUser;
    }

    static login(phone, password) {
        const users = Storage.getUsers();
        const user = users.find(u => u.phone === phone && u.password === password);

        if (!user) {
            throw new Error('Invalid phone or password');
        }

        Storage.setCurrentUser(user);
        UI.showToast('Logged in successfully', 'success');
        return user;
    }

    static checkAuth() {
        return Storage.getCurrentUser();
    }

    static logout() {
        Storage.logout();
        UI.showToast('Logged out successfully', 'success');
    }
}

class UI {
    static showElement(id) {
        document.getElementById(id)?.classList.remove('hidden');
    }

    static hideElement(id) {
        document.getElementById(id)?.classList.add('hidden');
    }

    static showError(message, containerId) {
        // Fallback or use Toast
        this.showToast(message, 'error');
    }

    // Toast Notifications
    static showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icons
        const icon = type === 'success'
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

        toast.innerHTML = `${icon}<span>${message}</span>`;
        container.appendChild(toast);

        // Remove after 3s
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.4s forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Avatar Generator
    static getAvatar(name) {
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

        // Deterministic color based on name length
        const colorIndex = name.length % colors.length;
        const bg = colors[colorIndex];

        return `
            <div class="avatar" style="background: ${bg};">
                ${initials}
            </div>
        `;
    }

    // Mock Rating Generator
    static getRating(id) {
        // Deterministic pseudo-random based on ID string
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Map to 4.0 - 5.0 range
        const rating = (Math.abs(hash % 10) / 10) + 4.0;
        const count = Math.abs(hash % 50) + 5; // 5 to 55 reviews

        return {
            stars: rating.toFixed(1),
            count: count
        };
    }
}
