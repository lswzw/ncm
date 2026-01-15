const i18n = {
    zh: {
        title: "网络连接",
        nav_overview: "连接概览",
        nav_all_conns: "全部连接",
        nav_est: "正在通信",
        nav_listen: "正在监听",
        nav_wait: "等待关闭",
        nav_other: "其他状态",
        nav_about: "关于软件",
        stat_total: "全部连接",
        stat_est: "正在通信",
        stat_listen: "正在监听",
        stat_process: "最活跃进程",
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
        nav_wait: "Waiting Close",
        nav_other: "Others",
        nav_about: "About App",
        stat_total: "Total",
        stat_est: "Established",
        stat_listen: "Listening",
        stat_wait: "Waiting Close",
        stat_process: "Top Process",
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
        // currentFilter = 'ALL_LIST'; // Keep as is
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

    // Explicitly hide stats panel
    const statsPanel = document.getElementById('overview-stats');
    if (statsPanel) statsPanel.style.display = 'none';

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


// Helper to check if connection is external (excludes 127.0.0.1, localhost, ::1, [::1])
function isExternal(conn) {
    if (!conn || !conn.remote_addr) return false;
    const r = conn.remote_addr;
    return !r.startsWith('127.0.0.1') &&
        !r.startsWith('localhost') &&
        !r.startsWith('::1') &&
        !r.startsWith('[::1]');
}

function applyFilterAndRender() {
    const statsPanel = document.getElementById('overview-stats');
    let filtered = [];

    if (currentFilter === 'ALL') {
        // --- 概览模式 (Overview) ---

        // 1. 显示统计面板
        if (statsPanel) {
            statsPanel.style.display = 'grid';
            updateStatsPanel(allConnections);
        }

        // 2. 概览模式只展示"正在通信"且"非本地"的连接
        // 过滤掉 127.0.0.1 等本地回环
        const meaningful = allConnections.filter(c => c.status === 'ESTABLISHED' && isExternal(c));
        const source = meaningful.length > 0 ? meaningful : allConnections.filter(c => c.status === 'ESTABLISHED');

        const shuffled = [...source].sort(() => 0.5 - Math.random());
        filtered = shuffled.slice(0, 6);

    } else {
        // --- 其他列表模式 ---

        // 1. 隐藏统计面板
        if (statsPanel) {
            statsPanel.style.display = 'none';
        }

        // 2. 正常筛选
        if (currentFilter === 'ALL_LIST') {
            filtered = allConnections;
        } else if (currentFilter === 'WAIT') {
            filtered = allConnections.filter(c => c.status === 'TIME_WAIT' || c.status === 'CLOSE_WAIT');
        } else if (currentFilter === 'OTHER') {
            filtered = allConnections.filter(c =>
                c.status !== 'ESTABLISHED' &&
                c.status !== 'LISTEN' &&
                c.status !== 'TIME_WAIT' &&
                c.status !== 'CLOSE_WAIT'
            );
        } else {
            filtered = allConnections.filter(c => c.status === currentFilter);
        }
    }

    renderTable(filtered);
}

function updateStatsPanel(conns) {
    // 统计面板：显示所有连接的真实数据（不过滤本地连接）
    const total = conns.length;
    const est = conns.filter(c => c.status === 'ESTABLISHED').length;
    const listen = conns.filter(c => c.status === 'LISTEN').length;
    const wait = conns.filter(c => c.status === 'TIME_WAIT' || c.status === 'CLOSE_WAIT').length;

    const activeConns = conns.filter(c => c.status === 'ESTABLISHED');

    // Calculate Top Process
    const processCounts = {};
    activeConns.forEach(c => {
        const name = c.process || 'Unknown';
        processCounts[name] = (processCounts[name] || 0) + 1;
    });

    let topName = '-';
    let topCount = 0;
    for (const [name, count] of Object.entries(processCounts)) {
        if (count > topCount) {
            topName = name;
            topCount = count;
        }
    }

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-est').innerText = est;
    document.getElementById('stat-listen').innerText = listen;
    const waitEl = document.getElementById('stat-wait');
    if (waitEl) waitEl.innerText = wait;

    // Update Top Process Card
    const nameEl = document.getElementById('stat-process-name');
    const countEl = document.getElementById('stat-process-count');
    if (nameEl && countEl) {
        nameEl.innerText = topName.length > 24 ? topName.substring(0, 24) + '...' : topName;
        nameEl.title = topName; // Tooltip for full name
        const suffix = currentLang === 'zh' ? ' 个连接' : ' conns';
        countEl.innerText = topCount + suffix;
    }
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
            <td style="font-family:monospace; color:#e2e8f0; font-size:12px;">${c.local_addr}</td>
            <td style="font-family:monospace; color:#94a3b8; font-size:12px;">${c.remote_addr}</td>
            <td>
                <span class="status-tag ${statusClass}">
                    <span class="status-dot"></span>
                    ${c.status}
                </span>
            </td>
            <td>
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:500; color:#f8fafc; font-size:12px;">${c.process}</span>
                    <span style="font-size:10px; color:#64748b;">PID: ${c.pid}</span>
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
