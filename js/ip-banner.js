// source/js/ip-banner.js
(function () {
    const MIRROR_HOST = 'www.msqy.cc.cd';
    const API_URL = 'https://www.loliapi.com/getip/';

    // 如果已经在镜像站，不再检测
    if (window.location.hostname === MIRROR_HOST) return;

    let isChina = false;
    let requestFinished = false;

    function handleResponse(data) {
        const country = data.country || data.country_code || data.region || '';
        isChina = /中国|CN|China/i.test(country);
        requestFinished = true;
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            tryCreateBanner();
        }
    }

    // 立即发起 IP 请求
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_URL, true);
    xhr.timeout = 5000;
    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                handleResponse(data);
            } catch (_) { /* 忽略 */ }
        }
    };
    xhr.onerror = xhr.ontimeout = function () { /* 静默失败 */ };
    xhr.send();

    function tryCreateBanner() {
        if (!isChina || !requestFinished) return;
        if (document.getElementById('msqy-banner')) return;
        createBanner();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryCreateBanner);
    } else {
        setTimeout(tryCreateBanner, 100);
    }

    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'msqy-banner';
        // 与屏幕左右边距 1rem，宽度自适应，居中显示
        banner.style.cssText = `
            position: fixed;
            top: .4rem;
            left: .9rem;
            right: .9rem;
            z-index: 99999;
            max-width: 600px;
            margin: 0 auto;
            background: var(--efu-card-bg, #fff);
            color: var(--efu-fontcolor, #363636);
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            font-size: 14px;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            border: var(--style-border, 1px solid var(--efu-card-border, #e3e8f7));
            box-sizing: border-box;
            transition: opacity 0.3s ease, transform 0.3s ease;
            opacity: 0;
            transform: translateY(-10px);
        `;

        const textWrapper = document.createElement('span');
        textWrapper.style.cssText = `
            flex: 1;
            line-height: 1.5;
            color: var(--efu-fontcolor, #363636);
        `;
        textWrapper.innerHTML = `
            🌏 检测到您在中国大陆，建议访问国内镜像站
            <a href="https://${MIRROR_HOST}${window.location.pathname}${window.location.search}"
               style="color: var(--efu-blue, #425aef); font-weight: 600; text-decoration: none;">
                ${MIRROR_HOST}
            </a>
            ，速度更快。
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: var(--efu-secondtext, #a1a2b8);
            padding: 4px 6px;
            line-height: 1;
            transition: color 0.2s;
            flex-shrink: 0;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = 'var(--efu-fontcolor, #363636)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = 'var(--efu-secondtext, #a1a2b8)';
        });
        closeBtn.addEventListener('click', () => {
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(-20px)';
            setTimeout(() => banner.remove(), 300);
            // 不保存任何状态，刷新页面后横幅会重新出现
        });

        banner.appendChild(textWrapper);
        banner.appendChild(closeBtn);

        // 点击跳转链接时不保存状态，下次进入仍然检测
        document.body.appendChild(banner);

        requestAnimationFrame(() => {
            banner.style.opacity = '1';
            banner.style.transform = 'translateY(0)';
        });
    }
})();