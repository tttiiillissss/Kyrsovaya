const API = 'https://localhost:7287';

window.currentUser = null;

async function checkAuth() {
    try {
        const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
            const user = await res.json();
            window.currentUser = user;
            showMainScreen(user);
        } else {
            showAuthScreen();
        }
    } catch {
        showAuthScreen();
    }
}

function showAuthScreen() {
    window.currentUser = null;
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-screen').style.display = 'none';
    // Применяем маску email после показа экрана
    setTimeout(() => applyEmailMask('auth-email'), 0);
}

function showMainScreen(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'flex';
    const name = user.name || user.fullName || '';
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    const roles = { admin: '⚙️ Администратор', doctor: '👨‍⚕️ Врач', client: '👤 Клиент' };
    const role = (user.role || '').toLowerCase();
    document.getElementById('user-role-badge').textContent = roles[role] || role;
    applyRolePermissions(role);
}

// Скрывает/показывает элементы по атрибутам data-roles и data-hide-roles
function applyRolePermissions(role) {
    document.querySelectorAll('[data-roles]').forEach(el => {
        const allowed = el.getAttribute('data-roles').split(',').map(r => r.trim());
        el.style.display = allowed.includes(role) ? '' : 'none';
    });
    document.querySelectorAll('[data-hide-roles]').forEach(el => {
        const hidden = el.getAttribute('data-hide-roles').split(',').map(r => r.trim());
        if (hidden.includes(role)) el.style.display = 'none';
    });
}

// Хелперы для других JS-файлов
function isAdmin()  { return window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin'; }
function isDoctor() { return window.currentUser && (window.currentUser.role || '').toLowerCase() === 'doctor'; }
function isClient() { return window.currentUser && (window.currentUser.role || '').toLowerCase() === 'client'; }
function canEdit()  { return isAdmin() || isDoctor(); }
function canDelete(){ return isAdmin(); }

let isLogin = true;

function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('auth-title').textContent     = isLogin ? 'Добро пожаловать!' : 'Регистрация';
    document.getElementById('auth-subtitle').textContent  = isLogin ? 'Войдите в свой аккаунт' : 'Создайте аккаунт клиента';
    document.getElementById('auth-btn-text').textContent  = isLogin ? 'Войти' : 'Зарегистрироваться';
    document.getElementById('auth-toggle-label').textContent = isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?';
    document.getElementById('auth-toggle-link').textContent  = isLogin ? 'Зарегистрироваться' : 'Войти';
    document.getElementById('register-fields').style.display = isLogin ? 'none' : 'flex';
    document.getElementById('register-fields').style.flexDirection = 'column';
    document.getElementById('register-fields').style.gap = '16px';
    document.getElementById('auth-error').textContent = '';
    const regNote = document.getElementById('reg-note');
    if (regNote) regNote.style.display = isLogin ? 'none' : 'block';

    // Переприменяем маску при переключении — поле то же, но сбрасываем ошибку
    setTimeout(() => applyEmailMask('auth-email'), 0);
}

async function submitAuth() {
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const errorEl  = document.getElementById('auth-error');
    errorEl.textContent = '';
    errorEl.style.color = '';

    if (!email || !password) { errorEl.textContent = 'Заполните все поля.'; return; }

    // Валидация формата email перед отправкой
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEl.textContent = 'Введите корректный email, например: name@mail.ru';
        return;
    }

    if (isLogin) {
        const res = await fetch(`${API}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        if (res.ok) {
            const user = await res.json();
            window.currentUser = user;
            showMainScreen(user);
            showTab(localStorage.getItem('activeTab') || 'owners');
        } else {
            errorEl.textContent = await res.text() || 'Неверный email или пароль.';
        }
    } else {
        const fullName = document.getElementById('reg-name').value.trim();
        if (!fullName) { errorEl.textContent = 'Введите полное имя.'; return; }

        // Роль не передаётся — бэкенд всегда ставит client
        const res = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fullName, email, password })
        });
        if (res.ok) {
            errorEl.style.color = 'green';
            errorEl.textContent = 'Аккаунт создан! Войдите.';
            setTimeout(() => { errorEl.style.color = ''; errorEl.textContent = ''; toggleAuth(); }, 1500);
        } else {
            errorEl.textContent = await res.text() || 'Ошибка при регистрации.';
        }
    }
}

async function logout() {
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    localStorage.removeItem('activeTab');
    window.currentUser = null;
    showAuthScreen();
}

document.addEventListener('DOMContentLoaded', () => {
    applyEmailMask('auth-email');
});