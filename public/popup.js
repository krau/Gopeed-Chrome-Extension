document.addEventListener("DOMContentLoaded", function () {
  const saveButton = document.getElementById("saveButton");
  const hostInput = document.getElementById("host");
  const tokenInput = document.getElementById("token");
  const toggleTokenButton = document.getElementById("toggleToken");
  const enabledCheckbox = document.getElementById("enabled");
  const customDownloadOptionsCheckbox = document.getElementById(
    "customDownloadOptions"
  );
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const currentSiteSpan = document.getElementById("currentSite");
  const addToBlacklistButton = document.getElementById("addToBlacklist");
  const blacklistItems = document.getElementById("blacklistItems");
  const searchBlacklist = document.getElementById("searchBlacklist");
  const loadMoreButton = document.getElementById("loadMore");
  const manualBlacklistInput = document.getElementById("manualBlacklistInput");
  const addManualBlacklistButton =
    document.getElementById("addManualBlacklist");

  const DEFAULT_HOST = "http://127.0.0.1:39666";
  let currentUrl = "";
  let blacklist = {};
  let displayedItems = 0;
  const itemsPerPage = 10;

  chrome.storage.local.get(
    ["host", "token", "enabled", "customDownloadOptions", "blacklist"],
    function (result) {
      hostInput.value = result.host || DEFAULT_HOST;
      tokenInput.value = result.token || "";
      enabledCheckbox.checked = result.enabled !== false;
      customDownloadOptionsCheckbox.checked =
        result.customDownloadOptions || false;
      blacklist = result.blacklist || {};
      displayBlacklistItems();
      updateCurrentSiteButton();
    }
  );

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].url) {
      currentUrl = tabs[0].url;
      currentSiteSpan.textContent = new URL(currentUrl).hostname;
      updateCurrentSiteButton();
    } else {
      currentSiteSpan.textContent = "无法获取当前网站";
      addToBlacklistButton.style.display = "none";
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");

      const slider = document.querySelector(".slider");
      if (button.dataset.tab === "blacklist") {
        slider.style.transform = "translateX(100%)";
      } else {
        slider.style.transform = "translateX(0)";
      }
    });
  });

  saveButton.addEventListener("click", function () {
    const host = hostInput.value || DEFAULT_HOST;
    const token = tokenInput.value;
    const enabled = enabledCheckbox.checked;
    const customDownloadOptions = customDownloadOptionsCheckbox.checked;

    if (!isValidUrl(host)) {
      showError(hostInput, "无效的 URL 格式");
      return;
    }

    chrome.storage.local.set(
      {
        host: host,
        token: token,
        enabled: enabled,
        customDownloadOptions: customDownloadOptions,
      },
      function () {
        saveButton.classList.add("success");
        setTimeout(() => saveButton.classList.remove("success"), 1500);
      }
    );
  });

  toggleTokenButton.addEventListener("click", function () {
    const eyeIcon = toggleTokenButton.querySelector(".eye-icon");
    const eyeOffIcon = toggleTokenButton.querySelector(".eye-off-icon");

    if (tokenInput.type === "password") {
      tokenInput.type = "text";
      eyeIcon.style.display = "none";
      eyeOffIcon.style.display = "inline";
    } else {
      tokenInput.type = "password";
      eyeIcon.style.display = "inline";
      eyeOffIcon.style.display = "none";
    }
  });

  addToBlacklistButton.addEventListener("click", function () {
    if (currentUrl) {
      const hostname = new URL(currentUrl).hostname;
      toggleBlacklistItem(hostname);
    }
  });

  addManualBlacklistButton.addEventListener("click", function () {
    const manualInput = manualBlacklistInput.value.trim();
    if (manualInput && isValidDomain(manualInput)) {
      toggleBlacklistItem(manualInput);
      manualBlacklistInput.value = "";
      manualBlacklistInput.classList.remove("invalid");
      document
        .querySelector(".manual-input .error-message")
        .classList.remove("show");
    } else {
      manualBlacklistInput.classList.add("invalid");
      document
        .querySelector(".manual-input .error-message")
        .classList.add("show");
    }
  });

  searchBlacklist.addEventListener("input", function () {
    displayBlacklistItems(false, true);
  });

  loadMoreButton.addEventListener("click", function () {
    displayBlacklistItems(true);
  });

  function toggleBlacklistItem(hostname) {
    if (blacklist.hasOwnProperty(hostname)) {
      delete blacklist[hostname];
    } else {
      blacklist[hostname] = {};
    }
    chrome.storage.local.set({ blacklist: blacklist }, function () {
      displayBlacklistItems();
      updateCurrentSiteButton();
      chrome.runtime.sendMessage({
        action: "updateBlacklist",
        blacklist: blacklist,
      });
    });
  }

  function updateCurrentSiteButton() {
    if (currentUrl) {
      const hostname = new URL(currentUrl).hostname;
      if (blacklist.hasOwnProperty(hostname)) {
        addToBlacklistButton.textContent = "移除";
        addToBlacklistButton.classList.add("in-blacklist");
      } else {
        addToBlacklistButton.textContent = "添加";
        addToBlacklistButton.classList.remove("in-blacklist");
      }
    }
  }

  function displayBlacklistItems(loadMore = false, isSearch = false) {
    const searchTerm = searchBlacklist.value.toLowerCase();
    const filteredBlacklist = Object.keys(blacklist).filter((item) =>
      item.toLowerCase().includes(searchTerm)
    );

    if (!loadMore || isSearch) {
      blacklistItems.innerHTML = "";
      displayedItems = 0;
    }

    const fragment = document.createDocumentFragment();
    const itemsToShow = Math.min(
      itemsPerPage,
      filteredBlacklist.length - displayedItems
    );

    for (let i = 0; i < itemsToShow; i++) {
      const item = filteredBlacklist[displayedItems + i];
      const li = document.createElement("li");
      li.textContent = item;
      const removeButton = document.createElement("button");
      removeButton.textContent = "删除";
      removeButton.addEventListener("click", function () {
        toggleBlacklistItem(item);
      });
      li.appendChild(removeButton);
      if (!isSearch) {
        li.style.animation = "none";
        li.offsetHeight;
        li.style.animation = null;
      }
      fragment.appendChild(li);
    }

    blacklistItems.appendChild(fragment);
    displayedItems += itemsToShow;

    loadMoreButton.style.display =
      displayedItems < filteredBlacklist.length ? "block" : "none";
  }

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  function isValidDomain(domain) {
    const re = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
    return re.test(domain);
  }

  function showError(inputElement, message) {
    const inputGroup =
      inputElement.closest(".input-group") || inputElement.parentNode;
    inputGroup.classList.add("error");
    let errorMessage = inputGroup.querySelector(".error-message");
    if (!errorMessage) {
      errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      inputGroup.appendChild(errorMessage);
    }
    errorMessage.textContent = message;

    setTimeout(() => {
      inputGroup.classList.remove("error");
      errorMessage.remove();
    }, 3000);
  }

  document.querySelectorAll(".input-group input").forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentNode.classList.add("focus");
    });
    input.addEventListener("blur", function () {
      if (this.value === "") {
        this.parentNode.classList.remove("focus");
      }
    });
  });
});
