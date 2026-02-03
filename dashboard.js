document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const session = getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const data = getSeniorData(session.seniorId);
    if (!data) {
        clearSession();
        window.location.href = 'index.html';
        return;
    }

    // Initialize Icons
    lucide.createIcons();

    // Setup Header
    document.getElementById('welcomeMsg').textContent = `Hello, ${data.profile.name}`;
    if (session.role !== 'senior') {
        document.getElementById('readOnlyBadge').classList.remove('hidden');
    }
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearSession();
        window.location.href = 'index.html';
    });

    // Update Button Texts based on role
    const isEdit = canEdit();
    document.getElementById('vitalsBtnText').textContent = isEdit ? 'Record Vitals' : 'View Vitals History';
    document.getElementById('stepsBtnText').textContent = isEdit ? 'Track Steps' : 'View Steps History';
    document.getElementById('medsBtnText').textContent = isEdit ? 'Manage Medications' : 'View Medications';

    // --- 1. Vitals Logic ---
    const latestVital = data.vitals && data.vitals.length > 0 
        ? data.vitals[data.vitals.length - 1] 
        : null;

    if (latestVital) {
        const createStat = (label, val, unit) => `
            <div class="stat-box bg-red text-center">
                <p class="text-lg text-gray">${label}</p>
                <p class="text-3xl font-bold">${val}</p>
                <p class="text-base text-gray-light">${unit}</p>
            </div>`;

        const html = 
            createStat('Heart Rate', latestVital.heartRate, 'bpm') +
            createStat('Blood Pressure', `${latestVital.bloodPressureSys}/${latestVital.bloodPressureDia}`, 'mmHg') +
            createStat('Sugar', latestVital.sugar, 'mg/dL') +
            createStat('Weight', latestVital.weight, 'kg');
        
        document.getElementById('vitalsContainer').innerHTML = html;
    } else {
        document.getElementById('noVitalsMsg').classList.remove('hidden');
    }

    // --- 2. Steps Logic ---
    // Simple date string match YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySteps = (data.steps || [])
        .filter(s => s.date.startsWith(todayStr))
        .reduce((sum, s) => sum + s.steps, 0);
    
    document.getElementById('stepCount').textContent = todaySteps.toLocaleString();

    // --- 3. Meds Logic ---
    const meds = data.medications || [];
    const nextMed = meds.sort((a, b) => a.time.localeCompare(b.time))[0];

    if (nextMed) {
        document.getElementById('medContainer').innerHTML = `
            <div class="stat-box bg-green">
                <p class="text-2xl font-bold">${nextMed.name}</p>
                <p class="text-xl text-gray mt-2">at ${nextMed.time}</p>
                <p class="text-lg text-gray-light">${nextMed.frequency}</p>
            </div>
        `;
    } else {
        document.getElementById('noMedsMsg').classList.remove('hidden');
    }
});
