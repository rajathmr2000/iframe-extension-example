// Background script for Iframe Inspector extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("🖼️ Iframe Inspector extension installed");
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'getFrameInfo') {
    // Handle frame information requests
    chrome.webNavigation.getAllFrames({ tabId: sender.tab.id }, (frames) => {
      sendResponse({ frames: frames });
    });
    return true; // Will respond asynchronously
  }
  
  // Handle script injection requests
  if (request.action === 'injectScript') {
    handleScriptInjection(request, sendResponse);
    return true; // Will respond asynchronously
  }
  
  // Handle script injection into all frames
  if (request.action === 'injectScriptAll') {
    handleInjectScriptAll(request, sendResponse);
    return true; // Will respond asynchronously
  }
});

// Function to inject script into specific target (main window or specific iframe)
async function handleScriptInjection(request, sendResponse) {
  try {
    const { tabId, frameIds, scriptFile, target } = request;
    
    console.log(`Injecting ${scriptFile} into tab ${tabId}, target: ${target}`, frameIds ? `frameIds: ${frameIds}` : '');
    
    const injectionTarget = {
      tabId: tabId
    };
    
    // Add frameIds if specified (for iframe injection)
    if (frameIds && frameIds.length > 0) {
      injectionTarget.frameIds = frameIds;
    }
    // If no frameIds specified, it will inject into main frame (frameId: 0)
    
    await chrome.scripting.executeScript({
      target: injectionTarget,
      files: [scriptFile]
    });
    
    const targetDesc = frameIds && frameIds.length > 0 ? 
      `iframe(s) [${frameIds.join(', ')}]` : 'main window';
    
    sendResponse({ 
      success: true, 
      message: `Script ${scriptFile} injected into ${targetDesc}`,
      target: target,
      frameIds: frameIds
    });
  } catch (error) {
    console.error('Error injecting script:', error);
    sendResponse({ 
      success: false, 
      error: error.message,
      target: request.target
    });
  }
}

// Function to inject script into all frames (main window + all iframes)
async function handleInjectScriptAll(request, sendResponse) {
  try {
    const { tabId, scriptFile } = request;
    
    console.log(`Injecting ${scriptFile} into all frames of tab ${tabId}`);
    
    // Get all frames in the tab
    chrome.webNavigation.getAllFrames({ tabId: tabId }, async (frames) => {
      if (chrome.runtime.lastError) {
        sendResponse({ 
          success: false, 
          error: chrome.runtime.lastError.message 
        });
        return;
      }
      
      try {
        const results = [];
        
        // Inject into all frames (including main frame with frameId 0)
        for (const frame of frames) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabId, frameIds: [frame.frameId] },
              files: [scriptFile]
            });
            
            const frameType = frame.frameId === 0 ? 'main window' : `iframe ${frame.frameId}`;
            results.push({
              frameId: frame.frameId,
              url: frame.url,
              success: true,
              type: frameType
            });
            
            console.log(`✅ Injected into ${frameType}: ${frame.url}`);
          } catch (frameError) {
            console.error(`❌ Failed to inject into frame ${frame.frameId}:`, frameError);
            results.push({
              frameId: frame.frameId,
              url: frame.url,
              success: false,
              error: frameError.message,
              type: frame.frameId === 0 ? 'main window' : `iframe ${frame.frameId}`
            });
          }
        }
        
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        sendResponse({
          success: true,
          message: `Script injected into ${successCount}/${totalCount} frames`,
          results: results,
          totalFrames: totalCount,
          successfulInjections: successCount
        });
      } catch (error) {
        console.error('Error in bulk injection:', error);
        sendResponse({ 
          success: false, 
          error: error.message 
        });
      }
    });
  } catch (error) {
    console.error('Error in handleInjectScriptAll:', error);
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

// Log when extension starts
console.log("🖼️ Iframe Inspector background script loaded");
