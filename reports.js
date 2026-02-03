// Mocking the imported utils (In real usage, ensure these are linked)
// import { getSession, requireAuth } from '../utils/auth';
// import { getSeniorData } from '../utils/storage';

let state = {
    filter: '7',
    data: null
};

document.addEventListener('DOMContentLoaded', () => {
    // initAuth(); // Assuming this is your requireAuth logic
    loadData();
    setupEventListeners();
});

function setupEventListeners() {
    const filterSelect = document.getElementById('filterSelect');
    const backBtn = document.getElementById('backBtn');

    filterSelect.addEventListener('change', (e) => {
        state.filter = e.target.value;
        render();
    });

    backBtn.addEventListener('click', () => {
        window.location.href = '/dashboard';
    });
}

function loadData() {
    // Placeholder for your actual auth/storage logic
    const session = typeof getSession === 'function' ? getSession() : { seniorId: '1' };
    if (!session) return;
    
    // Replace with your real getSeniorData call
    state.data = typeof getSeniorData === 'function' ? getSeniorData(session.seniorId) : mockData;
    render();
}

function render() {
    renderSummary();
    renderVitals();
    renderSteps();
    renderMedications();
}

function getFilteredData(type) {
    if (!state.data || !state.data[type]) return [];
    const days = parseInt(state.filter);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return state.data[type].filter(item => new Date(item.date) >= cutoff);
}

function renderSummary() {
    const vitals = getFilteredData('vitals');
    const steps = getFilteredData('steps');
    const container = document.getElementById('summaryContainer');

    if (vitals.length === 0 && steps.length === 0) {
        container.innerHTML = '';
        return;
    }

    const avgHeartRate = vitals.length > 0 
        ? Math.round(vitals.reduce((sum, v) => sum + v.heartRate, 0) / vitals.length) : 0;
    const avgSteps = steps.length > 0
        ? Math.round(steps.reduce((sum, s) => sum + s.steps, 0) / steps.length) : 0;

    container.innerHTML = `
        <section class="card border-4 border-black bg-white overflow-hidden">
            <div class="card-header bg-purple-500 text-white p-4">
                <h2 class="text-2xl font-bold">Summary (Last ${state.filter} days)</h2>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 text-center">
                    <p class="text-lg text-gray-600">Avg Heart Rate</p>
                    <p class="text-4xl font-bold text-black mt-2">${avgHeartRate}</p>
                    <p class="text-base text-gray-500">bpm</p>
                </div>
                <div class="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 text-center">
                    <p class="text-lg text-gray-600">Avg Steps</p>
                    <p class="text-4xl font-bold text-black mt-2">${avgSteps.toLocaleString()}</p>
                    <p class="text-base text-gray-500">per day</p>
                </div>
                <div class="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 text-center">
                    <p class="text-lg text-gray-600">Active Medications</p>
                    <p class="text-2xl font-bold text-black mt-4">${state.data.medications.length}</p>
                </div>
            </div>
        </section>
    `;
}

function renderVitals() {
    const vitals = getFilteredData('vitals');
    const container = document.getElementById('vitalsContainer');

    if (vitals.length === 0) {
        container.innerHTML = `<p class="text-2xl text-gray-500 text-center py-8">No vitals data for selected period</p>`;
        return;
    }

    let rows = vitals.map(v => `
        <tr class="border-b-2 border-gray-200">
            <td class="p-3">${new Date(v.date).toLocaleDateString()}</td>
            <td class="p-3 font-bold">${v.heartRate}</td>
            <td class="p-3 font-bold">${v.bloodPressureSys}/${v.bloodPressureDia}</td>
            <td class="p-3 font-bold">${v.sugar}</td>
            <td class="p-3 font-bold">${v.weight}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-lg">
                <thead>
                    <tr class="border-b-4 border-black">
                        <th class="text-left p-3">Date</th>
                        <th class="text-left p-3">HR</th>
                        <th class="text-left p-3">BP</th>
                        <th class="text-left p-3">Sugar</th>
                        <th class="text-left p-3">Weight</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function renderMedications() {
    const meds = state.data?.medications || [];
    const container = document.getElementById('medsContainer');

    if (meds.length === 0) {
        container.innerHTML = `<p class="text-2xl text-gray-500 text-center py-8">No medications scheduled</p>`;
        return;
    }

    container.innerHTML = `
        <div class="space-y-4">
            ${meds.map(med => `
                <div class="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                    <p class="text-2xl font-bold text-black">${med.name}</p>
                    <p class="text-xl text-gray-600 mt-1">${med.time} • ${med.frequency}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Fallback logic for Steps is similar to Vitals...
function renderSteps() {
    const steps = getFilteredData('steps');
    const container = document.getElementById('stepsContainer');
    if (steps.length === 0) {
        container.innerHTML = `<p class="text-2xl text-gray-500 text-center py-8">No steps data</p>`;
        return;
    }
    container.innerHTML = `<table>...</table>`; // Repeat table logic as per HTML
}
