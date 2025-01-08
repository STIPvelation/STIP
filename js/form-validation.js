// form-validation.js
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.setupValidation();
    }

    setupValidation() {
        // 실시간 유효성 검사
        this.form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });

        // 폼 제출 처리
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                await this.submitForm();
            }
        });
    }

    validateField(input) {
        const errorElement = document.querySelector(`[data-error-for="${input.id}"]`);
        let isValid = true;
        let errorMessage = '';

        // 기본 유효성 검사
        if (input.required && !input.value.trim()) {
            isValid = false;
            errorMessage = '이 필드는 필수입니다.';
        } else if (input.type === 'email' && input.value) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                errorMessage = '올바른 이메일 형식이 아닙니다.';
            }
        }

        // 유효성 상태에 따른 UI 업데이트
        input.classList.toggle('is-invalid', !isValid);
        input.classList.toggle('is-valid', isValid && input.value.trim());
        
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }

        return isValid;
    }

    validateForm() {
        let isValid = true;
        this.form.querySelectorAll('input, textarea').forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        return isValid;
    }

    async submitForm() {
        try {
            this.setLoadingState(true);
            const formData = new FormData(this.form);
            const response = await this.sendFormData(formData);
            
            if (response.success) {
                this.showSuccessMessage();
                this.form.reset();
            } else {
                this.showErrorMessage(response.message);
            }
        } catch (error) {
            this.showErrorMessage('제출 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.innerHTML = isLoading ? 
            '<span class="spinner"></span> 전송중...' : 
            'Contact';
    }

    showSuccessMessage() {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = '문의가 성공적으로 접수되었습니다.';
        this.form.insertBefore(alert, this.form.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }

    showErrorMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.textContent = message;
        this.form.insertBefore(alert, this.form.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }
}

// 폼 초기화
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        new FormValidator(contactForm);
    }
});