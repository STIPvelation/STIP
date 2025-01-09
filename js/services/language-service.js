/**
 * language-service.js
 * 다국어 처리를 위한 서비스
 * 
 * 주요 기능:
 * - 언어 설정 관리
 * - 텍스트 번역 처리
 * - 언어별 텍스트 적용
 * 
 * 사용되는 곳:
 * - listing.html의 모든 다국어 텍스트 처리
 * - 폼 레이블 및 placeholder 다국어 처리
 * - 에러 메시지 다국어 처리
 */

class LanguageService {
  constructor() {
    // 지원 언어 정의
    this.supportedLanguages = ['ko', 'en', 'ja', 'zh'];

    // 기본 언어 설정
    this.currentLang = this.getCurrentLanguage();

    // 언어별 레이블 정의
    this.langLabels = {
      ko: '한국어',
      en: 'English',
      ja: '日本語',
      zh: '中文'
    };
  }

  // 현재 언어 설정 가져오기
  getCurrentLanguage() {
    let lang = localStorage.getItem('preferredLanguage');

    if (!lang) {
      // 브라우저 언어 확인
      const browserLang = navigator.language.slice(0, 2);
      lang = this.supportedLanguages.includes(browserLang) ? browserLang : 'en';
      localStorage.setItem('preferredLanguage', lang);
    }

    return lang;
  }

  // 언어 변경 처리
  changeLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      console.error('Unsupported language:', lang);
      return false;
    }

    this.currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.updatePageLanguage();
    return true;
  }

  // 페이지 언어 업데이트
  updatePageLanguage() {
    // data-lang-{언어코드} 속성을 가진 모든 요소 업데이트
    const elements = document.querySelectorAll(`[data-lang-${this.currentLang}]`);
    elements.forEach(element => {
      element.textContent = element.getAttribute(`data-lang-${this.currentLang}`);
    });

    // placeholder 업데이트
    const inputs = document.querySelectorAll(`[data-lang-${this.currentLang}-placeholder]`);
    inputs.forEach(input => {
      input.placeholder = input.getAttribute(`data-lang-${this.currentLang}-placeholder`);
    });

    // 이벤트 발생
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: this.currentLang }
    }));
  }

  // 텍스트 처리
  processTextByLanguage(element) {
    const results = {};

    this.supportedLanguages.forEach(langCode => {
      const text = element.getAttribute(`data-lang-${langCode}`);
      if (text) {
        results[langCode] = text.split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');
      }
    });

    return results;
  }

  // 번역 텍스트 적용
  applyLanguageText(element) {
    const processedText = this.processTextByLanguage(element);
    const currentLangText = processedText[this.currentLang];

    if (currentLangText) {
      if (element.tagName.toLowerCase() === 'textarea') {
        element.value = currentLangText.join('\n');
      } else {
        element.textContent = currentLangText.join('\n');
      }
    }

    return processedText;
  }
}

// 전역 인스턴스 생성
const languageService = new LanguageService();

// 언어 변경 이벤트 리스너 예시
document.addEventListener('DOMContentLoaded', () => {
  // 초기 언어 적용
  languageService.updatePageLanguage();

  // 언어 변경 버튼 이벤트 연결
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', (e) => {
      const lang = e.target.dataset.language;
      languageService.changeLanguage(lang);
    });
  });
});