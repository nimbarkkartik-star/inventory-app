import { createElement } from '../utils.js';

export const Modal = {
    open: ({ title, content, onConfirm, confirmText = 'Confirm' }) => {
        const overlay = createElement('div', ['modal-overlay', 'open']);

        const modal = createElement('div', ['modal']);

        const header = createElement('div', ['modal-header']);
        header.innerHTML = `<h3 class="modal-title">${title}</h3>`;
        const closeBtn = createElement('button', ['text-secondary']);
        closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeBtn.onclick = close;
        header.appendChild(closeBtn);

        const body = createElement('div', ['modal-body']);
        if (typeof content === 'string') body.innerHTML = content;
        else body.appendChild(content);

        const footer = createElement('div', ['flex', 'justify-end', 'gap-4'], { style: 'margin-top: 1.5rem' });
        const cancelBtn = createElement('button', ['btn', 'btn-secondary'], {}, 'Cancel');
        cancelBtn.onclick = close;

        const confirmButton = createElement('button', ['btn', 'btn-primary'], {}, confirmText);
        confirmButton.onclick = async () => {
            confirmButton.innerHTML = '<div class="spinner"></div> Processing...';
            if (onConfirm) await onConfirm();
            close();
        };

        footer.appendChild(cancelBtn);
        footer.appendChild(confirmButton);

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);

        function close() {
            overlay.classList.remove('open');
            setTimeout(() => overlay.remove(), 200);
        }
    }
};
