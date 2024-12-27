// ==UserScript==
// @name         Blum Autoclicker JS
// @version      1.0
// @namespace    Violentmonkey Scripts
// @author       Marshallup
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon
// @downloadURL
// @updateURL
// @homepage     https://github.com/
// ==/UserScript==

(function () {
  "use strict";

  const originalFind = Array.prototype.find;

  function checkAndClickPlayButton() {
    const playButtons = document.querySelectorAll(
      'button.kit-button.is-large.is-primary, a.play-btn[href="/game"], button.kit-button.is-large.is-primary'
    );

    console.log(playButtons, "play buttons");
    playButtons.forEach((button) => {
      if (
        /Играть/.test(button.textContent) ||
        /Continue/.test(button.textContent)
      ) {
        setTimeout(() => {
          button.click();
        }, 1000);
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

  function searchCanvas() {
    const canvas = document.querySelector(".game-page.page canvas");

    if (!canvas) {
      return;
    }

    simulateRandomClick(canvas);

    console.log(canvas, "canvas");
  }

  function onClickClower(el, isExp = false) {
    if (isExp) {
      el.isExplosion = true;

      el.addedAt = performance.now();
    }

    el.onClick(el);
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
            onClickClower(firstArg);

            setTimeout(() => {
              onClickClower(firstArg, true);
            }, 10);
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
