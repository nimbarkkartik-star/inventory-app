import { store } from '../store.js';
import { createElement, formatDate } from '../utils.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';

export const Categories = () => {
    const container = createElement('div', ['flex', 'flex-col', 'gap-6', 'animate-fade-in']);

    // Header
    const headerRow = createElement('div', ['flex', 'justify-between', 'items-center']);
    headerRow.innerHTML = `<h1 class="font-bold text-2xl">Categories</h1>`;

    const addBtn = createElement('button', ['btn', 'btn-primary']);
    addBtn.innerHTML = `Add Category`;
    addBtn.onclick = () => openCategoryModal();
    headerRow.appendChild(addBtn);

    container.appendChild(headerRow);

    // List
    const tableWrapper = createElement('div', ['table-container']);
    const categories = store.state.categories;

    if (categories.length === 0) {
        tableWrapper.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏷️</div>
                <h3>No categories</h3>
                <p>Create categories to organize your products.</p>
            </div>
        `;
    } else {
        const table = createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${categories.map(c => `
                    <tr>
                        <td class="font-medium">${c.name}</td>
                        <td class="text-secondary">${formatDate(c.createdAt)}</td>
                        <td>
                             <button class="btn-icon text-primary" data-action="edit" data-id="${c.id}">Edit</button>
                             <button class="btn-icon text-danger" style="margin-left: 0.5rem; color:var(--danger)" data-action="delete" data-id="${c.id}">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableWrapper.appendChild(table);
    }
    container.appendChild(tableWrapper);

    // Clean Event Handling
    tableWrapper.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'delete') {
            Modal.open({
                title: 'Delete Category',
                content: 'Are you sure?',
                confirmText: 'Delete',
                onConfirm: async () => {
                    store.deleteCategory(id);
                    Toast.show('Category deleted');
                    window.dispatchEvent(new Event('hashchange'));
                }
            });
        }

        if (action === 'edit') {
            const cat = store.state.categories.find(c => c.id === id);
            if (cat) openCategoryModal(cat);
        }
    });

    return container;
};

function openCategoryModal(existingCategory = null) {
    const isEdit = !!existingCategory;

    const formHtml = `
        <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">Category Name</label>
            <input type="text" id="c-name" class="input" value="${existingCategory ? existingCategory.name : ''}" placeholder="e.g. Electronics">
        </div>
    `;

    Modal.open({
        title: isEdit ? 'Edit Category' : 'New Category',
        content: formHtml,
        confirmText: isEdit ? 'Save' : 'Create',
        onConfirm: async () => {
            const name = document.getElementById('c-name').value;
            if (!name) {
                Toast.show('Name required', 'error');
                throw new Error();
            }

            try {
                if (isEdit) {
                    store.updateCategory(existingCategory.id, name);
                    Toast.show('Category updated');
                } else {
                    store.addCategory(name);
                    Toast.show('Category created');
                }
                await new Promise(r => setTimeout(r, 300));
                window.dispatchEvent(new Event('hashchange'));
            } catch (err) {
                Toast.show(err.message, 'error');
                throw err;
            }
        }
    });
}
