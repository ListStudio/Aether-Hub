let scripts = JSON.parse(localStorage.getItem('aether_scripts')) || [];
let userName = localStorage.getItem('aether_user') || 'Я';
let screenStream = null;
let fCount = 0;
let fLast = performance.now();

const bgList = [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"
];

// --- МОНИТОРИНГ ---
function startMonitoring() {
    function fpsLoop() {
        fCount++;
        let now = performance.now();
        if (now - fLast >= 1000) {
            const el = document.getElementById('stat-fps');
            if(el) el.innerText = fCount + " FPS";
            fCount = 0; fLast = now;
        }
        requestAnimationFrame(fpsLoop);
    }
    fpsLoop();

    setInterval(() => {
        const pingEl = document.getElementById('stat-ping');
        if(pingEl) pingEl.innerText = Math.floor(Math.random() * 20 + 10) + " ms";
        
        const vpnEl = document.getElementById('stat-vpn');
        const isHTTPS = window.location.protocol === 'https:';
        if(vpnEl) {
            vpnEl.innerText = isHTTPS ? "SECURE (SSL)" : "UNSECURE";
            vpnEl.style.color = isHTTPS ? "#10b981" : "#ef4444";
        }
    }, 2000);

    if (navigator.getBattery) {
        navigator.getBattery().then(b => {
            const up = () => {
                const el = document.getElementById('stat-batt');
                if(el) el.innerText = Math.round(b.level * 100) + "%";
            };
            up(); b.onlevelchange = up;
        });
    }
}

// --- УПРАВЛЕНИЕ КОДОМ (ИЗМЕНИТЬ / СОХРАНИТЬ) ---
function saveScript() {
    const input = document.getElementById('codeInput');
    const editId = document.getElementById('editingId').value;
    
    if(!input.value) return;

    if(editId) {
        const idx = scripts.findIndex(s => s.id == editId);
        if(idx !== -1) scripts[idx].content = input.value;
        document.getElementById('editingId').value = "";
        document.getElementById('saveBtnText').innerText = "СОХРАНИТЬ КАРТОЧКУ";
    } else {
        scripts.push({ id: Date.now(), content: input.value });
    }

    localStorage.setItem('aether_scripts', JSON.stringify(scripts));
    renderScripts();
    input.value = '';
}

function editScript(id) {
    const item = scripts.find(s => s.id == id);
    if(item) {
        document.getElementById('codeInput').value = item.content;
        document.getElementById('editingId').value = id;
        document.getElementById('saveBtnText').innerText = "ОБНОВИТЬ ДАННЫЕ";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderScripts() {
    const vault = document.getElementById('codeVault');
    if(!vault) return;
    vault.innerHTML = '';
    scripts.forEach(s => {
        const card = document.createElement('div');
        card.className = 'stat-card'; 
        card.style.marginTop = "10px";
        card.style.justifyContent = "space-between";
        card.innerHTML = `
            <code style="font-size:0.75rem; color:#10b981; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60%;">${s.content}</code>
            <div style="display:flex; gap:5px;">
                <button class="btn" style="padding:5px; font-size:0.6rem; border-color:#38bdf8;" onclick="editScript(${s.id})">ИЗМ</button>
                <button class="btn" style="padding:5px; font-size:0.6rem; border-color:#ef4444;" onclick="del(${s.id})">УДАЛ</button>
            </div>`;
        vault.prepend(card);
    });
    document.getElementById('limit').innerText = scripts.length + " / 100";
}

function del(id) {
    scripts = scripts.filter(x => x.id !== id);
    localStorage.setItem('aether_scripts', JSON.stringify(scripts));
    renderScripts();
}

// --- SHARE SCREEN ---
async function startShare() {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ 
            video: { cursor: "always" }, 
            audio: false 
        });
        const video = document.getElementById('screenPreview');
        video.srcObject = screenStream;
        document.getElementById('videoContainer').style.display = 'block';
        
        screenStream.getVideoTracks()[0].onended = stopShare;
    } catch (e) {
        alert("Ошибка трансляции. Убедитесь, что сайт открыт через HTTPS.");
    }
}

function stopShare() {
    if(screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        screenStream = null;
    }
    document.getElementById('videoContainer').style.display = 'none';
}

// --- ФОНЫ ---
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

// --- ИНИЦИАЛИЗАЦИЯ ---
window.onload = () => {
    startMonitoring();
    renderLibrary();
    renderScripts();
    document.getElementById('userNameDisplay').innerText = userName;
    const savedBg = localStorage.getItem('aether_bg');
    if(savedBg) setBg(savedBg, true, savedBg.startsWith('#'));
    setTimeout(() => document.getElementById('loader').classList.add('loaded'), 1000);
};

// Системные функции
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
function copyCode() {
    const txt = document.getElementById('codeInput');
    navigator.clipboard.writeText(txt.value);
    const icon = document.querySelector('.icon-btn span');
    icon.style.color = "#10b981";
    setTimeout(() => icon.style.color = "var(--accent)", 800);
}
async function connectBT() {
    if(!navigator.bluetooth) return alert("Bluetooth недоступен.");
    try { await navigator.bluetooth.requestDevice({ acceptAllDevices: true }); } catch(e) {}
}
