async function loadServices() {
    const res = await fetch(`${API}/api/services`, {
        credentials: 'include'
    });
    const services = await res.json();
    const tab = document.getElementById('tab-services');
    if (services.length === 0) {
        tab.innerHTML = `
            <div class="section-header">
                <h2>Список услуг</h2>
                ${isAdmin() ? '<button class="btn-add" onclick="addService()">+ Добавить услугу</button>' : ''}
            </div>
            <div class="empty-state">
                <div class="empty-icon">🛠️</div>
                <p>Услуг пока нет</p>
            </div>`;
        return;
    }
    tab.innerHTML = `
        <div class="section-header">
            <h2>Всего: ${services.length}</h2>
            ${isAdmin() ? '<button class="btn-add" onclick="addService()">+ Добавить услугу</button>' : ''}
        </div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Стоимость</th>
                        <th>Длительность</th>
                        ${isAdmin() ? '<th>Действия</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${services.map(s => `
                        <tr>
                            <td>${s.id}</td>
                            <td><strong>${s.name}</strong></td>
                            <td>${s.description || '—'}</td>
                            <td>${s.price ? s.price + ' ₽' : '—'}</td>
                            <td>${s.durationMinutes ? s.durationMinutes + ' мин.' : '—'}</td>
                            ${isAdmin() ? `<td>
                                <button class="btn-edit" onclick="editService(${s.id}, '${s.name}', '${s.description || ''}', ${s.price || 0}, ${s.durationMinutes || 0})">✏️ Изменить</button>
                                <button class="btn-delete" onclick="deleteService(${s.id})">🗑️ Удалить</button>
                            </td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}
function addService() {
    openModal('Добавить услугу', `
        <div class="input-group">
            <label>Название</label>
            <input type="text" id="m-name" placeholder="Вакцинация, осмотр...">
        </div>
        <div class="input-group">
            <label>Описание</label>
            <input type="text" id="m-description" placeholder="Краткое описание услуги">
        </div>
        <div class="input-group">
            <label>Стоимость (₽)</label>
            <input type="number" id="m-price" placeholder="1500" min="0">
        </div>
        <div class="input-group">
            <label>Длительность (мин.)</label>
            <input type="number" id="m-duration" placeholder="30" min="0">
        </div>
    `, async () => {
        const body = {
            name:            document.getElementById('m-name').value,
            description:     document.getElementById('m-description').value,
            price:           parseFloat(document.getElementById('m-price').value) || 0,
            durationMinutes: parseInt(document.getElementById('m-duration').value) || 0
        };
        await fetch(`${API}/api/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadServices();
    });
}
function editService(id, name, description, price, durationMinutes) {
    openModal('Изменить услугу', `
        <div class="input-group">
            <label>Название</label>
            <input type="text" id="m-name" value="${name}">
        </div>
        <div class="input-group">
            <label>Описание</label>
            <input type="text" id="m-description" value="${description}">
        </div>
        <div class="input-group">
            <label>Стоимость (₽)</label>
            <input type="number" id="m-price" value="${price}" min="0">
        </div>
        <div class="input-group">
            <label>Длительность (мин.)</label>
            <input type="number" id="m-duration" value="${durationMinutes}" min="0">
        </div>
    `, async () => {
        const body = {
            id,
            name:            document.getElementById('m-name').value,
            description:     document.getElementById('m-description').value,
            price:           parseFloat(document.getElementById('m-price').value) || 0,
            durationMinutes: parseInt(document.getElementById('m-duration').value) || 0
        };
        await fetch(`${API}/api/services/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadServices();
    });
}
async function deleteService(id) {
    if (!confirm('Удалить услугу?')) return;
    await fetch(`${API}/api/services/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    loadServices();
}