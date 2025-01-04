// test-order-form.js
class OrderFormTest {
  constructor() {
    this.form = document.getElementById('orderForm');
    this.testOutput = document.getElementById('testOutput');
    this.testResults = [];

    // NicePay 설정
    this.merchantKey = "8onviTUoPLpmoUPGZIcAnj0YUrC9LmvKRjDRrQ7EUHVVL4SrtRMO8o6pNjN25pXoSQrWJMXbxuVSCL+dZ+4Jug==";
    this.MID = "stipv0202m";
    this.returnUrl = `${window.location.origin}/payResult_utf.php`;
    this.netCancelUrl = `${window.location.origin}/cancelResult_utf.php`;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    console.log('Order form submission started');
    this.testResults = [];

    try {
      // 폼 검증
      this.validateForm();

      // 모든 테스트 통과 시 결제 진행
      if (this.testResults.every(result => result.passed)) {
        await this.initializePayment();
      }

    } catch (error) {
      console.error('Order form error:', error);
      this.log(`Error: ${error.message}`, 'error');
    }

    this.displayResults();
  }

  validateForm() {
    // 필수 필드 검증
    this.runTest('Required Fields Test', () => {
      const requiredFields = ['orderName', 'orderEmail', 'orderPhone'];
      requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
          throw new Error(`${fieldId} is required`);
        }
      });
      return true;
    });

    // 이메일 형식 검증
    this.runTest('Email Format Test', () => {
      const email = document.getElementById('orderEmail').value;
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Invalid email format');
      }
      return true;
    });

    // 개인정보 동의 검증
    this.runTest('Privacy Consent Test', () => {
      const consent = document.getElementById('privacyConsent');
      if (!consent.checked) {
        throw new Error('Privacy consent is required');
      }
      return true;
    });
  }

  // test-order-form.js의 initializePayment 메소드 수정
  async initializePayment() {
    try {
      const orderData = {
        orderName: document.getElementById('orderName').value,
        orderEmail: document.getElementById('orderEmail').value,
        orderPhone: document.getElementById('orderPhone').value,
        Moid: `STIP${this.getEdiDate()}`, //this.generateOrderId(),
        Amt: '99000',
        GoodsName: '특허뉴스PDF',
        EdiDate: this.getEdiDate(),
      };

      // SignData 생성
      const signData = await this.generateSignData(orderData.EdiDate, orderData.Amt);

      // NicePay 결제 파라미터
      const payForm = document.createElement('form');
      payForm.name = 'payForm';
      payForm.method = 'post';
      payForm.action = 'payResult_utf.php';
      payForm.target = '_self';  // 새창이 아닌 현재 창에서 결과 처리
      payForm.style.display = 'none';

      // 필수 파라미터 설정
      const paymentParams = {
        PayMethod: 'CARD',
        GoodsName: orderData.GoodsName,
        Amt: orderData.Amt,
        BuyerName: orderData.orderName,
        BuyerTel: orderData.orderPhone,
        BuyerEmail: orderData.orderEmail,
        Moid: orderData.Moid,
        MID: this.MID,
        ReturnURL: this.returnUrl,
        CharSet: 'utf-8',
        EdiDate: orderData.EdiDate,
        SignData: signData,

        // 추가 필수 파라미터
        GoodsCl: '1',
        TransType: '0',
        ReqReserved: '',

        // 결제창 설정
        VbankExpDate: '', // 가상계좌 입금만료일
        GoodsCnt: '1',    // 상품 개수
        PayMethod: 'CARD' // 결제 수단
      };

      // 폼에 파라미터 추가
      Object.entries(paymentParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          payForm.appendChild(input);
        }
      });

      // 폼을 body에 추가
      document.body.appendChild(payForm);

      // 결제창 호출 전 메시지 핸들러 설정
      window.addEventListener('message', (e) => {
        try {
          if (e.data && typeof e.data === 'string') {
            const data = JSON.parse(e.data);
            if (data.resultCode && data.resultCode === '0000') {
              this.log('Payment initiated successfully', 'success');
            }
          }
        } catch (err) {
          // JSON 파싱 에러 무시
          console.log('Ignoring non-JSON message:', err);
        }
      }, false);

      // NicePay 결제창 호출
      this.log('Opening payment window...', 'info');

      // nicepaySubmit 함수 재정의
      window.nicepaySubmit = () => {
        try {
          payForm.submit();
        } catch (err) {
          console.error('Payment submission error:', err);
          this.log('Payment submission failed', 'error');
        }
      };

      // 결제창 호출
      goPay(payForm);

    } catch (error) {
      console.error('Payment initialization error:', error);
      this.log(`Payment Error: ${error.message}`, 'error');
      throw error;
    }
  }

  // 주문번호 생성
  generateOrderId() {
    const dateStr = new Date().toISOString()
      .replace(/[-:]/g, '')
      .slice(0, 14);
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `G${dateStr}${random}`;
  }

  // 전문 생성일시
  getEdiDate() {
    return new Date().toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14);
  }

  // 해시값 생성
  async generateSignData(ediDate, amt) {
    const data = ediDate + this.MID + amt + this.merchantKey;
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // 테스트 실행
  runTest(testName, testFn) {
    try {
      const result = testFn();
      this.testResults.push({
        name: testName,
        passed: true,
        message: 'Test passed'
      });
    } catch (error) {
      this.testResults.push({
        name: testName,
        passed: false,
        message: error.message
      });
    }
  }

  // 결과 표시
  displayResults() {
    const output = this.testResults.map(result =>
      `${result.name}: ${result.passed ? '✅' : '❌'} ${result.message}`
    ).join('\n');

    this.testOutput.textContent = output;
  }

  // 로그 기록
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    this.testOutput.textContent += `\n[${timestamp}] ${type.toUpperCase()}: ${message}`;
  }
}

// 결제창 콜백 함수
window.nicepaySubmit = function () {
  document.payForm.submit();
};

window.nicepayClose = function () {
  alert("결제가 취소되었습니다");
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new OrderFormTest();
});