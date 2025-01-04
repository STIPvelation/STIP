/**
 * payment-service.js
 * NicePay 결제 처리를 위한 서비스
 * 
 * 주요 기능:
 * - 결제 정보 관리
 * - NicePay 결제 연동
 * - 결제 결과 처리
 * 
 * 사용되는 곳:
 * - orderForm 결제 처리
 * - 결제 상태 관리
 */

class PaymentService {
  constructor() {
    this.merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug==";
    this.MID = "stipv0202m";
    this.currentLang = localStorage.getItem('preferredLanguage') || 'en';

    // 결제 메시지
    this.messages = {
      ko: {
        payment_init: '결제를 시작합니다.',
        payment_success: '결제가 완료되었습니다.',
        payment_failed: '결제에 실패했습니다.',
        payment_cancel: '결제가 취소되었습니다.',
        validation_error: '입력 정보를 확인해주세요.'
      },
      en: {
        payment_init: 'Initializing payment...',
        payment_success: 'Payment completed successfully.',
        payment_failed: 'Payment failed.',
        payment_cancel: 'Payment cancelled.',
        validation_error: 'Please check your input.'
      }
      // 다른 언어 메시지 추가...
    };

    this.initializeEventListeners();
  }

  // 이벤트 리스너 초기화
  initializeEventListeners() {
    // NicePay 콜백 함수 설정
    window.nicepaySubmit = () => {
      document.payForm.submit();
    };

    window.nicepayClose = () => {
      alert(this.getMessage('payment_cancel'));
    };
  }

  // 주문번호 생성
  generateOrderId() {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const random = Math.random().toString(36).substring(2, 15);
    return `STIP${timestamp}${random}`;
  }

  // 결제 데이터 준비
  preparePaymentData(formData) {
    const orderId = this.generateOrderId();
    const ediDate = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

    return {
      PayMethod: 'CARD',
      GoodsName: formData.get('productName') || '특허뉴스PDF',
      Amt: formData.get('price') || '99000',
      BuyerName: formData.get('orderName'),
      BuyerTel: formData.get('orderPhone'),
      BuyerEmail: formData.get('orderEmail'),
      Moid: orderId,
      MID: this.MID,
      EdiDate: ediDate,
      SignData: this.generateSignature(ediDate, formData.get('price')),
      ReturnURL: `${window.location.origin}/payResult.php`,
      CharSet: 'utf-8',
      GoodsCl: '1',
      TransType: '0'
    };
  }

  // 서명 데이터 생성
  async generateSignature(ediDate, amount) {
    const data = ediDate + this.MID + amount + this.merchantKey;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // 결제창 호출
  async requestPayment(formData) {
    try {
      const paymentData = this.preparePaymentData(formData);

      // 결제 폼 생성
      const payForm = document.createElement('form');
      payForm.name = 'payForm';
      payForm.method = 'post';
      payForm.action = 'payResult.php';
      payForm.style.display = 'none';

      // 폼 데이터 설정
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        payForm.appendChild(input);
      });

      document.body.appendChild(payForm);

      // 결제창 호출
      console.log('Opening payment window...');
      goPay(payForm);

      return {
        success: true,
        orderId: paymentData.Moid
      };

    } catch (error) {
      console.error('Payment request error:', error);
      throw error;
    }
  }

  // 결제 결과 처리
  async handlePaymentResult(response) {
    if (response.success) {
      // 결제 성공 처리
      this.showOrderCompletePopup();
      return await this.savePaymentResult(response);
    } else {
      // 결제 실패 처리
      throw new Error(response.message || this.getMessage('payment_failed'));
    }
  }

  // 결제 완료 팝업 표시
  showOrderCompletePopup() {
    const popup = document.getElementById('orderCompletePopup');
    if (popup) {
      popup.style.display = 'flex';
      this.updatePopupLanguage();
    }
  }

  // 팝업 언어 업데이트
  updatePopupLanguage() {
    const popup = document.getElementById('orderCompletePopup');
    if (popup) {
      popup.querySelectorAll(`[data-lang-${this.currentLang}]`).forEach(element => {
        element.textContent = element.getAttribute(`data-lang-${this.currentLang}`);
      });
    }
  }

  // 메시지 가져오기
  getMessage(key) {
    return this.messages[this.currentLang]?.[key] || this.messages['en'][key];
  }

  // 결제 결과 저장
  async savePaymentResult(response) {
    try {
      const result = await fetch('process_payment.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response)
      });

      return await result.json();

    } catch (error) {
      console.error('Payment save error:', error);
      throw error;
    }
  }
}

// 전역 인스턴스 생성
const paymentService = new PaymentService();

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  // ESC 키로 팝업 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const popup = document.getElementById('orderCompletePopup');
      if (popup) {
        popup.style.display = 'none';
        window.location.reload();
      }
    }
  });
});