async function loadUsers() {
    if (!isAdmin()) {
        document.getElementById('tab-users').innerHTML =
            '<p style="color:#e74c3c;padding:20px">Доступ запрещён.</p>';
        return;
    }
    const res = await fetch(`${API}/api/auth/admin/users`, { credentials: 'include' });
    const users = await res.json();
    const roleLabels = { admin: '⚙️ Администратор', doctor: '👨‍⚕️ Врач', client: '👤 Клиент' };

    document.getElementById('tab-users').innerHTML = `
        <div class="section-header">
            <h2>Всего: ${users.length}</h2>
            <button class="btn-add" onclick="openCreateUserModal()">➕ Добавить пользователя</button>
        </div>
        <div class="table-wrap"><table>
            <thead><tr><th>#</th><th>Имя</th><th>Email</th><th>Роль</th><th>Действия</th></tr></thead>
            <tbody>
            ${users.map(u => `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.fullName}</td>
                    <td>${u.email}</td>
                    <td>${roleLabels[(u.role||'').toLowerCase()] || u.role}</td>
                    <td>
                        <button class="btn-edit" onclick="openChangeRoleModal(${u.id},'${u.fullName}','${(u.role||'').toLowerCase()}')">🔑 Роль</button>
                    </td>
                </tr>`).join('')}
            </tbody>
        </table></div>`;
}

function openCreateUserModal() {
    openModal('Добавить пользователя', `
        <div class="input-group"><label>Полное имя</label><input type="text" id="cu-name"></div>
        <div class="input-group"><label>Email</label><input type="email" id="cu-email"></div>
        <div class="input-group"><label>Пароль</label><input type="password" id="cu-password"></div>
        <div class="input-group"><label>Роль</label>
            <select id="cu-role">
                <option value="client">👤 Клиент</option>
                <option value="doctor">👨‍⚕️ Врач</option>
                <option value="admin">⚙️ Администратор</option>
            </select>
        </div>`, async () => {
        const fullName = document.getElementById('cu-name').value.trim();
        const email    = document.getElementById('cu-email').value.trim();
        const password = document.getElementById('cu-password').value.trim();
        const role     = document.getElementById('cu-role').value;
        if (!fullName || !email || !password) { alert('Заполните все поля.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Введите корректный email.'); return; }
        const res = await fetch(`${API}/api/auth/admin/create-user`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ fullName, email, password, role })
        });
        if (res.ok) { closeModal(); loadUsers(); }
        else alert('Ошибка: ' + await res.text());
    });
    setTimeout(() => applyEmailMask('cu-email'), 0);
}

function openChangeRoleModal(userId, userName, currentRole) {
    openModal('Изменить роль', `
        <p>Пользователь: <strong>${userName}</strong></p>
        <div class="input-group"><label>Новая роль</label>
            <select id="cr-role">
                <option value="client"  ${currentRole==='client' ?'selected':''}>👤 Клиент</option>
                <option value="doctor"  ${currentRole==='doctor' ?'selected':''}>👨‍⚕️ Врач</option>
                <option value="admin"   ${currentRole==='admin'  ?'selected':''}>⚙️ Администратор</option>
            </select>
        </div>`, async () => {
        const res = await fetch(`${API}/api/auth/admin/change-role/${userId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ role: document.getElementById('cr-role').value })
        });
        if (res.ok) { closeModal(); loadUsers(); }
        else alert('Ошибка изменения роли.');
    });
}