/**
 * file-upload-service.js
 * 파일 업로드 처리를 위한 서비스
 * 
 * 주요 기능:
 * - 파일 업로드 처리
 * - 파일 유효성 검증
 * - 드래그 앤 드롭 지원
 * - 파일 목록 관리
 * 
 * 사용되는 곳:
 * - contactForm의 파일 업로드
 * - 문서 제출 기능
 */

class FileUploadService {
  constructor() {
    this.uploadedFiles = new Map();
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['.pdf', '.doc', '.docx'];
    this.currentLang = localStorage.getItem('preferredLanguage') || 'en';

    // 메시지 정의
    this.messages = {
      ko: {
        invalidType: '허용된 파일 형식이 아닙니다. PDF, DOC, DOCX 파일만 업로드 가능합니다.',
        sizeExceeded: '파일 크기가 5MB를 초과합니다.',
        uploadSuccess: '파일이 성공적으로 업로드되었습니다.',
        uploadFailed: '파일 업로드에 실패했습니다.',
        deleteConfirm: '파일을 삭제하시겠습니까?'
      },
      en: {
        invalidType: 'Invalid file type. Only PDF, DOC, DOCX files are allowed.',
        sizeExceeded: 'File size exceeds 5MB limit.',
        uploadSuccess: 'File uploaded successfully.',
        uploadFailed: 'File upload failed.',
        deleteConfirm: 'Do you want to delete this file?'
      },
      // 다른 언어 메시지 추가...
      ja: {
        invalidType: 'Invalid file type. Only PDF, DOC, DOCX files are allowed.',
        sizeExceeded: 'File size exceeds 5MB limit.',
        uploadSuccess: 'File uploaded successfully.',
        uploadFailed: 'File upload failed.',
        deleteConfirm: 'Do you want to delete this file?'
      },
      jz: {
        invalidType: 'Invalid file type. Only PDF, DOC, DOCX files are allowed.',
        sizeExceeded: 'File size exceeds 5MB limit.',
        uploadSuccess: 'File uploaded successfully.',
        uploadFailed: 'File upload failed.',
        deleteConfirm: 'Do you want to delete this file?'
      },
    };

    this.initializeEventListeners();
  }

  // 이벤트 리스너 초기화
  initializeEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('file');

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
      dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }
  }

  // 파일 유효성 검사
  validateFile(file) {
    const fileType = '.' + file.name.split('.').pop().toLowerCase();

    if (!this.allowedTypes.includes(fileType)) {
      throw new Error(this.getMessage('invalidType'));
    }

    if (file.size > this.maxFileSize) {
      throw new Error(this.getMessage('sizeExceeded'));
    }

    return true;
  }

  // 파일 크기 포맷팅
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 파일 목록 아이템 생성
  createFileItem(file, fileId) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            </div>
            <button type="button" class="remove-file" data-file-id="${fileId}">
                <span class="minus-icon">-</span>
            </button>
        `;

    const removeBtn = fileItem.querySelector('.remove-file');
    removeBtn.addEventListener('click', () => this.removeFile(fileId));

    return fileItem;
  }

  // 파일 처리
  async handleFiles(files) {
    const fileList = document.getElementById('fileList');
    const errorMessage = document.getElementById('errorMessage');

    for (const file of Array.from(files)) {
      try {
        this.validateFile(file);
        const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        this.uploadedFiles.set(fileId, file);

        const fileItem = this.createFileItem(file, fileId);
        fileList.appendChild(fileItem);

      } catch (error) {
        console.error('File validation error:', error);
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
      }
    }

    this.updateFileInput();
  }

  // 파일 입력 업데이트
  updateFileInput() {
    const fileInput = document.getElementById('file');
    const dt = new DataTransfer();
    this.uploadedFiles.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
  }

  // 파일 제거
  removeFile(fileId) {
    if (confirm(this.getMessage('deleteConfirm'))) {
      this.uploadedFiles.delete(fileId);
      const fileItem = document.querySelector(`[data-file-id="${fileId}"]`).closest('.file-item');
      fileItem.remove();
      this.updateFileInput();
    }
  }

  // 드래그 앤 드롭 이벤트 핸들러
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    this.handleFiles(files);
  }

  handleFileSelect(e) {
    const files = e.target.files;
    this.handleFiles(files);
  }

  // 메시지 가져오기
  getMessage(key) {
    return this.messages[this.currentLang]?.[key] || this.messages['en'][key];
  }

  // 파일 업로드 실행
  async uploadFiles() {
    const formData = new FormData();
    this.uploadedFiles.forEach(file => {
      formData.append('files[]', file);
    });

    try {
      const response = await fetch('upload_file.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }

      return result.files;

    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
}

// 전역 인스턴스 생성
const fileUploadService = new FileUploadService();

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  fileUploadService.initializeEventListeners();
});