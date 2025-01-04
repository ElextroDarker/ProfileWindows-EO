// ==UserScript==
// @name         ProfileWindows
// @namespace    http://tampermonkey.net/
// @version      2025-01-02-08-26
// @description  Show any page in an overlay when a button is clicked, reusable for multiple buttons.
// @author       ElextroDarker
// @match        https://etternaonline.com/*
// @homepageURL  https://github.com/ElextroDarker/ProfileWindows-EO
// @supportURL   https://github.com/ElextroDarker/ProfileWindows-EO/issues/new
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Ensure the script only runs on URLs matching /users/* but not /users/*/something other than /scores
    const userPathRegex = /^\/users\/[^/]+\/?$/; // Matches /users/<username> but not /users/<username>/something
    if (!userPathRegex.test(window.location.pathname)) {
        return;
    }

    // Function to create and display the overlay with an iframe
    function createOverlayWithIframe(url) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';

        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '90%';
        iframe.style.height = '90%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '12px';
        iframe.style.backgroundColor = 'white';

        overlay.appendChild(iframe);
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    // Function to attach overlay behavior to buttons
    function attachOverlayToButtons(selector) {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
            if (!button.dataset.overlayAttached) { // Avoid duplicate listeners
                button.dataset.overlayAttached = 'true';
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const url = window.location.origin + button.getAttribute('href');
                    createOverlayWithIframe(url);
                }, true);
            }
        });
    }

    // List of button selectors to attach the overlay functionality
    const buttonSelectors = [
        '.nav-link[href*="/scores"]', // General scores page
        'a[href^="/users/"][href*="/scores/"]', // Specific score URLs
        'a[href^="/songs/"]' // Any song URLs
    ];

    // Attach to existing buttons and observe for dynamically added ones
    buttonSelectors.forEach(selector => {
        attachOverlayToButtons(selector);

        // Use MutationObserver to detect dynamically added elements
        const observer = new MutationObserver(() => {
            attachOverlayToButtons(selector);
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
