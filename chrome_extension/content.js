// Content script that adds a "Transcribe Shiur" button to YUTorah pages

(function () {
    'use strict';

    // Create the button
    const button = document.createElement('button');
    button.id = 'yutorah-transcribe-btn';
    button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px; vertical-align: middle;">
      <path d="M8 1C6.34 1 5 2.34 5 4V8C5 9.66 6.34 11 8 11C9.66 11 11 9.66 11 8V4C11 2.34 9.66 1 8 1Z" fill="currentColor"/>
      <path d="M3 8C3 8.55 3.45 9 4 9C4.55 9 5 8.55 5 8H3ZM11 8C11 8.55 11.45 9 12 9C12.55 9 13 8.55 13 8H11ZM8 13C5.24 13 3 10.76 3 8H5C5 9.66 6.34 11 8 11C9.66 11 11 9.66 11 8H13C13 10.76 10.76 13 8 13Z" fill="currentColor"/>
      <path d="M7 13H9V15H7V13Z" fill="currentColor"/>
    </svg>
    Transcribe Shiur
  `;

    // Add click handler
    button.addEventListener('click', function () {
        const currentUrl = window.location.href;
        const webAppUrl = `https://yutorahnotes.onrender.com/?url=${encodeURIComponent(currentUrl)}`;
        window.open(webAppUrl, '_blank');
    });

    // Insert the button into the page
    // Wait for the page to be fully loaded
    function insertButton() {
        // Try to find a good spot to insert the button
        // Look for common YUTorah page elements
        const possibleParents = [
            document.querySelector('.page-header'),
            document.querySelector('.lecture-header'),
            document.querySelector('header'),
            document.querySelector('.container'),
            document.querySelector('body')
        ];

        const parent = possibleParents.find(el => el !== null);

        if (parent) {
            // Create a container for our button
            const container = document.createElement('div');
            container.id = 'yutorah-transcribe-container';
            container.appendChild(button);

            // Insert at the beginning of the parent
            parent.insertBefore(container, parent.firstChild);
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insertButton);
    } else {
        insertButton();
    }
})();
