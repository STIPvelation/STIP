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
        el.textContent = translations[lang].nav[key];
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

    // Update main content
    const contentWrapper = document.querySelector('.content-wrapper');
    if (contentWrapper) {
        const logoWrapper = contentWrapper.querySelector('.logo-wrapper p');
        logoWrapper.innerHTML = translations[lang].main.logo_text;

        const letterTitles = contentWrapper.querySelectorAll('.letter-title');
        letterTitles.forEach((el, index) => {
            if (el.querySelector('.strong')) {
                el.querySelector('span:not(.strong)').textContent = 
                    translations[lang].main.letter_titles[index];
            }
        });

        const contentBottomText = contentWrapper.querySelectorAll('.content-bottom .text p');
        contentBottomText.forEach((el, index) => {
            el.textContent = translations[lang].main.bottom_text[index];
        });

        const listingButton = contentWrapper.querySelector('.normal-button a');
        listingButton.textContent = translations[lang].main.buttons.listing;

        const watchVideoSpan = contentWrapper.querySelector('.watch-video-area span');
        watchVideoSpan.textContent = translations[lang].main.buttons.watch_video;
    }

    // Update footer
    const footerWrapper = document.querySelector('.footer-wrapper');
    if (footerWrapper) {
        const footerLogo = footerWrapper.querySelector('.footer-logo span');
        footerLogo.textContent = translations[lang].footer.slogan;

        const companyName = footerWrapper.querySelector('.company-name');
        companyName.textContent = translations[lang].footer.company_name;

        const companyInfoGrid = footerWrapper.querySelector('.company-info-grid');
        const companyInfo = translations[lang].footer.company_info;
        companyInfoGrid.innerHTML = `
            <span>${companyInfo.ceo}</span>
            <span>${companyInfo.address}</span>
            <span>${companyInfo.phone}</span>
            <span>${companyInfo.email}</span>
            <span>${companyInfo.business_number}</span>
        `;
    }

    // Update active language in dropdowns and sidebar
    document.querySelectorAll('.side-bar-item.lang span, .dropdown-item').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`.side-bar-item.${lang}, .dropdown-item:contains('${langMap[lang]}')`).classList.add('active');

    // Store language preference
    localStorage.setItem('preferredLanguage', lang);
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
    document.querySelectorAll('.dropdown-item, .side-bar-item.lang').forEach(el => {
        el.addEventListener('click', (event) => {
            const langText = event.target.textContent;
            const langMap = {
                '한국어': 'ko',
                'English': 'en',
                '日本語': 'ja',
                '中文': 'zh'
            };
            setLanguage(langMap[langText]);
        });
    });
});
