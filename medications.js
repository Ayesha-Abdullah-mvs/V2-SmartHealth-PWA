import { getSession, canEdit, requireAuth } from '../utils/auth.js';
import { getSeniorData, updateSeniorData } from '../utils/storage.js';

// DOM Elements
const medicationForm = document.getElementById('medicationForm');
const medicationList = document.getElementById('medicationList');
const addMedicationSection = document.getElementById('addMedicationSection');
const backBtn = document.getElementById('backBtn');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    
    // Check permissions to show/hide the "Add" form
    if (canEdit()) {
        addMedicationSection.classList.remove('hidden');
    }

    loadData();
});

// Navigation
backBtn.addEventListener('click', () => {
    window.location.href = '/dashboard';
});

// Load and Render Data
function loadData() {
    const session = getSession();
    if (!session) return;

    const data = getSeniorData(session.seniorId);
    if (data && data.medications) {
        const sortedMeds = data.medications.sort((a, b) => a.time.localeCompare(b.time));
        renderMedications(sortedMeds);
    }
}

function renderMedications(medications) {
    if (medications.length === 0) {
        medicationList.innerHTML = `<p class="text-2xl text-gray-500 text-center py-8">No medications scheduled</p>`;
        return;
    }

    const editMode = canEdit();
    medicationList.innerHTML = medications.map(med => `
        <div class="bg-green-50 p-6 rounded-lg border-2 border-green-200 flex justify-between items-center mb-4">
            <div>
                <p class="text-2xl font-bold text-black">${med.name}</p>
                <p class="text-xl text-gray-600 mt-1">${med.time} • ${med.frequency}</p>
            </div>
            ${editMode ? `
                <button onclick="deleteMedication('${med.id}')" class="bg-red-600 text-white h-12 px-4 rounded hover:bg-red-700">
                    🗑️
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Handle Form Submission
medicationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const session = getSession();
    if (!session) return;

    const newMed = {
        id: Date.now().toString(),
        name: document.getElementById('medName').value,
        time: document.getElementById('medTime').value,
        frequency: document.getElementById('medFrequency').value,
    };

    const data = getSeniorData(session.seniorId);
    if (data) {
        updateSeniorData(session.seniorId, {
            medications: [...data.medications, newMed]
        });

        medicationForm.reset();
        loadData();
    }
});

// Handle Delete (Attached to window for inline onclick access)
window.deleteMedication = function(id) {
    if (!canEdit()) return;

    const session = getSession();
    if (!session) return;

    const data = getSeniorData(session.seniorId);
    if (data) {
        updateSeniorData(session.seniorId, {
            medications: data.medications.filter(m => m.id !== id)
        });
        loadData();
    }
};
