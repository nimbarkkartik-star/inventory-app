import { generateId } from './utils.js';

const STORAGE_KEY = 'inventory_app_v1';

const defaultState = {
    products: [],
    categories: [],
    movements: [],
    settings: {
        currency: 'USD',
        companyName: 'My Inventory'
    },
    theme: 'light',
    auth: {
        isAuthenticated: false,
        user: null
    }
};

class Store {
    constructor() {
        this.state = this.load();
        this.listeners = [];
    }

    // ... (load, save, subscribe, etc remain)

    login(email, password) {
        // Demo Auth Logic
        if (email && password) {
            this.state.auth = {
                isAuthenticated: true,
                user: { email, name: 'Admin User' }
            };
            this.save();
            return true;
        }
        return false;
    }

    logout() {
        this.state.auth = {
            isAuthenticated: false,
            user: null
        };
        this.save();
    }


    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultState;
    }

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => { // unsubscribe
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Actions
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.save();
    }

    addProduct(product) {
        // Enforce Unique SKU
        if (product.sku && this.state.products.some(p => p.sku === product.sku)) {
            throw new Error('Product with this SKU already exists');
        }

        const newProduct = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sku: '',
            reorderLevel: 10,
            status: 'Active',
            ...product
        };
        this.state.products.push(newProduct);
        this.save();
        return newProduct;
    }

    updateProduct(id, updates) {
        const index = this.state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            // Check SKU uniqueness on edit
            if (updates.sku && updates.sku !== this.state.products[index].sku) {
                if (this.state.products.some(p => p.sku === updates.sku)) {
                    throw new Error('Product with this SKU already exists');
                }
            }

            this.state.products[index] = {
                ...this.state.products[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save();
        }
    }

    deleteProduct(id) {
        this.state.products = this.state.products.filter(p => p.id !== id);
        this.save();
    }

    addCategory(name) {
        if (this.state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('Category already exists');
        }
        const newCat = {
            id: generateId(),
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.state.categories.push(newCat);
        this.save();
        return newCat;
    }

    updateCategory(id, name) {
        if (this.state.categories.some(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('Category name already taken');
        }
        const index = this.state.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            this.state.categories[index] = { ...this.state.categories[index], name, updatedAt: new Date().toISOString() };
            this.save();
        }
    }

    deleteCategory(id) {
        this.state.categories = this.state.categories.filter(c => c.id !== id);
        // Optional: Remove category from products? For now, we keep it as text string or set to null
        // Let's set products with this category to null/Uncategorized
        // Finding name first - in a real relational DB we'd use ID. 
        // Current Store uses Name for product.category.
        // Let's find the category name first to be safe, though existing architecture is storing Name directly in Product.
        // Ideally refactor Product to store CategoryID. For this vanilla demo, we skip refactor and just delete.
        this.save();
    }

    addMovement(movement) {
        // Movement: { productId, type: 'IN'|'OUT'|'ADJUST', quantity, reason }

        const product = this.state.products.find(p => p.id === movement.productId);
        if (!product) throw new Error('Product not found');

        const currentQty = parseInt(product.quantity) || 0;
        const moveQty = parseInt(movement.quantity) || 0;
        let newQty = currentQty;

        if (movement.type === 'IN') {
            newQty = currentQty + moveQty;
        } else if (movement.type === 'OUT') {
            newQty = currentQty - moveQty;
        } else if (movement.type === 'ADJUST') {
            newQty = moveQty; // Set directly
        }

        if (newQty < 0) {
            throw new Error('Stock cannot be negative');
        }

        // Record Movement
        const newMovement = {
            id: generateId(),
            date: new Date().toISOString(),
            ...movement,
            quantity: moveQty, // For ADJUST, this might be ambiguous in history, but we store the inputs
            snapshotQty: newQty // Store resulting qty for audit
        };
        this.state.movements.push(newMovement);

        // Update Product
        this.updateProduct(product.id, { quantity: newQty });

        this.save();
        return newMovement;
    }

    updateSettings(newSettings) {
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.save();
    }

    getDashboardStats() {
        const totalProducts = this.state.products.length;
        const totalStock = this.state.products.reduce((acc, p) => acc + (parseInt(p.quantity) || 0), 0);
        const totalValue = this.state.products.reduce((acc, p) => acc + ((parseInt(p.quantity) || 0) * (parseFloat(p.price) || 0)), 0);

        // Low stock based on individual reorder level (default 10)
        const lowStock = this.state.products.filter(p => {
            const qty = parseInt(p.quantity) || 0;
            const limit = parseInt(p.reorderLevel) || 10;
            return qty <= limit && p.status !== 'Inactive';
        }).length;

        return { totalProducts, totalStock, totalValue, lowStock };
    }
}

export const store = new Store();
