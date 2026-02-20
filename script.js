let currentCategory = 'صدر';
let myChart = null;

// تهيئة الأيقونات
lucide.createIcons();

// 1. نظام إدارة البيانات
function getLogs() { return JSON.parse(localStorage.getItem('neoBeastV4')) || []; }
function saveLogs(logs) { localStorage.setItem('neoBeastV4', JSON.stringify(logs)); }

// 2. تغيير القسم العضلي
function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.innerText === cat));
    document.getElementById('currentCatDisplay').innerText = cat;
    refreshUI();
}

// 3. محرك التنبؤ والتحليل اللحظي
document.getElementById('weight').addEventListener('input', () => {
    const w = parseFloat(document.getElementById('weight').value);
    const n = document.getElementById('exerciseName').value;
    const pred = document.getElementById('predictionText');
    
    const logs = getLogs();
    const last = logs.find(l => l.name === n);
    
    if (last && w > 0) {
        const prob = Math.min(100, (last.max / (w * 1.2)) * 100).toFixed(0);
        pred.innerText = `احتمالية النجاح: ${prob}% | الهدف المقترح: ${last.reps + 1} عدات`;
        pred.className = prob > 70 ? "text-green-400 text-xs" : "text-orange-400 text-xs";
    }
});

// 4. إضافة تمرين جديد
function addEntry() {
    const name = document.getElementById('exerciseName').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const reps = parseInt(document.getElementById('reps').value);
    const rpe = document.getElementById('rpeRange').value;

    if (!name || isNaN(weight)) return;

    const logs = getLogs();
    const entry = {
        id: Date.now(),
        name, weight, reps, rpe,
        category: currentCategory,
        max: (weight * (1 + reps/30)).toFixed(1),
        date: new Date().toLocaleDateString('en-GB'),
        timestamp: Date.now()
    };

    logs.unshift(entry);
    saveLogs(logs);
    startRestTimer();
    refreshUI();
    
    // Clear inputs
    document.getElementById('weight').value = '';
    document.getElementById('reps').value = '';
}

// 5. تحديث الواجهة الكامل (The Core)
function refreshUI() {
    const allLogs = getLogs();
    const filteredLogs = allLogs.filter(l => l.category === currentCategory);
    
    updateHologram(allLogs);
    updatePRRoom(allLogs);
    updateStats(allLogs);
    renderLogs(filteredLogs);
    renderChart(filteredLogs);
    lucide.createIcons();
}

// 6. تحديث المجسم الهولوغرامي (واقعي)
function updateHologram(all) {
    const cats = ['صدر', 'ظهر', 'باي', 'تراي', 'أرجل'];
    const now = Date.now();

    cats.forEach(cat => {
        const el = document.getElementById(`bio-${cat}`);
        if (!el) return;

        const muscleLogs = all.filter(l => l.category === cat);
        el.classList.remove('recovering', 'evolved');

        if (muscleLogs.length > 0) {
            const last = muscleLogs[0];
            const hours = (now - last.timestamp) / (3600000);

            if (hours < 48) {
                el.classList.add('recovering');
            } else if (Math.max(...muscleLogs.map(l => l.weight)) > 80) {
                el.classList.add('evolved');
            }
        }
    });
}

// 7. غرفة الـ PR
function updatePRRoom(all) {
    const cats = ['صدر', 'ظهر', 'أكتاف', 'تراي', 'باي', 'أرجل'];
    const grid = document.getElementById('prGrid');
    
    grid.innerHTML = cats.map(c => {
        const cLogs = all.filter(l => l.category === c);
        const max = cLogs.length ? Math.max(...cLogs.map(l => l.weight)) : 0;
        return `
            <div class="pr-card">
                <p class="text-[7px] font-cyber text-gray-500 uppercase">${c}</p>
                <p class="text-xs font-black text-white">${max}KG</p>
            </div>
        `;
    }).join('');
}

// 8. مؤقت الراحة
function startRestTimer() {
    const timer = document.getElementById('restTimer');
    let timeLeft = 60;
    timer.classList.remove('hidden');
    
    const interval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerSeconds').innerText = timeLeft + 's';
        if (timeLeft <= 0) {
            clearInterval(interval);
            timer.classList.add('hidden');
        }
    }, 1000);
}

// 9. الرسم البياني
function renderChart(data) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    const chartData = [...data].reverse().slice(-10);
    
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(d => d.date),
            datasets: [{
                label: 'القوة التقديرية (1RM)',
                data: chartData.map(d => d.max),
                borderColor: '#00f3ff',
                backgroundColor: 'rgba(0,243,255,0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#444', font: { size: 8 } } } } }
    });
}

// 10. عرض السجلات
function renderLogs(logs) {
    const container = document.getElementById('logsContainer');
    container.innerHTML = logs.map(l => `
        <div class="glass-panel p-5 rounded-2xl flex justify-between items-center border-r-4 border-[--neon-red]">
            <div>
                <h4 class="font-bold text-sm">${l.name}</h4>
                <p class="text-[8px] font-cyber text-gray-500 uppercase">RPE: ${l.rpe} | ${l.date}</p>
            </div>
            <div class="text-right">
                <p class="text-xl font-black font-cyber text-[--cyber-blue]">${l.weight}KG</p>
                <p class="text-[9px] text-gray-400">${l.reps} REPS</p>
            </div>
        </div>
    `).join('');
}

function updateStats(all) {
    const totalVol = all.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0);
    document.getElementById('levelDisplay').innerText = Math.floor(totalVol / 1000) + 1;
    document.getElementById('userRank').innerText = totalVol > 50000 ? "TITAN PROTOCOL ACTIVE" : "NORMALIZING BIOMETRICS...";
}

// تشغيل عند التحميل
window.onload = refreshUI;
