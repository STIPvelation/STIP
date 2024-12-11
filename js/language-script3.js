// Load translations
let translations = {};

// Fetch translations
async function loadTranslations() {
  const response = await fetch('js/translations.json');
  translations = await response.json();

  // Set initial language to browser's language or default to English
  const browserLang = navigator.language.split('-')[0];
  const defaultLang = ['ko', 'en', 'ja', 'zh'].includes(browserLang) ? browserLang : 'en';
  setLanguage(defaultLang);
}

// Set language
function setLanguage(lang) {
  // Update navigation
  document.querySelectorAll('.nav-item, .side-bar-item').forEach(el => {
    const key = el.getAttribute('data-page');
    if (key) {
      el.textContent = translations[lang].nav[key];
    }
  });

  // Update dropdown button text
  const dropdownButton = document.getElementById('dropdownMenuButton1');
  const langMap = {
    'ko': '한국어',
    'en': 'English',
    'ja': '日本語',
    'zh': '中文'
  };
  dropdownButton.textContent = langMap[lang];

  // Update active language in dropdowns and sidebar
  document.querySelectorAll('.side-bar-item.lang span, .dropdown-item').forEach(el => {
    el.classList.remove('active');
  });

  // Manually find and mark active language
  const languageItems = document.querySelectorAll('.side-bar-item.lang span, .dropdown-item');
  languageItems.forEach(el => {
    const langTexts = {
      'ko': '한국어',
      'en': 'English',
      'ja': '日本語',
      'zh': '中文'
    };
    if (el.textContent.trim() === langTexts[lang]) {
      el.classList.add('active');
    }
  });

  // Store language preference
  localStorage.setItem('preferredLanguage', lang);
}

// Handle burger menu open
function handleBurgerMenu() {
  const sideBarContainer = document.querySelector('.side-bar-container');
  if (sideBarContainer) {
    sideBarContainer.style.display = 'block';
  }
}

// Handle burger menu close
function handleBurgerMenuClose() {
  const sideBarContainer = document.querySelector('.side-bar-container');
  if (sideBarContainer) {
    sideBarContainer.style.display = 'none';
  }
}

// Language change handlers
function handleLangChange(lang) {
  setLanguage(lang);
}

// Event listeners for language change
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();

  // Add data-page attributes to navigation items
  document.querySelectorAll('.nav-item, .side-bar-item').forEach(el => {
    const href = el.getAttribute('href') || el.textContent.toLowerCase();
    const page = href.replace('.html', '').replace('/', '');
    el.setAttribute('data-page', page);
  });

  // Language dropdown and sidebar language items
  document.querySelectorAll('.dropdown-item, .side-bar-item.lang span').forEach(el => {
    el.addEventListener('click', (event) => {
      const langText = event.target.textContent.trim();
      const langMap = {
        '한국어': 'ko',
        'English': 'en',
        '日本語': 'ja',
        '中文': 'zh'
      };
      setLanguage(langMap[langText]);
    });
  });

  // Close sidebar on background click
  const sidebarBackground = document.querySelector('.sidebar-background');
  if (sidebarBackground) {
    sidebarBackground.addEventListener('click', handleBurgerMenuClose);
  }
});
