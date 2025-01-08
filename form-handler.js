// listing.html Form Handler
class FormHandler {
  constructor() {
    this.contactForm = document.getElementById('contactForm');
    this.paymentForm = document.getElementById('paymentForm');
    this.fileUploader = new FileUploader();
    this.currentLang = localStorage.getItem('preferredLanguage') || 'ko';

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Contact Form 제출 이벤트
    this.contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleContactFormSubmit(e);
    });

    // 파일 필드 변경 이벤트
    document.getElementById('file').addEventListener('change', (e) => {
      this.fileUploader.handleFiles(e.target.files);
    });
  }

  async handleContactFormSubmit(e) {
    try {
      // 로딩 상태 표시
      this.showLoading(true);

      // 파일 업로드 처리
      const fileUploadResult = await this.fileUploader.uploadFiles();
      if (!fileUploadResult.success) {
        throw new Error(fileUploadResult.message);
      }

      // 폼 데이터 준비
      const formData = new FormData(this.contactForm);
      formData.append('lang', this.currentLang);

      // 파일 정보 추가
      if (fileUploadResult.files.length > 0) {
        formData.append('fileInfo', JSON.stringify(fileUploadResult.files));
      }

      // 디버그 로그
      console.log('Form submission data:', {
        formData: Object.fromEntries(formData),
        files: fileUploadResult.files
      });

      // 폼 데이터 저장
      const saveResponse = await this.saveFormData(formData);
      if (!saveResponse.success) {
        throw new Error(saveResponse.message);
      }

      // 성공 시 결제 폼으로 전환
      // this.showPaymentForm(formData);

    } catch (error) {
      // console.error('Form submission error:', error);
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  async saveFormData(formData) {
    const response = await fetch('contactForm_save.php', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  }

  showPaymentForm(formData) {
    // 컨택트 폼 숨기기
    this.contactForm.style.display = 'none';

    // 결제 폼에 데이터 설정
    document.getElementById('cardholderName').value = formData.get('name');
    document.getElementById('displayProductCode').textContent = formData.get('productCode');
    document.getElementById('displayProductName').textContent = formData.get('productName');

    // 결제 폼 표시
    this.paymentForm.style.display = 'block';
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.role = 'alert';
    errorDiv.textContent = message;

    // 기존 에러 메시지 제거
    const existingError = this.contactForm.querySelector('.alert-danger');
    if (existingError) {
      existingError.remove();
    }

    // 새 에러 메시지 추가
    this.contactForm.insertBefore(errorDiv, this.contactForm.firstChild);

    // 5초 후 자동 제거
    setTimeout(() => errorDiv.remove(), 5000);
  }

  showLoading(show) {
    // 로딩 인디케이터 표시/숨김 처리
    const submitButton = this.contactForm.querySelector('button[type="submit"]');
    const submitButton2 = this.contactForm.querySelector('button#submit');
    if (show) {
      //submitButton.disabled = true;
      //submitButton.textContent = '처리 중...';
      console.log('show '+`${show}`)
    } else {
      //submitButton.disabled = false;
      //submitButton.textContent = 'Submit';
    }
  }
}

// FileUploader 클래스는 별도 파일로 분리
class FileUploader {
  // ... (다음 코드에서 계속)
  constructor() {
    this.dropZone = document.getElementById('dropZone');
    this.fileInput = document.getElementById('file');
    this.fileList = document.getElementById('fileList');
    this.errorMessage = document.getElementById('errorMessage');
    this.uploadedFiles = new Map();

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // 드래그 앤 드롭 이벤트
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('dragover');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('dragover');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });

    // 파일 선택 이벤트
    this.fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });
  }

  async uploadFiles(formData) {
    try {
      const response = await fetch('upload_file.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      // console.error('File upload error:', error);
      throw error;
    }
  }

  // async uploadFiles() {
  //   try {
  //     const formData = new FormData();
  //     this.uploadedFiles.forEach(file => {
  //       formData.append('files[]', file);
  //     });

  //     const response = await fetch('upload_file.php', {
  //       method: 'POST',
  //       body: formData
  //     });

  //     const result = await response.json();
  //     if (!result.success) {
  //       throw new Error(result.message);
  //     }

  //     return result;

  //   } catch (error) {
  //     console.error('File upload error:', error);
  //     throw error;
  //   }
  // }

  // ... (다음 코드에서 계속)
  handleFiles(files) {
    Array.from(files).forEach(file => {
      const validationResult = this.validateFile(file);
      if (!validationResult.isValid) {
        this.showError(validationResult.error);
        return;
      }

      const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      this.uploadedFiles.set(fileId, file);

      this.addFileToList(file, fileId);
    });

    this.updateFileInput();
  }

  validateFile(file) {
    const validTypes = ['.pdf', '.doc', '.docx'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(fileExt)) {
      return {
        isValid: false,
        error: this.getMessage('invalidType')
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: this.getMessage('sizeExceeded')
      };
    }

    return { isValid: true };
  }

  addFileToList(file, fileId) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            </div>
            <button type="button" class="remove-file" data-file-id="${fileId}" aria-label="${this.getMessage('deleteFile')}">
                <span class="minus-icon">-</span>
            </button>
        `;

    // 삭제 버튼 이벤트 리스너
    const removeBtn = fileItem.querySelector('.remove-file');
    removeBtn.addEventListener('click', () => {
      this.removeFile(fileId);
      fileItem.remove();
    });

    this.fileList.appendChild(fileItem);
  }

  removeFile(fileId) {
    this.uploadedFiles.delete(fileId);
    this.updateFileInput();
  }

  updateFileInput() {
    const dt = new DataTransfer();
    this.uploadedFiles.forEach(file => dt.items.add(file));
    this.fileInput.files = dt.files;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.style.display = 'block';

    setTimeout(() => {
      this.errorMessage.style.display = 'none';
    }, 5000);
  }

  getMessage(key) {
    const messages = {
      ko: {
        invalidType: '허용되지 않는 파일 형식입니다. PDF, DOC, DOCX 파일만 업로드 가능합니다.',
        sizeExceeded: '파일 크기가 5MB를 초과했습니다.',
        deleteFile: '파일 삭제'
      },
      en: {
        invalidType: 'Invalid file type. Only PDF, DOC, DOCX files are allowed.',
        sizeExceeded: 'File size exceeds 5MB limit.',
        deleteFile: 'Delete file'
      },
      ja: {
        invalidType: '無効なファイル形式です。PDF、DOC、DOCXファイルのみアップロード可能です。',
        sizeExceeded: 'ファイルサイズが5MBを超えています。',
        deleteFile: 'ファイルを削除'
      },
      zh: {
        invalidType: '文件类型无效。仅允许PDF、DOC、DOCX文件。',
        sizeExceeded: '文件大小超过5MB限制。',
        deleteFile: '删除文件'
      }
    };

    const currentLang = localStorage.getItem('preferredLanguage') || 'ko';
    return messages[currentLang]?.[key] || messages['en'][key];
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  window.formHandler = new FormHandler();
});