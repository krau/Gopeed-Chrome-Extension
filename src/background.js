'use strict';

import { Client } from "../node_modules/@gopeed/rest";

const Settings = {
  host: 'http://localhost:39666',
  token: 'qwqowo',
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

chrome.storage.onChanged.addListener((changes) => {
  if (changes.host) {
    Settings.host = changes.host.newValue;
  }
  if (changes.token) {
    Settings.token = changes.token.newValue;
  }
  if (changes.enabled) {
    Settings.enabled = changes.enabled.newValue;
  }
  client = new Client({
    host: Settings.host,
    token: Settings.token
  });
});

const INFOCOLOR = '#6699FF';
const ERRORCOLOR = '#FF3366';

chrome.downloads.onDeterminingFilename.addListener(async function (item) {
  console.log(item);
  if (item.mime === "application/octet-stream" && item.finalUrl.startsWith("blob:")) {
    return;
  }
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
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showNotification',
        message: `正在下载: ${item.filename}, 文件大小: ${(item.fileSize / (1024 * 1024)).toFixed(2)}MB`,
      })
    });
  } catch (error) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showNotification',
        message: `下载${item.filename}失败: ${error.message}`,
        color: ERRORCOLOR,
        timeout: 4000,
      })
    });
  }
});

await chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  id: "createTask",
  title: '使用Gopeed下载',
  contexts: ['link', 'image', 'video', 'audio'],
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  await initStorage;

  let downloadUrl = info.linkUrl || info.srcUrl || info.frameUrl;
  if (info.mediaType) {
    downloadUrl = info.frameUrl || downloadUrl;
  }
  if (!downloadUrl) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showNotification',
      message: '下载失败, 无法获取下载链接',
      color: ERRORCOLOR,
    })
    return;
  }
  chrome.tabs.sendMessage(tab.id, {
    action: 'showNotification',
    message: '正在获取下载链接...',
    color: INFOCOLOR,
    timeout: 1500,
  })
  try {
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
    chrome.tabs.sendMessage(tab.id, {
      action: 'showNotification',
      message: `正在下载: ${resolveResult.res.files[0].name}, 文件大小: ${(resolveResult.res.files[0].size / (1024 * 1024)).toFixed(2)}MB`,
    })
  } catch (error) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showNotification',
      message: `下载${downloadUrl}失败: ${error.message}`,
      color: ERRORCOLOR,
      timeout: 4000,
    })
  }
});