const password = getElementById('password');
const confirmPassword = getElementById('confirm-password');
const form = getElementById('form');
const container = getElementById('container');
const loader = getElementById('loader');
const btn = getElementById('submit');
const error = getElementById('error');
const success = getElementById('success');

error.style.display = 'none';
success.style.display = 'none';
container.style.display = 'none';

let token, userId;
const verifyTokenUrl = '/api/v1/auth/verify-forgot-password-token';
const updatePasswordUrl = '/api/v1/auth/update-password';
const TokenType = {
    RESET_PASSWORD: 'RESET_PASSWORD',
    VERIFY_EMAIL: 'VERIFY_EMAIL',
};
// eslint-disable-next-line no-useless-escape
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/;

function getElementById(id) {
    return document.getElementById(id);
}

function displayError(msg) {
    success.style.display = 'none';
    error.innerText = msg;
    error.style.display = 'block';
}

function displaySuccess(msg) {
    error.style.display = 'none';
    success.innerText = msg;
    success.style.display = 'block';
}

async function handleSubmit(e) {
    e.preventDefault();
    error.style.display = 'none';

    if (!password.value.trim()) {
        return displayError('Password is missing');
    }

    if (!passwordRegex.test(password.value.trim())) {
        return displayError(
            'Password must contain at least one letter, one number and one special character'
        );
    }

    if (password.value.trim() !== confirmPassword.value.trim()) {
        return displayError('Passwords do not match');
    }

    btn.disabled = true;
    btn.innerText = 'Loading...';

    const res = await fetch(updatePasswordUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            token,
            userId,
            type: TokenType.RESET_PASSWORD,
            password: password.value.trim(),
            passwordConfirm: confirmPassword.value.trim(),
        }),
    });

    btn.disabled = false;
    btn.innerText = 'Reset Password';

    if (!res.ok) {
        const error = await res.json();
        displayError(error.message);
    }

    displaySuccess('Password updated successfully');
    password.value = '';
    confirmPassword.value = '';
}

window.addEventListener('DOMContentLoaded', async () => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => {
            return searchParams.get(prop);
        },
    });

    token = params.token;
    userId = params.userId;

    // Check if token and userId are valid
    const res = await fetch(verifyTokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ token, userId, type: TokenType.RESET_PASSWORD }),
    });

    if (!res.ok) {
        const error = await res.json();
        console.error({ error });
        loader.innerText = error.message;
        return;
    }

    loader.style.display = 'none';
    container.style.display = 'block';
});

form.addEventListener('submit', handleSubmit);
