import { store } from '../store.js';
import { createElement, formatCurrency, formatDate } from '../utils.js';

export const Reports = () => {
    const container = createElement('div', ['flex', 'flex-col', 'gap-6', 'animate-fade-in']);

    // Header
    const headerRow = createElement('div', ['flex', 'justify-between', 'items-center']);
    headerRow.innerHTML = `<h1 class="font-bold text-2xl">Reports</h1>`;

    // Actions
    const actions = createElement('div', ['flex', 'gap-2']);

    const printBtn = createElement('button', ['btn', 'btn-secondary']);
    printBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print
    `;
    printBtn.onclick = () => window.print();

    const exportBtn = createElement('button', ['btn', 'btn-primary']);
    exportBtn.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
         Export CSV
    `;
    exportBtn.onclick = downloadCSV;

    actions.appendChild(printBtn);
    actions.appendChild(exportBtn);
    headerRow.appendChild(actions);

    container.appendChild(headerRow);

    // Summary Card
    const stats = store.getDashboardStats();
    const summaryCard = createElement('div', ['card', 'p-6', 'grid', 'gap-6'], { style: 'grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin-bottom: 1rem;' });
    summaryCard.innerHTML = `
        <div class="flex flex-col gap-1">
            <span class="text-secondary text-sm">Total Products</span>
            <span class="text-2xl font-bold">${stats.totalProducts}</span>
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-secondary text-sm">Total Stock Qty</span>
            <span class="text-2xl font-bold">${stats.totalStock}</span>
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-secondary text-sm">Inventory Value</span>
            <span class="text-2xl font-bold">${formatCurrency(stats.totalValue)}</span>
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-secondary text-sm">Low Stock Items</span>
            <span class="text-2xl font-bold ${stats.lowStock > 0 ? 'text-danger' : ''}">${stats.lowStock}</span>
        </div>
    `;
    container.appendChild(summaryCard);

    // Report Table
    const tableWrapper = createElement('div', ['table-container']);
    const products = store.state.products;

    if (products.length === 0) {
        tableWrapper.innerHTML = `<div class="p-8 text-center text-secondary">No data available for report.</div>`;
    } else {
        const table = createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th class="text-right">Price</th>
                    <th class="text-center">Stock</th>
                    <th class="text-right">Value (Est)</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => {
            const stockVal = (parseInt(p.quantity) || 0) * (parseFloat(p.price) || 0);
            const isLow = (parseInt(p.quantity) || 0) <= (parseInt(p.reorderLevel) || 10);
            return `
                    <tr>
                        <td class="text-sm font-mono text-secondary">${p.sku || '-'}</td>
                        <td class="font-medium">
                            ${p.name}
                            ${isLow ? '<span class="text-danger text-xs ml-2 font-bold">(Low)</span>' : ''}
                        </td>
                        <td>${p.category || '-'}</td>
                        <td class="text-right">${formatCurrency(p.price)}</td>
                        <td class="text-center font-bold">${p.quantity}</td>
                        <td class="text-right">${formatCurrency(stockVal)}</td>
                        <td>
                            <span style="font-size: 0.75rem;">${p.status}</span>
                        </td>
                    </tr>
                    `;
        }).join('')}
            </tbody>
        `;
        tableWrapper.appendChild(table);
    }
    container.appendChild(tableWrapper);

    return container;
};

function downloadCSV() {
    const products = store.state.products;
    if (!products.length) return;

    // Headers
    const headers = ['ID', 'SKU', 'Name', 'Category', 'Price', 'Stock', 'Reorder Level', 'Status', 'Last Updated'];

    // Rows
    const rows = products.map(p => [
        p.id,
        p.sku || '',
        p.name,
        p.category || '',
        p.price,
        p.quantity,
        p.reorderLevel,
        p.status,
        p.updatedAt
    ]);

    // CSV Construction
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download Logic
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
