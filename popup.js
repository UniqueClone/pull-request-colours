// Popup script for Azure DevOps PR File Colors extension

// File type mapping for UI elements
const FILE_TYPE_MAPPINGS = {
  'ts': 'color-ts',
  'tsx': 'color-tsx',
  'mapper.ts': 'color-mapper-ts',
  'mapper.tsx': 'color-mapper-tsx',
  'test.ts': 'color-test-ts',
  'test.tsx': 'color-test-tsx',
  'mapper.test.ts': 'color-mapper-test-ts',
  'mapper.test.tsx': 'color-mapper-test-tsx',
  'stories.tsx': 'color-stories-tsx',
  'json': 'color-json',
  'resx': 'color-resx',
  'md': 'color-md'
};

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup initializing...');
  
  await loadCurrentColors();
  await loadCurrentUrl();
  setupEventListeners();
  updateExampleColors();
  
  console.log('Popup initialized successfully');
});

// Load current colors from storage and populate inputs
async function loadCurrentColors() {
  try {
    const result = await chrome.storage.sync.get('fileColors');
    const currentColors = result.fileColors || {};
    
    // Set color input values
    Object.entries(FILE_TYPE_MAPPINGS).forEach(([fileType, inputId]) => {
      const input = document.getElementById(inputId);
      if (input && currentColors[fileType]) {
        input.value = currentColors[fileType];
      }
    });
    
    console.log('Colors loaded:', currentColors);
  } catch (error) {
    console.error('Failed to load colors:', error);
    showStatusMessage('Failed to load current colors', 'error');
  }
}

// Load current URL from storage and populate input
async function loadCurrentUrl() {
  try {
    const result = await chrome.storage.sync.get('azureDevOpsUrl');
    const currentUrl = result.azureDevOpsUrl || '';
    
    // Set URL input value
    const urlInput = document.getElementById('azure-devops-url');
    if (urlInput) {
      urlInput.value = currentUrl;
    }
    
    console.log('URL loaded:', currentUrl);
  } catch (error) {
    console.error('Failed to load URL:', error);
    showStatusMessage('Failed to load current URL', 'error');
  }
}

// Setup event listeners for buttons and inputs
function setupEventListeners() {
  // Save button
  const saveBtn = document.getElementById('save-btn');
  saveBtn.addEventListener('click', saveSettings);
  
  // Reset button
  const resetBtn = document.getElementById('reset-btn');
  resetBtn.addEventListener('click', resetToDefaults);
  
  // Color input changes - update examples in real-time
  Object.values(FILE_TYPE_MAPPINGS).forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', updateExampleColors);
    }
  });
  
  // URL input validation
  const urlInput = document.getElementById('azure-devops-url');
  if (urlInput) {
    urlInput.addEventListener('input', validateUrl);
  }
}

// Save current color settings
async function saveColors() {
  try {
    const colors = {};
    
    // Collect all color values
    Object.entries(FILE_TYPE_MAPPINGS).forEach(([fileType, inputId]) => {
      const input = document.getElementById(inputId);
      if (input && input.value) {
        colors[fileType] = input.value;
      }
    });
    
    // Save to storage
    await chrome.storage.sync.set({ fileColors: colors });
    
    // Show success message
    showStatusMessage('Colors saved successfully!', 'success');
    
    console.log('Colors saved:', colors);
  } catch (error) {
    console.error('Failed to save colors:', error);
    showStatusMessage('Failed to save colors', 'error');
  }
}

// Reset colors to defaults
async function resetToDefaults() {
  try {
    // Get default colors from background script
    const response = await chrome.runtime.sendMessage({ action: 'getDefaultColors' });
    const defaultColors = response.defaultColors;
    
    if (defaultColors) {
      // Update input values
      Object.entries(FILE_TYPE_MAPPINGS).forEach(([fileType, inputId]) => {
        const input = document.getElementById(inputId);
        if (input && defaultColors[fileType]) {
          input.value = defaultColors[fileType];
        }
      });
      
      // Save defaults to storage
      await chrome.storage.sync.set({ fileColors: defaultColors });
      
      // Update examples
      updateExampleColors();
      
      // Show success message
      showStatusMessage('Reset to default colors', 'success');
      
      console.log('Colors reset to defaults:', defaultColors);
    }
  } catch (error) {
    console.error('Failed to reset colors:', error);
    showStatusMessage('Failed to reset colors', 'error');
  }
}

