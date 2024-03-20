'use strict';

import { Client } from "../node_modules/@gopeed/rest";

chrome.storage.local.get(['host', 'token', 'enableNotification'], function (data) {
  const host = data.host;
  const token = data.token;
  const client = new Client({
    host: host,
    token: token
  });

  chrome.downloads.onDeterminingFilename.addListener(async function (item) {
    await chrome.downloads.cancel(item.id)
    if (item.state === "complete") {
      await chrome.downloads.removeFile(item.id);
    }

    const downloadUrl = item.finalUrl;

    try {
      await client.createTask({
        req: {
          url: downloadUrl,
        },
        opt: {
          name: item.filename,
          selectFiles: [0]
        }
      });
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: "icons/icon_48.png",
        title: 'Create task success',
        message: 'Size: ' + (item.fileSize / (1024 * 1024)).toFixed(2) + 'MB',
      });
    } catch (error) {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: "icons/icon_48.png",
        title: 'Error when create task',
        message: 'Error message: ' + error.message,
      });
    }
  });
});
