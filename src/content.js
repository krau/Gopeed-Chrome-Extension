const notificationContainer = document.createElement("div");
notificationContainer.style.cssText = `
    position: fixed !important;
    bottom: 30px !important;
    right: 30px !important;
    z-index: 999999 !important;
`;
document.body.appendChild(notificationContainer);

let notificationCount = 0;
const maxNotifications = 5;

function createNotification(message, color) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        padding: 12px 24px !important;
        color: #fff !important;
        border-radius: 10px !important;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
        transition: all 0.3s ease !important;
        opacity: 0 ;
        transform: translateY(20px) !important;
        font-family: Arial, sans-serif !important;
        min-width: 250px !important;
        max-width: 400px !important;
        margin-top: 10px !important;
    `;
  notification.style.background = color || "#4CAF50";
  const title = document.createElement("div");
  title.textContent = "Gopeed Extension";
  title.style.cssText = `
        font-size: 12px !important;
        font-weight: normal !important;
        opacity: 0.8 ;
        margin-bottom: 8px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
    `;

  const content = document.createElement("div");
  content.textContent = message;
  content.style.cssText = `
        font-size: 16px !important;
        font-weight: bold !important;
    `;

  notification.appendChild(title);
  notification.appendChild(content);
  return notification;
}

function showNotification(message, color, timeout) {
  const notification = createNotification(message, color);
  notificationContainer.insertBefore(
    notification,
    notificationContainer.firstChild
  );
  notificationCount++;

  while (notificationContainer.children.length > maxNotifications) {
    notificationContainer.removeChild(notificationContainer.lastChild);
    notificationCount--;
  }

  Array.from(notificationContainer.children).forEach((notif, index) => {
    notif.style.transform = `translateY(${
      (notificationCount - index - 1) * 100
    }%) !important`;
  });

  setTimeout(() => {
    notification.style.opacity = "1 ";
    notification.style.transform = "translateY(0) !important";
  }, 10);

  setTimeout(() => {
    notification.style.opacity = "0 ";
    notification.style.transform = "translateY(20px) !important";
    setTimeout(() => {
      notificationContainer.removeChild(notification);
      notificationCount--;
      Array.from(notificationContainer.children).forEach((notif, index) => {
        notif.style.transform = `translateY(${
          (notificationCount - index - 1) * 100
        }%) !important`;
      });
    }, 300);
  }, timeout || 3000);
}

async function showCustomOptionsDialog(downloadUrl, filename, fileSize) {
  // Ensure filename is not empty
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
    `;

    const dialog = document.createElement("div");
    dialog.style.cssText = `
      background-color: #ffffff !important;
      padding: 40px !important;
      border-radius: 20px !important;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65) !important;
      max-width: 500px !important;
      width: 90% !important;
      transform: scale(0.9) !important;
      opacity: 0 !important;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    `;

    dialog.innerHTML = `
      <h2 style="text-align: center;margin-top: 0 !important; color: #333 !important; font-size: 28px !important; font-weight: 600 !important; margin-bottom: 30px !important;">自定义下载选项</h2>
      <p style="text-align: center;margin-bottom: 20px !important; color: #666 !important; font-size: 16px !important;">文件大小: ${(
        fileSize /
        (1024 * 1024)
      ).toFixed(2)} MB</p>
      <div style="margin-bottom: 25px !important;">
        <label for="customUrlInput" style="display: block !important; margin-bottom: 8px !important; color: #555 !important; font-size: 14px !important; font-weight: 500 !important;">下载链接:</label>
        <input type="text" id="customUrlInput" value="${downloadUrl}" style="background-color:white!important;color:black!important;width:100% !important; padding: 12px 15px !important; border: 1px solid #e0e0e0 !important; border-radius: 8px !important; font-size: 16px !important; transition: all 0.3s ease !important;">
      </div>
      <div style="margin-bottom: 25px !important;">
        <label for="customNameInput" style="display: block !important; margin-bottom: 8px !important; color: #555 !important; font-size: 14px !important; font-weight: 500 !important;">文件名:</label>
        <input type="text" id="customNameInput" value="${filename}" style="background-color:white!important;color:black!important;width: 100% !important; padding: 12px 15px !important; border: 1px solid #e0e0e0 !important; border-radius: 8px !important; font-size: 16px !important; transition: all 0.3s ease !important;">
      </div>
      <div style="margin-bottom: 30px !important;">
        <label for="connectionsSlider" style="display: block !important; margin-bottom: 8px !important; color: #555 !important; font-size: 14px !important; font-weight: 500 !important;">线程数: <span id="connectionsValue" style="font-weight: 600 !important; color: #4CAF50 !important;">1</span></label>
        <input type="range" id="connectionsSlider" min="1" max="32" value="32" style="width: 100% !important; -webkit-appearance: none !important; height: 6px !important; background: #e0e0e0 !important; border-radius: 3px !important; outline: none !important; opacity: 0.7 ; transition: opacity 0.2s ;">
      </div>
      <div style="display: flex !important; justify-content: flex-end !important;">
        <button id="cancelButton" style="margin-right: 15px !important; padding: 12px 25px !important; background-color: #f1f3f5 !important; color: #333 !important; border: none !important; border-radius: 8px !important; cursor: pointer !important; font-size: 16px !important; font-weight: 500 !important; transition: all 0.3s ease !important;">取消</button>
        <button id="confirmButton" style="padding: 12px 25px !important; background-color: #4CAF50 !important; color: white !important; border: none !important; border-radius: 8px !important; cursor: pointer !important; font-size: 16px !important; font-weight: 500 !important; transition: all 0.3s ease !important;">确认</button>
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

    // Fade in animation
    setTimeout(() => {
      overlay.style.opacity = "1 ";
      dialog.style.transform = "scale(1) !important";
      dialog.style.opacity = "1 ";
    }, 50);

    // Custom slider styles
    connectionsSlider.style.setProperty(
      "--slider-thumb-color",
      "#4CAF50",
      "important"
    );
    connectionsSlider.style.setProperty(
      "--slider-track-color",
      "#4CAF50",
      "important"
    );

    function updateSlider() {
      connectionsValue.textContent = connectionsSlider.value;
      const percent =
        ((connectionsSlider.value - connectionsSlider.min) /
          (connectionsSlider.max - connectionsSlider.min)) *
        100;
      connectionsSlider.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${percent}%, #e0e0e0 ${percent}%, #e0e0e0 100%) !important`;
    }

    connectionsSlider.addEventListener("input", updateSlider);

    updateSlider();

    [customUrlInput, customNameInput].forEach((input) => {
      input.addEventListener("focus", () => {
        input.style.borderColor = "#4CAF50 !important";
        input.style.boxShadow = "0 0 0 3px rgba(76, 175, 80, 0.2) !important";
      });
      input.addEventListener("blur", () => {
        input.style.borderColor = "#e0e0e0 !important";
        input.style.boxShadow = "none !important";
      });
    });

    [cancelButton, confirmButton].forEach((button) => {
      button.addEventListener("mouseover", () => {
        button.style.transform = "translateY(-2px) !important";
        button.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1) !important";
      });
      button.addEventListener("mouseout", () => {
        button.style.transform = "translateY(0) !important";
        button.style.boxShadow = "none !important";
      });
    });

    cancelButton.addEventListener("click", () => {
      overlay.style.opacity = "0 ";
      dialog.style.transform = "scale(0.9) !important";
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
      dialog.style.transform = "scale(0.9) !important";
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

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
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
