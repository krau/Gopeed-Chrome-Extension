document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const successMessage = document.getElementById('successMessage');

    chrome.storage.local.get(['enableNotification'], function (result) {
        if (result.enableNotification === undefined) {
            chrome.storage.local.set({ enableNotification: true });
            document.getElementById('enableNotification').checked = true;
        } else {
            document.getElementById('enableNotification').checked = result.enableNotification;
        }
    });

    saveButton.addEventListener('click', function () {
        const host = document.getElementById('host').value;
        const token = document.getElementById('token').value;
        const enableNotification = document.getElementById('enableNotification').checked;
        chrome.storage.local.set({ host: host, token: token, enableNotification: enableNotification }, function () {
            successMessage.style.display = 'block';
            setTimeout(function () {
                successMessage.style.display = 'none';
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
