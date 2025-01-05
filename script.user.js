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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-icon__svg">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33H14a1.65 1.65 0 0 0-1.51 1V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-.33 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V16a1.65 1.65 0 0 0-1-1.51V14a2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1-.33 1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H14a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .33 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V8a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1v.09z"></path>
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
