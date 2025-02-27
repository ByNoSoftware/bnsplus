/**
 * BNSCode+ Application JavaScript
 * Modern, responsive kod paylaşım uygulaması
 * 
 * Version: 2.0.0
 */

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the BNSCode application
  const app = new BNSCodeApp();
  app.init();
});

/**
 * BNSCode+ Application Main Class
 */
class BNSCodeApp {
  /**
   * Constructor
   */
  constructor() {
    // DOM Elements
    this.codeEditor = document.getElementById('codeEditor');
    this.codeViewer = document.getElementById('codeViewer');
    this.codeViewerContent = document.querySelector('#codeViewer code');
    this.editorContainer = document.getElementById('editorContainer');
    
    // Buttons
    this.newBtn = document.getElementById('newBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.copyBtn = document.getElementById('copyBtn');
    this.duplicateBtn = document.getElementById('duplicateBtn');
    this.rawBtn = document.getElementById('rawBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.languageBtn = document.getElementById('languageBtn');
    this.infoBtn = document.getElementById('infoBtn');
    this.themeSwitcher = document.getElementById('themeSwitcher');
    this.fontSizeIncrease = document.getElementById('fontSizeIncrease');
    this.fontSizeDecrease = document.getElementById('fontSizeDecrease');
    this.keyboardShortcuts = document.getElementById('keyboardShortcuts');
    this.statisticsBtn = document.getElementById('statisticsBtn');
    
    // Counters
    this.lineCount = document.getElementById('lineCount');
    this.charCount = document.getElementById('charCount');
    
    // State
    this.currentKey = null;
    this.currentMode = 'edit'; // 'edit' or 'view'
    this.currentLanguage = 'auto';
    this.isDirty = false;
    this.fontSize = 14;
    this.isLocked = false;
    
    // Language list mapping
    this.languageMap = {
      'javascript': { name: 'JavaScript', extension: 'js' },
      'typescript': { name: 'TypeScript', extension: 'ts' },
      'html': { name: 'HTML', extension: 'html' },
      'css': { name: 'CSS', extension: 'css' },
      'python': { name: 'Python', extension: 'py' },
      'java': { name: 'Java', extension: 'java' },
      'csharp': { name: 'C#', extension: 'cs' },
      'cpp': { name: 'C++', extension: 'cpp' },
      'c': { name: 'C', extension: 'c' },
      'php': { name: 'PHP', extension: 'php' },
      'ruby': { name: 'Ruby', extension: 'rb' },
      'go': { name: 'Go', extension: 'go' },
      'rust': { name: 'Rust', extension: 'rs' },
      'kotlin': { name: 'Kotlin', extension: 'kt' },
      'swift': { name: 'Swift', extension: 'swift' },
      'sql': { name: 'SQL', extension: 'sql' },
      'bash': { name: 'Bash', extension: 'sh' },
      'powershell': { name: 'PowerShell', extension: 'ps1' },
      'markdown': { name: 'Markdown', extension: 'md' },
      'json': { name: 'JSON', extension: 'json' },
      'xml': { name: 'XML', extension: 'xml' },
      'yaml': { name: 'YAML', extension: 'yaml' },
      'plaintext': { name: 'Plain Text', extension: 'txt' }
    };
  }
  
  /**
   * Initialize the application
   */
  init() {
    this.setupEventListeners();
    this.loadFromUrl();
    this.updateCounters();
    this.setupTheme();
    this.populateLanguageDropdown();
    this.setupKeyboardShortcuts();
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Button clicks
    this.newBtn.addEventListener('click', () => this.newDocument());
    this.saveBtn.addEventListener('click', () => this.saveDocument());
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.duplicateBtn.addEventListener('click', () => this.duplicateDocument());
    this.rawBtn.addEventListener('click', () => this.viewRawDocument());
    this.downloadBtn.addEventListener('click', () => this.downloadDocument());
    this.languageBtn.addEventListener('click', () => this.toggleLanguagePanel());
    this.infoBtn.addEventListener('click', () => this.showInfoModal());
    this.themeSwitcher.addEventListener('click', () => this.toggleTheme());
    this.fontSizeIncrease.addEventListener('click', () => this.changeFontSize(1));
    this.fontSizeDecrease.addEventListener('click', () => this.changeFontSize(-1));
    this.keyboardShortcuts.addEventListener('click', () => this.showKeyboardShortcutsModal());
    this.statisticsBtn.addEventListener('click', () => this.showStatisticsModal());
    
    // Editor events
    this.codeEditor.addEventListener('input', () => {
      this.isDirty = true;
      this.updateCounters();
    });
    
    // Tab handling in the editor
    this.codeEditor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.codeEditor.selectionStart;
        const end = this.codeEditor.selectionEnd;
        
        // Insert 4 spaces
        this.codeEditor.value = this.codeEditor.value.substring(0, start) + '    ' + this.codeEditor.value.substring(end);
        
        // Put caret at right position
        this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 4;
      }
    });
    
