'use strict';

import { Client } from "../node_modules/@gopeed/rest";

chrome.storage.local.get(['host', 'token'], async function (data) {
  const host = data.host;
  const token = data.token;
  if (!host || !token) {
    console.error('Missing host or token in storage');
    return;
  }
  const client = new Client({
    host: host,
    token: token
  });


  chrome.downloads.onDeterminingFilename.addListener(async function (item) {
    try {
      await chrome.downloads.cancel(item.id);
      if (item.state === "complete") {
        await chrome.downloads.removeFile(item.id);
      }
      const downloadUrl = item.finalUrl;
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
      console.error('Error when creating task:', error);
      if (data.enableNotification) {
        await chrome.notifications.create({
          type: 'basic',
          iconUrl: "icons/icon_48.png",
          title: 'Error when create task',
          message: 'Error message: ' + error.message,
        });
      }
    }
  });
});