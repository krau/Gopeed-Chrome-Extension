'use strict';

import { Client } from "../node_modules/@gopeed/rest";

chrome.storage.local.get(['host', 'token', 'enableNotification'], function (data) {
  const host = data.host;
  const token = data.token;
  const client = new Client({
    host: host,
    token: token
  });

  chrome.downloads.onCreated.addListener(async function (downloadItem) {
    chrome.downloads.cancel(downloadItem.id);
    try {
      await client.createTask({
        req: {
          url: downloadItem.finalUrl,
        },
        opt: {
          selectFiles: [0]
        }
      });
      chrome.notifications.create({
        type: 'basic',
        iconUrl: "icons/icon_48.png",
        title: 'Create task success',
        message: 'Size: ' + (downloadItem.fileSize / (1024 * 1024)).toFixed(2) + 'MB',
      });
    } catch (error) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: "icons/icon_48.png",
        title: 'Error when create task',
        message: 'Error message: ' + error.message,
      });
    }
  });
});
