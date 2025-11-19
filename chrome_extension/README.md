# YUTorah Transcriber - Chrome Extension

A Chrome extension that adds a "Transcribe Shiur" button to YUTorah pages, allowing you to generate AI-powered notes with one click.

## Features

- 🎯 One-click transcription from any YUTorah page
- 🤖 AI-powered note generation using Google Gemini
- ⚡ Automatic form submission - no manual input needed
- 📝 Hebrew terms preserved in Hebrew, notes in English

## Installation for Local Testing

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome_extension` folder from this project
5. The extension icon should appear in your toolbar

## Usage

1. Navigate to any shiur page on YUTorah.org
2. Click the YUTorah Transcriber extension icon in your toolbar
3. A new tab will open with the web app
4. The URL will be auto-filled and notes generation will start automatically
5. Wait for the AI to generate comprehensive notes

## Publishing to Chrome Web Store

### Prerequisites

- Google Developer account ($5 one-time fee)
- Extension icons (✅ already included)
- Screenshots for store listing
- Privacy policy

### Steps

1. **Create Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay the one-time $5 registration fee

2. **Prepare Store Listing**
   - Name: YUTorah Transcriber
   - Short description: Generate AI-powered notes from YUTorah shiurim with one click
   - Detailed description: (see below)
   - Category: Productivity
   - Language: English

3. **Package Extension**
   - Zip the entire `chrome_extension` folder
   - Or use: `cd chrome_extension && zip -r ../yutorah-transcriber.zip .`

4. **Upload**
   - In Developer Dashboard, click "New Item"
   - Upload the ZIP file
   - Fill in all required fields
   - Upload screenshots (at least 1, recommended 3-5)

5. **Submit for Review**
   - Review typically takes 1-3 business days
   - You'll receive an email when approved

## Store Listing Content

### Detailed Description

```
Transform your YUTorah learning experience with AI-powered note generation!

YUTorah Transcriber makes it effortless to generate comprehensive, clear notes from any shiur on YUTorah.org. With just one click, our extension:

✨ Captures the current YUTorah page URL
✨ Opens our AI-powered web app
✨ Automatically fills in the URL and starts processing
✨ Generates extensive notes with Hebrew terms preserved in Hebrew

Perfect for:
- Students reviewing shiurim
- Educators preparing materials
- Anyone who wants to retain more from Torah lectures

Features:
- One-click operation from any YUTorah page
- AI-powered transcription using Google Gemini
- Hebrew terms written in Hebrew script
- Clean, modern interface
- Fast processing

Privacy: This extension only accesses YUTorah.org pages and does not collect any personal data.
```

### Screenshots Needed

1. Extension icon in toolbar on a YUTorah page
2. The web app with auto-filled URL
3. Generated notes display

## Privacy Policy

```
Privacy Policy for YUTorah Transcriber

This extension does not collect, store, or transmit any personal information.

The extension only:
- Detects when you're on a YUTorah.org page
- Captures the current page URL when you click the extension icon
- Opens our web app with that URL

All audio processing and note generation happens on our servers and is not stored permanently.

For questions, contact: [your-email@example.com]
```

## Files Structure

```
chrome_extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (handles button clicks)
├── content.js         # Auto-fills form and submits
├── icons/
│   ├── icon16.png     # 16x16 icon
│   ├── icon48.png     # 48x48 icon
│   └── icon128.png    # 128x128 icon
└── README.md          # This file
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome standard)
- **Permissions**: 
  - `activeTab`: Access current tab URL
  - `scripting`: Inject content script
  - `host_permissions`: Access to yutorah.org pages

## Troubleshooting

**Extension icon doesn't appear**
- Make sure you loaded the extension in `chrome://extensions`
- Check that Developer mode is enabled

**Button doesn't work**
- Ensure you're on a yutorah.org page
- Check the browser console for errors (F12)

**Form doesn't auto-submit**
- The web app must be deployed and accessible
- Check that the URL in `background.js` matches your deployed app

## Development

To modify the extension:

1. Edit the files in `chrome_extension/`
2. Go to `chrome://extensions`
3. Click the refresh icon on the extension card
4. Test your changes

## License

MIT License - feel free to modify and distribute

## Support

For issues or questions, please contact [your-email@example.com]
