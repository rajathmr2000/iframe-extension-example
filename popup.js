document.addEventListener("DOMContentLoaded", () => {
  let currentTab = null;
  let iframes = [];

  // Get DOM elements
  const refreshBtn = document.getElementById("refresh");
  const injectMainBtn = document.getElementById("injectMain");
  const injectAllBtn = document.getElementById("injectAll");
  const highlightIframesBtn = document.getElementById("highlightIframes");
  const clearHighlightBtn = document.getElementById("clearHighlight");
  const loadingDiv = document.getElementById("loading");
  const iframeListDiv = document.getElementById("iframeList");
  const noIframesDiv = document.getElementById("noIframes");
  const statusDiv = document.getElementById("status");

  // Function to show status message
  function showStatus(message, type = 'success') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  // Function to scan for iframes
  async function scanIframes() {
    try {
      loadingDiv.style.display = 'block';
      iframeListDiv.style.display = 'none';
      noIframesDiv.style.display = 'none';

      // Get current active tab
      [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!currentTab) {
        throw new Error('No active tab found');
      }

      // Get all frames in the tab
      chrome.webNavigation.getAllFrames({ tabId: currentTab.id }, (frames) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting frames:', chrome.runtime.lastError);
          showStatus('Error scanning iframes', 'error');
          loadingDiv.style.display = 'none';
          return;
        }

        // Filter out the main frame (frameId 0)
        iframes = frames.filter(frame => frame.frameId !== 0);
        
        loadingDiv.style.display = 'none';
        
        if (iframes.length === 0) {
          noIframesDiv.style.display = 'block';
        } else {
          displayIframes();
          iframeListDiv.style.display = 'block';
        }
      });
    } catch (error) {
      console.error('Error scanning iframes:', error);
      showStatus('Error scanning page', 'error');
      loadingDiv.style.display = 'none';
    }
  }

  // Function to display iframes in the popup
  function displayIframes() {
    iframeListDiv.innerHTML = '';
    
    iframes.forEach((frame, index) => {
      const iframeItem = document.createElement('div');
      iframeItem.className = 'iframe-item';
      
      // Create iframe info display
      const iframeInfo = document.createElement('div');
      iframeInfo.className = 'iframe-info';
      
      const iframeId = document.createElement('div');
      iframeId.className = 'iframe-id';
      iframeId.textContent = `Frame #${index + 1} (ID: ${frame.frameId})`;
      
      const iframeUrl = document.createElement('div');
      iframeUrl.className = 'iframe-url';
      iframeUrl.textContent = frame.url || 'about:blank';
      iframeUrl.title = frame.url || 'about:blank';
      
      iframeInfo.appendChild(iframeId);
      iframeInfo.appendChild(iframeUrl);
      
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      
      // Create inject button
      const injectBtn = document.createElement('button');
      injectBtn.className = 'inject-btn';
      injectBtn.textContent = '📌 Inject Script';
      injectBtn.onclick = () => injectIntoFrame(frame.frameId, index + 1);
      
      // Create highlight button
      const highlightBtn = document.createElement('button');
      highlightBtn.className = 'highlight-btn';
      highlightBtn.textContent = '🔍 Highlight';
      highlightBtn.onclick = () => highlightSpecificIframe(index + 1);
      
      buttonContainer.appendChild(injectBtn);
      buttonContainer.appendChild(highlightBtn);
      
      iframeItem.appendChild(iframeInfo);
      iframeItem.appendChild(buttonContainer);
      iframeListDiv.appendChild(iframeItem);
    });
  }

  // Function to inject script into specific iframe
  async function injectIntoFrame(frameId, frameNumber) {
    try {
      if (!currentTab) {
        throw new Error('No active tab');
      }

      // Use background script for injection
      const response = await chrome.runtime.sendMessage({
        action: 'injectScript',
        tabId: currentTab.id,
        frameIds: [frameId],
        scriptFile: 'inject.js',
        target: `iframe #${frameNumber}`
      });

      if (response.success) {
        showStatus(`✅ Script injected into Frame #${frameNumber}`);
        console.log(`Script injected into frame ${frameId}`);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error injecting script:', error);
      showStatus(`❌ Failed to inject into Frame #${frameNumber}`, 'error');
    }
  }

  // Function to inject into main window only
  async function injectIntoMainWindow() {
    try {
      if (!currentTab) {
        throw new Error('No active tab');
      }

      // Use background script for injection into main window (frameId 0)
      const response = await chrome.runtime.sendMessage({
        action: 'injectScript',
        tabId: currentTab.id,
        frameIds: [0], // Main window has frameId 0
        scriptFile: 'inject.js',
        target: 'main window'
      });

      if (response.success) {
        showStatus('✅ Script injected into main window');
        console.log('Script injected into main window');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error injecting script into main window:', error);
      showStatus('❌ Failed to inject into main window', 'error');
    }
  }

  // Function to inject into all frames (main window + all iframes)
  async function injectIntoAll() {
    try {
      if (!currentTab) {
        throw new Error('No active tab');
      }

      // Use background script for bulk injection
      const response = await chrome.runtime.sendMessage({
        action: 'injectScriptAll',
        tabId: currentTab.id,
        scriptFile: 'inject.js'
      });

      if (response.success) {
        const { successfulInjections, totalFrames, results } = response;
        showStatus(`✅ Script injected into ${successfulInjections}/${totalFrames} frames`);
        
        // Log detailed results
        console.group('📊 Injection Results:');
        results.forEach(result => {
          if (result.success) {
            console.log(`✅ ${result.type}: ${result.url}`);
          } else {
            console.error(`❌ ${result.type}: ${result.error}`);
          }
        });
        console.groupEnd();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error injecting into all frames:', error);
      showStatus('❌ Failed to inject scripts', 'error');
    }
  }

  // Function to highlight all iframes on the page
  async function highlightAllIframes() {
    try {
      if (!currentTab) {
        throw new Error('No active tab');
      }

      // First inject the highlight script
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        files: ["highlight-iframes.js"]
      });

      // Then send message to highlight all iframes
      const response = await chrome.tabs.sendMessage(currentTab.id, {
        action: 'highlightAllIframes'
      });

      if (response && response.success) {
        showStatus(`✅ Highlighted ${response.count} iframe(s) on page`);
      } else {
        showStatus('❌ Failed to highlight iframes', 'error');
      }
    } catch (error) {
      console.error('Error highlighting iframes:', error);
      showStatus('❌ Failed to highlight iframes', 'error');
    }
  }

  // Function to highlight a specific iframe
  async function highlightSpecificIframe(frameIndex) {
    try {
      if (!currentTab) {
        throw new Error('No active tab');
      }

      // First inject the highlight script
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        files: ["highlight-iframes.js"]
      });

      // Then send message to highlight specific iframe
      const response = await chrome.tabs.sendMessage(currentTab.id, {
        action: 'highlightSpecificIframe',
        frameIndex: frameIndex
      });

      if (response && response.success) {
        showStatus(`✅ Highlighted iframe #${frameIndex}`);
      } else {
        showStatus(`❌ Failed to highlight iframe #${frameIndex}`, 'error');
      }
    } catch (error) {
      console.error('Error highlighting specific iframe:', error);
      showStatus(`❌ Failed to highlight iframe #${frameIndex}`, 'error');
    }
  }

  // Function to clear iframe highlights
  async function clearIframeHighlights() {
    try {
      if (!currentTab) {
        throw new Error('No active tab');
      }

      // Send message to clear highlights
      const response = await chrome.tabs.sendMessage(currentTab.id, {
        action: 'clearIframeHighlights'
      });

      if (response && response.success) {
        showStatus('✅ Cleared iframe highlights');
      } else {
        showStatus('❌ Failed to clear highlights', 'error');
      }
    } catch (error) {
      console.error('Error clearing highlights:', error);
      showStatus('❌ Failed to clear highlights', 'error');
    }
  }

  // Event listeners
  refreshBtn.addEventListener("click", scanIframes);
  injectMainBtn.addEventListener("click", injectIntoMainWindow);
  injectAllBtn.addEventListener("click", injectIntoAll);
  highlightIframesBtn.addEventListener("click", highlightAllIframes);
  clearHighlightBtn.addEventListener("click", clearIframeHighlights);

  // Initial scan when popup opens
  scanIframes();
});