    // Window events
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty && this.currentMode === 'edit') {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
  }
  
  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+S: Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveDocument();
      }
      
      // Ctrl+Alt+N: New
      if (e.ctrlKey && e.altKey && e.key === 'n') {
        e.preventDefault();
        this.newDocument();
      }
      
      // Ctrl+D: Duplicate
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.duplicateDocument();
      }
      
      // Ctrl+R: Raw
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        this.viewRawDocument();
      }
      
      // Ctrl+Alt+D: Download
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        e.preventDefault();
        this.downloadDocument();
      }
      
      // Ctrl+F: Search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        this.showSearchModal();
      }
    });
  }
  
  /**
   * Load document from URL
   */
  loadFromUrl() {
    const path = window.location.pathname;
    if (path === '/') {
      this.newDocument(true);
    } else {
      const key = path.substring(1);
      this.loadDocument(key);
    }
  }
  
  /**
   * Create a new document
   * @param {boolean} hideHistory - Whether to hide from browser history
   */
  newDocument(hideHistory = false) {
    this.codeViewer.classList.add('d-none');
    this.codeEditor.classList.remove('d-none');
    this.currentKey = null;
    
    if (!hideHistory) {
      window.history.pushState(null, 'BNSCode+', '/');
    }
    
    document.title = 'BNSCode+';
    this.enableButtons(['save']);
    this.disableButtons(['duplicate', 'raw']);
    
    this.codeEditor.value = '';
    this.codeEditor.focus();
    this.currentMode = 'edit';
    this.isDirty = false;
    this.isLocked = false;
    
    this.updateCounters();
  }
  
  /**
   * Load an existing document
   * @param {string} key - Document key
   */
  loadDocument(key) {
    this.showLoading();
    
    fetch(`/documents/${key}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.currentKey = key;
        
        this.codeViewerContent.innerHTML = data.highlighted || hljs.highlightAuto(data.data).value;
        this.codeEditor.value = data.data;
        
        document.getElementById('currentLanguage').textContent = data.language || 'otomatik';
        this.currentLanguage = data.language || 'auto';
        
        this.codeViewer.classList.remove('d-none');
        this.codeEditor.classList.add('d-none');
        
        document.title = `BNSCode+ - ${key}`;
        window.history.pushState(null, document.title, `/${key}`);
        
        this.enableButtons(['duplicate', 'raw']);
        this.disableButtons(['save']);
        
        this.currentMode = 'view';
        this.isDirty = false;
        this.isLocked = true;
        
        this.updateCounters();
        this.hideLoading();
      })
      .catch(error => {
        console.error('Error loading document:', error);
        this.hideLoading();
        this.showToast('Belge yüklenirken hata oluştu', 'error');
        this.newDocument();
      });
  }
  
  /**
   * Save the document
   */
  saveDocument() {
    const content = this.codeEditor.value;
    
    if (!content.trim()) {
      this.showToast('Boş belge kaydedilemez', 'warning');
      return;
    }
    
    this.showLoading();
    
    fetch('/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: content
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.loadDocument(data.key);
        this.showToast('Belge başarıyla kaydedildi', 'success');
        this.isDirty = false;
      })
      .catch(error => {
        console.error('Error saving document:', error);
        this.hideLoading();
        this.showToast('Belge kaydedilirken hata oluştu', 'error');
      });
  }
  
  /**
   * Copy content to clipboard
   */
  copyToClipboard() {
    const content = this.currentMode === 'edit' ? this.codeEditor.value : this.codeEditor.value;
    
    navigator.clipboard.writeText(content)
      .then(() => {
        this.showToast('İçerik panoya kopyalandı', 'success');
      })
      .catch(error => {
        console.error('Error copying to clipboard:', error);
        this.showToast('Panoya kopyalanırken hata oluştu', 'error');
      });
  }
  
  /**
   * Duplicate the document for editing
   */
  duplicateDocument() {
    if (this.isLocked && this.currentMode === 'view') {
      this.codeViewer.classList.add('d-none');
      this.codeEditor.classList.remove('d-none');
      
      this.currentMode = 'edit';
      this.isLocked = false;
      this.isDirty = true;
      
      this.enableButtons(['save']);
      
      window.history.pushState(null, 'BNSCode+', '/');
      document.title = 'BNSCode+';
      
      this.codeEditor.focus();
    }
  }
  
  /**
   * View raw document
   */
  viewRawDocument() {
    if (this.currentKey) {
      window.open(`/raw/${this.currentKey}`, '_blank');
    }
  }
  
  /**
   * Download the document
   */
  downloadDocument() {
    const content = this.currentMode === 'edit' ? this.codeEditor.value : this.codeEditor.value;
    if (!content.trim()) {
      this.showToast('Boş belge indirilemez', 'warning');
      return;
    }
    
    const language = this.currentLanguage === 'auto' ? this.detectLanguage(content) : this.currentLanguage;
    const extension = this.languageMap[language]?.extension || 'txt';
    
    const filename = this.currentKey ? `${this.currentKey}.${extension}` : `code.${extension}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showToast(`Belge "${filename}" olarak indirildi`, 'success');
  }
  
  /**
   * Toggle language selection panel
   */
  toggleLanguagePanel() {
    const panel = document.getElementById('languagePanel');
    panel.classList.toggle('d-none');
    
    if (!panel.classList.contains('d-none')) {
      this.populateLanguageList();
      document.getElementById('languageSearch').focus();
    }
  }
  
  /**
   * Populate language dropdown
   */
  populateLanguageDropdown() {
    const dropdown = document.querySelector('#languageDropdown + .dropdown-menu');
    
    // Clear existing items after the divider
    const divider = dropdown.querySelector('.dropdown-divider');
    let next = divider.nextElementSibling;
    while (next) {
      const current = next;
      next = current.nextElementSibling;
      current.remove();
    }
    
    // Add languages
    Object.entries(this.languageMap).forEach(([key, value]) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.classList.add('dropdown-item', 'language-option');
      link.href = '#';
      link.dataset.language = key;
      link.textContent = value.name;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.setLanguage(key);
      });
      
      item.appendChild(link);
      dropdown.appendChild(item);
    });
  }
  
  /**
   * Populate language list panel
   */
  populateLanguageList() {
    const languageList = document.getElementById('languageList');
    languageList.innerHTML = '';
    
    Object.entries(this.languageMap).forEach(([key, value]) => {
      const item = document.createElement('a');
      item.classList.add('list-group-item', 'list-group-item-action', 'language-item');
      item.dataset.language = key;
      item.textContent = value.name;
      item.addEventListener('click', () => {
        this.setLanguage(key);
        document.getElementById('languagePanel').classList.add('d-none');
      });
      
      languageList.appendChild(item);
    });
    
    // Add search functionality
    document.getElementById('languageSearch').addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll('.language-item').forEach(item => {
        const languageName = item.textContent.toLowerCase();
        if (languageName.includes(searchTerm)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
    
    document.getElementById('languagePanelClose').addEventListener('click', () => {
      document.getElementById('languagePanel').classList.add('d-none');
    });
  }
  
  /**
   * Set language
   * @param {string} language - Language identifier
   */
  setLanguage(language) {
    this.currentLanguage = language;
    document.getElementById('currentLanguage').textContent = language === 'auto' ? 'otomatik' : this.languageMap[language]?.name || language;
    
    // If in view mode, reload with new language highlighting
    if (this.currentMode === 'view' && this.currentKey) {
      const content = this.codeEditor.value;
      if (language === 'auto') {
        this.codeViewerContent.innerHTML = hljs.highlightAuto(content).value;
      } else {
        try {
          this.codeViewerContent.innerHTML = hljs.highlight(content, { language }).value;
        } catch (e) {
          this.codeViewerContent.innerHTML = hljs.highlightAuto(content).value;
        }
      }
    }
  }
  
  /**
   * Detect language from content
   * @param {string} content - Content to analyze
   * @returns {string} - Detected language
   */
  detectLanguage(content) {
    try {
      const result = hljs.highlightAuto(content);
      return result.language || 'plaintext';
    } catch (e) {
      return 'plaintext';
    }
  }
  
  /**
   * Show info modal
   */
  showInfoModal() {
    const modal = new bootstrap.Modal(document.getElementById('infoModal'));
    modal.show();
  }
  
  /**
   * Show keyboard shortcuts modal
   */
  showKeyboardShortcutsModal() {
    const modal = new bootstrap.Modal(document.getElementById('keyboardShortcutsModal'));
    modal.show();
  }
  
  /**
   * Show statistics modal
   */
  showStatisticsModal() {
    const content = this.currentMode === 'edit' ? this.codeEditor.value : this.codeEditor.value;
    const lines = content ? content.split('\n') : [];
    
    document.getElementById('statLineCount').textContent = lines.length;
    document.getElementById('statCharCount').textContent = content.length;
    
    const emptyLines = lines.filter(line => line.trim() === '').length;
    document.getElementById('statEmptyLines').textContent = emptyLines;
    document.getElementById('statNonEmptyLines').textContent = lines.length - emptyLines;
    
    // Detect comment lines based on language
    let commentLines = 0;
    const language = this.currentLanguage === 'auto' ? this.detectLanguage(content) : this.currentLanguage;
    
    if (['javascript', 'typescript', 'java', 'csharp', 'cpp', 'c', 'php'].includes(language)) {
      commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')).length;
    } else if (['python', 'ruby'].includes(language)) {
      commentLines = lines.filter(line => line.trim().startsWith('#')).length;
    } else if (['html', 'xml'].includes(language)) {
      commentLines = lines.filter(line => line.trim().startsWith('<!--') || line.trim().includes('-->')).length;
    }
    
    document.getElementById('statCommentLines').textContent = commentLines;
    
    const avgLineLength = lines.length > 0 ? Math.round(content.length / lines.length) : 0;
    document.getElementById('statAvgLineLength').textContent = avgLineLength;
    
    const fileSizeKB = Math.round(content.length / 1024 * 100) / 100;
    document.getElementById('statFileSize').textContent = `${fileSizeKB} KB`;
    
    document.getElementById('statLanguage').textContent = this.languageMap[language]?.name || language;
    
    const modal = new bootstrap.Modal(document.getElementById('statisticsModal'));
    modal.show();
  }
  
  /**
   * Show search modal
   */
  showSearchModal() {
    const modal = new bootstrap.Modal(document.getElementById('searchModal'));
    modal.show();
    document.getElementById('searchInput').focus();
    
    // Set up search functionality once modal is shown
    document.getElementById('searchModal').addEventListener('shown.bs.modal', () => {
      this.setupSearch();
    }, { once: true });
  }
  
  /**
   * Set up search functionality
   */
  setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchPrev = document.getElementById('searchPrev');
    const searchNext = document.getElementById('searchNext');
    const searchResults = document.getElementById('searchResults');
    const searchNoResults = document.getElementById('searchNoResults');
    const caseSensitive = document.getElementById('caseSensitiveSearch');
    
    let currentResults = [];
    let currentIndex = -1;
    
    const performSearch = () => {
      const searchTerm = searchInput.value;
      const content = this.currentMode === 'edit' ? this.codeEditor.value : this.codeEditor.value;
      
      if (!searchTerm) {
        searchResults.textContent = '0/0';
        searchPrev.disabled = true;
        searchNext.disabled = true;
        searchNoResults.classList.add('d-none');
        return;
      }
      
      // Find all instances
      const isCaseSensitive = caseSensitive.checked;
      currentResults = [];
      let index = -1;
      
      if (isCaseSensitive) {
        index = content.indexOf(searchTerm, 0);
        while (index !== -1) {
          currentResults.push(index);
          index = content.indexOf(searchTerm, index + 1);
        }
      } else {
        const lowerContent = content.toLowerCase();
        const lowerSearchTerm = searchTerm.toLowerCase();
        index = lowerContent.indexOf(lowerSearchTerm, 0);
        while (index !== -1) {
          currentResults.push(index);
          index = lowerContent.indexOf(lowerSearchTerm, index + 1);
        }
      }
      
      // Update results
      if (currentResults.length > 0) {
        searchNoResults.classList.add('d-none');
        searchResults.textContent = `0/${currentResults.length}`;
        searchPrev.disabled = true;
        searchNext.disabled = false;
        currentIndex = -1;
      } else {
        searchNoResults.classList.remove('d-none');
        searchResults.textContent = '0/0';
        searchPrev.disabled = true;
        searchNext.disabled = true;
      }
    };
    
    const navigateToResult = (index) => {
      if (index < 0 || index >= currentResults.length) return;
      
      currentIndex = index;
      searchResults.textContent = `${index + 1}/${currentResults.length}`;
      searchPrev.disabled = index === 0;
      searchNext.disabled = index === currentResults.length - 1;
      
      const searchTerm = searchInput.value;
      const position = currentResults[index];
      
      if (this.currentMode === 'edit') {
        this.codeEditor.focus();
        this.codeEditor.setSelectionRange(position, position + searchTerm.length);
        
        // Scroll to the position
        this.codeEditor.scrollTop = this.getScrollPosition(this.codeEditor.value, position);
      } else {
        // For view mode - could implement with scrollIntoView if needed
        // Would require search result highlighting in the rendered HTML
      }
    };
    
    // Event listeners
    searchInput.addEventListener('input', performSearch);
    caseSensitive.addEventListener('change', performSearch);
    searchButton.addEventListener('click', performSearch);
    
    searchPrev.addEventListener('click', () => {
      if (currentIndex > 0) {
        navigateToResult(currentIndex - 1);
      }
    });
    
    searchNext.addEventListener('click', () => {
      if (currentIndex < currentResults.length - 1) {
        navigateToResult(currentIndex + 1);
      } else if (currentIndex === -1 && currentResults.length > 0) {
        navigateToResult(0);
      }
    });
    
    // Initial search if there's text already in the input
    if (searchInput.value) {
      performSearch();
    }
  }
  
  /**
   * Get appropriate scroll position for search result
   * @param {string} text - Full text
   * @param {number} position - Character position
   * @returns {number} - Scroll position
   */
  getScrollPosition(text, position) {
    const textBeforeCursor = text.substring(0, position);
    const lineHeight = 20; // Approximate line height in pixels
    const linesBefore = (textBeforeCursor.match(/\n/g) || []).length;
    return linesBefore * lineHeight;
  }
  
  /**
   * Toggle dark/light theme
   */
  toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      this.themeSwitcher.innerHTML = '<i class="fas fa-sun me-2"></i> Aydınlık Mod';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      this.themeSwitcher.innerHTML = '<i class="fas fa-moon me-2"></i> Karanlık Mod';
    }
    
    // Rehighlight current content if in view mode
    if (this.currentMode === 'view' && this.codeViewerContent.textContent) {
      this.setLanguage(this.currentLanguage);
    }
  }
  
  /**
   * Setup theme based on user preference
   */
  setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
      this.themeSwitcher.innerHTML = '<i class="fas fa-sun me-2"></i> Aydınlık Mod';
    } else {
      this.themeSwitcher.innerHTML = '<i class="fas fa-moon me-2"></i> Karanlık Mod';
    }
  }
  
  /**
   * Change font size
   * @param {number} delta - Amount to change (positive or negative)
   */
  changeFontSize(delta) {
    this.fontSize = Math.max(8, Math.min(24, this.fontSize + delta));
    
    this.codeEditor.style.fontSize = `${this.fontSize}px`;
    this.codeViewerContent.style.fontSize = `${this.fontSize}px`;
    
    localStorage.setItem('fontSize', this.fontSize);
  }
  
  /**
   * Update line and character counters
   */
  updateCounters() {
    const content = this.codeEditor.value;
    const lines = content ? content.split('\n').length : 0;
    
    this.lineCount.textContent = lines;
    this.charCount.textContent = content.length;
  }
  
  /**
   * Enable specific buttons
   * @param {Array<string>} buttons - Button names to enable
   */
  enableButtons(buttons) {
    if (buttons.includes('save')) this.saveBtn.classList.add('active');
    if (buttons.includes('duplicate')) this.duplicateBtn.classList.add('active');
    if (buttons.includes('raw')) this.rawBtn.classList.add('active');
  }
  
  /**
   * Disable specific buttons
   * @param {Array<string>} buttons - Button names to disable
   */
  disableButtons(buttons) {
    if (buttons.includes('save')) this.saveBtn.classList.remove('active');
    if (buttons.includes('duplicate')) this.duplicateBtn.classList.remove('active');
    if (buttons.includes('raw')) this.rawBtn.classList.remove('active');
  }
  
  /**
   * Show loading indicator
   */
  showLoading() {
    let loadingIndicator = document.querySelector('.loading-indicator');
    
    if (!loadingIndicator) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      
      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      
      loadingIndicator.appendChild(spinner);
      document.body.appendChild(loadingIndicator);
    }
    
    loadingIndicator.style.display = 'flex';
  }
  
  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  }
  
  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type (success, error, warning)
   */
  showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-header">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        <strong class="me-auto">${type === 'success' ? 'Başarılı' : type === 'error' ? 'Hata' : type === 'warning' ? 'Uyarı' : 'Bilgi'}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Kapat"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }
}