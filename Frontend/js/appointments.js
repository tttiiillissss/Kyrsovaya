async function loadAppointments() {
    const res = await fetch(`${API}/api/appointments`, {
        credentials: 'include'
    });
    const appointments = await res.json();
    const tab = document.getElementById('tab-appointments');
    if (appointments.length === 0) {
        tab.innerHTML = `
            <div class="section-header">
                <h2>Список приёмов</h2>
                <button class="btn-add" onclick="addAppointment()">+ Добавить приём</button>
            </div>
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <p>Приёмов пока нет</p>
            </div>`;
        return;
    }
    tab.innerHTML = `
        <div class="section-header">
            <h2>Всего: ${appointments.length}</h2>
            <button class="btn-add" onclick="addAppointment()">+ Добавить приём</button>
        </div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Дата и время</th>
                        <th>Питомец</th>
                        <th>Владелец</th>
                        <th>Врач</th>
                        <th>Услуга</th>
                        <th>Статус</th>
                        <th>Примечания</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointments.map(a => `
                        <tr>
                            <td>${a.id}</td>
                            <td>${formatDateTime(a.appointmentDatetime)}</td>
                            <td><strong>${a.pet ? a.pet.name : '—'}</strong></td>
                            <td>${a.pet && a.pet.owner ? a.pet.owner.fullName : '—'}</td>
                            <td>${a.doctor ? a.doctor.fullName : '—'}</td>
                            <td>${a.service ? a.service.name : '—'}</td>
                            <td>${getBadge(a.status)}</td>
                            <td>${a.notes || '—'}</td>
                            <td>
                                <button class="btn-edit" onclick="editAppointment(${a.id}, ${a.petId}, ${a.doctorId}, ${a.serviceId}, '${a.appointmentDatetime}', '${a.status || ''}', '${a.notes || ''}')">✏️ Изменить</button>
                                <button class="btn-delete" onclick="deleteAppointment(${a.id})">🗑️ Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}
function formatDateTime(dt) {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}
function getBadge(status) {
    const badges = {
        'scheduled':  '<span class="badge badge-scheduled">📅 Запланирован</span>',
        'completed':  '<span class="badge badge-completed">✅ Завершён</span>',
        'cancelled':  '<span class="badge badge-cancelled">❌ Отменён</span>'
    };
    return badges[status] || `<span class="badge">${status || '—'}</span>`;
}
async function getSelectOptions() {
    const [petsRes, doctorsRes, servicesRes] = await Promise.all([
        fetch(`${API}/api/pets`, { credentials: 'include' }),
        fetch(`${API}/api/doctors`, { credentials: 'include' }),
        fetch(`${API}/api/services`, { credentials: 'include' })
    ]);
    const pets     = await petsRes.json();
    const doctors  = await doctorsRes.json();
    const services = await servicesRes.json();
    return { pets, doctors, services };
}
async function addAppointment() {
    const { pets, doctors, services } = await getSelectOptions();

    openModal('Добавить приём', `
        <div class="input-group">
            <label>Питомец</label>
            <select id="m-petid">
                ${pets.map(p => `<option value="${p.id}">${p.name} (${p.animalType || ''})</option>`).join('')}
            </select>
        </div>
        <div class="input-group">
            <label>Врач</label>
            <select id="m-doctorid">
                ${doctors.map(d => `<option value="${d.id}">${d.fullName}</option>`).join('')}
            </select>
        </div>
        <div class="input-group">
            <label>Услуга</label>
            <select id="m-serviceid">
                ${services.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
        </div>
        <div class="input-group">
            <label>Дата и время</label>
            <input type="datetime-local" id="m-datetime">
        </div>
        <div class="input-group">
            <label>Статус</label>
            <select id="m-status">
                <option value="scheduled">📅 Запланирован</option>
                <option value="completed">✅ Завершён</option>
                <option value="cancelled">❌ Отменён</option>
            </select>
        </div>
        <div class="input-group">
            <label>Примечания</label>
            <input type="text" id="m-notes" placeholder="Комментарий...">
        </div>
    `, async () => {
        const body = {
            petId:                parseInt(document.getElementById('m-petid').value),
            doctorId:             parseInt(document.getElementById('m-doctorid').value),
            serviceId:            parseInt(document.getElementById('m-serviceid').value),
            appointmentDatetime:  document.getElementById('m-datetime').value,
            status:               document.getElementById('m-status').value,
            notes:                document.getElementById('m-notes').value
        };
        await fetch(`${API}/api/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadAppointments();
    });
}
async function editAppointment(id, petId, doctorId, serviceId, datetime, status, notes) {
    const { pets, doctors, services } = await getSelectOptions();
    openModal('Изменить приём', `
        <div class="input-group">
            <label>Питомец</label>
            <select id="m-petid">
                ${pets.map(p => `<option value="${p.id}" ${p.id === petId ? 'selected' : ''}>${p.name} (${p.animalType || ''})</option>`).join('')}
            </select>
        </div>
        <div class="input-group">
            <label>Врач</label>
            <select id="m-doctorid">
                ${doctors.map(d => `<option value="${d.id}" ${d.id === doctorId ? 'selected' : ''}>${d.fullName}</option>`).join('')}
            </select>
        </div>
        <div class="input-group">
            <label>Услуга</label>
            <select id="m-serviceid">
                ${services.map(s => `<option value="${s.id}" ${s.id === serviceId ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
        </div>
        <div class="input-group">
            <label>Дата и время</label>
            <input type="datetime-local" id="m-datetime" value="${datetime.slice(0, 16)}">
        </div>
        <div class="input-group">
            <label>Статус</label>
            <select id="m-status">
                <option value="scheduled" ${status === 'scheduled' ? 'selected' : ''}>📅 Запланирован</option>
                <option value="completed" ${status === 'completed' ? 'selected' : ''}>✅ Завершён</option>
                <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>❌ Отменён</option>
            </select>
        </div>
        <div class="input-group">
            <label>Примечания</label>
            <input type="text" id="m-notes" value="${notes}">
        </div>
    `, async () => {
        const body = {
            id,
            petId:                parseInt(document.getElementById('m-petid').value),
            doctorId:             parseInt(document.getElementById('m-doctorid').value),
            serviceId:            parseInt(document.getElementById('m-serviceid').value),
            appointmentDatetime:  document.getElementById('m-datetime').value,
            status:               document.getElementById('m-status').value,
            notes:                document.getElementById('m-notes').value
        };
        await fetch(`${API}/api/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadAppointments();
    });
}
async function deleteAppointment(id) {
    if (!confirm('Удалить приём?')) return;
    await fetch(`${API}/api/appointments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    loadAppointments();
}