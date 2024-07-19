document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const successMessage = document.getElementById('successMessage');
    chrome.storage.local.get(['enabled'], function (result) {
        if (result.enabled === undefined) {
            chrome.storage.local.set({ enabled: true });
            document.getElementById('enabled').checked = true;
        } else {
            document.getElementById('enabled').checked = result.enabled;
        }
    });
    saveButton.addEventListener('click', function () {
        const host = document.getElementById('host').value;
        const token = document.getElementById('token').value;
        const enabled = document.getElementById('enabled').checked;
        chrome.storage.local.set({ host: host, token: token, enabled: enabled }, function () {
            successMessage.style.display = 'block';
            setTimeout(function () {
                successMessage.style.opacity = '1';
            }, 10);
            setTimeout(function () {
                successMessage.style.opacity = '0';
                setTimeout(function () {
                    successMessage.style.display = 'none';
                }, 500);
            }, 2000);
        });
    });
    chrome.storage.local.get(['host', 'token'], function (result) {
        if (result.host) {
            document.getElementById('host').value = result.host;
        }
        if (result.token) {
            document.getElementById('token').value = result.token;
        }
    });
});