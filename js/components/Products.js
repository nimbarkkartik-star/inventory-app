import { store } from '../store.js';
import { createElement, formatCurrency, formatDate } from '../utils.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';

let currentState = {
    search: '',
    sort: 'name', // name | stock
    filterLowStock: false
};

export const Products = () => {
    const container = createElement('div', ['flex', 'flex-col', 'gap-6', 'animate-fade-in']);

    // Header & Actions
    const headerRow = createElement('div', ['flex', 'justify-between', 'items-center']);
    headerRow.innerHTML = `<h1 class="font-bold text-2xl">Products</h1>`;

    const addBtn = createElement('button', ['btn', 'btn-primary']);
    addBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Product
    `;
    addBtn.onclick = () => openProductModal();

    headerRow.appendChild(addBtn);
    container.appendChild(headerRow);

    // Filters Toolbar
    const filterRow = createElement('div', ['flex', 'gap-4', 'items-center', 'justify-between', 'flex-wrap']);

    // Search
    const searchWrapper = createElement('div', ['flex-1'], { style: 'min-width: 250px;' });
    const searchInput = createElement('input', ['input'], {
        placeholder: 'Search by Name or SKU...',
        value: currentState.search
    });
    searchInput.oninput = (e) => {
        currentState.search = e.target.value;
        renderTable();
    };
    searchWrapper.appendChild(searchInput);

    // Controls
    const controls = createElement('div', ['flex', 'gap-4', 'items-center']);

    // Low Stock Filter
    const lowStockLabel = createElement('label', ['flex', 'items-center', 'gap-2', 'cursor-pointer']);
    const lowStockCheck = createElement('input', [], { type: 'checkbox' });
    lowStockCheck.checked = currentState.filterLowStock;
    lowStockCheck.onchange = (e) => {
        currentState.filterLowStock = e.target.checked;
        renderTable();
    };
    lowStockLabel.appendChild(lowStockCheck);
    lowStockLabel.append(' Show Low Stock Only');

    // Sort
    const sortSelect = createElement('select', ['input'], { style: 'width: auto;' });
    sortSelect.innerHTML = `
        <option value="name" ${currentState.sort === 'name' ? 'selected' : ''}>Sort by Name</option>
        <option value="stock" ${currentState.sort === 'stock' ? 'selected' : ''}>Sort by Stock</option>
    `;
    sortSelect.onchange = (e) => {
        currentState.sort = e.target.value;
        renderTable();
    };

    controls.appendChild(lowStockLabel);
    controls.appendChild(sortSelect);

    filterRow.appendChild(searchWrapper);
    filterRow.appendChild(controls);

    container.appendChild(filterRow);

    // Table Container
    const tableContainer = createElement('div', ['table-container']);
    container.appendChild(tableContainer);

    function renderTable() {
        tableContainer.innerHTML = '';
        let products = [...store.state.products];

        // Filter
        if (currentState.search) {
            const q = currentState.search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.sku && p.sku.toLowerCase().includes(q))
            );
        }

        if (currentState.filterLowStock) {
            products = products.filter(p => {
                const qty = parseInt(p.quantity) || 0;
                const limit = parseInt(p.reorderLevel) || 10;
                return qty <= limit;
            });
        }

        // Sort
        products.sort((a, b) => {
            if (currentState.sort === 'name') return a.name.localeCompare(b.name);
            if (currentState.sort === 'stock') return (parseInt(a.quantity) || 0) - (parseInt(b.quantity) || 0);
            return 0;
        });

        if (products.length === 0) {
            tableContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
            return;
        }

        const table = createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => {
            const isLow = (parseInt(p.quantity) || 0) <= (parseInt(p.reorderLevel) || 10);
            return `
                    <tr>
                        <td class="text-sm font-medium text-secondary">${p.sku || '-'}</td>
                        <td class="font-medium">${p.name}</td>
                        <td class="text-secondary text-sm">${p.category || '-'}</td>
                        <td>${formatCurrency(p.price)}</td>
                        <td>
                            <div class="flex items-center gap-2">
                                <span class="${isLow ? 'text-danger' : 'text-success'} font-bold">
                                    ${p.quantity}
                                </span>
                                ${isLow ? '<span title="Low Stock" class="text-warning">⚠️</span>' : ''}
                            </div>
                        </td>
                         <td>
                            <span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: ${p.status === 'Active' ? 'var(--success-bg)' : 'var(--bg-app)'}; color: ${p.status === 'Active' ? 'var(--success)' : 'var(--text-secondary)'}; font-weight: 600;">
                                ${p.status || 'Active'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-icon text-primary" data-action="edit" data-id="${p.id}">Edit</button>
                            <button class="btn-icon text-danger" data-action="delete" data-id="${p.id}" style="margin-left: 0.5rem;">Del</button>
                        </td>
                    </tr>
                `}).join('')}
            </tbody>
        `;
        tableContainer.appendChild(table);
    }

    // Initial Render
    renderTable();

    // Event Bindings
    tableContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'edit') {
            const product = store.state.products.find(p => p.id === id);
            if (product) openProductModal(product);
        } else if (action === 'delete') {
            confirmDelete(id);
        }
    });

    return container;
};

