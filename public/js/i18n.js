// i18next configuration - Simple version without ES6 modules
let i18nextInstance = null;

// Supported languages - defined first
const supportedLanguages = ['ar', 'en', 'ru', 'fr', 'tr'];
const rtlLanguages = ['ar'];

// Detect browser language
function detectBrowserLanguage() {
  // Get language from server first
  if (window.initialLanguage && window.initialLanguage !== '<%= language || "ar" %>') {
    return window.initialLanguage;
  }
  
  // Get language from localStorage
  const savedLanguage = localStorage.getItem('trading-calculator-language');
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Get language from browser
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0]; // Get language code (e.g., 'en' from 'en-US')
  
  console.log('Browser language detected:', browserLang, '-> code:', langCode);
  
  // Check if browser language is supported
  if (supportedLanguages.includes(langCode)) {
    console.log('Using browser language:', langCode);
    return langCode;
  }
  
  // Check for similar languages (e.g., 'en' for 'en-US', 'en-GB', etc.)
  const similarLang = supportedLanguages.find(lang => 
    browserLang.toLowerCase().startsWith(lang.toLowerCase())
  );
  if (similarLang) {
    console.log('Using similar language:', similarLang, 'for browser language:', browserLang);
    return similarLang;
  }
  
  console.log('Browser language not supported, falling back to Arabic');
  
  // Default fallback
  return 'ar';
}

let currentLanguage = detectBrowserLanguage();
let translations = {};

console.log('Browser language detected:', navigator.language);
console.log('Initial language set to:', currentLanguage);

// Load translation file
async function loadTranslations(lang, namespace) {
  try {
    const response = await fetch(`/locales/${lang}/${namespace}.json`);
    if (response.ok) {
      const data = await response.json();
      console.log(`Loaded translations for ${lang}/${namespace}:`, data);
      return data;
    }
    throw new Error(`Failed to load ${namespace} for ${lang}: ${response.status}`);
  } catch (error) {
    console.error(`Error loading translations for ${lang}/${namespace}:`, error);
    return {};
  }
}

// Initialize i18next
async function initI18n() {
  console.log('Starting i18n initialization for language:', currentLanguage);
  
  // Load all translation files for current language
  const namespaces = ['common', 'calculator', 'results', 'guide'];
  translations[currentLanguage] = {};
  
  for (const namespace of namespaces) {
    console.log(`Loading ${currentLanguage}/${namespace}...`);
    translations[currentLanguage][namespace] = await loadTranslations(currentLanguage, namespace);
  }
  
  console.log('All translations loaded:', translations);
  
  // Set up i18next-like interface
  i18nextInstance = {
    language: currentLanguage,
    t: function(key, options = {}) {
      const [namespace, ...keyParts] = key.split(':');
      const fullKey = keyParts.join(':');
      
      if (namespace && keyParts.length > 0) {
        return getTranslation(namespace, fullKey, options);
      } else {
        return getTranslation('common', key, options);
      }
    },
    changeLanguage: async function(lang) {
      if (supportedLanguages.includes(lang)) {
        currentLanguage = lang;
        this.language = lang;
        
        // Save language preference to localStorage
        localStorage.setItem('trading-calculator-language', lang);
        console.log('Language saved to localStorage:', lang);
        
        // Load translations for new language if not already loaded
        if (!translations[lang]) {
          translations[lang] = {};
          for (const namespace of namespaces) {
            translations[lang][namespace] = await loadTranslations(lang, namespace);
          }
        }
        
        // Update page direction
        updatePageDirection();
        
        // Trigger language change event
        if (window.onLanguageChanged) {
          window.onLanguageChanged(lang);
        }
        
        return Promise.resolve();
      }
      return Promise.reject(new Error(`Unsupported language: ${lang}`));
    }
  };
  
  // Update page direction
  updatePageDirection();
  
  // Update page content immediately after loading translations
  updatePageContent();
  
  // Trigger initialization event
  if (window.onI18nInitialized) {
    window.onI18nInitialized();
  }
}

// Get translation value
function getTranslation(namespace, key, options = {}) {
  const keys = key.split('.');
  let value = translations[currentLanguage]?.[namespace];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }
  
  if (value === undefined) {
    console.warn(`Translation missing: ${namespace}:${key}`);
    return key; // Return key as fallback
  }
  
  // Simple interpolation
  if (options && typeof value === 'string') {
    Object.keys(options).forEach(optionKey => {
      value = value.replace(`{{${optionKey}}}`, options[optionKey]);
    });
  }
  
  return value;
}

// Update page direction based on current language
function updatePageDirection() {
  const dir = rtlLanguages.includes(currentLanguage) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = currentLanguage;
  
  // Update menu direction
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.dir = dir;
  }
  
  // Update menu header direction
  const navLinksHeader = document.querySelector('.nav-links-header');
  if (navLinksHeader) {
    navLinksHeader.dir = dir;
  }
  
  // Update nav links direction
  const navLinkElements = document.querySelectorAll('.nav-link');
  navLinkElements.forEach(link => {
    link.dir = dir;
  });
  
  // Update language selector direction
  const languageSelector = document.getElementById('languageSelector');
  if (languageSelector) {
    languageSelector.dir = dir;
  }
}

// Make updatePageDirection available globally
window.updatePageDirection = updatePageDirection;

// Helper function to change language
function changeLanguage(language) {
  if (i18nextInstance) {
    return i18nextInstance.changeLanguage(language);
  }
  return Promise.reject(new Error('i18next not initialized'));
}

// Helper function to get current language
function getCurrentLanguage() {
  return currentLanguage;
}

