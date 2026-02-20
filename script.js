let exercises = JSON.parse(localStorage.getItem('neoMatrix')) || [];
let currentFilter = 'الكل';
let editingId = null;

// أيقونات لوسيد
lucide.createIcons();

// إضافة تمرين جديد للمصفوفة
function addNewExercise() {
    const name = document.getElementById('exName').value;
    const cat = document.getElementById('catSelect').value;

    if (!name) return;

    const newEx = {
        id: Date.now(),
        name: name,
        category: cat,
        weight: 0,
        reps: 0,
        history: []
    };

    exercises.push(newEx);
    saveData();
    document.getElementById('exName').value = '';
    renderExercises();
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('neoMatrix', JSON.stringify(exercises));
}

// فلترة حسب العضلة
function filterByCat(cat) {
    currentFilter = cat;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.innerText === cat));
    renderExercises();
}

// البحث
function searchExercises() {
    renderExercises();
}

// عرض التمارين في المصفوفة
function renderExercises() {
    const grid = document.getElementById('exerciseGrid');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = exercises;
    if (currentFilter !== 'الكل') {
        filtered = filtered.filter(ex => ex.category === currentFilter);
    }
    if (searchTerm) {
        filtered = filtered.filter(ex => ex.name.toLowerCase().includes(searchTerm));
    }

    grid.innerHTML = filtered.map(ex => `
        <div class="exercise-card group" onclick="openUpdateModal(${ex.id})">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="text-[8px] font-cyber text-[--cyber-blue] uppercase tracking-widest">${ex.category}</span>
                    <h4 class="text-lg font-bold group-hover:text-[--cyber-blue] transition-colors">${ex.name}</h4>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-black font-cyber text-white">${ex.weight}<span class="text-[10px] text-gray-500 ml-1">KG</span></p>
                    <p class="text-[10px] text-gray-500">${ex.reps} تكرار</p>
                </div>
            </div>
            <div class="flex justify-between items-center text-[10px] text-gray-600 border-t border-white/5 pt-3">
                <span>آخر تحديث: ${ex.history.length > 0 ? ex.history[ex.history.length-1].date : 'لا يوجد'}</span>
                <i data-lucide="chevron-right" class="w-3 h-3"></i>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// فتح نافذة التحديث
function openUpdateModal(id) {
    const ex = exercises.find(e => e.id === id);
    editingId = id;
    document.getElementById('modalTitle').innerText = ex.name;
    document.getElementById('newWeight').value = ex.weight;
    document.getElementById('newReps').value = ex.reps;
    document.getElementById('updateModal').classList.remove('hidden');
    
    document.getElementById('saveBtn').onclick = () => {
        updateExerciseData(id);
    };
}

function closeModal() {
    document.getElementById('updateModal').classList.add('hidden');
}

// تحديث بيانات التمرين (تطوير واقعي)
function updateExerciseData(id) {
    const w = parseFloat(document.getElementById('newWeight').value);
    const r = parseInt(document.getElementById('newReps').value);
    
    const index = exercises.findIndex(e => e.id === id);
    if (index !== -1) {
        exercises[index].weight = w;
        exercises[index].reps = r;
        exercises[index].history.push({
            date: new Date().toLocaleDateString('en-GB'),
            weight: w,
            reps: r
        });
        saveData();
        closeModal();
        renderExercises();
    }
}

// البدء عند تحميل الصفحة
window.onload = renderExercises;
