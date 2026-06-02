async function loadOwners() {
    const res = await fetch(`${API}/api/owners`, {
        credentials: 'include'
    });
    const owners = await res.json();
    const tab = document.getElementById('tab-owners');
    if (owners.length === 0) {
        tab.innerHTML = `
            <div class="section-header">
                <h2>Список владельцев</h2>
                <button class="btn-add" onclick="addOwner()">+ Добавить владельца</button>
            </div>
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p>Владельцев пока нет</p>
            </div>`;
        return;
    }
    tab.innerHTML = `
        <div class="section-header">
            <h2>Всего: ${owners.length}</h2>
            <button class="btn-add" onclick="addOwner()">+ Добавить владельца</button>
        </div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>ФИО</th>
                        <th>Телефон</th>
                        <th>Email</th>
                        <th>Адрес</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${owners.map(o => `
                        <tr>
                            <td>${o.id}</td>
                            <td><strong>${o.fullName}</strong></td>
                            <td>${o.phone || '—'}</td>
                            <td>${o.email || '—'}</td>
                            <td>${o.address || '—'}</td>
                            <td>
                                <button class="btn-edit" onclick="editOwner(${o.id}, '${o.fullName}', '${o.phone || ''}', '${o.email || ''}', '${o.address || ''}')">✏️ Изменить</button>
                                <button class="btn-delete" onclick="deleteOwner(${o.id})">🗑️ Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}
function addOwner() {
    openModal('Добавить владельца', `
        <div class="input-group">
            <label>ФИО</label>
            <input type="text" id="m-fullname" placeholder="Иванов Иван Иванович">
        </div>
        <div class="input-group">
            <label>Телефон</label>
            <input type="text" id="m-phone" placeholder="+7 900 000 00 00">
        </div>
        <div class="input-group">
            <label>Email</label>
            <input type="email" id="m-email" placeholder="example@mail.ru">
        </div>
        <div class="input-group">
            <label>Адрес</label>
            <input type="text" id="m-address" placeholder="г. Москва, ул. Ленина, д. 1">
        </div>
    `, async () => {
        const body = {
            fullName: document.getElementById('m-fullname').value,
            phone:    document.getElementById('m-phone').value,
            email:    document.getElementById('m-email').value,
            address:  document.getElementById('m-address').value
        };
        await fetch(`${API}/api/owners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadOwners();
    });
}
function editOwner(id, fullName, phone, email, address) {
    openModal('Изменить владельца', `
        <div class="input-group">
            <label>ФИО</label>
            <input type="text" id="m-fullname" value="${fullName}">
        </div>
        <div class="input-group">
            <label>Телефон</label>
            <input type="text" id="m-phone" value="${phone}">
        </div>
        <div class="input-group">
            <label>Email</label>
            <input type="email" id="m-email" value="${email}">
        </div>
        <div class="input-group">
            <label>Адрес</label>
            <input type="text" id="m-address" value="${address}">
        </div>
    `, async () => {
        const body = {
            id,
            fullName: document.getElementById('m-fullname').value,
            phone:    document.getElementById('m-phone').value,
            email:    document.getElementById('m-email').value,
            address:  document.getElementById('m-address').value
        };
        await fetch(`${API}/api/owners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadOwners();
    });
}
async function deleteOwner(id) {
    if (!confirm('Удалить владельца? Все его питомцы тоже будут удалены.')) return;
    await fetch(`${API}/api/owners/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    loadOwners();
}