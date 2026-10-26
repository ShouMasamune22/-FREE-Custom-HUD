(function (global) {
    'use strict';

    const NXUI = {};

    NXUI.el = function (tag, props, children) {
        const node = document.createElement(tag);
        if (props) {
            Object.keys(props).forEach(function (key) {
                const value = props[key];
                if (value === null || value === undefined || value === false) return;
                if (key === 'class') node.className = value;
                else if (key === 'text') node.textContent = value;
                else if (key === 'html') node.innerHTML = value;
                else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
                else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
                else if (key === 'dataset' && typeof value === 'object') Object.assign(node.dataset, value);
                else node.setAttribute(key, value === true ? '' : value);
            });
        }
        if (children) {
            (Array.isArray(children) ? children : [children]).forEach(function (child) {
                if (child === null || child === undefined || child === false) return;
                node.appendChild(typeof child === 'string' || typeof child === 'number'
                    ? document.createTextNode(String(child))
                    : child);
            });
        }
        return node;
    };

    NXUI.escape = function (value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    NXUI.qs = function (selector, root) { return (root || document).querySelector(selector); };
    NXUI.qsa = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

    NXUI.clear = function (node) { if (node) while (node.firstChild) node.removeChild(node.firstChild); return node; };

    NXUI.show = function (node) { if (node) node.classList.remove('nx-hidden'); return node; };
    NXUI.hide = function (node) { if (node) node.classList.add('nx-hidden'); return node; };

    NXUI.money = function (amount, symbol) {
        const n = Number(amount) || 0;
        const sign = n < 0 ? '-' : '';
        const whole = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return sign + (symbol || '$') + whole;
    };

    NXUI.number = function (value, decimals) {
        const n = Number(value) || 0;
        return n.toFixed(decimals === undefined ? 0 : decimals);
    };

    NXUI.timeAgo = function (unixSeconds) {
        const diff = Math.max(0, Math.floor(Date.now() / 1000) - Number(unixSeconds || 0));
        if (diff < 60) return 'baru saja';
        if (diff < 3600) return Math.floor(diff / 60) + ' menit lalu';
        if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
        return Math.floor(diff / 86400) + ' hari lalu';
    };

    const ICONS = {
        check: 'M20 6L9 17l-5-5',
        x: 'M18 6L6 18M6 6l12 12',
        alert: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
        info: 'M12 16v-4m0-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z',
        wallet: 'M3 7a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm13 5h3',
        bag: 'M6 8h12l-1 12H7L6 8zm3 0V6a3 3 0 016 0v2',
        briefcase: 'M3 8h18v11H3V8zm6 0V6a2 2 0 012-2h2a2 2 0 012 2v2',
        car: 'M5 16h14M7 16v2m10-2v2M4 16l1.5-5.5A2 2 0 017.4 9h9.2a2 2 0 011.9 1.5L20 16M6 13h12',
        shield: 'M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3z',
        heart: 'M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z',
        fuel: 'M4 21V5a2 2 0 012-2h5a2 2 0 012 2v16M3 21h11M13 8h3l3 3v7a2 2 0 11-4 0v-4h-2',
        gauge: 'M12 14l4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        bell: 'M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 01-3.4 0',
        settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H10a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V10a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
        user: 'M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z',
        search: 'M21 21l-4.3-4.3M17 11a6 6 0 11-12 0 6 6 0 0112 0z',
        chevronLeft: 'M15 18l-6-6 6-6',
        chevronRight: 'M9 18l6-6-6-6',
        trash: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
        plus: 'M12 5v14M5 12h14',
        globe: 'M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z',
        discord: 'M8 11a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2zM7 18s-2-4-1-9a12 12 0 014-2l.5 1a10 10 0 013 0L14 7a12 12 0 014 2c1 5-1 9-1 9a12 12 0 01-4 1l-.6-1.2M11 17l-.6 1.2a12 12 0 01-4-1',
        lifebuoy: 'M12 22a10 10 0 100-20 10 10 0 000 20zm0-6a4 4 0 100-8 4 4 0 000 8zM4.9 4.9l4.2 4.2m5.8 5.8l4.2 4.2m0-14.2l-4.2 4.2m-5.8 5.8l-4.2 4.2',
        clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zm0-14v4l3 2',
        map: 'M9 4l6 2 6-2v14l-6 2-6-2-6 2V6l6-2zm0 0v14m6-12v14',
        door: 'M4 21V4a1 1 0 011-1h9a1 1 0 011 1v17M4 21h16M12 12h.01',
        power: 'M12 3v9M6.6 6.6a8 8 0 1010.8 0',
        mic: 'M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3zM5.5 11.5a6.5 6.5 0 0013 0M12 18v3',
        food: 'M4 10a8 8 0 0116 0H4zM4 13h16M5 17h14',
        drink: 'M6 8h12l-1.5 12h-9L6 8zM9 8V4h3',
        brain: 'M10 4a3 3 0 00-3 3 3 3 0 000 6 3 3 0 003 3 3 3 0 003-3V7a3 3 0 00-3-3zM14 4a3 3 0 013 3 3 3 0 010 6 3 3 0 01-3 3 3 3 0 01-3-3V7a3 3 0 013-3z',
        run: 'M14 4.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8 21l3-6-2-2 3-4 3 3h3M9 13l-2 1',
    };

    NXUI.icon = function (name, size, extraClass) {
        const path = ICONS[name] || ICONS.info;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size || 16);
        svg.setAttribute('height', size || 16);
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.7');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        if (extraClass) svg.setAttribute('class', extraClass);
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', path);
        svg.appendChild(p);
        return svg;
    };

    NXUI.hasIcon = function (name) { return Object.prototype.hasOwnProperty.call(ICONS, name); };

    NXUI.nui = function (endpoint, data) {
        return fetch('https://' + (global.GetParentResourceName ? global.GetParentResourceName() : 'nx_ui') + '/' + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data || {}),
        }).then(function (res) { return res.json().catch(function () { return {}; }); });
    };

    NXUI.on = function (name, handler) {
        global.addEventListener('message', function (event) {
            const payload = event.data || {};
            if (payload.action === name || payload.type === name) handler(payload.data, payload);
        });
    };

    const ICON_FOR_TYPE = {
        success: 'check', error: 'x', warning: 'alert', info: 'info',
        money_received: 'wallet', money_spent: 'wallet',
        item_received: 'bag', item_removed: 'bag',
        job: 'briefcase', vehicle: 'car', police: 'shield', ems: 'heart',
        business: 'briefcase', system: 'bell',
    };

    NXUI.toasts = (function () {
        let container = null;
        const queue = [];
        let visible = 0;
        let maxVisible = 5;
        let position = 'top-right';

        function ensureContainer() {
            if (container && document.body.contains(container)) return container;
            container = NXUI.el('div', { class: 'nx-toasts', dataset: { position: position } });
            document.body.appendChild(container);
            return container;
        }

        function drain() {
            while (visible < maxVisible && queue.length > 0) {
                render(queue.shift());
            }
        }

        function render(toast) {
            const kind = toast.kind || 'info';
            const node = NXUI.el('div', { class: 'nx-toast nx-toast--' + kind });
            node.appendChild(NXUI.el('div', { class: 'nx-toast__icon' }, [NXUI.icon(ICON_FOR_TYPE[kind] || 'info', 17)]));

            const body = NXUI.el('div', {});
            if (toast.title) body.appendChild(NXUI.el('div', { class: 'nx-toast__title', text: toast.title }));
            body.appendChild(NXUI.el('div', { class: 'nx-toast__message', text: toast.message || '' }));
            node.appendChild(body);

            const duration = Math.max(1200, toast.duration || 5000);
            const bar = NXUI.el('div', { class: 'nx-toast__timer' });
            bar.style.animation = 'nx-toast-timer ' + duration + 'ms linear forwards';
            node.appendChild(bar);

            ensureContainer().appendChild(node);
            visible += 1;

            let closed = false;
            function close() {
                if (closed) return;
                closed = true;
                node.classList.add('is-leaving');
                setTimeout(function () {
                    if (node.parentNode) node.parentNode.removeChild(node);
                    visible = Math.max(0, visible - 1);
                    drain();
                }, 200);
            }

            node.addEventListener('click', close);
            const timer = setTimeout(close, duration);
            node.addEventListener('mouseenter', function () { clearTimeout(timer); bar.style.animationPlayState = 'paused'; });
            node.addEventListener('mouseleave', function () { setTimeout(close, 1200); });
        }

        return {
            configure: function (options) {
                if (!options) return;
                if (options.maxVisible) maxVisible = options.maxVisible;
                if (options.position) {
                    position = options.position;
                    if (container) container.dataset.position = position;
                }
            },
            push: function (toast) {
                queue.push(toast);
                if (queue.length > 40) queue.shift();
                drain();
            },
            clear: function () {
                queue.length = 0;
                if (container) NXUI.clear(container);
                visible = 0;
            },
        };
    })();

    NXUI.store = {
        get: function (key, fallback) {
            try {
                const raw = global.localStorage.getItem('nx:' + key);
                return raw === null ? fallback : JSON.parse(raw);
            } catch (err) { return fallback; }
        },
        set: function (key, value) {
            try { global.localStorage.setItem('nx:' + key, JSON.stringify(value)); } catch (err) { /* quota */ }
        },
    };

    NXUI.prefersReducedMotion = function () {
        return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    global.NXUI = NXUI;
})(window);
