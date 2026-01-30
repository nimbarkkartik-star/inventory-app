import { store } from '../store.js';
import { createElement, formatCurrency, formatDate } from '../utils.js';
// Using CDN for Chart.js since no bundler/npm
import 'https://cdn.jsdelivr.net/npm/chart.js';

export const Dashboard = () => {
    const container = createElement('div', ['flex', 'flex-col', 'gap-6', 'animate-fade-in']);

    // Header
    const header = createElement('h1', ['font-bold', 'text-2xl'], {}, 'Dashboard');
    container.appendChild(header);

    // Stats
    const stats = store.getDashboardStats();

    // Grid Container
    const topGrid = createElement('div', ['grid', 'gap-4'], { style: 'grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));' });

    const metrics = [
        { label: 'Total Products', value: stats.totalProducts, icon: '📦' },
        { label: 'Total Items in Stock', value: stats.totalStock, icon: '📊' },
        { label: 'Low Stock Alerts', value: stats.lowStock, icon: '⚠️', class: stats.lowStock > 0 ? 'text-warning' : '' },
        { label: 'Inventory Value', value: formatCurrency(stats.totalValue), icon: '💰' }
    ];

    metrics.forEach(m => {
        const card = createElement('div', ['card', 'stat-card']);
        card.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="stat-label">${m.label}</span>
                <span style="font-size: 1.5rem;">${m.icon}</span>
            </div>
            <span class="stat-value ${m.class || ''}">${m.value}</span>
        `;
        topGrid.appendChild(card);
    });
    container.appendChild(topGrid);

    // Charts & Recent Grid
    const mainGrid = createElement('div', ['grid', 'gap-6'], { style: 'grid-template-columns: 2fr 1fr; margin-top: 1rem;' });

    // Left: Chart
    const chartCard = createElement('div', ['card', 'flex', 'flex-col']);
    chartCard.innerHTML = `
        <h3 class="font-bold text-lg mb-4">Stock Movements (Last 7 Days)</h3>
        <div style="position: relative; height: 300px; width: 100%;">
            <canvas id="movementChart"></canvas>
        </div>
    `;
    mainGrid.appendChild(chartCard);

    // Right: Recent Activity
    const activityCard = createElement('div', ['card', 'flex', 'flex-col', 'gap-4']);
    activityCard.innerHTML = `<h3 class="font-bold text-lg">Recent Moves</h3>`;

    const movements = [...store.state.movements]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (movements.length > 0) {
        const list = createElement('div', ['flex', 'flex-col', 'gap-3']);
        movements.forEach(m => {
            const product = store.state.products.find(p => p.id === m.productId);
            const item = createElement('div', ['flex', 'align-center', 'justify-between', 'text-sm'], { style: 'border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;' });
            item.innerHTML = `
                <div class="flex flex-col">
                    <span class="font-medium">${product?.name || 'Unknown'}</span>
                    <span class="text-muted text-xs">${formatDate(m.date)}</span>
                </div>
                <div class="font-bold ${m.type === 'IN' ? 'text-success' : 'text-danger'}">
                    ${m.type === 'IN' ? '+' : '-'}${m.quantity}
                </div>
            `;
            list.appendChild(item);
        });
        activityCard.appendChild(list);
    } else {
        activityCard.innerHTML += `<p class="text-secondary text-sm">No recent movements.</p>`;
    }

    // Recently Added Products
    const productsCard = createElement('div', ['card', 'flex', 'flex-col', 'gap-4']);
    productsCard.innerHTML = `<h3 class="font-bold text-lg">New Products</h3>`;

    const recentProducts = [...store.state.products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    if (recentProducts.length > 0) {
        const list = createElement('div', ['flex', 'flex-col', 'gap-3']);
        recentProducts.forEach(p => {
            const item = createElement('div', ['flex', 'align-center', 'justify-between', 'text-sm'], { style: 'border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;' });
            item.innerHTML = `
                <div class="flex flex-col">
                    <span class="font-medium">${p.name}</span>
                    <span class="text-muted text-xs">${p.category || 'Uncategorized'}</span>
                </div>
                <span class="font-medium">${p.quantity} in stock</span>
             `;
            list.appendChild(item);
        });
        productsCard.appendChild(list);
    } else {
        productsCard.innerHTML += `<p class="text-secondary text-sm">No products added yet.</p>`;
    }

    // Right Column Container
    const rightCol = createElement('div', ['flex', 'flex-col', 'gap-6']);
    rightCol.appendChild(activityCard);
    rightCol.appendChild(productsCard);

    mainGrid.appendChild(rightCol);
    container.appendChild(mainGrid);

    // Initialize Chart
    setTimeout(() => {
        const ctx = container.querySelector('#movementChart');
        if (ctx) {
            renderChart(ctx);
        }
    }, 100);

    return container;
};

function renderChart(canvas) {
    // Process Data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const inData = last7Days.map(date => {
        return store.state.movements
            .filter(m => m.type === 'IN' && m.date.startsWith(date))
            .reduce((sum, m) => sum + parseInt(m.quantity), 0);
    });

    const outData = last7Days.map(date => {
        return store.state.movements
            .filter(m => m.type === 'OUT' && m.date.startsWith(date))
            .reduce((sum, m) => sum + parseInt(m.quantity), 0);
    });

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [
                {
                    label: 'Stock In',
                    data: inData,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                },
                {
                    label: 'Stock Out',
                    data: outData,
                    backgroundColor: '#ef4444',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}
