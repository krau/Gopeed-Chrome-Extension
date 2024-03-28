document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const successMessage = document.getElementById('successMessage');

    // 设置默认值
    chrome.storage.local.get(['enableNotification'], function (result) {
        if (result.enableNotification === undefined) { // 如果存储中没有enableNotification键
            chrome.storage.local.set({ enableNotification: true }); // 将默认值设置为true
            document.getElementById('enableNotification').checked = true; // 设置复选框为选中状态
        } else {
            document.getElementById('enableNotification').checked = result.enableNotification; // 否则，根据存储中的值设置复选框状态
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
