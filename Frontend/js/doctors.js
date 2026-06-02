async function loadDoctors() {
    const res = await fetch(`${API}/api/doctors`, {
        credentials: 'include'
    });
    const doctors = await res.json();
    const tab = document.getElementById('tab-doctors');
    if (doctors.length === 0) {
        tab.innerHTML = `
            <div class="section-header">
                <h2>Список врачей</h2>
                ${isAdmin() ? '<button class="btn-add" onclick="addDoctor()">+ Добавить врача</button>' : ''}
            </div>
            <div class="empty-state">
                <div class="empty-icon">👨‍⚕️</div>
                <p>Врачей пока нет</p>
            </div>`;
        return;
    }
    tab.innerHTML = `
        <div class="section-header">
            <h2>Всего: ${doctors.length}</h2>
            ${isAdmin() ? '<button class="btn-add" onclick="addDoctor()">+ Добавить врача</button>' : ''}
        </div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ФИО</th>
                        <th>Специализация</th>
                        <th>Стаж (лет)</th>
                        <th>Телефон</th>
                        ${isAdmin() ? '<th>Действия</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${doctors.map(d => `
                        <tr>
                            <td>${d.id}</td>
                            <td><strong>${d.fullName}</strong></td>
                            <td>${d.specialization || '—'}</td>
                            <td>${d.experienceYears ?? '—'}</td>
                            <td>${d.phone || '—'}</td>
                            ${isAdmin() ? `<td>
                                <button class="btn-edit" onclick="editDoctor(${d.id}, '${d.fullName}', '${d.specialization || ''}', ${d.experienceYears ?? 0}, '${d.phone || ''}')">✏️ Изменить</button>
                                <button class="btn-delete" onclick="deleteDoctor(${d.id})">🗑️ Удалить</button>
                            </td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

function addDoctor() {
    openModal('Добавить врача', `
        <div class="input-group">
            <label>ФИО</label>
            <input type="text" id="m-fullname" placeholder="Петров Пётр Петрович">
        </div>
        <div class="input-group">
            <label>Специализация</label>
            <input type="text" id="m-specialization" placeholder="Хирург, терапевт...">
        </div>
        <div class="input-group">
            <label>Стаж (лет)</label>
            <input type="number" id="m-experience" placeholder="5" min="0">
        </div>
        <div class="input-group">
            <label>Телефон</label>
            <input type="text" id="m-phone" placeholder="+7 (___) ___-__-__">
        </div>
    `, async () => {
        const body = {
            fullName:        document.getElementById('m-fullname').value,
            specialization:  document.getElementById('m-specialization').value,
            experienceYears: parseInt(document.getElementById('m-experience').value) || 0,
            phone:           document.getElementById('m-phone').value
        };
        await fetch(`${API}/api/doctors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadDoctors();
    });

    setTimeout(() => applyPhoneMask('m-phone'), 0);
}

function editDoctor(id, fullName, specialization, experienceYears, phone) {
    openModal('Изменить врача', `
        <div class="input-group">
            <label>ФИО</label>
            <input type="text" id="m-fullname" value="${fullName}">
        </div>
        <div class="input-group">
            <label>Специализация</label>
            <input type="text" id="m-specialization" value="${specialization}">
        </div>
        <div class="input-group">
            <label>Стаж (лет)</label>
            <input type="number" id="m-experience" value="${experienceYears}" min="0">
        </div>
        <div class="input-group">
            <label>Телефон</label>
            <input type="text" id="m-phone" value="${phone}">
        </div>
    `, async () => {
        const body = {
            id,
            fullName:        document.getElementById('m-fullname').value,
            specialization:  document.getElementById('m-specialization').value,
            experienceYears: parseInt(document.getElementById('m-experience').value) || 0,
            phone:           document.getElementById('m-phone').value
        };
        await fetch(`${API}/api/doctors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadDoctors();
    });

    setTimeout(() => applyPhoneMask('m-phone'), 0);
}

async function deleteDoctor(id) {
    if (!confirm('Удалить врача?')) return;
    await fetch(`${API}/api/doctors/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    loadDoctors();
}