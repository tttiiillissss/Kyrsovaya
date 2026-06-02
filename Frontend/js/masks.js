/**
 * Маска телефона: +7 (XXX) XXX-XX-XX
 */
function applyPhoneMask(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;

    el.addEventListener('input', function (e) {
        let val = el.value.replace(/\D/g, ''); 
        if (val.startsWith('8')) val = '7' + val.slice(1);
        if (!val.startsWith('7')) val = '7' + val;
        val = val.slice(0, 11); 
        let result = '+7';
        if (val.length > 1) result += ' (' + val.slice(1, 4);
        if (val.length >= 4) result += ') ' + val.slice(4, 7);
        if (val.length >= 7) result += '-' + val.slice(7, 9);
        if (val.length >= 9) result += '-' + val.slice(9, 11);

        el.value = result;
    });

    el.addEventListener('keydown', function (e) {
        // Разрешаем стирать
        if (e.key === 'Backspace' && el.value === '+7') {
            el.value = '';
        }
    });

    el.addEventListener('focus', function () {
        if (!el.value) el.value = '+7 (';
    });

    el.addEventListener('blur', function () {
        if (el.value === '+7 (' || el.value === '+7') el.value = '';
    });
}

/**
 * Маска email: разрешает только корректные символы,
 * подсвечивает поле красным если формат неверный при потере фокуса.
 */
function applyEmailMask(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;

    el.addEventListener('blur', function () {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        el.style.borderColor = el.value && !valid ? '#e74c3c' : '';
        el.style.outline     = el.value && !valid ? '2px solid #e74c3c' : '';
        if (el.value && !valid) {
            showFieldError(el, 'Введите корректный email, например: name@mail.ru');
        } else {
            removeFieldError(el);
        }
    });

    el.addEventListener('input', function () {
        el.style.borderColor = '';
        el.style.outline = '';
        removeFieldError(el);
    });
}

/**
 * Маска даты рождения: DD.MM.YYYY 
 */
function applyBirthDateMask(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;

    el.placeholder = 'ДД.ММ.ГГГГ';
    el.maxLength = 10;

    el.addEventListener('input', function (e) {
        let val = el.value.replace(/\D/g, '').slice(0, 8);
        let result = '';
        if (val.length > 0) result += val.slice(0, 2);
        if (val.length > 2) result += '.' + val.slice(2, 4);
        if (val.length > 4) result += '.' + val.slice(4, 8);
        el.value = result;
    });

    el.addEventListener('blur', function () {
        if (!el.value) return;
        const parts = el.value.split('.');
        let valid = parts.length === 3
            && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4;

        if (valid) {
            const d = parseInt(parts[0]), m = parseInt(parts[1]), y = parseInt(parts[2]);
            const date = new Date(y, m - 1, d);
            valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
                && y >= 1900 && y <= new Date().getFullYear();
        }

        el.style.borderColor = !valid ? '#e74c3c' : '';
        el.style.outline     = !valid ? '2px solid #e74c3c' : '';
        if (!valid) {
            showFieldError(el, 'Введите дату в формате ДД.ММ.ГГГГ');
        } else {
            removeFieldError(el);
        }
    });

    el.addEventListener('input', function () {
        el.style.borderColor = '';
        el.style.outline = '';
        removeFieldError(el);
    });
}
/**
 * Преобразует "ДД.ММ.ГГГГ" 
 * Возвращает null если строка пустая или некорректная.
 */
function parseBirthDate(val) {
    if (!val) return null;
    const parts = val.split('.');
    if (parts.length !== 3) return null;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Преобразует "ГГГГ-ММ-ДД"
 */
function formatBirthDate(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

//Вспомогательные функции ошибок

function showFieldError(el, message) {
    removeFieldError(el);
    const err = document.createElement('small');
    err.className = 'field-error';
    err.style.cssText = 'color:#e74c3c;font-size:11px;margin-top:3px;display:block';
    err.textContent = message;
    el.parentNode.appendChild(err);
}

function removeFieldError(el) {
    const existing = el.parentNode && el.parentNode.querySelector('.field-error');
    if (existing) existing.remove();
}