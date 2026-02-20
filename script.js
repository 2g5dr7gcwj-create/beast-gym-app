// الإعدادات الأولية
let currentCategory = 'صدر + تراي';
const sounds = {
    sync: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    timer: new Audio('https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3')
};

// تشغيل الخلفية
VANTA.DOTS({
    el: "#vanta-canvas",
    mouseControls: true,
    color: 0xff003c,
    backgroundColor: 0x050505,
    size: 2.00,
    spacing: 35.00
});

// تبديل الأقسام
function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('categoryDisplay').innerText = cat;
    refreshUI();
}

// القائمة الذكية والاقتراحات
function showQuickList() {
    const input = document.getElementById('exerciseName').value.toLowerCase();
    const list = document.getElementById('quickExerciseList');
    const logs = JSON.parse(localStorage.getItem('neoBeastLogs')) || [];
    
    const names = [...new Set(logs.filter(l => l.category === currentCategory).map(l => l.name))];
    const filtered = names.filter(n => n.toLowerCase().includes(input));

    if (filtered.length > 0) {
        list.innerHTML = filtered.map(n => `<div class="quick-item" onclick="selectExercise('${n}')">${n}</div>`).join('');
        list.classList.remove('hidden');
    } else {
        list.classList.add('hidden');
    }
}

function selectExercise(name) {
    document.getElementById('exerciseName').value = name;
    document.getElementById('quickExerciseList').classList.add('hidden');
    
    const logs = JSON.parse(localStorage.getItem('neoBeastLogs')) || [];
    const last = logs.find(l => l.name === name);
    
    if (last) {
        const aiWeight = (parseFloat(last.weight) * 1.025).toFixed(1);
        document.getElementById('aiSuggestion').innerText = `AI TARGET: ${aiWeight}KG`;
        document.getElementById('weight').placeholder = last.weight;
        document.getElementById('reps').value = last.reps;
    }
}

// إضافة تمرين
function addEntry() {
    const name = document.getElementById('exerciseName').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const reps = parseInt(document.getElementById('reps').value);

    if (!name || isNaN(weight)) return;

    const logs = JSON.parse(localStorage.getItem('neoBeastLogs')) || [];
    const prev = logs.find(l => l.name === name);

    const entry = {
        id: Date.now(),
        name, weight, reps,
        category: currentCategory,
        max: (weight * (1 + reps / 30)).toFixed(1),
        diff: prev ? (weight - prev.weight).toFixed(1) : 0,
        date: new Date().toLocaleDateString('en-GB')
    };

    logs.unshift(entry);
    localStorage.setItem('neoBeastLogs', JSON.stringify(logs));
    
    sounds.sync.play();
    startRestTimer(60);
    refreshUI();
    clearInputs();
}

// مؤقت الاستراحة
function startRestTimer(sec) {
    const el = document.getElementById('restTimer');
    const display = document.getElementById('timerDisplay');
    el.style.display = 'flex';
    let time = sec;
    
    const interval = setInterval(() => {
        time--;
        display.innerText = `${time}s`;
        if (time <= 0) {
            clearInterval(interval);
            sounds.timer.play();
            el.style.display = 'none';
        }
    }, 1000);
}

function refreshUI() {
    const allLogs = JSON.parse(localStorage.getItem('neoBeastLogs')) || [];
    const logs = allLogs.filter(l => l.category === currentCategory);
    const container = document.getElementById('logsContainer');

    // ليفل الوحش
    const level = Math.floor(allLogs.length / 5) + 1;
    document.getElementById('levelCircle').innerText = level;
    document.getElementById('xpBar').style.width = `${(allLogs.length % 5) * 20}%`;

    // الإنجازات
    if (allLogs.length > 0) document.getElementById('badge-1').classList.add('achievement-active');
    if (allLogs.length > 20) document.getElementById('badge-2').classList.add('achievement-active');

    container.innerHTML = logs.map(log => `
        <div class="glass-panel p-5 rounded-2xl flex justify-between items-center border-l-2 ${log.diff > 0 ? 'border-green-500' : 'border-white/10'}">
            <div>
                <h4 class="font-bold text-white italic">${log.name}</h4>
                <p class="text-[9px] font-cyber text-gray-500 uppercase mt-1">
                    ${log.date} | ${log.diff > 0 ? '↑ +'+log.diff : '• STABLE'}
                </p>
            </div>
            <div class="flex items-center gap-6">
                <div class="text-right">
                    <p class="text-[--neon-red] font-cyber font-black text-xl">${log.weight}</p>
                    <p class="text-[8px] text-gray-600 uppercase font-bold">${log.reps} Reps</p>
                </div>
                <button onclick="deleteEntry(${log.id})" class="text-gray-800 hover:text-red-500 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
    updateChart(logs);
}

function updateChart(data) {
    const ctx = document.getElementById('beastChart').getContext('2d');
    const points = [...data].reverse().slice(-10);
    
    if (window.chartObj) window.chartObj.destroy();
    
    window.chartObj = new Chart(ctx, {
        type: 'line',
        data: {
            labels: points.map(p => p.date),
            datasets: [{
                label: '1RM Evolution',
                data: points.map(p => p.max),
                borderColor: '#00f3ff',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(0, 243, 255, 0.05)'
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { grid: { display: false }, ticks: { color: '#333' } } }
        }
    });
}

function deleteEntry(id) {
    let logs = JSON.parse(localStorage.getItem('neoBeastLogs'));
    logs = logs.filter(l => l.id !== id);
    localStorage.setItem('neoBeastLogs', JSON.stringify(logs));
    refreshUI();
}

function clearInputs() {
    document.getElementById('exerciseName').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('aiSuggestion').innerText = '';
}

window.onload = refreshUI;
