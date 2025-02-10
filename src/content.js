const notificationContainer = document.createElement("div");
notificationContainer.style.cssText = `
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    z-index: 999999 !important;
    display: flex !important;
    flex-direction: column-reverse !important;
    gap: 12px !important;
    pointer-events: none !important;
`;
document.body.appendChild(notificationContainer);

let notificationCount = 0;
const maxNotifications = 5;

function createNotification(message, color) {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const notification = document.createElement("div");
  notification.style.cssText = `
        padding: 16px !important;
        background-color: ${isDarkMode ? '#1a1a1a' : '#ffffff'} !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 12px ${isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)'} !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        opacity: 0 ;
        transform: translateX(20px) !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif !important;
        min-width: 320px !important;
        max-width: 400px !important;
        border-left: 4px solid ${color || '#219653'} !important;
        pointer-events: auto !important;
    `;

  const header = document.createElement("div");
  header.style.cssText = `
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        margin-bottom: 12px !important;
    `;

  const title = document.createElement("div");
  title.textContent = "Gopeed";
  title.style.cssText = `
        font-size: 13px !important;
        font-weight: 600 !important;
        color: ${color || '#219653'} !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
    `;

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "×";
  closeButton.style.cssText = `
        background: none !important;
        border: none !important;
        color: #666 !important;
        font-size: 20px !important;
        cursor: pointer !important;
        padding: 0 4px !important;
        line-height: 1 !important;
        opacity: 0.7 !important;
        transition: opacity 0.2s ease !important;
    `;
  closeButton.addEventListener("mouseover", () => {
    closeButton.style.opacity = "1 !important";
  });
  closeButton.addEventListener("mouseout", () => {
    closeButton.style.opacity = "0.7 !important";
  });
  closeButton.addEventListener("click", () => {
    notification.style.opacity = "0 ";
    notification.style.transform = "translateX(20px) !important";
    setTimeout(() => {
      notificationContainer.removeChild(notification);
      notificationCount--;
    }, 300);
  });

  header.appendChild(title);
  header.appendChild(closeButton);

  let fileName = '';
  let fileSize = '';
  if (typeof message === 'string' && message.includes('MB')) {
    const parts = message.split(',');
    if (parts.length === 2) {
      fileName = parts[0].trim();
      fileSize = parts[1].trim();
    } else {
      fileName = message;
    }
  } else {
    fileName = message;
  }

  const contentWrapper = document.createElement("div");
  contentWrapper.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        gap: 4px !important;
    `;

  const nameContent = document.createElement("div");
  nameContent.textContent = fileName;
  nameContent.style.cssText = `
        font-size: 14px !important;
        font-weight: 500 !important;
        color: ${isDarkMode ? '#e1e1e1' : '#2c3e50'} !important;
        line-height: 1.5 !important;
        margin: 0 !important;
        word-break: break-word !important;
    `;

  contentWrapper.appendChild(nameContent);

  if (fileSize) {
    const sizeContent = document.createElement("div");
    sizeContent.textContent = fileSize;
    sizeContent.style.cssText = `
        font-size: 13px !important;
        color: ${isDarkMode ? '#999' : '#666'} !important;
        line-height: 1.4 !important;
        margin: 0 !important;
    `;
    contentWrapper.appendChild(sizeContent);
  }

  notification.appendChild(header);
  notification.appendChild(contentWrapper);

  notification.addEventListener("mouseover", () => {
    notification.style.transform = "translateX(0) scale(1.02) !important";
    notification.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.12) !important";
  });
  notification.addEventListener("mouseout", () => {
    notification.style.transform = "translateX(0) scale(1) !important";
    notification.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08) !important";
  });

  return notification;
}

function showNotification(message, color, timeout) {
  const notification = createNotification(message, color);
  notificationContainer.appendChild(notification);
  notificationCount++;

  while (notificationContainer.children.length > maxNotifications) {
    notificationContainer.removeChild(notificationContainer.firstChild);
    notificationCount--;
  }

  setTimeout(() => {
    notification.style.opacity = "1 ";
    notification.style.transform = "translateX(0) !important";
  }, 10);

  if (timeout !== 0) {
    setTimeout(() => {
      notification.style.opacity = "0 ";
      notification.style.transform = "translateX(20px) !important";
      setTimeout(() => {
        if (notification.parentNode === notificationContainer) {
          notificationContainer.removeChild(notification);
          notificationCount--;
        }
      }, 300);
    }, timeout || 5000);
  }
}

async function showCustomOptionsDialog(downloadUrl, filename, fileSize) {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (!filename) {
    filename = await getFilenameFromUrl(downloadUrl);
  }

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      z-index: 1000000 !important;
      opacity: 0 ;
      transition: opacity 0.3s ease;
      background-color: rgba(0, 0, 0, 0.5) !important;
      backdrop-filter: blur(2px) !important;
      -webkit-backdrop-filter: blur(2px) !important;
    `;

    const dialog = document.createElement("div");
    dialog.style.cssText = `
      background-color: ${isDarkMode ? '#1a1a1a' : '#ffffff'} !important;
      padding: 36px !important;
      border-radius: 28px !important;
      box-shadow: 0 10px 50px ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'}, 0 6px 12px ${isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.08)'} !important;
      max-width: 460px !important;
      width: 90% !important;
      transform: scale(0.95) translateY(20px) !important;
      opacity: 0 !important;
      transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1) !important;
      box-sizing: border-box !important;
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'} !important;
      text-align: left !important;
      pointer-events: auto !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      background: ${isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
    `;

    dialog.innerHTML = `
      <div style="text-align: left !important; margin-bottom: 32px !important;">
        <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 24px !important;">
          <h2 style="margin: 0 !important; color: ${isDarkMode ? '#ffffff' : '#1a1a1a'} !important; font-size: 24px !important; font-weight: 700 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif !important; line-height: 1.3 !important; letter-spacing: -0.5px !important;">自定义下载选项</h2>
          <div style="display: flex !important; align-items: center !important; gap: 8px !important;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="color: #219653 !important;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="color: #219653 !important; font-size: 14px !important; font-weight: 600 !important;">${(fileSize / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        </div>
      </div>

      <div style="display: flex !important; flex-direction: column !important; gap: 24px !important;">
        <div class="input-group" style="position: relative !important;">
          <label for="customUrlInput" style="display: block !important; margin-bottom: 8px !important; color: ${isDarkMode ? '#e1e1e1' : '#4a4a4a'} !important; font-size: 13px !important; font-weight: 600 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important;">下载链接</label>
          <div style="position: relative !important;">
            <input type="text" id="customUrlInput" value="${downloadUrl}" style="width: calc(100% - 56px) !important; max-width: 100% !important; min-width: 0 !important; padding: 14px 16px !important; padding-left: 40px !important; border: 2px solid ${isDarkMode ? '#333' : '#e8e8e8'} !important; border-radius: 12px !important; font-size: 14px !important; transition: all 0.2s ease-in-out !important; background: ${isDarkMode ? '#2d2d2d' : '#ffffff'} !important; color: ${isDarkMode ? '#e1e1e1' : '#2c3e50'} !important; outline: none !important; box-sizing: border-box !important;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="position: absolute !important; left: 14px !important; top: 50% !important; transform: translateY(-50%) !important; color: ${isDarkMode ? '#666' : '#999'} !important;">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="input-group" style="position: relative !important;">
          <label for="customNameInput" style="display: block !important; margin-bottom: 8px !important; color: ${isDarkMode ? '#e1e1e1' : '#4a4a4a'} !important; font-size: 13px !important; font-weight: 600 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important;">文件名</label>
          <div style="position: relative !important;">
            <input type="text" id="customNameInput" value="${filename}" style="width: calc(100% - 56px) !important; max-width: 100% !important; min-width: 0 !important; padding: 14px 16px !important; padding-left: 40px !important; border: 2px solid ${isDarkMode ? '#333' : '#e8e8e8'} !important; border-radius: 12px !important; font-size: 14px !important; transition: all 0.2s ease-in-out !important; background: ${isDarkMode ? '#2d2d2d' : '#ffffff'} !important; color: ${isDarkMode ? '#e1e1e1' : '#2c3e50'} !important; outline: none !important; box-sizing: border-box !important;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="position: absolute !important; left: 14px !important; top: 50% !important; transform: translateY(-50%) !important; color: ${isDarkMode ? '#666' : '#999'} !important;">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 2v7h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="input-group" style="position: relative !important;">
          <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 8px !important;">
            <label for="connectionsSlider" style="color: ${isDarkMode ? '#e1e1e1' : '#4a4a4a'} !important; font-size: 13px !important; font-weight: 600 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important;">线程数</label>
            <div style="display: flex !important; align-items: center !important; gap: 8px !important;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: #219653 !important;">
                <path d="M16 3v18M8 3v18M3 8h18M3 16h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span id="connectionsValue" style="color: #219653 !important; font-weight: 600 !important; font-size: 14px !important;">32</span>
            </div>
          </div>
          <input type="range" id="connectionsSlider" min="1" max="32" value="32" style="
            width: calc(100% - 16px) !important;
            max-width: 100% !important;
            min-width: 0 !important;
            -webkit-appearance: none !important;
            height: 6px !important;
            background: ${isDarkMode ? '#333' : '#e8e8e8'} !important;
            border-radius: 6px !important;
            outline: none !important;
            opacity: 1 !important;
            transition: opacity 0.2s !important;
            cursor: pointer !important;
            box-sizing: border-box !important;
            margin: 8px !important;
          ">
        </div>
      </div>

      <div style="display: flex !important; justify-content: flex-end !important; gap: 12px !important; margin-top: 32px !important;">
        <button id="cancelButton" style="
          padding: 12px 24px !important;
          background-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'} !important;
          color: ${isDarkMode ? '#e1e1e1' : '#4a4a4a'} !important;
          border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'} !important;
          border-radius: 12px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease-in-out !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: currentColor !important;">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          取消
        </button>
        <button id="confirmButton" style="
          padding: 12px 32px !important;
          background: linear-gradient(135deg, #219653, #27ae60) !important;
          color: white !important;
          border: none !important;
          border-radius: 12px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease-in-out !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          box-shadow: 0 4px 12px rgba(33, 150, 83, 0.2) !important;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: currentColor !important;">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          确认下载
        </button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const customUrlInput = document.getElementById("customUrlInput");
    const customNameInput = document.getElementById("customNameInput");
    const connectionsSlider = document.getElementById("connectionsSlider");
    const connectionsValue = document.getElementById("connectionsValue");
    const cancelButton = document.getElementById("cancelButton");
    const confirmButton = document.getElementById("confirmButton");

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.style.opacity = "0 ";
        dialog.style.transform = "scale(0.95) translateY(20px) !important";
        dialog.style.opacity = "0 ";
        setTimeout(() => document.body.removeChild(overlay), 300);
        resolve({ cancelled: true });
      }
    });

    setTimeout(() => {
      overlay.style.opacity = "1 ";
      dialog.style.transform = "scale(1) translateY(0) !important";
      dialog.style.opacity = "1 ";
    }, 50);

    [customUrlInput, customNameInput].forEach((input) => {
      input.addEventListener("focus", () => {
        input.style.borderColor = "#219653 !important";
        input.style.boxShadow = "0 0 0 3px rgba(33, 150, 83, 0.08) !important";
        input.style.backgroundColor = isDarkMode ? "#2d2d2d" : "#ffffff" + " !important";
      });
      input.addEventListener("blur", () => {
        input.style.borderColor = isDarkMode ? "#333" : "#e8e8e8" + " !important";
        input.style.boxShadow = "none !important";
        input.style.backgroundColor = isDarkMode ? "#2d2d2d" : "#ffffff" + " !important";
      });
    });

    [cancelButton, confirmButton].forEach((button) => {
      button.addEventListener("mouseover", () => {
        if (button.id === 'cancelButton') {
          button.style.backgroundColor = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)" + " !important";
          button.style.transform = "translateY(-1px) !important";
        } else {
          button.style.transform = "translateY(-2px) !important";
          button.style.boxShadow = "0 6px 20px rgba(33, 150, 83, 0.25) !important";
        }
      });
      button.addEventListener("mouseout", () => {
        if (button.id === 'cancelButton') {
          button.style.backgroundColor = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)" + " !important";
          button.style.transform = "translateY(0) !important";
        } else {
          button.style.transform = "translateY(0) !important";
          button.style.boxShadow = "0 4px 12px rgba(33, 150, 83, 0.2) !important";
        }
      });
    });

    connectionsSlider.style.setProperty(
      "--slider-thumb-color",
      "#219653",
      "important"
    );
    connectionsSlider.style.setProperty(
      "--slider-track-color",
      "#219653",
      "important"
    );

    function updateSlider() {
      connectionsValue.textContent = connectionsSlider.value;
      const percent =
        ((connectionsSlider.value - connectionsSlider.min) /
          (connectionsSlider.max - connectionsSlider.min)) *
        100;
      connectionsSlider.style.background = `linear-gradient(to right, #219653 0%, #219653 ${percent}%, #e0e0e0 ${percent}%, #e0e0e0 100%) !important`;
    }

    connectionsSlider.addEventListener("input", updateSlider);

    updateSlider();

    cancelButton.addEventListener("click", () => {
      overlay.style.opacity = "0 ";
      dialog.style.transform = "scale(0.95) translateY(20px) !important";
      dialog.style.opacity = "0 ";
      setTimeout(() => document.body.removeChild(overlay), 300);
      resolve({ cancelled: true });
    });

    confirmButton.addEventListener("click", () => {
      const customOptions = {
        url: customUrlInput.value.trim(),
        name: customNameInput.value.trim(),
        connections: parseInt(connectionsSlider.value),
      };
      overlay.style.opacity = "0 ";
      dialog.style.transform = "scale(0.95) translateY(20px) !important";
      dialog.style.opacity = "0 ";
      setTimeout(() => document.body.removeChild(overlay), 300);
      resolve(customOptions);
    });
  });
}

async function getFilenameFromUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentDisposition = response.headers.get("content-disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        return filenameMatch[1];
      }
    }
    const urlParts = url.split("/");
    return urlParts[urlParts.length - 1] || "unknown_file";
  } catch (error) {
    console.error("Error fetching filename:", error);
    return "unknown_file";
  }
}

chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
  if (message.action === "showNotification") {
    showNotification(message.message, message.color, message.timeout);
  } else if (message.action === "showCustomOptionsDialog") {
    showCustomOptionsDialog(
      message.downloadUrl,
      message.filename,
      message.fileSize
    ).then((result) => sendResponse(result));
    return true;
  }
});
