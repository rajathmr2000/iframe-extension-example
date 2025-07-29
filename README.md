# Iframe Inspector & Script Injector

A Chrome browser extension that detects iframes on web pages and allows you to inject scripts into specific iframes for DOM inspection and accessibility testing.

## Features

- 🔍 **Iframe Detection**: Automatically scans and lists all iframes on the current page
- 📋 **Iframe Information**: Shows iframe URLs and frame IDs
- 📌 **Selective Injection**: Inject scripts into specific iframes or all iframes at once
- 🎯 **DOM Access**: Injected script can access and manipulate the DOM of the selected iframe
- 🖱️ **Interactive Elements**: Click elements to inspect them, double-click to toggle highlighting
- ⌨️ **Keyboard Shortcuts**: Use Escape to clear selection, 'I' to re-inspect current selection

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `iframe-extension` folder
4. The extension icon should appear in your browser toolbar

## Usage

### Testing the Extension

1. Open the provided `iframe-test-page.html` in Chrome to test with multiple iframes
2. Click the extension icon in the toolbar to open the popup
3. The extension will automatically scan for iframes and display them

### Using the Extension

1. **Refresh**: Click the "🔄 Refresh" button to rescan the current page for iframes
2. **Inject All**: Click "📌 Inject All" to inject the script into all detected iframes
3. **Inject Specific**: Click "📌 Inject Script" on any specific iframe to inject only into that frame

### Injected Script Features

Once injected, the script (`bkp.js`) provides the following functionality:

- **Element Highlighting**: All elements get a red border and slight background tint
- **Click to Inspect**: Click any element to select it and view detailed information in the console
- **Double-click Toggle**: Double-click anywhere to toggle the highlighting on/off
- **Keyboard Controls**:
  - `Escape`: Clear current selection
  - `I`: Re-inspect current selection

### Console Functions

The following functions are available in the iframe's console after injection:

- `highlightAllElements()`: Highlight all elements with red borders
- `removeHighlighting()`: Remove all highlighting
- `selectElement(element)`: Select and inspect a specific element
- `getCurrentSelection()`: Get the currently selected element

## File Structure

```
iframe-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js              # Popup logic and iframe detection
├── background.js         # Background service worker
├── bkp.js               # Script to inject into iframes
└── inject.js            # Alternative injection script
```

## Technical Details

### Permissions

The extension requires the following permissions:
- `tabs`: Access to browser tabs
- `scripting`: Script injection capabilities
- `webNavigation`: Access to frame information
- `activeTab`: Current tab access
- `<all_urls>`: Access to all websites

### How It Works

1. **Detection**: Uses `chrome.webNavigation.getAllFrames()` to detect all frames on the page
2. **Filtering**: Filters out the main frame (frameId 0) to show only iframes
3. **Injection**: Uses `chrome.scripting.executeScript()` to inject the script into specific frames
4. **DOM Access**: The injected script runs in the iframe's context and can access its DOM

### Cross-Origin Considerations

- Some iframes may block script injection due to cross-origin policies
- Sites with strict Content Security Policy (CSP) may prevent injection
- The extension will show success/error messages for injection attempts

## Development

### Modifying the Injection Script

Edit `bkp.js` to customize what happens when the script is injected into an iframe. The current script:

- Highlights all elements
- Provides click-to-inspect functionality
- Logs detailed element information
- Supports keyboard shortcuts

### Adding New Features

1. Modify `popup.html` for UI changes
2. Update `popup.js` for new functionality
3. Edit `manifest.json` for additional permissions
4. Enhance `bkp.js` for new injection behaviors

## Troubleshooting

### Extension Not Working
- Ensure you're on a webpage (not chrome:// pages)
- Check if the page has iframes
- Verify the extension is enabled in chrome://extensions/

### Script Injection Fails
- Some sites block cross-origin script injection
- Check the browser console for error messages
- Try on the test page first to verify functionality

### No Iframes Detected
- Refresh the page and try again
- Some iframes load dynamically and may not be immediately detected
- Use the refresh button in the extension popup

## Example Test Page

Use the included `iframe-test-page.html` to test the extension. It contains:
- Multiple iframes with different sources
- Local HTML content iframes
- External website iframes (some may be blocked)
- Dynamic content examples

## Contributing

Feel free to enhance this extension by:
- Adding more inspection features
- Improving the UI
- Adding better error handling
- Supporting more iframe scenarios