// Update example file names with current colors
function updateExampleColors() {
  Object.entries(FILE_TYPE_MAPPINGS).forEach(([fileType, inputId]) => {
    const input = document.getElementById(inputId);
    const label = input ? input.closest('.color-input-group').querySelector('label') : null;
    const example = label ? label.querySelector('.file-example') : null;
    
    if (input && example && input.value) {
      example.style.color = input.value;
    }
  });
}

// Show status message with animation
function showStatusMessage(message, type = 'success') {
  const statusElement = document.getElementById('status-message');
  
  // Clear existing classes and content
  statusElement.className = 'status-message';
  statusElement.textContent = message;
  
  // Add type class and show animation
  statusElement.classList.add(type, 'show');
  
  // Clear message after 3 seconds
  setTimeout(() => {
    statusElement.classList.remove('show');
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = 'status-message';
    }, 300);
  }, 3000);
}

// Save all settings (URL and colors)
async function saveSettings() {
  try {
    const urlInput = document.getElementById('azure-devops-url');
    const azureDevOpsUrl = urlInput ? urlInput.value.trim() : '';
    
    // Validate URL
    if (azureDevOpsUrl && !isValidUrlPattern(azureDevOpsUrl)) {
      showStatusMessage('Please enter a valid URL pattern', 'error');
      return;
    }
    
    const colors = {};
    
    // Collect all color values
    Object.entries(FILE_TYPE_MAPPINGS).forEach(([fileType, inputId]) => {
      const input = document.getElementById(inputId);
      if (input && input.value) {
        colors[fileType] = input.value;
      }
    });
    
    // Save both URL and colors to storage
    await chrome.storage.sync.set({ 
      azureDevOpsUrl: azureDevOpsUrl,
      fileColors: colors 
    });
    
    // Show success message
    showStatusMessage('Settings saved successfully!', 'success');
    
    console.log('Settings saved:', { azureDevOpsUrl, colors });
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatusMessage('Failed to save settings', 'error');
  }
}

// Validate URL pattern
function validateUrl() {
  const urlInput = document.getElementById('azure-devops-url');
  const url = urlInput.value.trim();
  
  if (url && !isValidUrlPattern(url)) {
    urlInput.setCustomValidity('Please enter a valid URL pattern (e.g., https://dev.azure.com/yourorg/project/_git/repo/pullrequest*)');
  } else {
    urlInput.setCustomValidity('');
  }
}

// Check if URL pattern is valid
function isValidUrlPattern(url) {
  // Basic validation for Azure DevOps URL pattern
  const patterns = [
    /^https:\/\/dev\.azure\.com\/[^/]+\/[^/]+\/_git\/[^/]+\/pullrequest\*?$/,
    /^https:\/\/[a-zA-Z0-9.-]+\/[^/]+\/_git\/[^/]+\/pullrequest\*?$/
  ];
  return patterns.some(pattern => pattern.test(url)) || (url.includes('_git') && url.includes('pullrequest'));
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Ctrl/Cmd + S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    saveSettings();
  }
  
  // Ctrl/Cmd + R to reset
  if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
    event.preventDefault();
    resetToDefaults();
  }
  
  // Escape to close popup
  if (event.key === 'Escape') {
    window.close();
  }
});

// Handle clicking on labels to focus color inputs
document.addEventListener('click', (event) => {
  if (event.target.closest('label')) {
    const label = event.target.closest('label');
    const input = document.getElementById(label.getAttribute('for'));
    if (input && input.type === 'color') {
      input.focus();
      input.click();
    }
  }
});

// Add visual feedback for color changes
document.addEventListener('input', (event) => {
  if (event.target.type === 'color') {
    const colorGroup = event.target.closest('.color-input-group');
    if (colorGroup) {
      // Add a subtle animation to indicate change
      colorGroup.style.backgroundColor = '#f0f8ff';
      setTimeout(() => {
        colorGroup.style.backgroundColor = '';
      }, 200);
    }
  }
});
