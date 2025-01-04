class PaymentHandler {
  constructor() {
    this.paymentForm = document.getElementById('paymentForm');
    this.cardholderName = document.getElementById('cardholderName');

    this.initializeEventListeners();
    this.initializeValidation();
  }

  initializeEventListeners() {
    // 카드 번호 포맷팅
    document.getElementById('cardNumber').addEventListener('input', (e) => {
      this.formatCardNumber(e.target);
    });

    // 만료일 포맷팅
    document.getElementById('expiryDate').addEventListener('input', (e) => {
      this.formatExpiryDate(e.target);
    });

    // 폼 제출
    this.paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handlePaymentSubmit(e);
    });
  }

  initializeValidation() {
    this.cardholderName.addEventListener('input', () => {
      const originalName = document.getElementById('name').value;
      if (this.cardholderName.value !== originalName) {
        this.cardholderName.style.borderColor = 'red';
        this.cardholderName.setCustomValidity(this.getMessage('nameMismatch'));
      } else {
        this.cardholderName.style.borderColor = 'green';
        this.cardholderName.setCustomValidity('');
      }
    });
  }

  async handlePaymentSubmit(e) {
    try {
      
      // 이름 일치 검증
      const originalName = document.getElementById('name').value;
      if (this.cardholderName.value !== originalName) {
        throw new Error(this.getMessage('nameMismatch'));
      }

      // 로딩 상태 표시
      this.showLoading(true);

      // 결제 데이터 준비
      const formData = new FormData(this.paymentForm);
      formData.append('lang', localStorage.getItem('preferredLanguage') || 'ko');

      // 결제 정보 저장 및 NicePay 폼 받기
      const response = await fetch('../process_payment.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        // NicePay 결제창 표시
        this.showNicePayModal(result.nice_pay_form);
      } else {
        throw new Error(result.message);
      }

      // Nice Pay 결제 요청 24-12-26 update
      // const paymentResult = await this.requestPayment(formData);

      // if (paymentResult.success) {
      //   alert(this.getMessage('paymentSuccess'));
      //   window.location.href = 'listing.html';
      // } else {
      //   throw new Error(paymentResult.message || this.getMessage('paymentFailed'));
      // }

    } catch (error) {
      console.error('Payment error:', error);
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  showNicePayModal(formHtml) {
    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'nice-pay-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            ${formHtml}
        </div>
    `;

    document.body.appendChild(modal);

    // NicePay 결제창 실행
    if (typeof nicepayStart === 'function') {
      nicepayStart();
    }
  }

  async requestPayment(formData) {
    // Nice Pay 결제 요청 준비
    const paymentData = {
      PayMethod: 'CARD',
      GoodsName: formData.get('productName'),
      Amt: '99000',
      BuyerName: formData.get('cardholderName'),
      BuyerEmail: document.getElementById('email').value,
      BuyerTel: document.getElementById('mobile').value,
      Moid: 'ORDER' + new Date().getTime(),
      EdiDate: this.getCurrentDate()
    };

    try {
      const response = await fetch('../payRequest_utf.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(paymentData)
      });

      return await response.json();

    } catch (error) {
      console.error('Payment request error:', error);
      throw new Error(this.getMessage('networkError'));
    }
  }

  formatCardNumber(input) {
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formattedValue.substring(0, 19);
  }

  formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    input.value = value.substring(0, 5);
  }

  getCurrentDate() {
    const now = new Date();
    return now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
  }

  showLoading(show) {
    const submitButton = this.paymentForm.querySelector('button[type="submit"]');
    if (show) {
      submitButton.disabled = true;
      submitButton.textContent = this.getMessage('processing');
    } else {
      submitButton.disabled = false;
      submitButton.textContent = this.getMessage('processPayment');
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.role = 'alert';
    errorDiv.textContent = message;

    const existingError = this.paymentForm.querySelector('.alert-danger');
    if (existingError) {
      existingError.remove();
    }

    this.paymentForm.insertBefore(errorDiv, this.paymentForm.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  getMessage(key) {
    const messages = {
      ko: {
        nameMismatch: '카드 소유자 이름이 입력하신 이름과 일치하지 않습니다.',
        paymentSuccess: '결제가 완료되었습니다.',
        paymentFailed: '결제 처리에 실패했습니다.',
        networkError: '네트워크 오류가 발생했습니다.',
        processing: '처리 중...',
        processPayment: '결제하기'
      },
      en: {
        nameMismatch: 'Cardholder name does not match the name you entered.',
        paymentSuccess: 'Payment completed successfully.',
        paymentFailed: 'Payment processing failed.',
        networkError: 'A network error occurred.',
        processing: 'Processing...',
        processPayment: 'Process Payment'
      },
      ja: {
        nameMismatch: 'Cardholder name does not match the name you entered.',
        paymentSuccess: 'Payment completed successfully.',
        paymentFailed: 'Payment processing failed.',
        networkError: 'A network error occurred.',
        processing: 'Processing...',
        processPayment: 'Process Payment'
      },
      jz: {
        nameMismatch: 'Cardholder name does not match the name you entered.',
        paymentSuccess: 'Payment completed successfully.',
        paymentFailed: 'Payment processing failed.',
        networkError: 'A network error occurred.',
        processing: 'Processing...',
        processPayment: 'Process Payment'
      },
      // 다른 언어 메시지 추가...
    };

    const currentLang = localStorage.getItem('preferredLanguage') || 'ko';
    return messages[currentLang]?.[key] || messages['en'][key];
  }

  // update 24-12-26
  handlePaymentResult(result) {
    if (result.success) {
      // 결제 상태 업데이트
      this.updatePaymentStatus({
        payment_id: this.currentPaymentId,
        status: 'completed',
        TID: result.TID,
        ResultMsg: result.ResultMsg
      });
    } else {
      // 결제 실패 처리
      this.updatePaymentStatus({
        payment_id: this.currentPaymentId,
        status: 'failed',
        error_message: result.ResultMsg
      });
      this.showError(result.ResultMsg);
    }
  }

  async updatePaymentStatus(paymentResult) {
    try {
      const response = await fetch('../update_payment_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(paymentResult)
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Payment status update failed:', result.message);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }

  // NicePay 콜백 함수들
  handlePaymentSuccess(response) {
    this.closeModal();
    this.handlePaymentResult({
      success: true,
      ...response
    });
  }

  handlePaymentError(error) {
    this.closeModal();
    this.handlePaymentResult({
      success: false,
      ResultMsg: error.message || '결제 처리 중 오류가 발생했습니다.'
    });
  }

  closeModal() {
    const modal = document.querySelector('.nice-pay-modal');
    if (modal) {
      modal.remove();
    }
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.paymentHandler = new PaymentHandler();
});