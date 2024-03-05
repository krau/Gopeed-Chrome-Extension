'use strict';
import { Client } from "../node_modules/@gopeed/rest";
let cilent = new Client();
chrome.storage.local.get(['host', 'token'], function (data) {
  const host = data.host;
  const token = data.token;
  cilent = new Client({
    host: host,
    token: token
  });
});

chrome.downloads.onCreated.addListener(async function (downloadItem) {
  console.log('onCreated', downloadItem.finalUrl);
  chrome.downloads.cancel(downloadItem.id);
  try {
    await cilent.createTask({
      req: {
        url: downloadItem.finalUrl,
      },
      opt: {
        selectFiles: [0]
      }
    });
  } catch (error) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: "icons/icon_48.png",
      title: 'Error when create task',
      message: 'Error message: ' + error.message,
    });
  }
})