// 폼 제출 처리를 위한 JavaScript
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const fileInput = document.getElementById('file');
  const fileList = document.getElementById('fileList');
  const errorMessage = document.getElementById('errorMessage');

  // 업로드된 파일을 관리하기 위한 Map
  const uploadedFiles = new Map();

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 목록 아이템 생성 함수
  const createFileItem = (file, fileId) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <button type="button" class="remove-file" data-file-id="${fileId}" aria-label="파일 삭제">
                <span class="minus-icon">-</span>
            </button>
        `;

    const removeBtn = fileItem.querySelector('.remove-file');
    removeBtn.addEventListener('click', () => {
      uploadedFiles.delete(fileId);
      fileItem.remove();
      updateFileInput();
    });

    return fileItem;
  };

  // FileList 업데이트 함수
  const updateFileInput = () => {
    const dt = new DataTransfer();
    uploadedFiles.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
  };

  // 파일 처리 함수
  const handleFiles = (files) => {
    const validTypes = ['.pdf', '.doc', '.docx'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach(file => {
      const fileType = '.' + file.name.split('.').pop().toLowerCase();

      if (!validTypes.includes(fileType)) {
        showError('유효하지 않은 파일 형식입니다.');
        return;
      }

      if (file.size > maxSize) {
        showError('파일 크기가 제한을 초과합니다.');
        return;
      }

      const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      uploadedFiles.set(fileId, file);

      const fileItem = createFileItem(file, fileId);
      fileList.appendChild(fileItem);
    });

    updateFileInput();
    errorMessage.style.display = 'none';
  };

  // 폼 제출 처리
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
      // 파일 업로드 처리
      const fileData = new FormData();
      uploadedFiles.forEach((file) => {
        fileData.append('files[]', file);
      });

      // 파일 업로드 요청
      const fileUploadResult = await fetch('upload_file.php', {
        method: 'POST',
        body: fileData
      });

      const fileResponse = await fileUploadResult.json();

      if (!fileResponse.success) {
        throw new Error(fileResponse.message || '파일 업로드에 실패했습니다.');
      }

      // 폼 데이터 준비
      const formData = new FormData(this);
      formData.append('lang', document.documentElement.lang || 'ko');
      formData.append('fileInfo', JSON.stringify(fileResponse.files));

      // 폼 데이터 제출
      const response = await fetch('contactForm_save.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '저장에 실패했습니다.');
      }

      // 성공 처리
      alert('제출이 완료되었습니다.');

      // 주문 폼으로 전환
      showOrderForm();

    } catch (error) {
      console.error('Error:', error);
      showError(error.message || '처리 중 오류가 발생했습니다.');
    }
  });

  // 파일 드래그 앤 드롭 처리
  const dropZone = document.getElementById('dropZone');

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  // 에러 메시지 표시 함수
  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  };

  // 주문 폼 표시 함수
  const showOrderForm = () => {
    contactForm.style.display = 'none';
    const orderFormSection = document.getElementById('orderFormSection');
    if (orderFormSection) {
      orderFormSection.style.display = 'block';
    }
  };
});