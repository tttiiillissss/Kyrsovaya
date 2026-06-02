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
                ${isAdmin() ? '<button class="btn-add" onclick="addOwner()">+ Добавить владельца</button>' : ''}
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
            ${isAdmin() ? '<button class="btn-add" onclick="addOwner()">+ Добавить владельца</button>' : ''}
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
                        ${isAdmin() ? '<th>Действия</th>' : ''}
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
                            ${isAdmin() ? `<td>
                                <button class="btn-edit" onclick="editOwner(${o.id}, '${o.fullName}', '${o.phone || ''}', '${o.email || ''}', '${o.address || ''}')">✏️ Изменить</button>
                                <button class="btn-delete" onclick="deleteOwner(${o.id})">🗑️ Удалить</button>
                            </td>` : ''}
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
            <input type="text" id="m-phone" placeholder="+7 (___) ___-__-__">
        </div>
        <div class="input-group">
            <label>Email</label>
            <input type="text" id="m-email" placeholder="example@mail.ru">
        </div>
        <div class="input-group">
            <label>Адрес</label>
            <input type="text" id="m-address" placeholder="г. Москва, ул. Ленина, д. 1">
        </div>
    `, async () => {
        const emailVal = document.getElementById('m-email').value.trim();
        if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            alert('Введите корректный email.');
            return;
        }
        const body = {
            fullName: document.getElementById('m-fullname').value,
            phone:    document.getElementById('m-phone').value,
            email:    emailVal,
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

    // Применяем маски после вставки HTML в DOM
    setTimeout(() => {
        applyPhoneMask('m-phone');
        applyEmailMask('m-email');
    }, 0);
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
            <input type="text" id="m-email" value="${email}">
        </div>
        <div class="input-group">
            <label>Адрес</label>
            <input type="text" id="m-address" value="${address}">
        </div>
    `, async () => {
        const emailVal = document.getElementById('m-email').value.trim();
        if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            alert('Введите корректный email.');
            return;
        }
        const body = {
            id,
            fullName: document.getElementById('m-fullname').value,
            phone:    document.getElementById('m-phone').value,
            email:    emailVal,
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

    setTimeout(() => {
        applyPhoneMask('m-phone');
        applyEmailMask('m-email');
    }, 0);
}

async function deleteOwner(id) {
    if (!confirm('Удалить владельца? Все его питомцы тоже будут удалены.')) return;
    await fetch(`${API}/api/owners/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    loadOwners();
}