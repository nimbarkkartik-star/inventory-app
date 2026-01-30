import { store } from '../store.js';
import { createElement } from '../utils.js';
import { Toast } from './Toast.js';

export const Login = () => {
    const container = createElement('div', ['login-container']);

    const card = createElement('div', ['login-card', 'animate-fade-in']);

    card.innerHTML = `
        <div class="login-header">
            <div class="brand large">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Inventory
            </div>
            <p class="text-secondary">Sign in to manage your inventory</p>
        </div>
        
        <form class="login-form">
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" class="input" placeholder="demo@example.com" value="demo@example.com">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" class="input" placeholder="••••••••" value="demo">
            </div>
            <button type="submit" class="btn btn-primary w-full">Sign In</button>
        </form>
    `;

    // Handle Submit
    const form = card.querySelector('form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const email = card.querySelector('#email').value;
        const password = card.querySelector('#password').value;
        const btn = card.querySelector('button');

        btn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div> Signing in...';

        await new Promise(r => setTimeout(r, 800)); // Fake network delay

        if (store.login(email, password)) {
            window.location.hash = 'dashboard';
            // Force reload to apply layout changes (login vs app shell)
            window.location.reload();
        } else {
            Toast.show('Invalid credentials', 'error');
            btn.innerHTML = 'Sign In';
        }
    };

    container.appendChild(card);
    return container;
};
