document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const successMessage = document.getElementById('successMessage');

    saveButton.addEventListener('click', function () {
        const host = document.getElementById('host').value;
        const token = document.getElementById('token').value;
        chrome.storage.local.set({ host: host, token: token }, function () {
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
