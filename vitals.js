document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    lucide.createIcons();

    const session = getSession();
    const isEdit = canEdit();
    const formCard = document.getElementById('vitalsFormCard');
    const tableBody = document.getElementById('vitalsTableBody');
    const noHistoryMsg = document.getElementById('noHistoryMsg');

    // Show form if senior
    if (isEdit) {
        formCard.classList.remove('hidden');
        document.getElementById('actionHeader').classList.remove('hidden');
    }

    // Load Data
    function loadData() {
        const data = getSeniorData(session.seniorId);
        if (!data || !data.vitals) return;

        const vitals = data.vitals.sort((a, b) => new Date(b.date) - new Date(a.date));

        tableBody.innerHTML = '';
        
        if (vitals.length === 0) {
            noHistoryMsg.classList.remove('hidden');
        } else {
            noHistoryMsg.classList.add('hidden');
            vitals.forEach(vital => {
                const dateObj = new Date(vital.date);
                const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${dateStr}</td>
                    <td class="font-bold">${vital.heartRate}</td>
                    <td class="font-bold">${vital.bloodPressureSys}/${vital.bloodPressureDia}</td>
                    <td class="font-bold">${vital.sugar}</td>
                    <td class="font-bold">${vital.weight}</td>
                    ${isEdit ? `
                    <td>
                        <button class="btn btn-red btn-icon delete-btn" data-id="${vital.id}">
                             <i data-lucide="trash-2"></i>
                        </button>
                    </td>` : ''}
                `;
                tableBody.appendChild(row);
            });
            // Re-init icons for new delete buttons
            lucide.createIcons();
        }
    }

    loadData();

    // Handle Delete
    if (isEdit) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.delete-btn');
            if (btn) {
                const id = btn.getAttribute('data-id');
                const data = getSeniorData(session.seniorId);
                const newVitals = data.vitals.filter(v => v.id !== id);
                updateSeniorData(session.seniorId, { vitals: newVitals });
                loadData();
            }
        });
    }

    // Handle Submit
    const form = document.getElementById('vitalsForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const newVital = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                heartRate: parseInt(document.getElementById('heartRate').value),
                bloodPressureSys: parseInt(document.getElementById('bpSys').value),
                bloodPressureDia: parseInt(document.getElementById('bpDia').value),
                sugar: parseInt(document.getElementById('sugar').value),
                weight: parseFloat(document.getElementById('weight').value),
            };

            const data = getSeniorData(session.seniorId);
            updateSeniorData(session.seniorId, {
                vitals: [...(data.vitals || []), newVital]
            });

            form.reset();
            loadData();
        });
    }
});