// Helper function to get translation
function t(key, options = {}) {
  if (i18nextInstance) {
    return i18nextInstance.t(key, options);
  }
  return key;
}

// Helper function to get translation with specific namespace
function tNS(namespace, key, options = {}) {
  return t(`${namespace}:${key}`, options);
}

    // Update page content when language changes
    function updatePageContent() {
      console.log('Updating page content for language:', currentLanguage);
      
      // Update all elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const namespace = element.getAttribute('data-i18n-ns') || 'common';
        const translation = tNS(namespace, key);
        console.log(`Updating element with key ${namespace}:${key} -> ${translation}`);
        
        // Check if element has child elements (like icons)
        if (element.children.length > 0) {
          // If element has children, update only the text nodes
          const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
          if (textNodes.length > 0) {
            textNodes[0].textContent = translation;
          } else {
            // If no text nodes, append translation
            element.appendChild(document.createTextNode(translation));
          }
        } else if (element.tagName === 'SPAN' && element.children.length === 0) {
          // Special handling for span elements without children
          element.textContent = translation;
        } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = translation;
        } else if (element.tagName === 'OPTION') {
          // Special handling for option elements
          element.textContent = translation;
        } else {
          element.textContent = translation;
        }
      });
      
      // Update all elements with data-i18n-attr attribute
      document.querySelectorAll('[data-i18n-attr]').forEach(element => {
        const attr = element.getAttribute('data-i18n-attr');
        const key = element.getAttribute('data-i18n');
        const namespace = element.getAttribute('data-i18n-ns') || 'common';
        const translation = tNS(namespace, key);
        element.setAttribute(attr, translation);
      });
      
      // Update form placeholders and tooltips
      updateFormElements();
      
      // Update page title
      const pageTitle = tNS('common', 'app.title');
      if (pageTitle && pageTitle !== 'app.title') {
        document.title = pageTitle + ' - Trading Calculator Pro';
      }
      
      console.log('Page content update complete');
    }

// Update form elements with translations
function updateFormElements() {
  // Update input placeholders
  document.querySelectorAll('input[data-i18n-placeholder]').forEach(input => {
    const key = input.getAttribute('data-i18n-placeholder');
    const namespace = input.getAttribute('data-i18n-ns') || 'calculator';
    input.placeholder = tNS(namespace, key);
  });
  
  // Update tooltips
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    const namespace = element.getAttribute('data-i18n-ns') || 'calculator';
    element.title = tNS(namespace, key);
  });
}

        // Initialize language selector
        function initLanguageSelector() {
          const languageSelector = document.getElementById('languageSelector');
          if (languageSelector) {
            // Set current language
            languageSelector.value = currentLanguage;
            console.log('Language selector initialized with language:', currentLanguage);

            // Force visibility and colors for language selector - optimized version
            let isApplyingStyles = false; // Flag to prevent infinite loops
            
            const applyStyles = () => {
              // Prevent infinite loops
              if (isApplyingStyles) return;
              isApplyingStyles = true;
              
              try {
                // Use gradient background for better visibility
                languageSelector.style.background = 'linear-gradient(135deg, #32AA8C 0%, #2a8f76 100%)';
                languageSelector.style.backgroundColor = '#32AA8C'; // Fallback
                languageSelector.style.color = 'white';
                languageSelector.style.webkitTextFillColor = 'white';
                languageSelector.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                languageSelector.style.opacity = '1';
                languageSelector.style.visibility = 'visible';
              } finally {
                isApplyingStyles = false;
              }
            };
            
            // Apply initial styles once
            applyStyles();
            
            // Reapply styles on specific events only (not on every mutation)
            languageSelector.addEventListener('focus', applyStyles);
            languageSelector.addEventListener('blur', applyStyles);

            languageSelector.addEventListener('change', function(e) {
              const selectedLanguage = e.target.value;
              console.log('Language changed to:', selectedLanguage);
              applyStyles(); // Ensure styles persist after change
              changeLanguage(selectedLanguage).then(() => {
                updatePageContent();
                console.log('Page content updated for language:', selectedLanguage);
              }).catch(error => {
                console.error('Error changing language:', error);
              });
            });
            
            // Use MutationObserver only to detect external style changes, not our own
            let lastStyle = languageSelector.getAttribute('style') || '';
            const observer = new MutationObserver((mutations) => {
              // Only apply if style changed externally (not by our code)
              const currentStyle = languageSelector.getAttribute('style') || '';
              if (currentStyle !== lastStyle && !isApplyingStyles) {
                const computedColor = window.getComputedStyle(languageSelector).color;
                // Only reapply if color is not white (someone changed it externally)
                if (computedColor !== 'rgb(255, 255, 255)' && computedColor !== '#ffffff') {
                  setTimeout(applyStyles, 100); // Small delay to avoid loops
                }
                lastStyle = currentStyle;
              }
            });
            
            observer.observe(languageSelector, {
              attributes: true,
              attributeFilter: ['style']
            });
            
            // Apply styles once when DOM is fully ready (not repeatedly)
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(applyStyles, 100);
              });
            }
          } else {
            console.error('Language selector not found!');
          }
        }

// Language change event handler
window.onLanguageChanged = function(lang) {
  updatePageContent();
};

// Initialization event handler
window.onI18nInitialized = function() {
  updatePageContent();
  initLanguageSelector();
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded, initializing i18n...');
  await initI18n();
  console.log('i18n initialization complete');
});

// Export for global use
window.i18next = i18nextInstance;
window.changeLanguage = changeLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.t = t;
window.tNS = tNS;
