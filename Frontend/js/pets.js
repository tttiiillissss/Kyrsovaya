async function loadPets() {
    const res = await fetch(`${API}/api/pets`, {
        credentials: 'include'
    });
    const pets = await res.json();
    const tab = document.getElementById('tab-pets');
    if (pets.length === 0) {
        tab.innerHTML = `
            <div class="section-header">
                <h2>Список питомцев</h2>
                <button class="btn-add" onclick="addPet()">+ Добавить питомца</button>
            </div>
            <div class="empty-state">
                <div class="empty-icon">🐾</div>
                <p>Питомцев пока нет</p>
            </div>`;
        return;
    }
    tab.innerHTML = `
        <div class="section-header">
            <h2>Всего: ${pets.length}</h2>
            <button class="btn-add" onclick="addPet()">+ Добавить питомца</button>
        </div>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Кличка</th>
                        <th>Владелец</th>
                        <th>Вид</th>
                        <th>Порода</th>
                        <th>Пол</th>
                        <th>Дата рождения</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${pets.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td><strong>${p.name}</strong></td>
                            <td>${p.owner ? p.owner.fullName : '—'}</td>
                            <td>${p.animalType || '—'}</td>
                            <td>${p.breed || '—'}</td>
                            <td>${p.gender || '—'}</td>
                            <td>${p.birthDate ? p.birthDate.split('T')[0] : '—'}</td>
                            <td>
                                <button class="btn-edit" onclick="editPet(${p.id}, ${p.ownerId}, '${p.name}', '${p.animalType || ''}', '${p.breed || ''}', '${p.gender || ''}', '${p.birthDate ? p.birthDate.split('T')[0] : ''}')">✏️ Изменить</button>
                                <button class="btn-delete" onclick="deletePet(${p.id})">🗑️ Удалить</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}
async function getOwnerOptions(selectedId = null) {
    const res = await fetch(`${API}/api/owners`, { credentials: 'include' });
    const owners = await res.json();
    return owners.map(o => `
        <option value="${o.id}" ${o.id === selectedId ? 'selected' : ''}>${o.fullName}</option>
    `).join('');
}
async function addPet() {
    const ownerOptions = await getOwnerOptions();
    openModal('Добавить питомца', `
        <div class="input-group">
            <label>Владелец</label>
            <select id="m-ownerid">${ownerOptions}</select>
        </div>
        <div class="input-group">
            <label>Кличка</label>
            <input type="text" id="m-name" placeholder="Барсик">
        </div>
        <div class="input-group">
            <label>Вид животного</label>
            <input type="text" id="m-animaltype" placeholder="Кошка">
        </div>
        <div class="input-group">
            <label>Порода</label>
            <input type="text" id="m-breed" placeholder="Сибирская">
        </div>
        <div class="input-group">
            <label>Пол</label>
            <select id="m-gender">
                <option value="">— Не указан —</option>
                <option value="Мужской">Мужской</option>
                <option value="Женский">Женский</option>
            </select>
        </div>
        <div class="input-group">
            <label>Дата рождения</label>
            <input type="date" id="m-birthdate">
        </div>
    `, async () => {
        const body = {
            ownerId:    parseInt(document.getElementById('m-ownerid').value),
            name:       document.getElementById('m-name').value,
            animalType: document.getElementById('m-animaltype').value,
            breed:      document.getElementById('m-breed').value,
            gender:     document.getElementById('m-gender').value,
            birthDate:  document.getElementById('m-birthdate').value || null
        };
        await fetch(`${API}/api/pets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadPets();
    });
}
async function editPet(id, ownerId, name, animalType, breed, gender, birthDate) {
    const ownerOptions = await getOwnerOptions(ownerId);
    openModal('Изменить питомца', `
        <div class="input-group">
            <label>Владелец</label>
            <select id="m-ownerid">${ownerOptions}</select>
        </div>
        <div class="input-group">
            <label>Кличка</label>
            <input type="text" id="m-name" value="${name}">
        </div>
        <div class="input-group">
            <label>Вид животного</label>
            <input type="text" id="m-animaltype" value="${animalType}">
        </div>
        <div class="input-group">
            <label>Порода</label>
            <input type="text" id="m-breed" value="${breed}">
        </div>
        <div class="input-group">
            <label>Пол</label>
            <select id="m-gender">
                <option value="">— Не указан —</option>
                <option value="Мужской" ${gender === 'Мужской' ? 'selected' : ''}>Мужской</option>
                <option value="Женский" ${gender === 'Женский' ? 'selected' : ''}>Женский</option>
            </select>
        </div>
        <div class="input-group">
            <label>Дата рождения</label>
            <input type="date" id="m-birthdate" value="${birthDate}">
        </div>
    `, async () => {
        const body = {
            id,
            ownerId:    parseInt(document.getElementById('m-ownerid').value),
            name:       document.getElementById('m-name').value,
            animalType: document.getElementById('m-animaltype').value,
            breed:      document.getElementById('m-breed').value,
            gender:     document.getElementById('m-gender').value,
            birthDate:  document.getElementById('m-birthdate').value || null
        };
        await fetch(`${API}/api/pets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        closeModal();
        loadPets();
    });
}
async function deletePet(id) {
    if (!confirm('Удалить питомца?')) return;
    await fetch(`${API}/api/pets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    loadPets();
}