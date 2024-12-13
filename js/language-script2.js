// Load translations
let translations = {};

const langLabel = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
    zh: "中文",
};
// Fetch translations
async function loadTranslations() {
    const response = await fetch('js/translations.json');
    translations = await response.json();
    
    // Set initial language to browser's language or default to English
    const browserLang = navigator.language.split('-')[0];
    const defaultLang = ['ko', 'en', 'ja', 'zh'].includes(browserLang) ? browserLang : 'en';
    setLanguage(defaultLang);
}

// Function to close sidebar
function closeSideBar() {
    const sideBarContainer = document.querySelector('.side-bar-container');
    const burgerMenu = document.querySelector('.burger-menu');

    if (sideBarContainer) {
        // sideBarContainer.classList.remove('active');
        sideBarContainer.classList.remove("open");
        sideBarContainer.classList.add("close");
    }

    // Reset burger menu icon if needed
    if (burgerMenu) {
        burgerMenu.setAttribute('onclick', 'handleBurgerMenu()');
    }
}

// Set language
function setLanguage(lang) {
    // Update navigation
    document.querySelectorAll('.nav-item, .side-bar-item.lang').forEach(el => {
        const key = el.getAttribute('data-page');
        if (key) {
            el.textContent = translations[lang].nav[key];
        }
    });

    // Update dropdown button text
    const dropdownButton = document.getElementById('dropdownMenuButton1');
    // const langMap = {
    //     'ko': '한국어',
    //     'en': 'English',
    //     'ja': '日本語',
    //     'zh': '中文'
    // };
    dropdownButton.textContent = langLabel[lang];

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
    document.querySelectorAll('.side-bar-item, .dropdown-item').forEach(el => {
        el.classList.remove('active');
    });

    // Manually find and mark active language
    const languageItems = document.querySelectorAll('.side-bar-item span, .dropdown-item');
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

    // const activeLang = document.querySelector(`.side-bar-item.${lang}`);
    // if (activeLang) activeLang.classList.add('active');

    // Store language preference
    localStorage.setItem('preferredLanguage', lang);

    // Close sidebar after language selection
    closeSideBar();
}

// Handle burger menu open
// function handleBurgerMenu() {
//     const sideBarContainer = document.querySelector('.side-bar-container');
//     if (sideBarContainer) {
//         sideBarContainer.style.display = 'block';
//     }
// }

// Handle burger menu close
// function handleBurgerMenuClose() {
//     const sideBarContainer = document.querySelector('.side-bar-container');
//     if (sideBarContainer) {
//         sideBarContainer.style.display = 'none';
//     }
// }

const handleBurgerMenu = () => {
    const nav = document.querySelector(".side-bar-container");
    nav.classList.add("open");
    nav.classList.remove("close");

    // 글자 색상 활성화 (예: 검정색)
    // document.querySelectorAll(".side-bar-item").forEach((item) => {
    //     item.style.color = "#000";
    // });
};

// function handleBurgerMenu() {
//     const sideBarContainer = document.querySelector('.side-bar-container');
//     if (sideBarContainer) {
//         sideBarContainer.classList.add('active');
//     }
// }


const handleBurgerMenuClose = () => {
    const nav = document.querySelector(".side-bar-container");
    nav.classList.remove("open");
    nav.classList.add("close");

    // 글자 색상 비활성화 (예: 투명)
    // document.querySelectorAll(".side-bar-item").forEach((item) => {
    //     item.style.color = "transparent";
    // });
};

// function handleBurgerMenuClose() {
//     const sideBarContainer = document.querySelector('.side-bar-container');
//     if (sideBarContainer) {
//         sideBarContainer.classList.remove('active');
//     }
// }


// Language change handlers
// 

// const handleLangChange = (lang, isSidebar = false) => {
//     const prevLang = localStorage.getItem("lang");
//     localStorage.setItem("lang", lang);
//     if (!isSidebar) {
//         document.querySelector(".btn-secondary").innerHTML = langLabel[lang];
//         return;
//     }
//     const sideBarList = document.querySelector(".side-bar-list.lang");
//     const langDom = sideBarList.querySelector(`.${lang}`);
//     const prevLangDom = sideBarList.querySelector(`.${prevLang}`);
//     langDom.classList.toggle("active");
//     prevLangDom.classList.toggle("active");

//     setLanguage(lang);
// };

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
    document.querySelectorAll('.dropdown-item, .side-bar-item').forEach(el => {
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
    
    // 배경 클릭 시 메뉴 닫기
    document.querySelector('.sidebar-background').addEventListener('click', handleBurgerMenuClose);

});
