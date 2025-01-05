// ==UserScript==
// @name         Blum Autoclicker JS
// @version      1.0.2
// @namespace    Violentmonkey Scripts
// @description  Blum Autoclicker WEB TG
// @author       Marshallup
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://github.com/Marshallup/blum-autoclicker-js/raw/main/logo.png
// @downloadURL  https://github.com/Marshallup/blum-autoclicker-js/raw/main/script.user.js
// @updateURL    https://github.com/Marshallup/blum-autoclicker-js/raw/main/script.user.js
// @homepage     https://github.com/Marshallup
// ==/UserScript==

(function () {
  "use strict";

  // Функция для расчета вероятности
  function executeWithProbability(probability, callback) {
    // Генерируем случайное число от 0 до 1
    const randomValue = Math.random();
    // Сравниваем его с вероятностью
    if (randomValue < probability) {
      // Если попали в вероятность, выполняем callback
      callback();
    }
  }

  // Класс для работы с localStorage
  class SettingsManager {
    constructor() {
      this.settings = {
        additionalClickModifier: 0,
        autoClickPlayButton: true,
      };
      this.settingsKey = "gameAutoclickerSettings";
    }

    loadSettings() {
      const savedStringSettings = localStorage.getItem(this.settingsKey);

      try {
        const savedSettings = JSON.parse(savedStringSettings);
        if (savedSettings) {
          this.settings = savedSettings;

          return savedSettings;
        }

        return this.settings;
      } catch {
        return this.settings;
      }
    }

    saveSettings(settings) {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));

      this.settings = settings;
    }
  }

  const settingsManager = new SettingsManager();

  settingsManager.loadSettings();

  // Вставка стилей
  function injectStyles() {
    const styles = `
      .settings-panel {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 100000000;
        width: 300px;
        background: #333;
        border: 1px solid #555;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
        font-family: Arial, sans-serif;
        color: #fff;
        opacity: 0;
        transform: translateY(-20px);
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
      }

      .settings-panel--visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .settings-panel__header {
        margin: 0;
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .settings-panel__close {
        cursor: pointer;
        background: none;
        border: none;
        color: #fff;
        font-size: 20px;
      }

      .settings-panel__field {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .settings-panel__button {
        background: #1976d2;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s;
      }

      .settings-panel__button:hover {
        background: #005bb5;
      }

      .settings-icon {
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 10000000;
        width: 40px;
        height: 40px;
        background: #333;
        border: 1px solid #555;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
        transition: background 0.3s;
      }

      .settings-icon:hover {
        background: #444;
      }

      .settings-icon__svg {
        width: 24px;
        height: 24px;
        fill: #fff;
      }

      input[type="number"],
      input[type="checkbox"] {
        background: #444;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 5px;
      }

      input[type="number"]:focus,
      input[type="checkbox"]:focus {
        outline: 2px solid #1976d2;
      }

      .settings-panel__message {
        margin-top: 10px;
        font-size: 14px;
        color: #4caf50;
        display: none;
      }

      .settings-panel__message--visible {
        display: block;
      }

      .settings-panel__field--block {
        display: block;
      }

      .settings-panel__field--block span {
        display: block;
        margin-bottom: 10px;
      }
    `;
    const styleTag = document.createElement("style");
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }

  // Панель настроек
  function createSettingsPanel(settings) {
    const panelHtml = `
      <div class="settings-panel" id="settings-panel">
          <div class="settings-panel__header">
            <span>Настройки</span>
          <button class="settings-panel__close" id="close-settings">&times;</button>
        </div>
        <div class="settings-panel__field settings-panel__field--block">
          <span>Дополнительная вероятность кликнуть на элемент (При автоклике вероятность кликнуть еще раз на элемент в процентах)</span>
          <input id="additional-click-modifier" type="number" value="${
            settings.additionalClickModifier || 0
          }" />
        </div>
        <div class="settings-panel__field">
          <span>Автоклик по кнопкам Play</span>
          <input id="auto-click-play" type="checkbox" ${
            settings.autoClickPlayButton ? "checked" : ""
          } />
        </div>
        <button class="settings-panel__button" id="save-settings">Сохранить</button>
      </div>
      <div class="settings-icon" id="settings-icon">
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 50 50">
          <path d="M 22.205078 2 A 1.0001 1.0001 0 0 0 21.21875 2.8378906 L 20.246094 8.7929688 C 19.076509 9.1331971 17.961243 9.5922728 16.910156 10.164062 L 11.996094 6.6542969 A 1.0001 1.0001 0 0 0 10.708984 6.7597656 L 6.8183594 10.646484 A 1.0001 1.0001 0 0 0 6.7070312 11.927734 L 10.164062 16.873047 C 9.583454 17.930271 9.1142098 19.051824 8.765625 20.232422 L 2.8359375 21.21875 A 1.0001 1.0001 0 0 0 2.0019531 22.205078 L 2.0019531 27.705078 A 1.0001 1.0001 0 0 0 2.8261719 28.691406 L 8.7597656 29.742188 C 9.1064607 30.920739 9.5727226 32.043065 10.154297 33.101562 L 6.6542969 37.998047 A 1.0001 1.0001 0 0 0 6.7597656 39.285156 L 10.648438 43.175781 A 1.0001 1.0001 0 0 0 11.927734 43.289062 L 16.882812 39.820312 C 17.936999 40.39548 19.054994 40.857928 20.228516 41.201172 L 21.21875 47.164062 A 1.0001 1.0001 0 0 0 22.205078 48 L 27.705078 48 A 1.0001 1.0001 0 0 0 28.691406 47.173828 L 29.751953 41.1875 C 30.920633 40.838997 32.033372 40.369697 33.082031 39.791016 L 38.070312 43.291016 A 1.0001 1.0001 0 0 0 39.351562 43.179688 L 43.240234 39.287109 A 1.0001 1.0001 0 0 0 43.34375 37.996094 L 39.787109 33.058594 C 40.355783 32.014958 40.813915 30.908875 41.154297 29.748047 L 47.171875 28.693359 A 1.0001 1.0001 0 0 0 47.998047 27.707031 L 47.998047 22.207031 A 1.0001 1.0001 0 0 0 47.160156 21.220703 L 41.152344 20.238281 C 40.80968 19.078827 40.350281 17.974723 39.78125 16.931641 L 43.289062 11.933594 A 1.0001 1.0001 0 0 0 43.177734 10.652344 L 39.287109 6.7636719 A 1.0001 1.0001 0 0 0 37.996094 6.6601562 L 33.072266 10.201172 C 32.023186 9.6248101 30.909713 9.1579916 29.738281 8.8125 L 28.691406 2.828125 A 1.0001 1.0001 0 0 0 27.705078 2 L 22.205078 2 z M 23.056641 4 L 26.865234 4 L 27.861328 9.6855469 A 1.0001 1.0001 0 0 0 28.603516 10.484375 C 30.066026 10.848832 31.439607 11.426549 32.693359 12.185547 A 1.0001 1.0001 0 0 0 33.794922 12.142578 L 38.474609 8.7792969 L 41.167969 11.472656 L 37.835938 16.220703 A 1.0001 1.0001 0 0 0 37.796875 17.310547 C 38.548366 18.561471 39.118333 19.926379 39.482422 21.380859 A 1.0001 1.0001 0 0 0 40.291016 22.125 L 45.998047 23.058594 L 45.998047 26.867188 L 40.279297 27.871094 A 1.0001 1.0001 0 0 0 39.482422 28.617188 C 39.122545 30.069817 38.552234 31.434687 37.800781 32.685547 A 1.0001 1.0001 0 0 0 37.845703 33.785156 L 41.224609 38.474609 L 38.53125 41.169922 L 33.791016 37.84375 A 1.0001 1.0001 0 0 0 32.697266 37.808594 C 31.44975 38.567585 30.074755 39.148028 28.617188 39.517578 A 1.0001 1.0001 0 0 0 27.876953 40.3125 L 26.867188 46 L 23.052734 46 L 22.111328 40.337891 A 1.0001 1.0001 0 0 0 21.365234 39.53125 C 19.90185 39.170557 18.522094 38.59371 17.259766 37.835938 A 1.0001 1.0001 0 0 0 16.171875 37.875 L 11.46875 41.169922 L 8.7734375 38.470703 L 12.097656 33.824219 A 1.0001 1.0001 0 0 0 12.138672 32.724609 C 11.372652 31.458855 10.793319 30.079213 10.427734 28.609375 A 1.0001 1.0001 0 0 0 9.6328125 27.867188 L 4.0019531 26.867188 L 4.0019531 23.052734 L 9.6289062 22.117188 A 1.0001 1.0001 0 0 0 10.435547 21.373047 C 10.804273 19.898143 11.383325 18.518729 12.146484 17.255859 A 1.0001 1.0001 0 0 0 12.111328 16.164062 L 8.8261719 11.46875 L 11.523438 8.7734375 L 16.185547 12.105469 A 1.0001 1.0001 0 0 0 17.28125 12.148438 C 18.536908 11.394293 19.919867 10.822081 21.384766 10.462891 A 1.0001 1.0001 0 0 0 22.132812 9.6523438 L 23.056641 4 z M 25 17 C 20.593567 17 17 20.593567 17 25 C 17 29.406433 20.593567 33 25 33 C 29.406433 33 33 29.406433 33 25 C 33 20.593567 29.406433 17 25 17 z M 25 19 C 28.325553 19 31 21.674447 31 25 C 31 28.325553 28.325553 31 25 31 C 21.674447 31 19 28.325553 19 25 C 19 21.674447 21.674447 19 25 19 z" fill="currentColor"></path>
        </svg>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", panelHtml);

    const settingsPanel = document.getElementById("settings-panel");
    const settingsIcon = document.getElementById("settings-icon");
    const closeSettings = document.getElementById("close-settings");

    const togglePanel = () => {
      settingsPanel.classList.toggle("settings-panel--visible");
    };

    const closePanel = () => {
      settingsPanel.classList.remove("settings-panel--visible");
    };

    settingsIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePanel();
    });

    closeSettings.addEventListener("click", closePanel);

    document.getElementById("save-settings").addEventListener("click", () => {
      const newSettings = {
        additionalClickModifier: Math.min(
          Math.max(
            parseInt(
              document.getElementById("additional-click-modifier").value,
              10
            ),
            0
          ),
          100
        ),
        autoClickPlayButton: document.getElementById("auto-click-play").checked,
      };
      settingsManager.saveSettings(newSettings);

      closePanel();
    });
  }

  // Класс для эмуляции событий клика
  class MouseEventSimulator {
    static clickRandomly(element) {
      if (!element) return;

      const { width, height } = element;
      const randomX = Math.random() * width;
      const randomY = Math.random() * height;

      const rect = element.getBoundingClientRect();

      const props = {
        clientX: rect.left + randomX,
        clientY: rect.top + randomY,
        bubbles: true,
      };

      MouseEventSimulator.dispatchClickEvent(element, props);
    }

    static dispatchClickEvent(element, props) {
      ["mousedown", "mouseup", "click"].forEach((event) =>
        element.dispatchEvent(new MouseEvent(event, props))
      );
    }
  }

  // Работа с игровым canvas
  class CanvasHandler {
    constructor() {
      this.gameCanvasElement = null;
    }

    findAndClickCanvas() {
      this.gameCanvasElement = document.querySelector(".game-page.page canvas");

      if (this.gameCanvasElement) {
        MouseEventSimulator.clickRandomly(this.gameCanvasElement);
      }
    }

    startCanvasSearchLoop() {
      setInterval(this.findAndClickCanvas.bind(this), 1000);
    }
  }

  // Очередь обработки игровых объектов
  class GameElementQueueManager {
    constructor(clickDelay = 70) {
      this.clickDelay = clickDelay;
      this.elementQueue = [];
    }

    processQueue() {
      if (this.elementQueue.length > 0) {
        const gameElement = this.elementQueue.shift();
        this.clickGameElement(gameElement);
      }
    }

    startQueueProcessing() {
      setInterval(() => this.processQueue(), this.clickDelay);
    }

    clickGameElement(element) {
      if (!element || !element.onClick) return;

      element.onClick(element);

      if (settingsManager.settings.additionalClickModifier) {
        executeWithProbability(
          settingsManager.settings.additionalClickModifier / 100,
          () => {
            element.onClick(element);
          }
        );
      }

      setTimeout(() => {
        element.isExplosion = true;
        element.processedAt = performance.now();
      }, 10);
    }
  }

  // Проверка и автоматический клик по кнопкам "Play"
  function findAndClickPlayButton() {
    if (!settingsManager.settings.autoClickPlayButton) {
      return;
    }

    const playButtonElements = document.querySelectorAll(
      'button.kit-button.is-large.is-primary, a.play-btn[href="/game"], button.kit-button.is-large.is-primary, .pages-index-game > div.default > button.kit-pill.reset.pill'
    );

    playButtonElements.forEach((button) => {
      const text = button.textContent.trim();
      if (["Играть", "Play", "Continue"].some((word) => text.includes(word))) {
        button.click();
      }
    });
  }

  // Переопределение метода find для поиска игровых объектов
  function overrideArrayFindForGameElements() {
    const originalArrayFind = Array.prototype.find;

    Array.prototype.find = function (...args) {
      const origFn = args[0];
      if (typeof origFn === "function") {
        args[0] = function (...params) {
          const item = params[0];
          if (
            item &&
            typeof item === "object" &&
            item.asset &&
            !item.isExplosion
          ) {
            // Проверяем тип элемента
            if (["CLOVER"].includes(item.asset.assetType)) {
              gameElementQueueManager.elementQueue.push(item);
            }
          }
          return origFn.apply(null, params);
        };
      }
      return originalArrayFind.apply(this, args);
    };
  }

  // Инициализация классов и функций
  const canvasHandler = new CanvasHandler();
  const gameElementQueueManager = new GameElementQueueManager();

  injectStyles();
  createSettingsPanel(settingsManager.settings);

  gameElementQueueManager.startQueueProcessing();
  canvasHandler.startCanvasSearchLoop();

  setInterval(() => {
    findAndClickPlayButton();
  }, 5000);

  overrideArrayFindForGameElements();
})();
