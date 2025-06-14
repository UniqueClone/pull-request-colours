// Background service worker for Azure DevOps PR File Colors extension

// Default color scheme for file types
const DEFAULT_COLORS = {
  'ts': '#0078d4',           // Blue - TypeScript files
  'tsx': '#8764b8',          // Purple - React TypeScript files
  'mapper.ts': '#ff8c00',    // Orange - Mapper files
  'mapper.tsx': '#ff6b35',   // Orange-Red - React Mapper files
  'test.ts': '#107c10',      // Green - TypeScript test files
  'test.tsx': '#008a8a',     // Teal - React test files
  'mapper.test.ts': '#d13438', // Red - Mapper test files
  'mapper.test.tsx': '#b91372', // Dark Pink - React Mapper test files
  'stories.tsx': '#e3008c',  // Pink - Storybook files
  'json': '#ffb900',         // Yellow - JSON files
  'resx': '#9b59b6',         // Purple - Resource files
  'md': '#5d5d5d'           // Gray - Markdown files
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Azure DevOps PR File Colors extension installed');
  
  // Set default colors if not already set
  const result = await chrome.storage.sync.get('fileColors');
  if (!result.fileColors) {
    await chrome.storage.sync.set({ fileColors: DEFAULT_COLORS });
    console.log('Default colors initialized');
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDefaultColors') {
    sendResponse({ defaultColors: DEFAULT_COLORS });
  }
});

// Handle storage changes and notify content scripts
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && (changes.fileColors || changes.azureDevOpsUrl)) {
    // Notify all tabs about changes
    chrome.tabs.query({ 
      url: 'https://*/*' 
    }, (tabs) => {
      tabs.forEach(tab => {
        const message = {
          action: changes.fileColors ? 'colorsUpdated' : 'urlUpdated'
        };
        if (changes.fileColors) {
          message.colors = changes.fileColors.newValue;
        }
        if (changes.azureDevOpsUrl) {
          message.url = changes.azureDevOpsUrl.newValue;
        }
        
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab might not have content script loaded, ignore error
        });
      });
    });
  }
});
