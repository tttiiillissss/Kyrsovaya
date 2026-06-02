async function loadPets() {
    const res = await fetch(`${API}/api/pets`, {
        credentials: 'include'
    });
    const pets = await res.json();
    const tab = document.getElementById('tab-pets');

    const showAddBtn  = isAdmin() || isClient();
    const showEdit    = isAdmin() || isClient();
    const showDelete  = isAdmin();
    const showActions = showEdit || showDelete;

    if (pets.length === 0) {
        tab.innerHTML = `
            <div class="section-header">
                <h2>Список питомцев</h2>
                ${showAddBtn ? '<button class="btn-add" onclick="addPet()">+ Добавить питомца</button>' : ''}
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
            ${showAddBtn ? '<button class="btn-add" onclick="addPet()">+ Добавить питомца</button>' : ''}
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
                        ${showActions ? '<th>Действия</th>' : ''}
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
                            <td>${p.birthDate ? formatBirthDate(p.birthDate) : '—'}</td>
                            ${showActions ? `<td>
                                ${showEdit ? `<button class="btn-edit" onclick="editPet(${p.id}, ${p.ownerId}, '${p.name}', '${p.animalType || ''}', '${p.breed || ''}', '${p.gender || ''}', '${p.birthDate || ''}')">✏️ Изменить</button>` : ''}
                                ${showDelete ? `<button class="btn-delete" onclick="deletePet(${p.id})">🗑️ Удалить</button>` : ''}
                            </td>` : ''}
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

function petFormFields(withOwnerSelect, ownerSelectHtml, values = {}) {
    return `
        ${withOwnerSelect ? `<div class="input-group"><label>Владелец</label><select id="m-ownerid">${ownerSelectHtml}</select></div>` : ''}
        <div class="input-group">
            <label>Кличка</label>
            <input type="text" id="m-name" value="${values.name || ''}" placeholder="Барсик">
        </div>
        <div class="input-group">
            <label>Вид животного</label>
            <input type="text" id="m-animaltype" value="${values.animalType || ''}" placeholder="Кошка">
        </div>
        <div class="input-group">
            <label>Порода</label>
            <input type="text" id="m-breed" value="${values.breed || ''}" placeholder="Сибирская">
        </div>
        <div class="input-group">
            <label>Пол</label>
            <select id="m-gender">
                <option value="">— Не указан —</option>
                <option value="Мужской" ${values.gender === 'Мужской' ? 'selected' : ''}>Мужской</option>
                <option value="Женский" ${values.gender === 'Женский' ? 'selected' : ''}>Женский</option>
            </select>
        </div>
        <div class="input-group">
            <label>Дата рождения</label>
            <input type="text" id="m-birthdate" value="${values.birthDate || ''}" placeholder="ДД.ММ.ГГГГ" maxlength="10">
        </div>
    `;
}

async function addPet() {
    if (isClient()) {
        openModal('Добавить питомца', petFormFields(false, '', {}), async () => {
            const birthDateIso = parseBirthDate(document.getElementById('m-birthdate').value);
            const ownersRes = await fetch(`${API}/api/owners`, { credentials: 'include' });
            const owners = await ownersRes.json();
            if (!owners.length) { alert('Ваш профиль владельца не найден. Обратитесь к администратору.'); return; }
            const body = {
                ownerId:    owners[0].id,
                name:       document.getElementById('m-name').value,
                animalType: document.getElementById('m-animaltype').value,
                breed:      document.getElementById('m-breed').value,
                gender:     document.getElementById('m-gender').value,
                birthDate:  birthDateIso
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
        setTimeout(() => applyBirthDateMask('m-birthdate'), 0);
        return;
    }

    const ownerOptions = await getOwnerOptions();
    openModal('Добавить питомца', petFormFields(true, ownerOptions, {}), async () => {
        const birthDateIso = parseBirthDate(document.getElementById('m-birthdate').value);
        const body = {
            ownerId:    parseInt(document.getElementById('m-ownerid').value),
            name:       document.getElementById('m-name').value,
            animalType: document.getElementById('m-animaltype').value,
            breed:      document.getElementById('m-breed').value,
            gender:     document.getElementById('m-gender').value,
            birthDate:  birthDateIso
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
    setTimeout(() => applyBirthDateMask('m-birthdate'), 0);
}

async function editPet(id, ownerId, name, animalType, breed, gender, birthDateIso) {
    const birthDateFormatted = formatBirthDate(birthDateIso);

    if (isClient()) {
        openModal('Изменить питомца', petFormFields(false, '', { name, animalType, breed, gender, birthDate: birthDateFormatted }), async () => {
            const birthDateIsoNew = parseBirthDate(document.getElementById('m-birthdate').value);
            const body = {
                id, ownerId,
                name:       document.getElementById('m-name').value,
                animalType: document.getElementById('m-animaltype').value,
                breed:      document.getElementById('m-breed').value,
                gender:     document.getElementById('m-gender').value,
                birthDate:  birthDateIsoNew
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
        setTimeout(() => applyBirthDateMask('m-birthdate'), 0);
        return;
    }

    const ownerOptions = await getOwnerOptions(ownerId);
    openModal('Изменить питомца', petFormFields(true, ownerOptions, { name, animalType, breed, gender, birthDate: birthDateFormatted }), async () => {
        const birthDateIsoNew = parseBirthDate(document.getElementById('m-birthdate').value);
        const body = {
            id,
            ownerId:    parseInt(document.getElementById('m-ownerid').value),
            name:       document.getElementById('m-name').value,
            animalType: document.getElementById('m-animaltype').value,
            breed:      document.getElementById('m-breed').value,
            gender:     document.getElementById('m-gender').value,
            birthDate:  birthDateIsoNew
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
    setTimeout(() => applyBirthDateMask('m-birthdate'), 0);
}

async function deletePet(id) {
    if (!confirm('Удалить питомца?')) return;
    await fetch(`${API}/api/pets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    loadPets();
}