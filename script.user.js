// ==UserScript==
// @name         Blum Autoclicker JS
// @version      1.0.2
// @namespace    Violentmonkey Scripts
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

  const originalFind = Array.prototype.find;

  function checkAndClickPlayButton() {
    const playButtons = document.querySelectorAll(
      'button.kit-button.is-large.is-primary, a.play-btn[href="/game"], button.kit-button.is-large.is-primary'
    );

    playButtons.forEach((button) => {
      if (
        /Играть/.test(button.textContent) ||
        /Continue/.test(button.textContent)
      ) {
        button.click();
      }
    });
  }

  function simulateRandomClick(canvas) {
    const randomX = Math.random() * canvas.width;
    const randomY = Math.random() * canvas.height;

    const prop = {
      clientX: canvas.getBoundingClientRect().left + randomX,
      clientY: canvas.getBoundingClientRect().top + randomY,
      bubbles: true,
    };

    canvas.dispatchEvent(new MouseEvent("click", prop));
    canvas.dispatchEvent(new MouseEvent("mousedown", prop));
    canvas.dispatchEvent(new MouseEvent("mouseup", prop));
  }

  function simulateClick(canvas, x, y) {
    const prop = { clientX: x, clientY: y, bubbles: true };
    canvas.dispatchEvent(new MouseEvent("click", prop));
    canvas.dispatchEvent(new MouseEvent("mousedown", prop));
    canvas.dispatchEvent(new MouseEvent("mouseup", prop));
  }

  function getGameCanvas() {
    return document.querySelector(".game-page.page canvas");
  }

  function searchCanvas() {
    const canvas = getGameCanvas();

    if (!canvas) {
      return;
    }

    simulateRandomClick(canvas);
  }

  /**
   *
   * @param {*} el
   * @description Клик по clower элементу
   */
  function clickClower(el) {
    // el.onClick(el);

    console.log(el.rect, "el rect");

    const canvas = getGameCanvas();

    if (!canvas) {
      return;
    }

    simulateClick(canvas, el.rect.x, el.rect.y);

    setTimeout(() => {
      el.isExplosion = true;

      el.addedAt = performance.now();
    }, 10);
  }

  /**
   *
   * @description Подменяем метод find
   */
  Array.prototype.find = function (...items) {
    const origFn = items[0];

    if (origFn) {
      items[0] = function (...args) {
        const firstArg = args[0];

        if (
          typeof firstArg === "object" &&
          "asset" in firstArg &&
          "assetType" in firstArg.asset
        ) {
          if (!firstArg.isExplosion && firstArg.asset.assetType === "CLOVER") {
            clickClower(firstArg);
          }
        }

        return origFn.apply(null, args);
      };
    }

    return originalFind.apply(this, items);
  };

  setInterval(() => {
    searchCanvas();
  }, 1000);

  setInterval(() => {
    checkAndClickPlayButton();
  }, 5000);
})();
