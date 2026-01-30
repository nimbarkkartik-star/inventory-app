import { store } from './store.js';
import { Sidebar } from './components/Sidebar.js';
import { createElement } from './utils.js';
import { Dashboard } from './components/Dashboard.js';
import { Products } from './components/Products.js';
import { Settings } from './components/Settings.js';

import { Categories } from './components/Categories.js';
import { Inventory } from './components/Inventory.js';
import { Reports } from './components/Reports.js';
import { Login } from './components/Login.js';

// Route Map
const routes = {
    'dashboard': Dashboard,
    'products': Products,
    'categories': Categories,
    'inventory': Inventory,
    'reports': Reports,
    'settings': Settings,
    'login': Login
};



const app = document.getElementById('app');

function init() {
    // Theme Init
    if (store.state.theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    }

    // Check Auth on Init
    if (!store.state.auth?.isAuthenticated && window.location.hash !== '#login') {
        window.location.hash = 'login';
    }

    render();
    window.addEventListener('hashchange', render);

    // Global Store Listener for Theme
    store.subscribe(() => {
        if (store.state.theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
    });
}

function render() {
    app.innerHTML = '';

    // Auth Check during navigation
    if (!store.state.auth?.isAuthenticated && window.location.hash !== '#login') {
        window.location.hash = 'login';
        return;
    }

    // Get Route
    const hash = window.location.hash.slice(1) || 'dashboard';
    const PageComponent = routes[hash] || routes['dashboard'];

    // Special Case: Login (No Shell)
    if (hash === 'login') {
        app.appendChild(PageComponent());
        return;
    }

    // Sidebar
    app.appendChild(Sidebar(hash));

    // Main Content
    const main = createElement('main', ['main-content']);

    // Top Bar (Shared)
    const topBar = createElement('header', ['top-bar']);

    // Menu Toggle (Mobile)
    const menuBtn = createElement('button', ['menu-toggle']);
    menuBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    menuBtn.onclick = () => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('open');
    };
    topBar.appendChild(menuBtn);

    // Sidebar Overlay
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = createElement('div', ['sidebar-overlay']);
        overlay.onclick = () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('open');
            overlay.classList.remove('open');
        };
        app.appendChild(overlay);
    }

    // Theme Toggle in Top Bar
    const themeBtn = createElement('button', ['theme-toggle']);
    themeBtn.setAttribute('title', 'Toggle Theme');
    themeBtn.innerHTML = store.state.theme === 'dark'
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

    themeBtn.onclick = () => store.toggleTheme();
    topBar.appendChild(themeBtn);
    main.appendChild(topBar);

    // Page Content
    const pageContainer = createElement('div', ['page-content']);

    // Async Render for Loading State simulation
    // We wrap the component Render in a small delay or just call it
    // For now synchronous
    if (typeof PageComponent === 'function') {
        const content = PageComponent();
        if (content instanceof Promise) {
            // Handle loading
        } else {
            pageContainer.appendChild(content);
        }
    }

    main.appendChild(pageContainer);
    app.appendChild(main);
}

init();
