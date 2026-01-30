export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const createElement = (tag, classes = [], attributes = {}, innerHTML = '') => {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
};
