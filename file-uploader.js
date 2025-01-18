class FileUploader {
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

  async uploadFiles() {
    try {
      const formData = new FormData();
      this.uploadedFiles.forEach(file => {
        formData.append('files[]', file);
      });

      const response = await fetch('upload_file.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;

    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

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