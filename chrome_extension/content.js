// Content script that adds a sidebar with AI-generated notes to YUTorah pages

(function () {
    'use strict';

    const API_BASE_URL = 'https://yutorahnotes.onrender.com';
    let sidebar = null;
    let backdrop = null;
    let isSidebarOpen = false;

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

    // Create backdrop
    function createBackdrop() {
        if (backdrop) return backdrop;

        backdrop = document.createElement('div');
        backdrop.id = 'yutorah-sidebar-backdrop';
        backdrop.addEventListener('click', toggleSidebar);
        document.body.appendChild(backdrop);

        return backdrop;
    }

    // Create sidebar
    function createSidebar() {
        if (sidebar) return sidebar;

        sidebar = document.createElement('div');
        sidebar.id = 'yutorah-notes-sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h2>Shiur Notes</h2>
                <button class="close-btn" id="yutorah-close-sidebar">×</button>
            </div>
            <div class="sidebar-content" id="yutorah-sidebar-content">
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Generating notes...</p>
                </div>
            </div>
        `;
        document.body.appendChild(sidebar);

        // Close button handler
        document.getElementById('yutorah-close-sidebar').addEventListener('click', toggleSidebar);

        return sidebar;
    }

    // Toggle sidebar
    function toggleSidebar() {
        if (!sidebar) {
            createSidebar();
        }
        if (!backdrop) {
            createBackdrop();
        }
        
        isSidebarOpen = !isSidebarOpen;
        
        if (isSidebarOpen) {
            sidebar.classList.add('open');
            backdrop.classList.add('open');
            document.body.style.overflow = 'hidden';
            loadNotes();
        } else {
            sidebar.classList.remove('open');
            backdrop.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    // Load notes from API
    async function loadNotes() {
        const contentDiv = document.getElementById('yutorah-sidebar-content');
        const currentUrl = window.location.href;

        // Show loading state
        contentDiv.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Generating notes... This may take a minute.</p>
            </div>
        `;

        try {
            const response = await fetch(`${API_BASE_URL}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: currentUrl }),
            });

            const contentType = response.headers.get('content-type');
            const responseText = await response.text();
            let data;

            // Handle response
            if (contentType && contentType.includes('application/json')) {
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    throw new Error('Failed to parse server response');
                }
            } else {
                throw new Error('Server returned non-JSON response');
            }

            if (response.ok && data.notes) {
                // Display notes
                contentDiv.innerHTML = `
                    <div class="notes-content">
                        ${data.cached ? '<div class="cache-badge">Cached</div>' : ''}
                        <div class="notes-text">${formatMarkdown(data.notes)}</div>
                    </div>
                `;
            } else {
                throw new Error(data.error || 'Failed to generate notes');
            }
        } catch (error) {
            contentDiv.innerHTML = `
                <div class="error-state">
                    <p class="error-icon">⚠️</p>
                    <p class="error-message">${error.message}</p>
                    <button class="retry-btn" onclick="window.yutorahRetryLoad()">Retry</button>
                </div>
            `;
            // Make retry function available globally
            window.yutorahRetryLoad = loadNotes;
        }
    }

    // Simple markdown to HTML converter
    function formatMarkdown(text) {
        if (!text) return '';

        const lines = text.split('\n');
        let html = '';
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            if (!line) {
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                continue;
            }

            // Headers
            if (line.startsWith('### ')) {
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                html += `<h3>${escapeHtml(line.substring(4))}</h3>\n`;
            } else if (line.startsWith('## ')) {
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                html += `<h2>${escapeHtml(line.substring(3))}</h2>\n`;
            } else if (line.startsWith('# ')) {
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                html += `<h1>${escapeHtml(line.substring(2))}</h1>\n`;
            }
            // Blockquotes
            else if (line.startsWith('> ')) {
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                html += `<blockquote>${formatInline(line.substring(2))}</blockquote>\n`;
            }
            // Lists
            else if (line.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>\n';
                    inList = true;
                }
                html += `<li>${formatInline(line.substring(2))}</li>\n`;
            }
            // Regular paragraphs
            else {
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                html += `<p>${formatInline(line)}</p>\n`;
            }
        }

        if (inList) {
            html += '</ul>\n';
        }

        return html;
    }

    // Format inline markdown (bold, italic)
    function formatInline(text) {
        // Escape HTML first
        text = escapeHtml(text);
        
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic (single asterisk, but not part of bold)
        text = text.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
        
        return text;
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add click handler
    button.addEventListener('click', toggleSidebar);

    // Insert the button into the page
    function insertButton() {
        const possibleParents = [
            document.querySelector('.page-header'),
            document.querySelector('.lecture-header'),
            document.querySelector('header'),
            document.querySelector('.container'),
            document.querySelector('body')
        ];

        const parent = possibleParents.find(el => el !== null);

        if (parent) {
            const container = document.createElement('div');
            container.id = 'yutorah-transcribe-container';
            container.appendChild(button);
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
