/**
 * <toast-notification> web component
 * Displays non-blocking notification messages that auto-dismiss.
 * 
 * Usage:
 *   import { showToast } from './components/toastNotification.js';
 *   showToast('Something went wrong', 'error');
 *   showToast('Item saved', 'success');
 */

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        }

        .toast {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            min-width: 280px;
            max-width: 420px;
            padding: 12px 16px;
            border-radius: 6px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            color: #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            pointer-events: auto;
            animation: toast-in 0.3s ease-out;
            word-break: break-word;
        }

        .toast.removing {
            animation: toast-out 0.3s ease-in forwards;
        }

        .toast-error   { background: #d32f2f; }
        .toast-warning { background: #ed6c02; }
        .toast-info    { background: #0288d1; }
        .toast-success { background: #2e7d32; }

        .toast-message { flex: 1; }

        .toast-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            opacity: 0.8;
        }
        .toast-close:hover { opacity: 1; }

        @keyframes toast-in {
            from { opacity: 0; transform: translateX(100%); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toast-out {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(100%); }
        }
    </style>
`;

class ToastNotification extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }

    /**
     * Show a toast message.
     * @param {string} message - Text to display
     * @param {'error'|'warning'|'info'|'success'} severity
     * @param {number} durationMs - Auto-dismiss duration (0 = manual close only)
     */
    show(message, severity = 'info', durationMs = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${severity}`;

        const msgSpan = document.createElement('span');
        msgSpan.className = 'toast-message';
        msgSpan.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.#dismiss(toast));

        toast.appendChild(msgSpan);
        toast.appendChild(closeBtn);
        this.shadowRoot.appendChild(toast);

        if (durationMs > 0) {
            setTimeout(() => this.#dismiss(toast), durationMs);
        }
    }

    #dismiss(toast) {
        if (!toast.parentNode) return;
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    }
}

customElements.define('toast-notification', ToastNotification);

// --- Singleton helper ---

let _toastInstance = null;

const getToastInstance = () => {
    if (!_toastInstance) {
        _toastInstance = document.querySelector('toast-notification');
    }
    if (!_toastInstance) {
        _toastInstance = document.createElement('toast-notification');
        document.body.appendChild(_toastInstance);
    }
    return _toastInstance;
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'error'|'warning'|'info'|'success'} severity
 * @param {number} durationMs
 */
export const showToast = (message, severity = 'info', durationMs = 5000) => {
    getToastInstance().show(message, severity, durationMs);
};
