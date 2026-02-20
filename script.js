// تشغيل الخلفية التفاعلية
VANTA.DOTS({
    el: "#vanta-canvas",
    mouseControls: true,
    touchControls: true,
    minHeight: 200.00,
    color: 0xff003c,
    backgroundColor: 0x050505,
    size: 2.00,
    spacing: 35.00
});

lucide.createIcons();
let myChart;

// دالة إضافة تمرين
function addEntry() {
    const name = document.getElementById('exerciseName').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const reps = parseInt(document.getElementById('reps').value);
    
    if (!name || isNaN(weight)) return;

    const entry = {
        id: Date.now(),
        name, weight, reps,
        max: (weight * (1 + reps / 30)).toFixed(1),
        date: new Date().toLocaleDateString('en-GB')
    };

    let logs = JSON.parse(localStorage.getItem('neoBeastLogs')) || [];
    logs.unshift(entry);
    localStorage.setItem('neoBeastLogs', JSON.stringify(logs));

    refreshUI();
    document.querySelectorAll('.cyber-input').forEach(i => i.value = '');
}

// تحديث الواجهة
function refreshUI() {
    const logs = JSON.parse(localStorage.getItem('neoBeastLogs')) || [];
    const container = document.getElementById('logsContainer');
    
    // حساب الإحصائيات
    document.getElementById('totalVolume').innerText = logs.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0);
    const maxes = logs.map(l => parseFloat(l.max));
    document.getElementById('topMax').innerText = maxes.length ? Math.max(...maxes) : 0;
    
    // نظام الليفل (كل 5 تمارين ليفل جديد)
    const level = Math.floor(logs.length / 5) + 1;
    document.getElementById('levelCircle').innerText = level;
    document.getElementById('xpBar').style.width = `${(logs.length % 5) * 20}%`;

    // عرض السجلات
    container.innerHTML = logs.map(log => `
        <div class="glass-panel p-5 rounded-2xl flex justify-between items-center animate-in slide-in-from-right duration-500">
            <div>
                <h4 class="font-black text-white italic">${log.name}</h4>
                <p class="text-[9px] font-cyber text-gray-500 uppercase mt-1">${log.date}</p>
            </div>
            <div class="flex gap-4 items-center">
                <div class="text-center"><p class="text-[--neon-red] font-cyber font-black">${log.weight}KG</p></div>
                <div class="h-8 w-[1px] bg-white/10"></div>
                <div class="text-right font-cyber text-xs">${log.max} <span class="text-[8px] text-gray-600">MAX</span></div>
            </div>
        </div>
    `).join('');
    
    updateChart(logs);
}

function updateChart(logs) {
    const ctx = document.getElementById('beastChart').getContext('2d');
    const chartData = [...logs].reverse().slice(-7);

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(l => l.date),
            datasets: [{
                data: chartData.map(l => l.max),
                borderColor: '#ff003c',
                tension: 0.4,
                pointRadius: 4,
                fill: true,
                backgroundColor: 'rgba(255, 0, 60, 0.1)'
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: false } } }
    });
}

window.onload = refreshUI;
