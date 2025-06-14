# Azure DevOps PR File Colors

A Microsoft Edge extension that color-codes file types in Azure DevOps pull requests to make code reviews easier and faster.

## Features

- **Color-coded file types**: Instantly identify different file types in PR diffs
- **Customizable colors**: Change colors for each file type through the extension popup
- **Configurable URL pattern**: Set your own Azure DevOps organization URL pattern
- **File type support**:
  - `.ts` - TypeScript files
  - `.tsx` - React TypeScript files
  - `.mapper.ts` - Mapper files
  - `.mapper.tsx` - React Mapper files
  - `.test.ts` - TypeScript test files
  - `.test.tsx` - React test files
  - `.mapper.test.ts` - Mapper test files
  - `.mapper.test.tsx` - React Mapper test files
  - `.stories.tsx` - Storybook story files
  - `.json` - JSON configuration files
  - `.resx` - Resource files
  - `.md` - Markdown documentation files

- **Smart detection**: Uses intelligent pattern matching to detect file types in order of specificity
- **Dynamic updates**: Colors apply instantly when navigating through PR pages
- **Sync across devices**: Settings are synchronized across your Microsoft Edge installations

## Installation

### From Source

1. Clone or download this repository
2. Open Microsoft Edge and navigate to `edge://extensions/`
3. Enable "Developer mode" in the left sidebar
4. Click "Load unpacked" and select the extension directory
5. The extension will be installed and ready to use

### Initial Setup

After installation, you must configure the extension:

1. Click the extension icon in the Edge toolbar
2. In the "Azure DevOps Configuration" section, enter your pull request URL pattern
3. Use this format: `https://your-devops-host.com/yourproject/_git/yourrepo/pullrequest*`
4. Replace the host, project, and repo with your actual values
5. The `*` wildcard at the end is important for matching all PR URLs
6. Click "Save Changes"

**Example URL patterns:**
- `https://dev.azure.com/myorg/MyProject/_git/MyRepo/pullrequest*`
- `https://your-company.com/yourproject/_git/yourrepo/pullrequest*`

### Creating Icons (Optional)

If you need to regenerate the extension icons:

1. **Using the web-based generator**:
   - Open `icons/create-icons.html` in a web browser
   - Click "Generate and Download Icons"
   - Save the downloaded files to the `icons/` directory

2. **Using PowerShell**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File icons/create-icons.ps1
   ```

## Usage

1. **Install and configure the extension** following the steps above
2. **Navigate to an Azure DevOps pull request** matching your configured URL pattern
3. **File names will automatically be color-coded** based on their type
4. **Customize colors** by clicking the extension icon in the toolbar

### Customizing Colors

1. Click the extension icon in the Edge toolbar
2. A popup will open showing all file types and their current colors
3. Click any color picker to change the color for that file type
4. Click "Save Changes" to apply your new color scheme
5. Use "Reset to Defaults" to restore the original colors

### Keyboard Shortcuts in Settings Popup

- `Ctrl/Cmd + S` - Save changes
- `Ctrl/Cmd + R` - Reset to defaults
- `Escape` - Close popup

## Technical Details

### File Detection Logic

The extension uses regex patterns to detect file types in order of specificity:

1. `.mapper.test.tsx` (most specific)
2. `.mapper.test.ts`
3. `.stories.tsx`
4. `.test.tsx`
5. `.test.ts`
6. `.mapper.tsx`
7. `.mapper.ts`
8. `.tsx`
9. `.ts`
10. `.resx`
11. `.json`
12. `.md` (least specific)

This ensures that more specific file types (like test files) are correctly identified even when they contain multiple extensions.

### Browser Compatibility

- **Microsoft Edge**: Fully supported (Chromium-based)
- **Google Chrome**: Compatible (same extension API)
- **Other Chromium browsers**: Should work with minimal modifications

### Permissions

The extension requires the following permissions:

- `storage` - To save and sync color preferences and URL configuration
- `activeTab` - To access the current tab for color updates
- Host permission for `https://*/*` - To run on any HTTPS website (user configures specific URLs)

### Privacy and Security

- **No data collection**: The extension does not collect or transmit any personal data
- **Local storage only**: All configuration (URL patterns and colors) is stored locally in your browser
- **No external connections**: The extension only operates on Azure DevOps pages you configure
- **Open source**: All code is available for inspection in this repository

## File Structure

```
pull-request-colours/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for settings management
├── content-script.js      # Main logic for file detection and styling
├── popup.html            # Settings interface
├── popup.js              # Settings interface logic
├── popup.css             # Settings interface styling
├── icons/                # Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   ├── icon-128.png
│   ├── create-icons.html  # Web-based icon generator
│   ├── create-icons.ps1   # PowerShell icon generator
│   └── README.md         # Icon documentation
└── README.md             # This file
```

## Default Color Scheme

- **`.ts`** - Blue (#0078d4) - Standard TypeScript files
- **`.tsx`** - Purple (#8764b8) - React TypeScript components
- **`.mapper.ts`** - Orange (#ff8c00) - Data mapping files
- **`.mapper.tsx`** - Orange-Red (#ff6b35) - React mapper files
- **`.test.ts`** - Green (#107c10) - TypeScript test files
- **`.test.tsx`** - Teal (#008a8a) - React component tests
- **`.mapper.test.ts`** - Red (#d13438) - Mapper test files
- **`.mapper.test.tsx`** - Dark Pink (#b91372) - React mapper test files
- **`.stories.tsx`** - Pink (#e3008c) - Storybook story files
- **`.json`** - Yellow (#ffb900) - Configuration files
- **`.resx`** - Purple (#9b59b6) - Resource files
- **`.md`** - Gray (#5d5d5d) - Documentation files

## Development

### Making Changes

1. Modify the source files as needed
2. Reload the extension in `edge://extensions/`
3. Test your changes on Azure DevOps PR pages

### Adding New File Types

1. Update the `FILE_PATTERNS` array in `content-script.js`
2. Add the new file type to `DEFAULT_COLORS` in `background.js`
3. Add corresponding UI elements in `popup.html` and `popup.js`
4. Update this README with the new file type information

### Debugging

- Open Edge Developer Tools (F12) on Azure DevOps pages
- Check the Console tab for extension logs
- Use the Sources tab to set breakpoints in extension scripts

## Contributing

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Azure DevOps PR pages
5. Submit a pull request

## License

This project is open source. See the license file for details.

## Support

If you encounter issues:

1. **Extension not working**: Make sure you've configured the URL pattern in the extension settings
2. **Colors not showing**: Verify you're on a pull request page that matches your configured URL pattern
3. **Settings not saving**: Check that the extension has storage permissions
4. **Invalid URL pattern**: Ensure your URL follows the format: `https://your-host.com/project/_git/repo/pullrequest*`

For additional help, check the browser console (F12) for error messages.

## Changelog

### Version 1.0.3
- Made URL pattern configurable for privacy and security
- Added URL validation and setup instructions
- Removed hardcoded organization-specific URLs
- Enhanced settings interface with URL configuration
- Made extension compatible with any Azure DevOps hosting

### Version 1.0.2
- Added support for `.resx` (resource) files
- Updated file detection logic to include resource files
- Enhanced UI with additional color picker for .resx files

### Version 1.0.1
- Added support for `.mapper.tsx` and `.mapper.test.tsx` files
- Updated file detection logic order
- Enhanced UI with additional color pickers

### Version 1.0.0
- Initial release
- Support for 9 file types
- Customizable color scheme
- Real-time color updates
- Settings synchronization
- Comprehensive documentation
