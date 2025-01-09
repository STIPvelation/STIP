// payment-handler.js의 시작 부분에 추가
console.log('Translations available:', !!window.translations);
console.log('Current translations:', window.translations);

// translations 로딩 상태 확인 함수
function checkTranslations() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;

    const check = () => {
      if (window.translationsLoaded && window.translations) {
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Translations failed to load'));
      } else {
        attempts++;
        setTimeout(check, 100);
      }
    };

    check();
  });
}

class PaymentHandler {
  // constructor() {
  //   this.converter = new CurrencyConverter();
  //   this.currentLang = localStorage.getItem('preferredLanguage') || 'ko';
  //   this.translations = window.translations; // translations 객체 참조
  //   this.initialize();
  // }

  constructor() {
    // if (!window.translations) {
    //   throw new Error('Translations not loaded');
    // }
    // this.converter = new CurrencyConverter();
    // this.currentLang = localStorage.getItem('preferredLanguage') || 'ko';
    // this.translations = window.translations;
    // this.initialize();

    this.converter = new CurrencyConverter();
    this.currentLang = localStorage.getItem('preferredLanguage') || 'ko';
    this.init();
  }

  // async initialize() {
  //   // translations이 로드되었는지 확인
  //   if (!this.translations) {
  //     console.error('Translations not loaded');
  //     return;
  //   }
  //   await this.initializeEventListeners();
  // }

  async initialize() {
    // try {
    //   await this.initializeEventListeners();
    //   await this.updateAmount(this.currentLang);
    //   console.log('Payment handler initialized successfully');
    // } catch (error) {
    //   console.error('Initialization error:', error);
    // }
    try {
      await checkTranslations();
      this.translations = window.translations;
      await this.initializeEventListeners();
      await this.updateAmount(this.currentLang);
      console.log('Payment handler initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  // 금액 업데이트 메서드 수정
  async updateAmount(lang) {
    const amountInput = document.getElementById('amount');
    const currencySpan = document.querySelector('.currency');

    if (!amountInput || !currencySpan) return;

    try {
      // translations 객체 존재 확인
      if (!this.translations || !this.translations[lang] || !this.translations[lang].payment) {
        throw new Error(`Translation not found for language: ${lang}`);
      }

      const currency = this.translations[lang].payment.currency;
      const convertedAmount = await this.converter.convertAmount(
        CONFIG.BASE_AMOUNT,
        'KRW',
        currency
      );

      amountInput.value = this.formatAmount(convertedAmount, lang);
      currencySpan.textContent = currency;

      // 환율 정보 업데이트
      await this.updateRateInfo(lang);
    } catch (error) {
      console.error('Amount update error:', error);
      // 기본값 설정
      amountInput.value = CONFIG.BASE_AMOUNT.toLocaleString() + ' KRW';
      currencySpan.textContent = 'KRW';
    }
  }

  // 다른 메서드들은 동일...
}

// 초기화 코드 수정
document.addEventListener('DOMContentLoaded', async () => {
  // translations.js가 로드되었는지 확인
  // if (typeof window.translations === 'undefined') {
  //   console.error('Translations not loaded. Make sure translations.js is included before payment-handler.js');
  //   return;
  // }

  // new PaymentHandler();

  // try {
  //   if (!window.translations) {
  //     throw new Error('Translations not loaded');
  //   }
  //   const handler = new PaymentHandler();
  //   // 글로벌 접근을 위해 window 객체에 할당 (필요한 경우)
  //   window.paymentHandler = handler;
  // } catch (error) {
  //   console.error('Payment handler initialization failed:', error);
  // }
  try {
    await checkTranslations();
    new PaymentHandler();
  } catch (error) {
    console.error('Failed to initialize payment handler:', error);
  }
});