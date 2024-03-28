'use strict';

import { Client } from "../node_modules/@gopeed/rest";

const Settings = {
  host: 'http://localhost:39666',
  token: 'qwqowo',
  enableNotification: true
}

let client;

const initStorage = chrome.storage.local.get().then((items) => {
  Object.assign(Settings, items);
  client = new Client({
    host: Settings.host,
    token: Settings.token
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.host) {
    Settings.host = changes.host.newValue;
  }
  if (changes.token) {
    Settings.token = changes.token.newValue;
  }
  if (changes.enableNotification) {
    Settings.enableNotification = changes.enableNotification.newValue;
  }
  client = new Client({
    host: Settings.host,
    token: Settings.token
  });
});

chrome.downloads.onDeterminingFilename.addListener(async function (item) {
  await initStorage;
  await chrome.downloads.cancel(item.id);
  try {
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
    if (Settings.enableNotification) {
      await chrome.notifications.create({
        type: 'basic',
        iconUrl: "icons/icon_48.png",
        title: 'Create task success',
        message: 'Size: ' + (item.fileSize / (1024 * 1024)).toFixed(2) + 'MB',
      });
    }
  } catch (error) {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: "icons/icon_48.png",
      title: 'Error when create task',
      message: 'Error message: ' + error.message,
    });
  }
});

