class ErrorService {
    static #instance;
    #errorMessages;

    constructor() {
        if (ErrorService.#instance) {
            return ErrorService.#instance;
        }
        ErrorService.#instance = this;

        // 다국어 에러 메시지 정의
        this.#errorMessages = {
            ko: {
                fetch_countries_failed: '국가 목록을 불러오는데 실패했습니다.',
                invalid_file_type: '허용되지 않는 파일 형식입니다.',
                file_size_exceeded: '파일 크기가 제한을 초과했습니다.',
                upload_failed: '파일 업로드에 실패했습니다.',
                form_submission_failed: '폼 제출에 실패했습니다.',
                payment_failed: '결제 처리에 실패했습니다.'
                // ... 기타 에러 메시지
            },
            en: {
                fetch_countries_failed: 'Failed to load country list.',
                invalid_file_type: 'Invalid file type.',
                file_size_exceeded: 'File size exceeded the limit.',
                upload_failed: 'File upload failed.',
                form_submission_failed: 'Form submission failed.',
                payment_failed: 'Payment processing failed.'
            },
            ja: {
                fetch_countries_failed: '国リストの読み込みに失敗しました。',
                invalid_file_type: '無効なファイル形式です。',
                file_size_exceeded: 'ファイルサイズが制限を超えています。',
                upload_failed: 'ファイルのアップロードに失敗しました。',
                form_submission_failed: 'フォームの送信に失敗しました。',
                payment_failed: '決済処理に失敗しました。'
            },
            zh: {
                fetch_countries_failed: '加载国家列表失败。',
                invalid_file_type: '文件类型无效。',
                file_size_exceeded: '文件大小超过限制。',
                upload_failed: '文件上传失败。',
                form_submission_failed: '表单提交失败。',
                payment_failed: '支付处理失败。'
            }
        };
    }

    /**
     * 에러 메시지를 가져오는 메서드
     * @param {string} lang - 언어 코드
     * @param {string} errorCode - 에러 코드
     * @returns {string} - 해당 언어의 에러 메시지
     */
    getErrorMessage(lang, errorCode) {
        return this.#errorMessages[lang]?.[errorCode] || this.#errorMessages['en'][errorCode] || 'An error occurred.';
    }

    /**
     * 토스트 메시지를 표시하는 메서드
     * @param {string} type - 메시지 타입 ('error', 'success', 'warning', 'info')
     * @param {string} message - 표시할 메시지
     */
    showToast(type, message) {
        // 이미 존재하는 토스트 제거
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        // 새로운 토스트 엘리먼트 생성
        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.textContent = message;

        // body에 토스트 추가
        document.body.appendChild(toast);

        // 토스트 표시 애니메이션
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // 3초 후 토스트 제거
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    /**
     * 에러를 처리하고 토스트로 표시하는 메서드
     * @param {Error} error - 에러 객체
     * @param {string} lang - 언어 코드
     * @param {string} errorCode - 에러 코드
     */
    handleError(error, lang, errorCode) {
        console.error('Error:', error);
        const message = this.getErrorMessage(lang, errorCode);
        this.showToast('error', message);
    }
}

// 전역 인스턴스 생성
window.errorService = new ErrorService(); 