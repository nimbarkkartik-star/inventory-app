import { store } from '../store.js';
import { createElement } from '../utils.js';
import { Toast } from './Toast.js';

export const Settings = () => {
    const container = createElement('div', ['flex', 'flex-col', 'gap-6', 'animate-fade-in']);

    container.innerHTML = `<h1 class="font-bold text-2xl">Settings</h1>`;

    // App Preferences
    const card = createElement('div', ['card', 'max-w-2xl']);

    card.innerHTML = `
        <h3 class="font-bold text-lg mb-4">General Info</h3>
        <div class="flex flex-col gap-2 mb-6">
            <label class="text-sm font-medium">Company Name</label>
            <div class="flex gap-2">
                <input type="text" id="company-name" class="input" value="${store.state.settings.companyName || 'My Inventory'}" placeholder="e.g. Acme Corp">
                <button id="save-company-btn" class="btn btn-primary">Save</button>
            </div>
        </div>

        <h3 class="font-bold text-lg mb-4">Appearance</h3>
        <div class="flex items-center justify-between mb-6">
            <div>
                <div class="font-medium">Dark Mode</div>
                <div class="text-sm text-secondary">Switch between light and dark themes</div>
            </div>
            <label class="switch">
                <input type="checkbox" id="theme-switch" ${store.state.theme === 'dark' ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>

        <h3 class="font-bold text-lg mb-4 mt-8">Data Management</h3>
        <div class="flex items-center justify-between">
            <div>
                <div class="font-medium">Clear All Data</div>
                <div class="text-sm text-secondary">Permanently remove all products and history</div>
            </div>
            <button id="clear-btn" class="btn btn-secondary text-danger" style="border-color: var(--danger);">Clear Data</button>
        </div>
    `;

    container.appendChild(card);

    // Event Listeners
    setTimeout(() => {
        const companyInput = container.querySelector('#company-name');
        const saveCompanyBtn = container.querySelector('#save-company-btn');

        if (saveCompanyBtn) {
            saveCompanyBtn.onclick = () => {
                const name = companyInput.value;
                if (name) {
                    store.updateSettings({ companyName: name });
                    Toast.show('Company name saved');
                    // Reload to update header if used there
                    // window.location.reload(); 
                }
            };
        }

        const themeSwitch = container.querySelector('#theme-switch');
        if (themeSwitch) {
            themeSwitch.onchange = () => {
                store.toggleTheme();
                Toast.show(`Theme switched to ${store.state.theme} mode`);
            };
        }

        const clearBtn = container.querySelector('#clear-btn');
        if (clearBtn) {
            clearBtn.onclick = () => {
                if (confirm('Are you sure? This cannot be undone.')) {
                    localStorage.clear();
                    location.reload();
                }
            };
        }
    }, 0);

    return container;
};
