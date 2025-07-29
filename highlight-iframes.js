// Content script for highlighting iframes in the main page
console.log("🎯 Iframe highlighter loaded");

// Function to highlight all iframes on the page
function highlightAllIframes() {
  const iframes = document.querySelectorAll('iframe');
  console.log(`Found ${iframes.length} iframes to highlight`);
  
  iframes.forEach((iframe, index) => {
    // Store original styles
    if (!iframe.dataset.originalBorder) {
      iframe.dataset.originalBorder = iframe.style.border || 'none';
    }
    if (!iframe.dataset.originalOutline) {
      iframe.dataset.originalOutline = iframe.style.outline || 'none';
    }
    if (!iframe.dataset.originalBoxShadow) {
      iframe.dataset.originalBoxShadow = iframe.style.boxShadow || 'none';
    }
    
    // Apply highlighting
    iframe.style.border = '3px solid #FF4081';
    iframe.style.outline = '2px dashed #9C27B0';
    iframe.style.boxShadow = '0 0 20px rgba(255, 64, 129, 0.5)';
    iframe.style.position = 'relative';
    
    // Add a label to identify the iframe
    let label = iframe.querySelector('.iframe-highlight-label');
    if (!label) {
      label = document.createElement('div');
      label.className = 'iframe-highlight-label';
      label.style.cssText = `
        position: absolute;
        top: -25px;
        left: 0;
        background: #FF4081;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      `;
      label.textContent = `Iframe #${index + 1}`;
      
      // Create a wrapper if the iframe doesn't have position relative
      if (getComputedStyle(iframe.parentElement).position === 'static') {
        iframe.parentElement.style.position = 'relative';
      }
      
      iframe.parentElement.insertBefore(label, iframe);
    }
    
    console.log(`Highlighted iframe ${index + 1}:`, iframe.src || 'about:blank');
  });
  
  return iframes.length;
}

// Function to highlight a specific iframe
function highlightSpecificIframe(frameId) {
  // This is more complex as we need to map frameId to actual DOM element
  // For now, we'll just highlight all and focus on the specific one
  const iframes = document.querySelectorAll('iframe');
  
  // Clear all highlights first
  clearIframeHighlights();
  
  if (frameId && frameId > 0 && frameId <= iframes.length) {
    const targetIframe = iframes[frameId - 1];
    
    // Store original styles
    targetIframe.dataset.originalBorder = targetIframe.style.border || 'none';
    targetIframe.dataset.originalOutline = targetIframe.style.outline || 'none';
    targetIframe.dataset.originalBoxShadow = targetIframe.style.boxShadow || 'none';
    
    // Apply special highlighting for this iframe
    targetIframe.style.border = '5px solid #4CAF50';
    targetIframe.style.outline = '3px dashed #2196F3';
    targetIframe.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.8)';
    
    // Add special label
    let label = document.createElement('div');
    label.className = 'iframe-highlight-label';
    label.style.cssText = `
      position: absolute;
      top: -30px;
      left: 0;
      background: #4CAF50;
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      z-index: 10000;
      font-family: Arial, sans-serif;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      animation: pulse 1s infinite;
    `;
    label.textContent = `🎯 Target Iframe #${frameId}`;
    
    // Add pulse animation
    if (!document.querySelector('#iframe-pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'iframe-pulse-animation';
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
    
    if (getComputedStyle(targetIframe.parentElement).position === 'static') {
      targetIframe.parentElement.style.position = 'relative';
    }
    
    targetIframe.parentElement.insertBefore(label, targetIframe);
    
    // Scroll to the iframe
    targetIframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    console.log(`Highlighted specific iframe #${frameId}:`, targetIframe.src || 'about:blank');
    return true;
  }
  
  return false;
}

// Function to clear iframe highlights
function clearIframeHighlights() {
  const iframes = document.querySelectorAll('iframe');
  
  iframes.forEach(iframe => {
    // Restore original styles
    if (iframe.dataset.originalBorder) {
      iframe.style.border = iframe.dataset.originalBorder === 'none' ? '' : iframe.dataset.originalBorder;
      delete iframe.dataset.originalBorder;
    }
    if (iframe.dataset.originalOutline) {
      iframe.style.outline = iframe.dataset.originalOutline === 'none' ? '' : iframe.dataset.originalOutline;
      delete iframe.dataset.originalOutline;
    }
    if (iframe.dataset.originalBoxShadow) {
      iframe.style.boxShadow = iframe.dataset.originalBoxShadow === 'none' ? '' : iframe.dataset.originalBoxShadow;
      delete iframe.dataset.originalBoxShadow;
    }
  });
  
  // Remove all labels
  const labels = document.querySelectorAll('.iframe-highlight-label');
  labels.forEach(label => label.remove());
  
  // Remove animation style
  const animationStyle = document.querySelector('#iframe-pulse-animation');
  if (animationStyle) {
    animationStyle.remove();
  }
  
  console.log("Cleared all iframe highlights");
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  
  if (request.action === 'highlightAllIframes') {
    const count = highlightAllIframes();
    sendResponse({ success: true, count: count });
  } else if (request.action === 'highlightSpecificIframe') {
    const success = highlightSpecificIframe(request.frameIndex);
    sendResponse({ success: success });
  } else if (request.action === 'clearIframeHighlights') {
    clearIframeHighlights();
    sendResponse({ success: true });
  }
  
  return true; // Keep the message channel open for async response
});

// Make functions globally available for debugging
window.highlightAllIframes = highlightAllIframes;
window.highlightSpecificIframe = highlightSpecificIframe;
window.clearIframeHighlights = clearIframeHighlights;
