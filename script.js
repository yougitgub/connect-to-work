/**
 * Shared Logic for Worker Platform
 * Handles LocalStorage, Authentication, and common UI tasks.
 */

class Storage {
    static USERS_KEY = 'app_users';
    static CURRENT_USER_KEY = 'app_current_user';

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
        return newUser;
    }

    static login(phone, password) {
        const users = Storage.getUsers();
        const user = users.find(u => u.phone === phone && u.password === password);

        if (!user) {
            throw new Error('Invalid phone or password');
        }

        Storage.setCurrentUser(user);
        return user;
    }

    static checkAuth() {
        return Storage.getCurrentUser();
    }

    static logout() {
        Storage.logout();
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
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div style="color: var(--danger-color); margin-bottom: 1rem; text-align: center;">${message}</div>`;
            setTimeout(() => {
                container.innerHTML = '';
            }, 3000);
        }
    }
}
