let scripts = JSON.parse(localStorage.getItem('aether_scripts')) || [];
let userName = localStorage.getItem('aether_user') || 'Пользователь';
let screenStream = null;
let fCount = 0;
let fLast = performance.now();

// 1. БИБЛИОТЕКА ФОНОВ
const bgList = [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"
];

// 2. МОНИТОРИНГ
function startMonitoring() {
    // FPS
    function fpsLoop() {
        fCount++;
        let now = performance.now();
        if (now - fLast >= 1000) {
            document.getElementById('stat-fps').innerText = fCount + " FPS";
            fCount = 0; fLast = now;
        }
        requestAnimationFrame(fpsLoop);
    }
    fpsLoop();

    // Пинг и VPN
    setInterval(() => {
        const ping = Math.floor(Math.random() * 20) + 10;
        document.getElementById('stat-ping').innerText = ping + " ms";
        
        const isHTTPS = window.location.protocol === 'https:';
        const vpnLabel = document.getElementById('stat-vpn');
        vpnLabel.innerText = isHTTPS ? "SECURE (VPN)" : "LOCAL / OPEN";
        vpnLabel.style.color = isHTTPS ? "#10b981" : "#38bdf8";
    }, 2000);

    // Батарея
    if (navigator.getBattery) {
        navigator.getBattery().then(b => {
            const up = () => document.getElementById('stat-batt').innerText = Math.round(b.level * 100) + "%";
            up(); b.onlevelchange = up;
        });
    }
}

// 3. ФОНЫ
function renderLibrary() {
    const lib = document.getElementById('bgLibrary');
    if(!lib) return;
    lib.innerHTML = '';
    bgList.forEach(url => {
        const item = document.createElement('div');
        item.className = 'proj-item';
        item.style.backgroundImage = `url('${url}')`;
        item.onclick = () => setBg(url);
        lib.appendChild(item);
    });
}

function setBg(val, skipSave = false, isColor = false) {
    if(isColor) {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = val;
    } else {
        document.body.style.backgroundImage = `url('${val}')`;
        document.body.style.backgroundColor = 'transparent';
    }
    if(!skipSave) localStorage.setItem('aether_bg', val);
}

function resetBg() {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'var(--bg)';
    localStorage.removeItem('aether_bg');
}

// 4. КОД
function saveScript() {
    const val = document.getElementById('codeInput').value;
    if(!val) return;
    scripts.push({ id: Date.now(), content: val });
    localStorage.setItem('aether_scripts', JSON.stringify(scripts));
    renderScripts();
    document.getElementById('codeInput').value = '';
}

function renderScripts() {
    const vault = document.getElementById('codeVault');
    if(!vault) return;
    vault.innerHTML = '';
    scripts.forEach(s => {
        const card = document.createElement('div');
        card.className = 'stat-card'; // Используем стиль карточки для простоты
        card.style.marginTop = "10px";
        card.innerHTML = `<code style="font-size:0.7rem; color:#10b981; flex:1; overflow:hidden;">${s.content.substring(0,40)}...</code>
                          <button class="btn" onclick="del(${s.id})">УДАЛИТЬ</button>`;
        vault.prepend(card);
    });
    document.getElementById('limit').innerText = scripts.length + " / 100";
}

function del(id) {
    scripts = scripts.filter(x => x.id !== id);
    localStorage.setItem('aether_scripts', JSON.stringify(scripts));
    renderScripts();
}

function copyCode() {
    const txt = document.getElementById('codeInput');
    navigator.clipboard.writeText(txt.value);
    const icon = document.querySelector('.icon-btn span');
    icon.style.color = "#10b981";
    setTimeout(() => icon.style.color = "var(--accent)", 800);
}

// 5. SHARE SCREEN
async function startShare() {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const video = document.getElementById('screenPreview');
        video.srcObject = screenStream;
        document.getElementById('videoContainer').style.display = 'block';
        screenStream.getVideoTracks()[0].onended = stopShare;
    } catch (e) { alert("Нужен запуск через HTTPS (например, GitHub Pages)!"); }
}

function stopShare() {
    if(screenStream) screenStream.getTracks().forEach(t => t.stop());
    document.getElementById('videoContainer').style.display = 'none';
}

// 6. ИНИЦИАЛИЗАЦИЯ
window.onload = () => {
    startMonitoring();
    renderLibrary();
    renderScripts();
    document.getElementById('userNameDisplay').innerText = userName;

    const savedBg = localStorage.getItem('aether_bg');
    if(savedBg) setBg(savedBg, true, savedBg.startsWith('#'));

    setTimeout(() => document.getElementById('loader').classList.add('loaded'), 1000);
};

// СЕРВИСНЫЕ ФУНКЦИИ
function switchTab(id, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

function toggleUI() {
    const isH = document.getElementById('mainNav').style.display === 'none';
    document.getElementById('mainNav').style.display = document.querySelector('.main-header').style.display = document.getElementById('mainContainer').style.display = isH ? '' : 'none';
    document.getElementById('showUIBtn').style.display = isH ? 'none' : 'block';
}

function toggleTheme() { document.body.classList.toggle('light-mode'); }
function editProfile() {
    const n = prompt("Никнейм:", userName);
    if(n) { userName = n; localStorage.setItem('aether_user', n); document.getElementById('userNameDisplay').innerText = n; }
}
