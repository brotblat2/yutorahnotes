// Content script that adds a "Transcribe Shiur" button to YUTorah pages

(function () {
    'use strict';

    // Create the container for buttons
    const container = document.createElement('div');
    container.id = 'yutorah-transcribe-container';

    // Helper to create buttons
    function createButton(text, mode, iconPath, id) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.className = 'yutorah-action-btn';
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px; vertical-align: middle;">
                ${iconPath}
            </svg>
            ${text}
        `;
        btn.addEventListener('click', function () {
            const currentUrl = window.location.href;
            const webAppUrl = `https://yutorahnotes.onrender.com/?url=${encodeURIComponent(currentUrl)}&mode=${mode}`;
            window.open(webAppUrl, '_blank');
        });
        return btn;
    }

    // Summarize Button Icon (Notes)
    const summarizeIcon = `
        <path d="M8 1C6.34 1 5 2.34 5 4V8C5 9.66 6.34 11 8 11C9.66 11 11 9.66 11 8V4C11 2.34 9.66 1 8 1Z" fill="currentColor"/>
        <path d="M3 8C3 8.55 3.45 9 4 9C4.55 9 5 8.55 5 8H3ZM11 8C11 8.55 11.45 9 12 9C12.55 9 13 8.55 13 8H11ZM8 13C5.24 13 3 10.76 3 8H5C5 9.66 6.34 11 8 11C9.66 11 11 9.66 11 8H13C13 10.76 10.76 13 8 13Z" fill="currentColor"/>
        <path d="M7 13H9V15H7V13Z" fill="currentColor"/>
    `;

    // Transcribe Button Icon (Text/Document)
    const transcribeIcon = `
        <path d="M4 2C3.45 2 3 2.45 3 3V13C3 13.55 3.45 14 4 14H12C12.55 14 13 13.55 13 13V3C13 2.45 12.55 2 12 2H4ZM4 3H12V13H4V3Z" fill="currentColor"/>
        <path d="M5 5H11V6H5V5Z" fill="currentColor"/>
        <path d="M5 7H11V8H5V7Z" fill="currentColor"/>
        <path d="M5 9H9V10H5V9Z" fill="currentColor"/>
    `;

    const summarizeBtn = createButton('Summarize Shiur', 'notes', summarizeIcon, 'yutorah-summarize-btn');
    const transcribeBtn = createButton('Transcribe Shiur', 'transcript', transcribeIcon, 'yutorah-transcribe-btn');

    container.appendChild(summarizeBtn);
    container.appendChild(transcribeBtn);

    // Insert the buttons into the page
    // Wait for the page to be fully loaded
    function insertButtons() {
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
            // Insert at the beginning of the parent
            // Check if already inserted to avoid duplicates
            if (!document.getElementById('yutorah-transcribe-container')) {
                parent.insertBefore(container, parent.firstChild);
            }
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insertButtons);
    } else {
        insertButtons();
    }
})();
