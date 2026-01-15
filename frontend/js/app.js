const i18n = {
    zh: {
        title: "网络连接",
        nav_overview: "连接概览",
        nav_all_conns: "全部连接",
        nav_est: "正在通信",
        nav_listen: "正在监听",
        nav_other: "其他状态",
        nav_about: "关于软件",
        local_addr: "本地地址",
        remote_addr: "远程地址",
        status: "状态",
        process: "所属进程",
        refresh: "立即刷新",
        refresh_rate: "刷新频率:",
        rate_manual: "手动",
        refreshing: "正在获取数据...",
        btn_lang: "EN",
        empty: "暂无相关连接",
        about_title: "关于 Ncm",
        about_content: "Ncm (Network Connection Monitor)\n一个基于 Wails 开发的跨平台网络连接监控工具。\n\n版本: v1.0.0"
    },
    en: {
        title: "Network Connections",
        nav_overview: "Overview",
        nav_all_conns: "All Connections",
        nav_est: "Established",
        nav_listen: "Listening",
        nav_other: "Others",
        nav_about: "About App",
        local_addr: "Local Address",
        remote_addr: "Remote Address",
        status: "Status",
        process: "Process",
        refresh: "Refresh Now",
        refresh_rate: "Interval:",
        rate_manual: "Manual",
        refreshing: "Fetching data...",
        btn_lang: "中",
        empty: "No connections found",
        about_title: "About Ncm",
        about_content: "Ncm (Network Connection Monitor)\nA cross-platform network monitor tool built with Wails.\n\nVersion: v1.0.0"
    }
};

let currentLang = 'zh';
let currentFilter = 'ALL';
let allConnections = []; // Store data for local filtering
let refreshIntervalId = null;

function toggleLang() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updateTexts();
}

function updateTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.innerText = i18n[currentLang][key];
        }
    });

    // Also update elements with data-current-key (for dynamic titles)
    document.querySelectorAll('[data-current-key]').forEach(el => {
        const key = el.getAttribute('data-current-key');
        if (i18n[currentLang][key]) {
            el.innerText = i18n[currentLang][key];
        }
    });
}

function setFilter(filter) {
    currentFilter = filter;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    let activeId = 'nav-overview'; // Default
    if (filter === 'ALL_LIST') {
        currentFilter = 'ALL'; // Logic uses 'ALL'
        activeId = 'nav-all';
    }
    else if (filter === 'ALL') activeId = 'nav-overview';
    else if (filter === 'ESTABLISHED') activeId = 'nav-est';
    else if (filter === 'LISTEN') activeId = 'nav-listen';
    else if (filter === 'OTHER') activeId = 'nav-other';

    const activeEl = document.getElementById(activeId);
    if (activeEl) activeEl.classList.add('active');

    // View switching
    document.getElementById('connections-view').style.display = 'block';

    const aboutView = document.getElementById('about-view');
    if (aboutView) aboutView.style.display = 'none';

    // Update title
    let titleKey = 'nav_overview';
    if (filter === 'ALL_LIST') titleKey = 'nav_all_conns';
    else if (filter === 'ALL') titleKey = 'nav_overview';
    else if (filter === 'ESTABLISHED') titleKey = 'nav_est';
    else if (filter === 'LISTEN') titleKey = 'nav_listen';
    else if (filter === 'OTHER') titleKey = 'nav_other';

    const titleEl = document.querySelector('.page-title');
    if (titleEl && i18n[currentLang][titleKey]) {
        titleEl.innerText = i18n[currentLang][titleKey];
        // Remove data-i18n to prevent auto-translation back to default on language trigger
        // We handle language toggle by recalling this logic or updating text manually
        titleEl.setAttribute('data-current-key', titleKey);
        titleEl.removeAttribute('data-i18n');
    }

    // Re-render table with current filter
    applyFilterAndRender();
}

function showAbout() {
    currentFilter = 'ABOUT';

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-about').classList.add('active');

    // View switching
    const connView = document.getElementById('connections-view');
    if (connView) connView.style.display = 'none';

    const aboutView = document.getElementById('about-view');
    if (aboutView) aboutView.style.display = 'block';

    // Update title
    const titleEl = document.querySelector('.page-title');
    if (titleEl) {
        titleEl.innerText = i18n[currentLang].about_title;
        titleEl.removeAttribute('data-i18n');
    }
}

// 刷新频率控制
function changeRefreshRate() {
    const rate = parseInt(document.getElementById('refresh-rate').value);

    // 清除旧的定时器
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }

    if (rate > 0) {
        // 立即刷新一次
        refreshConnections();
        // 设置新的定时器
        refreshIntervalId = setInterval(refreshConnections, rate);
    }
}

async function refreshConnections() {
    try {
        if (!window['go'] || !window['go']['main'] || !window['go']['main']['App']) {
            console.warn("Wails runtime not ready. Rendering mock data for debugging.");
            renderMockData();
            return;
        }

        const conns = await window.go.main.App.GetConnections();
        allConnections = conns || [];
        applyFilterAndRender();

    } catch (err) {
        console.error("Failed to get connections:", err);
    }
}

function renderMockData() {
    const mockConns = [
        { local_addr: "127.0.0.1:38629", remote_addr: "*", status: "LISTEN", pid: 162517, process: "antigravity" },
        { local_addr: "192.168.1.5:54321", remote_addr: "142.250.77.1:443", status: "ESTABLISHED", pid: 1234, process: "chrome" },
        { local_addr: "::1:8080", remote_addr: "*", status: "LISTEN", pid: 5678, process: "docker-proxy" },
        { local_addr: "127.0.0.1:45566", remote_addr: "127.0.0.1:6379", status: "TIME_WAIT", pid: 0, process: "System/Unknown" },
        { local_addr: "10.0.0.2:22", remote_addr: "192.168.1.100:55667", status: "ESTABLISHED", pid: 998, process: "sshd" }
    ];
    allConnections = mockConns;
    applyFilterAndRender();
}

function applyFilterAndRender() {
    let filtered = allConnections;
    if (currentFilter !== 'ALL') {
        if (currentFilter === 'OTHER') {
            filtered = allConnections.filter(c => c.status !== 'ESTABLISHED' && c.status !== 'LISTEN');
        } else {
            filtered = allConnections.filter(c => c.status === currentFilter);
        }
    }
    renderTable(filtered);
}

function renderTable(conns) {
    const tbody = document.getElementById('conn-body');
    tbody.innerHTML = '';

    if (!conns || conns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-muted)">${i18n[currentLang].empty}</td></tr>`;
        return;
    }

    conns.forEach(c => {
        const tr = document.createElement('tr');

        // 样式计算
        let statusClass = 'status-other';
        if (c.status === 'ESTABLISHED') statusClass = 'status-established';
        else if (c.status === 'LISTEN') statusClass = 'status-listen';

        tr.innerHTML = `
            <td style="font-family:monospace; color:#e2e8f0; font-size:13px;">${c.local_addr}</td>
            <td style="font-family:monospace; color:#94a3b8; font-size:13px;">${c.remote_addr}</td>
            <td>
                <span class="status-tag ${statusClass}">
                    <span class="status-dot"></span>
                    ${c.status}
                </span>
            </td>
            <td>
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:500; color:#f8fafc;">${c.process}</span>
                    <span style="font-size:11px; color:#64748b;">PID: ${c.pid}</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    updateTexts();
    // 初始化默认刷新频率 (5s)
    changeRefreshRate();
    // 初始化视图和标题状态
    setFilter(currentFilter);
});
