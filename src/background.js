'use strict';

import { Client } from "../node_modules/@gopeed/rest";

const Settings = {
  host: 'http://localhost:39666',
  token: 'qwqowo',
  enableNotification: true,
  enabled: true,
}

let client;

const initStorage = chrome.storage.local.get().then((items) => {
  Object.assign(Settings, items);
  client = new Client({
    host: Settings.host,
    token: Settings.token
  });
});

const sendSuccessNotification = async (message) => {
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: "icons/icon_48.png",
    title: '已创建下载任务',
    message: message,
  });
}

const sendErrorNotification = async (message) => {
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: "icons/icon_48.png",
    title: '创建下载任务失败',
    message: message,
  });
}

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
  if (changes.enabled) {
    Settings.enabled = changes.enabled.newValue;
  }
  client = new Client({
    host: Settings.host,
    token: Settings.token
  });
});

chrome.downloads.onDeterminingFilename.addListener(async function (item) {
  await initStorage;
  if (!Settings.enabled) {
    return;
  }
  await chrome.downloads.cancel(item.id);
  try {
    const downloadUrl = item.finalUrl;
    await client.createTask({
      req: {
        url: downloadUrl,
        extra: {
          header: {
            "Referer": item.referrer || item.url || downloadUrl,
          }
        },
      },
      opt: {
        name: item.filename,
      }
    });
    if (Settings.enableNotification) {
      await sendSuccessNotification('文件大小: ' + (item.fileSize / (1024 * 1024)).toFixed(2) + 'MB');
    }
  } catch (error) {
    await sendErrorNotification('错误信息: ' + error.message);
  }
});

chrome.contextMenus.create({
  id: 'createTask',
  title: '使用Gopeed下载',
  contexts: ['link', 'image', 'video', 'audio'],
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  await initStorage;
  console.log(info);
  try {
    let downloadUrl = info.linkUrl || info.srcUrl || info.frameUrl;
    if (info.mediaType) {
      downloadUrl = info.frameUrl || downloadUrl;
    }
    if (!downloadUrl) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: "icons/icon_48.png",
        title: '创建下载任务失败',
        message: '无法获取下载链接',
      });
    }
    const resolveResult = await client.resolve({
      url: downloadUrl,
      extra: {
        header: {
          "Referer": tab.url || downloadUrl,
        }
      }
    })
    await client.createTask({
      rid: resolveResult.id,
      opt: {
        name: resolveResult.res.files[0].name
      }
    })
    if (Settings.enableNotification) {
      await sendSuccessNotification('文件大小: ' + (resolveResult.res.files[0].size / (1024 * 1024)).toFixed(2) + 'MB');
    }
  } catch (error) {
    await sendErrorNotification('错误信息: ' + error.message);
  }
});