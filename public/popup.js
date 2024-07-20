document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const hostInput = document.getElementById('host');
    const tokenInput = document.getElementById('token');
    const toggleTokenButton = document.getElementById('toggleToken');

    const DEFAULT_HOST = 'http://127.0.0.1:39666';

    chrome.storage.local.get(['enabled'], function (result) {
        if (result.enabled === undefined) {
            chrome.storage.local.set({ enabled: true });
            document.getElementById('enabled').checked = true;
        } else {
            document.getElementById('enabled').checked = result.enabled;
        }
    });

    saveButton.addEventListener('click', function () {
        const host = hostInput.value || DEFAULT_HOST;
        const token = tokenInput.value;
        const enabled = document.getElementById('enabled').checked;

        if (!host) {
            hostInput.parentElement.classList.add('error');
            setTimeout(() => {
                hostInput.parentElement.classList.remove('error');
            }, 820);
            return;
        }

        chrome.storage.local.set({ host: host, token: token, enabled: enabled }, function () {
            saveButton.classList.add('success');

            setTimeout(function () {
                saveButton.classList.remove('success');
            }, 1500);
        });
    });

    toggleTokenButton.addEventListener('click', function () {
        const eyeIcon = toggleTokenButton.querySelector('.eye-icon');
        const eyeOffIcon = toggleTokenButton.querySelector('.eye-off-icon');

        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            eyeIcon.style.display = 'none';
            eyeOffIcon.style.display = 'inline';
        } else {
            tokenInput.type = 'password';
            eyeIcon.style.display = 'inline';
            eyeOffIcon.style.display = 'none';
        }
    });

    chrome.storage.local.get(['host', 'token'], function (result) {
        hostInput.value = result.host || DEFAULT_HOST;
        if (result.token) {
            tokenInput.value = result.token;
        }
    });
});