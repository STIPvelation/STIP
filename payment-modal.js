class PaymentModal {
  constructor() {
    this.modalTemplate = `
            <div class="payment-modal">
                <div class="modal-overlay"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <span class="lang-ko">결제 진행</span>
                            <span class="lang-en">Payment Process</span>
                            <span class="lang-ja">決済処理</span>
                            <span class="lang-zh">支付处理</span>
                        </h3>
                        <button type="button" class="modal-close" aria-label="Close">×</button>
                    </div>
                    <div class="modal-content">
                        <div class="payment-frame-container">
                            <iframe name="nice_pay_frame" id="nicePayFrame" 
                                    frameborder="0" scrolling="no"></iframe>
                        </div>
                        <div class="payment-status">
                            <div class="spinner"></div>
                            <p class="status-message">
                                <span class="lang-ko">결제를 진행 중입니다...</span>
                                <span class="lang-en">Processing payment...</span>
                                <span class="lang-ja">決済を処理中です...</span>
                                <span class="lang-zh">正在处理支付...</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

    this.modal = null;
    this.currentLanguage = 'ko';
    this.eventHandlers = new Map();
  }

  show(paymentFormHtml) {
    // 모달 생성 및 표시
    this.modal = this.createModal();
    document.body.appendChild(this.modal);
    document.body.classList.add('modal-open');

    // 결제 폼 설정
    const form = this.modal.querySelector('form');
    if (form) {
      form.innerHTML = paymentFormHtml;
    }

    // 이벤트 리스너 설정
    this.setupEventListeners();

    // 언어 설정 적용
    this.updateLanguage(this.currentLanguage);

    // 모달 애니메이션
    setTimeout(() => {
      this.modal.classList.add('show');
    }, 10);
  }

  createModal() {
    const modalWrapper = document.createElement('div');
    modalWrapper.innerHTML = this.modalTemplate;
    return modalWrapper.firstElementChild;
  }

  setupEventListeners() {
    // 닫기 버튼 이벤트
    const closeButton = this.modal.querySelector('.modal-close');
    closeButton.addEventListener('click', () => this.hide());

    // 오버레이 클릭 이벤트
    const overlay = this.modal.querySelector('.modal-overlay');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide();
      }
    });

    // ESC 키 이벤트
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });

    // 결제 프레임 로드 이벤트
    const frame = this.modal.querySelector('#nicePayFrame');
    frame.addEventListener('load', () => {
      this.updateStatus('ready');
    });
  }

  updateStatus(status, message = '') {
    const statusContainer = this.modal.querySelector('.payment-status');
    const statusMessage = statusContainer.querySelector('.status-message');
    const spinner = statusContainer.querySelector('.spinner');

    switch (status) {
      case 'ready':
        spinner.style.display = 'none';
        statusMessage.textContent = this.getLocalizedMessage('ready');
        break;
      case 'processing':
        spinner.style.display = 'block';
        statusMessage.textContent = this.getLocalizedMessage('processing');
        break;
      case 'success':
        spinner.style.display = 'none';
        statusMessage.textContent = this.getLocalizedMessage('success');
        statusContainer.classList.add('success');
        break;
      case 'error':
        spinner.style.display = 'none';
        statusMessage.textContent = message || this.getLocalizedMessage('error');
        statusContainer.classList.add('error');
        break;
    }
  }

  getLocalizedMessage(key) {
    const messages = {
      ready: {
        ko: '결제창이 준비되었습니다.',
        en: 'Payment window is ready.',
        ja: '決済画面の準備ができました。',
        zh: '支付窗口已准备就绪。'
      },
      processing: {
        ko: '결제를 처리중입니다...',
        en: 'Processing payment...',
        ja: '決済を処理中です...',
        zh: '正在处理支付...'
      },
      success: {
        ko: '결제가 완료되었습니다.',
        en: 'Payment completed successfully.',
        ja: '決済が完了しました。',
        zh: '支付已完成。'
      },
      error: {
        ko: '결제 처리 중 오류가 발생했습니다.',
        en: 'An error occurred during payment processing.',
        ja: '決済処理中にエラーが発生しました。',
        zh: '支付处理过程中发生错误。'
      }
    };

    return messages[key]?.[this.currentLanguage] || messages[key]?.['en'] || '';
  }

  updateLanguage(lang) {
    this.currentLanguage = lang;
    this.modal.querySelectorAll(`[class^="lang-"]`).forEach(el => {
      el.style.display = 'none';
    });
    this.modal.querySelectorAll(`.lang-${lang}`).forEach(el => {
      el.style.display = 'block';
    });
  }

  hide() {
    if (this.modal) {
      this.modal.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(this.modal);
        document.body.classList.remove('modal-open');
        this.modal = null;
      }, 300);
    }
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => handler(data));
    }
  }
}