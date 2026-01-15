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
    // 实际项目中这里通过 window.go.network.Scanner.GetConnections() 调用
    console.log("Refreshing connections...");
    // 动态更新表格内容的逻辑...
}

window.addEventListener('DOMContentLoaded', () => {
    updateTexts();
    setInterval(refreshConnections, 3000); // 3秒刷新一次
});