function confirmDelete(id) {
    Modal.open({
        title: 'Delete Product',
        content: 'Are you sure you want to delete this product? This action cannot be undone.',
        confirmText: 'Delete',
        onConfirm: async () => {
            store.deleteProduct(id);
            Toast.show('Product deleted');
            // Force re-render of current view without reload
            // In a better framework, state change triggers render. 
            // Here we dispatch hashchange to "refresh" the view
            window.dispatchEvent(new Event('hashchange'));
        }
    });
}

function openProductModal(existingProduct = null) {
    const isEdit = !!existingProduct;
    // Populate categories dynamically from store or hardcoded common ones + dynamic
    const categories = ['Electronics', 'Clothing', 'Home', 'Office', ...store.state.categories.map(c => c.name)];
    // Dedupe
    const uniqueCats = [...new Set(categories)];

    const formHtml = `
        <div class="flex flex-col gap-4">
            <div class="grid gap-4" style="grid-template-columns: 2fr 1fr;">
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Product Name</label>
                    <input type="text" id="p-name" class="input" value="${existingProduct ? existingProduct.name : ''}" placeholder="e.g. Wireless Headphones">
                </div>
                 <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">SKU</label>
                    <input type="text" id="p-sku" class="input" value="${existingProduct ? existingProduct.sku || '' : ''}" placeholder="PROD-001">
                </div>
            </div>
            
            <div class="grid gap-4" style="grid-template-columns: 1fr 1fr;">
                 <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Price</label>
                    <input type="number" id="p-price" class="input" value="${existingProduct ? existingProduct.price : ''}" placeholder="0.00">
                </div>
                 <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Category</label>
                    <select id="p-cat" class="input">
                        <option value="">Select Category</option>
                        ${uniqueCats.map(c => `<option value="${c}" ${existingProduct?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="grid gap-4" style="grid-template-columns: 1fr 1fr 1fr;">
                 <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Stock</label>
                    <input type="number" id="p-stock" class="input" value="${existingProduct ? existingProduct.quantity : ''}" placeholder="0" ${isEdit ? 'disabled title="Use Inventory Movements to adjust stock"' : ''}>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Reorder Level</label>
                    <input type="number" id="p-reorder" class="input" value="${existingProduct ? existingProduct.reorderLevel || 10 : '10'}">
                </div>
                 <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium">Status</label>
                    <select id="p-status" class="input">
                        <option value="Active" ${!existingProduct || existingProduct.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${existingProduct?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </div>
            ${isEdit ? '<p class="text-xs text-secondary">* Stock quantity can only be adjusted via Inventory Movements.</p>' : ''}
        </div>
    `;

    Modal.open({
        title: isEdit ? 'Edit Product' : 'New Product',
        content: formHtml,
        confirmText: isEdit ? 'Save Changes' : 'Create Product',
        onConfirm: async () => {
            const name = document.getElementById('p-name').value;
            const sku = document.getElementById('p-sku').value;
            const price = document.getElementById('p-price').value;
            const stock = document.getElementById('p-stock').value;
            const category = document.getElementById('p-cat').value;
            const reorderLevel = document.getElementById('p-reorder').value;
            const status = document.getElementById('p-status').value;

            if (!name) {
                Toast.show('Name is required', 'error');
                throw new Error('Validation failed');
            }

            const data = {
                name,
                sku,
                price: parseFloat(price) || 0,
                quantity: parseInt(stock) || 0,
                category,
                reorderLevel: parseInt(reorderLevel) || 0,
                status
            };

            await new Promise(r => setTimeout(r, 600));

            try {
                if (isEdit) {
                    // Don't update quantity directly on edit, security/logic preference
                    delete data.quantity;
                    store.updateProduct(existingProduct.id, data);
                    Toast.show('Product updated');
                } else {
                    store.addProduct(data);
                    Toast.show('Product created');
                }
                window.dispatchEvent(new Event('hashchange'));
            } catch (err) {
                Toast.show(err.message, 'error');
                throw err;
            }
        }
    });
}
