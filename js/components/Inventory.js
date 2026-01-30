import { store } from '../store.js';
import { createElement, formatDate } from '../utils.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';

let currentFilter = '';

export const Inventory = () => {
    const container = createElement('div', ['flex', 'flex-col', 'gap-6', 'animate-fade-in']);

    // Header
    const headerRow = createElement('div', ['flex', 'justify-between', 'items-center']);
    headerRow.innerHTML = `<h1 class="font-bold text-2xl">Inventory History</h1>`;

    const addBtn = createElement('button', ['btn', 'btn-primary']);
    addBtn.innerText = 'Record Movement';
    addBtn.onclick = openMovementModal;
    headerRow.appendChild(addBtn);

    container.appendChild(headerRow);

    // Filters
    const filterRow = createElement('div', ['flex', 'align-center', 'gap-4', 'p-4', 'bg-surface', 'border', 'rounded']);
    filterRow.style.backgroundColor = 'var(--bg-surface)';
    filterRow.style.border = '1px solid var(--border-color)';
    filterRow.style.borderRadius = 'var(--radius-md)';

    const filterHtml = `
        <div class="flex items-center gap-2 flex-1">
            <span class="text-sm font-medium text-secondary">Filter by Product:</span>
            <select id="history-filter" class="input" style="max-width: 300px;">
                <option value="">All Products</option>
                ${store.state.products.map(p => `<option value="${p.id}" ${currentFilter === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
        </div>
    `;
    filterRow.innerHTML = filterHtml;
    container.appendChild(filterRow);

    const filterSelect = filterRow.querySelector('#history-filter');
    filterSelect.onchange = (e) => {
        currentFilter = e.target.value;
        const event = new Event('hashchange'); // Trigger re-render simple way
        window.dispatchEvent(event);
    };

    // List
    const tableWrapper = createElement('div', ['table-container']);

    // Filter Data
    let movements = [...store.state.movements].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (currentFilter) {
        movements = movements.filter(m => m.productId === currentFilter);
    }

    const products = store.state.products;

    if (movements.length === 0) {
        tableWrapper.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📜</div>
                <h3>No records found</h3>
                <p>${currentFilter ? 'No movements for this product.' : 'No inventory movements recorded yet.'}</p>
            </div>
        `;
    } else {
        const table = createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Change</th>
                    <th>Balance</th>
                    <th>Reason</th>
                </tr>
            </thead>
            <tbody>
                ${movements.map(m => {
            const product = products.find(p => p.id === m.productId);
            let typeClass = 'text-main';
            let typeLabel = m.type;
            let bg = '#f3f4f6';
            let sign = '';

            if (m.type === 'IN') {
                typeClass = 'text-success';
                bg = 'var(--success-bg)';
                sign = '+';
            } else if (m.type === 'OUT') {
                typeClass = 'text-danger';
                bg = 'var(--danger-bg)';
                sign = '-';
            } else {
                typeClass = 'text-warning';
                bg = 'var(--warning-bg)';
                sign = '=';
            }

            return `
                    <tr>
                        <td class="text-sm text-secondary">${formatDate(m.date)}</td>
                        <td class="font-medium">${product ? product.name : 'Unknown'}</td>
                        <td>
                            <span class="${typeClass}" style="background: ${bg}; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
                                ${typeLabel}
                            </span>
                        </td>
                        <td class="font-bold font-mono">${sign}${m.quantity}</td>
                        <td class="text-sm text-secondary">${m.snapshotQty ?? '-'}</td>
                        <td class="text-secondary text-sm">${m.reason || '-'}</td>
                    </tr>
                    `;
        }).join('')}
            </tbody>
        `;
        tableWrapper.appendChild(table);
    }
    container.appendChild(tableWrapper);

    // Summary Stat based on filtered view
    if (movements.length > 0) {
        const summary = createElement('div', ['text-sm', 'text-secondary', 'text-right', 'mt-2']);
        summary.innerText = `Showing ${movements.length} record(s)`;
        container.appendChild(summary);
    }

    return container;
};

// ... (Modal logic remains mostly same, keeping it for "Record Movement")
function openMovementModal() {
    const products = store.state.products;
    if (products.length === 0) {
        Toast.show('Create products first', 'error');
        return;
    }

    const formHtml = `
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Product</label>
                <select id="m-product" class="input">
                    ${products.map(p => `<option value="${p.id}" ${currentFilter === p.id ? 'selected' : ''}>${p.name} (Cur: ${p.quantity})</option>`).join('')}
                </select>
            </div>
            <div class="grid gap-4" style="grid-template-columns: 1fr 1fr;">
                 <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Type</label>
                    <select id="m-type" class="input">
                        <option value="IN">Stock IN (+)</option>
                        <option value="OUT">Stock OUT (-)</option>
                        <option value="ADJUST">Manual Adjustment (=)</option>
                    </select>
                </div>
                 <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Quantity</label>
                    <input type="number" id="m-qty" class="input" placeholder="0">
                    <span class="text-xs text-secondary" id="qty-hint">Amount to add</span>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">Reason</label>
                <select id="m-reason" class="input">
                    <option value="Purchase Order">Purchase Order</option>
                    <option value="Sale">Sale</option>
                    <option value="Return">Return</option>
                    <option value="Damaged">Damaged / Expired</option>
                    <option value="Loss">Lost / Theft</option>
                    <option value="Inventory Count">Inventory Count</option>
                    <option value="Correction">Correction</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>
    `;

    Modal.open({
        title: 'Record Movement',
        content: formHtml,
        confirmText: 'Save',
        onConfirm: async () => {
            const productId = document.getElementById('m-product').value;
            const type = document.getElementById('m-type').value;
            const quantity = parseInt(document.getElementById('m-qty').value);
            const reason = document.getElementById('m-reason').value;

            if (isNaN(quantity) || quantity < 0) {
                Toast.show('Invalid quantity', 'error');
                throw new Error();
            }

            if (type === 'ADJUST' && quantity < 0) {
                Toast.show('Adjustment cannot be negative. Use 0 to clear stock.', 'error');
                throw new Error();
            }

            await new Promise(r => setTimeout(r, 600));
            try {
                store.addMovement({ productId, type, quantity, reason });
                Toast.show('Movement recorded');
                window.dispatchEvent(new Event('hashchange'));
            } catch (e) {
                Toast.show(e.message, 'error');
                throw e;
            }
        }
    });

    // Enhancement: Update hint based on type
    setTimeout(() => {
        const typeSelect = document.getElementById('m-type');
        const hint = document.getElementById('qty-hint');
        if (typeSelect && hint) {
            typeSelect.onchange = () => {
                const map = {
                    'IN': 'Amount to add',
                    'OUT': 'Amount to remove',
                    'ADJUST': 'New total quantity'
                };
                hint.textContent = map[typeSelect.value];
            };
        }
    }, 100);
}
