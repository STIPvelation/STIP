// payment-handler.js

class PaymentHandler {
  constructor() {
    this.converter = new CurrencyConverter();
    this.currentLang = localStorage.getItem('preferredLanguage') || 'ko';
    this.initializeEventListeners();
  }

  async initializeEventListeners() {
    // 폼 제출 이벤트
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactFormSubmit(e));
    }

    // 결제 폼 이벤트
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
      paymentForm.addEventListener('submit', (e) => this.handlePaymentFormSubmit(e));
    }

    // 입력 필드 이벤트
    this.initializeInputValidation();

    // 초기 금액 설정
    await this.updateAmount(this.currentLang);

    // 주기적 업데이트
    setInterval(() => this.updateAmount(this.currentLang), CONFIG.UPDATE_INTERVAL);
  }

  // 연락처 폼 제출 처리
  async handleContactFormSubmit(e) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const userName = formData.get('name');
      const email = formData.get('email');
      const mobile = formData.get('mobile');

      // 이메일 유효성 검사
      if (!this.isValidEmail(email)) {
        alert(translations[this.currentLang].payment.validation.email);
        return;
      }

      // 서버로 데이터 전송
      const response = await fetch('contactForm_save.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // 연락처 폼 숨기기
        e.target.style.display = 'none';

        // 결제 폼 표시 및 초기화
        const paymentForm = document.getElementById('paymentForm');
        paymentForm.style.display = 'block';

        // 카드 소유자 이름 자동 입력
        document.getElementById('cardholderName').value = userName;

        // 금액 표시
        await this.updateAmount(this.currentLang);
      } else {
        alert('정보 저장에 실패했습니다. 다시 시도해 주세요.');
        window.location.href = 'listing.html';
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  }

  // 결제 폼 제출 처리
  async handlePaymentFormSubmit(e) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const cardholderName = formData.get('cardholderName');
      const userName = document.getElementById('name').value;

      // 이름 일치 확인
      if (cardholderName !== userName) {
        alert(translations[this.currentLang].payment.validation.name_mismatch);
        document.getElementById('cardholderName').focus();
        return;
      }

      // 결제 처리
      const response = await fetch('process_payment.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert('결제가 완료되었습니다.');
        window.location.href = 'listing.html';
      } else {
        alert(result.message || '결제 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('결제 처리 중 오류가 발생했습니다.');
    }
  }

  // 입력 필드 유효성 검사 초기화
  initializeInputValidation() {
    // 이메일 유효성 검사
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        const isValid = this.isValidEmail(e.target.value);
        e.target.style.borderColor = isValid ? 'green' : 'red';
        e.target.setCustomValidity(
          isValid ? '' : translations[this.currentLang].payment.validation.email
        );
      });
    }

    // 카드 번호 포맷팅
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
      cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue.substring(0, 19);
      });
    }

    // 만료일 포맷팅
    const expiryDate = document.getElementById('expiryDate');
    if (expiryDate) {
      expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
          value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value.substring(0, 5);
      });
    }

    // 전화번호 포맷팅
    const mobileInput = document.getElementById('mobile');
    if (mobileInput) {
      mobileInput.addEventListener('input', (e) => {
        const countryCode = translations[this.currentLang].payment.country_code;
        let value = e.target.value.replace(/\D/g, '');

        if (!value.startsWith(countryCode.replace('+', ''))) {
          value = countryCode + value;
        }

        // 국가별 포맷팅
        if (this.currentLang === 'ko') {
          value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        } else {
          value = value.replace(/(\d+)(\d{4})(\d{4})/, '$1-$2-$3');
        }

        e.target.value = value;
      });
    }

    // 카드 소유자 이름 확인
    const cardholderName = document.getElementById('cardholderName');
    if (cardholderName) {
      cardholderName.addEventListener('input', (e) => {
        const userName = document.getElementById('name').value;
        const isValid = e.target.value === userName;
        e.target.style.borderColor = isValid ? 'green' : 'red';
      });
    }
  }

  // 금액 업데이트
  async updateAmount(lang) {
    const amountInput = document.getElementById('amount');
    const currencySpan = document.querySelector('.currency');

    if (!amountInput || !currencySpan) return;

    try {
      const convertedAmount = await this.converter.convertAmount(
        CONFIG.BASE_AMOUNT,
        'KRW',
        translations[lang].payment.currency
      );

      amountInput.value = this.formatAmount(convertedAmount, lang);
      currencySpan.textContent = translations[lang].payment.currency;

      // 환율 정보 업데이트
      this.updateRateInfo(lang);
    } catch (error) {
      console.error('Amount update error:', error);
    }
  }

  // 유틸리티 메소드들
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  formatAmount(amount, lang) {
    return new Intl.NumberFormat(this.getCurrencyLocale(lang), {
      style: 'currency',
      currency: translations[lang].payment.currency,
      maximumFractionDigits: this.getCurrencyDecimals(lang)
    }).format(amount);
  }

  getCurrencyLocale(lang) {
    const localeMap = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      zh: 'zh-CN'
    };
    return localeMap[lang] || 'en-US';
  }

  getCurrencyDecimals(lang) {
    const currency = translations[lang].payment.currency;
    return currency === 'KRW' || currency === 'JPY' ? 0 : 2;
  }

  async updateRateInfo(lang) {
    const rateInfo = document.querySelector('.rate-info');
    if (!rateInfo) {
      return;
    }

    const rates = await this.converter.getExchangeRates();
    const currency = translations[lang].payment.currency;

    if (currency !== 'KRW') {
      rateInfo.textContent = `1 ${currency} = ${Math.round(1 / rates[currency] * 100) / 100
        } KRW`;
    } else {
      rateInfo.textContent = '';
    }
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  new PaymentHandler();
});