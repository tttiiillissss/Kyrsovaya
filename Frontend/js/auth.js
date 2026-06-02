const API = 'https://localhost:7287';
async function checkAuth() {
    try {
        const res = await fetch(`${API}/api/auth/me`, {
            credentials: 'include'
        });

        if (res.ok) {
            const user = await res.json();
            showMainScreen(user);
        } else {
            showAuthScreen();
        }
    } catch {
        showAuthScreen();
    }
}
function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-screen').style.display = 'none';
}
function showMainScreen(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'flex';
    const name = user.name || user.fullName || '';
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    const roles = { admin: '⚙️ Администратор', doctor: '👨‍⚕️ Врач', client: '👤 Клиент' };
    const role = user.role || '';
    document.getElementById('user-role-badge').textContent = roles[role] || role;
}
let isLogin = true;
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('auth-title').textContent = isLogin ? 'Добро пожаловать!' : 'Регистрация';
    document.getElementById('auth-subtitle').textContent = isLogin ? 'Войдите в свой аккаунт' : 'Создайте аккаунт';
    document.getElementById('auth-btn-text').textContent = isLogin ? 'Войти' : 'Зарегистрироваться';
    document.getElementById('auth-toggle-label').textContent = isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?';
    document.getElementById('auth-toggle-link').textContent = isLogin ? 'Зарегистрироваться' : 'Войти';
    document.getElementById('register-fields').style.display = isLogin ? 'none' : 'flex';
    document.getElementById('register-fields').style.flexDirection = 'column';
    document.getElementById('register-fields').style.gap = '16px';
    document.getElementById('auth-error').textContent = '';
}
async function submitAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = '';
    if (!email || !password) {
        errorEl.textContent = 'Заполните все поля.';
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
            showMainScreen(user);
            const savedTab = localStorage.getItem('activeTab') || 'owners';
            showTab(savedTab);
        } else {
            const msg = await res.text();
            errorEl.textContent = msg || 'Неверный email или пароль.';
        }
    } else {
        const fullName = document.getElementById('reg-name').value.trim();
        const role = document.getElementById('reg-role').value;

        if (!fullName) {
            errorEl.textContent = 'Введите полное имя.';
            return;
        }
        const res = await fetch(`${API}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fullName, email, password, role })
        });
        if (res.ok) {
            errorEl.style.color = 'green';
            errorEl.textContent = 'Аккаунт создан! Войдите.';
            setTimeout(() => {
                errorEl.style.color = '';
                errorEl.textContent = '';
                toggleAuth();
            }, 1500);
        } else {
            const msg = await res.text();
            errorEl.textContent = msg || 'Ошибка при регистрации.';
        }
    }
}
async function logout() {
    await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    localStorage.removeItem('activeTab');
    showAuthScreen();
}