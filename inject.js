// This script will run inside the iframe
console.log("🚀 Injected into iframe:", window.location.href);

// Function to highlight all elements with red border
function highlightAllElements() {
  // Get all elements in the iframe
  const allElements = document.querySelectorAll('*');
  
  console.log(`Found ${allElements.length} elements to highlight`);
  
  // Apply red border to each element
  allElements.forEach((element, index) => {
    // Store original border style to avoid overwriting
    if (!element.dataset.originalBorder) {
      element.dataset.originalBorder = element.style.border || 'none';
    }
    
    // Apply red border
    element.style.border = "2px solid red";
    element.style.boxSizing = "border-box"; // Prevent layout shifts
    
    // Optional: Add a subtle background to make elements more visible
    if (!element.dataset.originalBackground) {
      element.dataset.originalBackground = element.style.backgroundColor || 'transparent';
    }
    element.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
    
    console.log(`Highlighted element ${index + 1}:`, element.tagName, element.className || '(no class)');
  });
}

// Function to remove highlighting
function removeHighlighting() {
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (element.dataset.originalBorder) {
      element.style.border = element.dataset.originalBorder === 'none' ? '' : element.dataset.originalBorder;
      delete element.dataset.originalBorder;
    }
    
    if (element.dataset.originalBackground) {
      element.style.backgroundColor = element.dataset.originalBackground === 'transparent' ? '' : element.dataset.originalBackground;
      delete element.dataset.originalBackground;
    }
  });
  
  console.log("Removed highlighting from all elements");
}

// Variable to track currently selected element
let currentlySelected = null;

// Function to select an element and log its details
function selectElement(element) {
  // Remove previous selection
  if (currentlySelected) {
    currentlySelected.style.outline = '';
    currentlySelected.style.backgroundColor = currentlySelected.dataset.originalBackground === 'transparent' ? '' : currentlySelected.dataset.originalBackground;
  }
  
  // Set new selection
  currentlySelected = element;
  element.style.outline = '3px solid blue';
  element.style.backgroundColor = 'rgba(0, 0, 255, 0.2)';
  
  // Log element details
  const elementInfo = {
    tagName: element.tagName,
    id: element.id || '(no id)',
    className: element.className || '(no class)',
    textContent: element.textContent ? element.textContent.trim().substring(0, 100) + (element.textContent.trim().length > 100 ? '...' : '') : '(no text)',
    attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`),
    position: element.getBoundingClientRect(),
    innerHTML: element.innerHTML.substring(0, 200) + (element.innerHTML.length > 200 ? '...' : ''),
    element: element // Include the actual element for further inspection
  };
  
  console.group('🎯 Selected Element:');
  console.log('Tag:', elementInfo.tagName);
  console.log('ID:', elementInfo.id);
  console.log('Class:', elementInfo.className);
  console.log('Text Content:', elementInfo.textContent);
  console.log('Attributes:', elementInfo.attributes);
  console.log('Position:', elementInfo.position);
  console.log('Inner HTML (first 200 chars):', elementInfo.innerHTML);
  console.log('Full Element Object:', elementInfo.element);
  console.groupEnd();
  
  return elementInfo;
}

// Add click event listener for element selection
document.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  
  const clickedElement = event.target;
  selectElement(clickedElement);
}, true); // Use capture phase to ensure we catch the event first

// Execute highlighting
highlightAllElements();

// Optional: Add a way to toggle highlighting by double-clicking
document.addEventListener('dblclick', (event) => {
  event.preventDefault();
  event.stopPropagation();
  
  const hasHighlighting = document.querySelector('[data-original-border]');
  if (hasHighlighting) {
    removeHighlighting();
  } else {
    highlightAllElements();
  }
}, true);

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    // Clear selection
    if (currentlySelected) {
      currentlySelected.style.outline = '';
      currentlySelected.style.backgroundColor = currentlySelected.dataset.originalBackground === 'transparent' ? '' : currentlySelected.dataset.originalBackground;
      currentlySelected = null;
      console.log('🔄 Selection cleared');
    }
  } else if (event.key === 'i' || event.key === 'I') {
    // Log current selection info again
    if (currentlySelected) {
      selectElement(currentlySelected);
    }
  }
});

// Make functions globally available for debugging
window.highlightAllElements = highlightAllElements;
window.removeHighlighting = removeHighlighting;
window.selectElement = selectElement;
window.getCurrentSelection = () => currentlySelected;

console.log("documet", document)
