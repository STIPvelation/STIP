// 결제 관련 유틸리티 클래스
class PaymentUtils {
  static formatCardNumber(cardNumber) {
    return cardNumber.replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  }

  static formatExpiryDate(input) {
    const cleanValue = input.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
    }
    return cleanValue;
  }

  static validateCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanNumber)) {
      return false;
    }
    return this.luhnCheck(cleanNumber);
  }

  static luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return (sum % 10) === 0;
  }

  static validateExpiryDate(expiryDate) {
    const [month, year] = expiryDate.split('/');
    if (!month || !year) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);

    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;

    return true;
  }

  static validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }

  static getCardType(cardNumber) {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      jcb: /^35/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber.replace(/\s/g, ''))) {
        return type;
      }
    }
    return 'unknown';
  }
}

// 결제 상태 관리 클래스
class PaymentState {
  static STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  };

  constructor() {
    this.status = PaymentState.STATUS.PENDING;
    this.paymentId = null;
    this.error = null;
    this.observers = new Set();
  }

  setStatus(status) {
    this.status = status;
    this.notifyObservers();
  }

  setPaymentId(id) {
    this.paymentId = id;
    this.notifyObservers();
  }

  setError(error) {
    this.error = error;
    this.notifyObservers();
  }

  addObserver(observer) {
    this.observers.add(observer);
  }

  removeObserver(observer) {
    this.observers.delete(observer);
  }

  notifyObservers() {
    this.observers.forEach(observer => {
      observer.update(this);
    });
  }
}

// 결제 이벤트 관리 클래스
class PaymentEventManager {
  constructor() {
    this.events = {};
  }

  subscribe(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  unsubscribe(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName]
        .filter(cb => cb !== callback);
    }
  }

  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        callback(data);
      });
    }
  }
}

// 결제 폼 검증 클래스
class PaymentFormValidator {
  constructor(form) {
    this.form = form;
    this.errors = new Map();
    this.setupValidation();
  }

  setupValidation() {
    this.form.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        this.validateField(input);
      });

      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
  }

  validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (input.id) {
      case 'cardNumber':
        isValid = PaymentUtils.validateCardNumber(value);
        errorMessage = isValid ? '' : '올바른 카드 번호를 입력해주세요.';
        break;
      case 'expiryDate':
        isValid = PaymentUtils.validateExpiryDate(value);
        errorMessage = isValid ? '' : '올바른 유효기간을 입력해주세요.';
        break;
      case 'cvv':
        isValid = PaymentUtils.validateCVV(value);
        errorMessage = isValid ? '' : '올바른 CVV를 입력해주세요.';
        break;
      // 추가 필드 검증...
    }

    this.updateFieldValidation(input, isValid, errorMessage);
    return isValid;
  }

  updateFieldValidation(input, isValid, errorMessage) {
    const fieldContainer = input.closest('.input-box');
    const errorElement = fieldContainer.querySelector('.error-message');

    if (isValid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
      this.errors.delete(input.id);
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      }
      this.errors.set(input.id, errorMessage);
    }
  }

  validateAll() {
    let isValid = true;
    this.form.querySelectorAll('input').forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    return isValid;
  }

  getErrors() {
    return Array.from(this.errors.values());
  }
}