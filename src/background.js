"use strict";
import { Client } from "../node_modules/@gopeed/rest";

const Settings = {
  host: "http://localhost:39666",
  token: "qwqowo",
  enabled: true,
  customDownloadOptions: false,
  smallFileMode: false,
  smallFileSize: 10,
};

let client;

const smallFileDownloads = new Set();

const initSettings = async () => {
  const items = await chrome.storage.local.get([
    "host",
    "token",
    "enabled",
    "customDownloadOptions",
    "blacklist",
    "smallFileMode",
    "smallFileSize",
  ]);
  Object.assign(Settings, items);
  client = new Client({
    host: Settings.host,
    token: Settings.token,
  });
};

chrome.storage.onChanged.addListener((changes) => {
  for (let [key, { newValue }] of Object.entries(changes)) {
    if (key in Settings) {
      Settings[key] = newValue;
    }
  }
  client = new Client({
    host: Settings.host,
    token: Settings.token,
  });
});

const INFOCOLOR = "#6699FF";
const ERRORCOLOR = "#FF3366";

async function isUrlInBlacklist(url) {
  const result = await chrome.storage.local.get(["blacklist"]);
  const blacklist = result.blacklist || {};
  const hostname = new URL(url).hostname;
  return blacklist.hasOwnProperty(hostname);
}

async function handleDownload(downloadUrl, sourceUrl, filename, fileSize) {
  try {
    const isSmallFile = Settings.smallFileMode && fileSize && fileSize <= Settings.smallFileSize * 1024 * 1024;
    
    if (isSmallFile) {
      console.log(`Small file detected (${fileSize} bytes), using browser download`);
      
      smallFileDownloads.add(downloadUrl);
      
      chrome.downloads.download({
        url: downloadUrl,
        filename: filename,
        saveAs: false
      });
      
      setTimeout(() => {
        smallFileDownloads.delete(downloadUrl);
      }, 5000);
      
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "showNotification",
          message: `使用浏览器下载小文件: ${filename}, 文件大小: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`,
          color: INFOCOLOR
        });
      }
      return;
    }

    let customOptions = {
      url: downloadUrl,
      name: filename,
      connections: 1,
    };

    const isSmallFileMode = Settings.smallFileMode && fileSize && fileSize <= Settings.smallFileSize * 1024 * 1024;
    
    if (Settings.customDownloadOptions && !isSmallFileMode) {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length > 0) {
        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: "showCustomOptionsDialog",
          downloadUrl: downloadUrl,
          filename: filename,
          fileSize: fileSize,
        });

        if (response && !response.cancelled) {
          customOptions = response;
        } else if (response && response.cancelled) {
          console.log("Download cancelled by user");
          return;
        }
      }
    }

    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await client.createTask({
          req: {
            url: customOptions.url,
            extra: {
              header: {
                Referer: sourceUrl || customOptions.url,
              },
            },
          },
          opt: {
            name: customOptions.name,
            extra: {
              connections: isSmallFileMode ? 1 : customOptions.connections,
            },
          },
        });
        break;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        console.log(`Retry ${i + 1} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "showNotification",
        message: `${customOptions.name}, 文件大小: ${(
          fileSize /
          (1024 * 1024)
        ).toFixed(2)}MB${isSmallFileMode ? " (小文件单线程下载)" : ""}`,
      });
    }
  } catch (error) {
    console.error("Error in handleDownload:", error);
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "showNotification",
        message: `下载${filename}失败: ${error.message}`,
        color: ERRORCOLOR,
        timeout: 4000,
      });
    }
  }
}

const pendingDownloads = new Map();

chrome.downloads.onCreated.addListener((item) => {
  if (!Settings.enabled) return;

  const downloadUrl = item.finalUrl || item.url;

  if (downloadUrl.startsWith("blob:") || downloadUrl.startsWith("data:")) {
    console.log(
      `Download URL ${downloadUrl} starts with blob: or data:, not intercepting.`
    );
    return;
  }

  if (smallFileDownloads.has(downloadUrl)) {
    console.log(`Small file download detected for ${downloadUrl}, skipping interception`);
    return;
  }

  pendingDownloads.set(item.id, { item, status: "created" });
  chrome.downloads.pause(item.id);
});

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  if (!Settings.enabled) {
    suggest();
    return;
  }

  const pendingDownload = pendingDownloads.get(item.id);
  if (pendingDownload) {
    pendingDownload.status = "filename_determined";
    pendingDownload.filename = item.filename;
    processDownload(item.id);
  }
  suggest();
});

async function processDownload(downloadId) {
  const pendingDownload = pendingDownloads.get(downloadId);
  if (!pendingDownload || pendingDownload.status !== "filename_determined")
    return;

  const { item, filename } = pendingDownload;
  pendingDownloads.delete(downloadId);

  const downloadUrl = item.finalUrl || item.url;
  const sourceUrl = item.referrer || item.url;

  try {
    const isInBlacklist = await isUrlInBlacklist(sourceUrl);
    if (isInBlacklist) {
      console.log(`${sourceUrl} is in blacklist, not intercepting download.`);
      chrome.downloads.resume(downloadId);
      return;
    }

    console.log("Intercepting download:", downloadUrl);

    await chrome.downloads.cancel(downloadId);
    console.log(`Successfully cancelled download with id: ${downloadId}`);

    await handleDownload(downloadUrl, sourceUrl, filename, item.fileSize);
  } catch (error) {
    console.error("Error processing download:", error);
    chrome.downloads.resume(downloadId);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: "createTask",
    title: "使用Gopeed下载",
    contexts: ["link", "image", "video", "audio"],
  });
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  await initSettings();
  let downloadUrl =
    info.linkUrl || info.srcUrl || info.frameUrl || info.pageUrl;
  if (!downloadUrl) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showNotification",
      message: "下载失败, 无法获取下载链接",
      color: ERRORCOLOR,
    });
    return;
  }

  if (downloadUrl.startsWith("blob:") || downloadUrl.startsWith("data:")) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showNotification",
      message: "无法拦截 blob: 或 data: 开头的下载链接",
      color: INFOCOLOR,
      timeout: 3000,
    });
    return;
  }

  chrome.tabs.sendMessage(tab.id, {
    action: "showNotification",
    message: "正在获取下载链接...",
    color: INFOCOLOR,
    timeout: 1500,
  });

  try {
    const resolveResult = await client.resolve({
      url: downloadUrl,
      extra: {
        header: {
          Referer: tab.url || downloadUrl,
        },
      },
    });
    await handleDownload(
      downloadUrl,
      tab.url,
      resolveResult.res.files[0].name,
      resolveResult.res.files[0].size
    );
  } catch (error) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showNotification",
      message: `下载${downloadUrl}失败: ${error.message}`,
      color: ERRORCOLOR,
      timeout: 4000,
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === "updateBlacklist") {
    chrome.storage.local.set({ blacklist: message.blacklist });
  }
});

await initSettings();
