const i18n = {
    zh: {
        title: "电脑连接监控",
        local_addr: "本地地址",
        remote_addr: "远程地址",
        status: "状态",
        process: "进程",
        refresh: "刷新",
        last_update: "最后更新",
        refreshing: "同步中...",
        lang: "English"
    },
    en: {
        title: "Ncm - Connection Monitor",
        local_addr: "Local Address",
        remote_addr: "Remote Address",
        status: "Status",
        process: "Process",
        refresh: "Refresh",
        last_update: "Last Updated",
        refreshing: "Updating...",
        lang: "中文"
    }
};

let currentLang = 'zh';

function toggleLang() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updateTexts();
}

function updateTexts() {
    document.title = i18n[currentLang].title;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = i18n[currentLang][key];
    });
}

// 模拟从 Wails 后端获取数据
async function refreshConnections() {
    try {
        if (!window['go'] || !window['go']['main'] || !window['go']['main']['App']) {
            console.warn("Wails runtime not ready, skipping update.");
            return;
        }

        document.getElementById('conn-body').innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);">${i18n[currentLang].refreshing}</td></tr>`;

        const conns = await window.go.main.App.GetConnections();

        const tbody = document.getElementById('conn-body');
        tbody.innerHTML = '';

        if (!conns || conns.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No connections found</td></tr>`;
            return;
        }

        conns.forEach(c => {
            const tr = document.createElement('tr');

            // 状态样式
            let statusClass = 'status-other';
            if (c.status === 'ESTABLISHED') statusClass = 'status-established';
            else if (c.status === 'LISTEN') statusClass = 'status-listen';

            tr.innerHTML = `
                <td>${c.local_addr}</td>
                <td>${c.remote_addr}</td>
                <td><span class="status-tag ${statusClass}">${c.status}</span></td>
                <td>${c.process} <span style="font-size:10px;color:#666">(${c.pid})</span></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Failed to get connections:", err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updateTexts();
    setInterval(refreshConnections, 3000); // 3秒刷新一次
});
