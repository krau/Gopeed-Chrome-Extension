const notificationContainer = document.createElement("div");
notificationContainer.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 999999;
`;
document.body.appendChild(notificationContainer);

let notificationCount = 0;
const maxNotifications = 5;

function createNotification(message, color) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        padding: 12px 24px;
        color: #fff;
        border-radius: 10px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
        font-family: Arial, sans-serif;
        min-width: 250px;
        max-width: 400px;
        margin-top: 10px;
    `;
  notification.style.background = color || "#4CAF50";
  const title = document.createElement("div");
  title.textContent = "Gopeed Extension";
  title.style.cssText = `
        font-size: 12px;
        font-weight: normal;
        opacity: 0.8;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    `;

  const content = document.createElement("div");
  content.textContent = message;
  content.style.cssText = `
        font-size: 16px;
        font-weight: bold;
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
    notif.style.transform = `translateY(${(notificationCount - index - 1) * 100
      }%)`;
  });

  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateY(0)";
  }, 10);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateY(20px)";
    setTimeout(() => {
      notificationContainer.removeChild(notification);
      notificationCount--;
      Array.from(notificationContainer.children).forEach((notif, index) => {
        notif.style.transform = `translateY(${(notificationCount - index - 1) * 100
          }%)`;
      });
    }, 300);
  }, timeout || 3000);
}

chrome.runtime.onMessage.addListener(function (
  message,
  _sender,
  _sendResponse
) {
  if (message.action === "showNotification") {
    showNotification(message.message, message.color, message.timeout);
  }
});
