// Content script for Azure DevOps PR File Colors extension

// File type patterns in order of specificity (most specific first)
const FILE_PATTERNS = [
  { pattern: /\.mapper\.test\.tsx$/i, type: 'mapper.test.tsx' },
  { pattern: /\.mapper\.test\.ts$/i, type: 'mapper.test.ts' },
  { pattern: /\.stories\.tsx$/i, type: 'stories.tsx' },
  { pattern: /\.test\.tsx$/i, type: 'test.tsx' },
  { pattern: /\.test\.ts$/i, type: 'test.ts' },
  { pattern: /\.mapper\.tsx$/i, type: 'mapper.tsx' },
  { pattern: /\.mapper\.ts$/i, type: 'mapper.ts' },
  { pattern: /\.tsx$/i, type: 'tsx' },
  { pattern: /\.ts$/i, type: 'ts' },
  { pattern: /\.resx$/i, type: 'resx' },
  { pattern: /\.json$/i, type: 'json' },
  { pattern: /\.md$/i, type: 'md' }
];

// Current color scheme
let currentColors = {};

// CSS class prefix for our styles
const CSS_CLASS_PREFIX = 'azdo-file-color-';

// Initialize the extension
async function initialize() {
  console.log('Azure DevOps PR File Colors: Initializing...');
  
  // Load current color scheme
  await loadColors();
  
  // Apply colors to existing elements
  applyFileColors();
  
  // Set up observer for dynamic content
  setupMutationObserver();
  
  // Listen for color updates from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'colorsUpdated') {
      currentColors = request.colors;
      updateDynamicStyles();
      applyFileColors();
    }
  });
  
  console.log('Azure DevOps PR File Colors: Initialized successfully');
}

// Load colors from storage
async function loadColors() {
  try {
    const result = await chrome.storage.sync.get('fileColors');
    currentColors = result.fileColors || {};
    updateDynamicStyles();
  } catch (error) {
    console.error('Failed to load colors:', error);
  }
}

// Create and update dynamic CSS styles
function updateDynamicStyles() {
  // Remove existing style element
  const existingStyle = document.getElementById('azdo-file-colors-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create new style element
  const style = document.createElement('style');
  style.id = 'azdo-file-colors-styles';
  
  let css = '';
  Object.entries(currentColors).forEach(([fileType, color]) => {
    const className = CSS_CLASS_PREFIX + fileType.replace(/\./g, '-');
    css += `.${className} { color: ${color} !important; }\n`;
  });
  
  style.textContent = css;
  document.head.appendChild(style);
}

// Detect file type from filename
function detectFileType(filename) {
  for (const { pattern, type } of FILE_PATTERNS) {
    if (pattern.test(filename)) {
      return type;
    }
  }
  return null;
}

// Apply color classes to file elements
function applyFileColors() {
  // Common selectors for Azure DevOps file names in PR views
  const fileSelectors = [
    // File name links in diff view
    '.repos-compare-toolbar .secondary-text',
    '.file-header .secondary-text',
    '.diff-header .secondary-text',
    // File names in file tree
    '.repos-tree-view .repos-tree-node .text-ellipsis',
    // File names in changes list
    '.vc-pullrequest-files-tree .tree-node .text-ellipsis',
    '.vc-pullrequest-files-tree .tree-node .item-text',
    // File path in file header
    '.file-path-header .file-path',
    '.diff-file-header .file-path',
    // Additional selectors for different views
    '.repos-changes-explorer .item-name',
    '.change-list .change-summary .text-ellipsis',
    '.change-summary-item .text-ellipsis',
    // File names in commit details
    '.commit-files-container .file-name',
    '.commit-file-summary .file-name'
  ];
  
  fileSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const filename = element.textContent.trim();
      if (filename) {
        // Remove existing color classes
        element.classList.forEach(className => {
          if (className.startsWith(CSS_CLASS_PREFIX)) {
            element.classList.remove(className);
          }
        });
        
        // Apply new color class
        const fileType = detectFileType(filename);
        if (fileType && currentColors[fileType]) {
          const className = CSS_CLASS_PREFIX + fileType.replace(/\./g, '-');
          element.classList.add(className);
        }
      }
    });
  });
  
  // Also check for file names in anchor tags and spans
  const links = document.querySelectorAll('a[href*="/pullrequest/"], span');
  links.forEach(link => {
    const text = link.textContent.trim();
    if (text && (text.includes('.ts') || text.includes('.tsx') || text.includes('.json') || text.includes('.md') || text.includes('.resx'))) {
      // Remove existing color classes
      link.classList.forEach(className => {
        if (className.startsWith(CSS_CLASS_PREFIX)) {
          link.classList.remove(className);
        }
      });
      
      // Apply new color class
      const fileType = detectFileType(text);
      if (fileType && currentColors[fileType]) {
        const className = CSS_CLASS_PREFIX + fileType.replace(/\./g, '-');
        link.classList.add(className);
      }
    }
  });
}

// Set up mutation observer to handle dynamic content
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldReapply = false;
    
    mutations.forEach((mutation) => {
      // Check if new nodes were added
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node contains file elements
            const hasFileElements = node.querySelector && (
              node.querySelector('.secondary-text') ||
              node.querySelector('.text-ellipsis') ||
              node.querySelector('.file-path') ||
              node.querySelector('.item-name') ||
              node.classList.contains('secondary-text') ||
              node.classList.contains('text-ellipsis') ||
              node.classList.contains('file-path') ||
              node.classList.contains('item-name')
            );
            
            if (hasFileElements) {
              shouldReapply = true;
            }
          }
        });
      }
      
      // Check if text content changed
      if (mutation.type === 'characterData' || mutation.type === 'childList') {
        shouldReapply = true;
      }
    });
    
    if (shouldReapply) {
      // Debounce the reapplication to avoid excessive calls
      clearTimeout(window.azDoFileColorsTimeout);
      window.azDoFileColorsTimeout = setTimeout(() => {
        applyFileColors();
      }, 100);
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// Current Azure DevOps URL pattern
let azureDevOpsUrlPattern = '';

// Check if we're on a PR page
function isPullRequestPage() {
  if (!azureDevOpsUrlPattern) {
    return false; // No URL pattern configured
  }
  
  // Check if current URL matches the configured pattern
  try {
    const urlRegex = new RegExp(azureDevOpsUrlPattern.replace(/\*/g, '.*'), 'i');
    return urlRegex.test(window.location.href);
  } catch (error) {
    console.error('Invalid URL pattern:', azureDevOpsUrlPattern, error);
    return false;
  }
}

// Load Azure DevOps URL pattern from storage
async function loadUrlPattern() {
  try {
    const result = await chrome.storage.sync.get('azureDevOpsUrl');
    azureDevOpsUrlPattern = result.azureDevOpsUrl || '';
    console.log('Azure DevOps URL pattern loaded:', azureDevOpsUrlPattern);
  } catch (error) {
    console.error('Failed to load URL pattern:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await loadUrlPattern();
    if (isPullRequestPage()) {
      initialize();
    }
  });
} else {
  loadUrlPattern().then(() => {
    if (isPullRequestPage()) {
      initialize();
    }
  });
}

// Also initialize on navigation changes (for SPA behavior)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (isPullRequestPage()) {
      setTimeout(initialize, 500); // Small delay for page to load
    }
  }
}).observe(document, { subtree: true, childList: true });
