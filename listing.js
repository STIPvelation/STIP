// listing-process.js
document.addEventListener('DOMContentLoaded', function () {
  // 1. Product Preview Form 처리
  const productPreviewForm = document.getElementById('productPreviewForm');
  productPreviewForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
      // Product Preview 데이터 수집
      const previewData = {
        productCode: document.getElementById('previewProductCode').value,
        productName: document.getElementById('previewProductName').value,
        quantity: document.getElementById('previewQuantity').value,
        price: document.getElementById('previewPrice').value
      };

      // Product Preview 데이터 저장
      const saveResponse = await fetch('save_product_preview.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData)
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save product preview');
      }

      // Order Form으로 데이터 전달 및 화면 전환
      productPreviewForm.style.display = 'none';
      const orderForm = document.getElementById('orderForm');
      orderForm.style.display = 'block';

      // Order Form에 데이터 설정
      document.getElementById('hidden_productCode').value = previewData.productCode;
      document.getElementById('hidden_productName').value = previewData.productName;
      document.getElementById('hidden_price').value = previewData.price;

    } catch (error) {
      console.error('Product preview error:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  });

  // 2. Order Form 처리
  const orderForm = document.getElementById('orderForm');
  orderForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
      // 주문 데이터 수집
      const formData = new FormData(this);

      // NicePay 결제창 호출 및 결제 처리
      const paymentResult = await processPayment(formData);

      if (paymentResult.success) {
        // 결제 성공 시 주문 데이터 저장
        const orderData = {
          ...Object.fromEntries(formData),
          paymentInfo: paymentResult
        };

        const orderSaveResponse = await fetch('save_order.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });

        if (!orderSaveResponse.ok) {
          throw new Error('Failed to save order');
        }

        // Contact Form 표시
        orderForm.style.display = 'none';
        const contactForm = document.getElementById('contactForm');
        contactForm.style.display = 'block';

        // Order Form 데이터를 Contact Form으로 전달
        document.getElementById('name').value = orderData.orderName;
        document.getElementById('email').value = orderData.orderEmail;
        document.getElementById('mobile').value = orderData.orderPhone;
      }

    } catch (error) {
      console.error('Order processing error:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  });

  // 3. Contact Form 처리
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
      // 파일 업로드 처리
      if (this.querySelector('input[type="file"]').files.length > 0) {
        const fileData = new FormData();
        Array.from(this.querySelector('input[type="file"]').files)
          .forEach(file => fileData.append('files[]', file));

        const uploadResponse = await fetch('upload_file.php', {
          method: 'POST',
          body: fileData
        });

        if (!uploadResponse.ok) {
          throw new Error('File upload failed');
        }
      }

      // Contact Form 데이터 저장
      const formData = new FormData(this);
      const response = await fetch('save_contact.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save contact form');
      }

      // 성공 시 listing.html로 리다이렉트
      alert('성공적으로 처리되었습니다.');
      window.location.href = 'listing.html';

    } catch (error) {
      console.error('Contact form error:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  });
});

// NicePay 결제 처리 함수
async function processPayment(formData) {
  // 기존 NicePay 결제 처리 코드 유지
  // test-order-form.js의 결제 처리 로직 사용
}

// 파일 크기 포맷팅 함수
const formatFileSize = (bytes) => {
  console.log('Formatting file size for bytes:', bytes);
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  console.log('Formatted size:', formattedSize);
  return formattedSize;
};

// 파일 목록 아이템 생성 함수
const createFileItem = (file, fileId) => {
  console.log('Creating file item for:', { fileName: file.name, fileId: fileId });

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
    console.log('Removing file:', { fileId: fileId, fileName: file.name });
    uploadedFiles.delete(fileId);
    fileItem.remove();
    updateFileInput();
    console.log('Current uploaded files count:', uploadedFiles.size);
  });

  return fileItem;
};

// FileList 업데이트 함수
const updateFileInput = () => {
  console.log('Updating file input with files:', uploadedFiles.size);
  const dt = new DataTransfer();
  uploadedFiles.forEach(file => dt.items.add(file));
  fileInput.files = dt.files;
  console.log('Updated fileInput files count:', fileInput.files.length);
};

// 파일 처리 함수
const handleFiles = (files) => {
  console.log('Handling files:', files.length);

  const validTypes = ['.pdf', '.doc', '.docx'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  Array.from(files).forEach(file => {
    console.log('Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const fileType = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(fileType)) {
      console.error('Invalid file type:', fileType);
      showError('유효하지 않은 파일 형식입니다.');
      return;
    }

    if (file.size > maxSize) {
      console.error('File size exceeds limit:', {
        fileSize: file.size,
        maxSize: maxSize
      });
      showError('파일 크기가 제한을 초과합니다.');
      return;
    }

    const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    uploadedFiles.set(fileId, file);
    console.log('File added to upload queue:', fileId);

    const fileItem = createFileItem(file, fileId);
    fileList.appendChild(fileItem);
  });

  updateFileInput();
  errorMessage.style.display = 'none';
};



// 결제 폼 에러 메시지 표시 함수
function showPaymentError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger mt-3';
  errorDiv.role = 'alert';
  errorDiv.textContent = message;

  // 기존 에러 메시지 제거
  const existingError = paymentForm.querySelector('.alert-danger');
  if (existingError) {
    existingError.remove();
  }

  // 폼 상단에 에러 메시지 추가
  paymentForm.insertBefore(errorDiv, paymentForm.firstChild);

  // 5초 후 에러 메시지 자동 제거
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function addFileToList(file, fileId) {
  // ... 파일 리스트 추가 함수 내용 ...
  const fileItem = document.createElement('div');
  fileItem.className = 'file-item';
  fileItem.innerHTML = `
                      <div class="file-info">
                          <span class="file-name">${file.name}</span>
                          <span class="file-size">${formatFileSize(file.size)}</span>
                      </div>
                      <button type="button" class="remove-file" data-file-id="${fileId}">
                          <span class="minus-icon">-</span>
                      </button>
                  `;

  // document.getElementById('fileList').appendChild(fileItem);

  // fileItem.querySelector('.remove-file').addEventListener('click', () => {
  //   uploadedFiles.delete(fileId);
  //   fileItem.remove();
  // });

  fileItem.querySelector('.remove-file').addEventListener('click', () => {
    uploadedFiles.delete(fileId);
    fileItem.remove();
  });

  fileList.appendChild(fileItem);
}

// 파일 크기 포맷팅
// function formatFileSize(bytes) {
//   if (bytes === 0) return '0 B';
//   const k = 1024;
//   const sizes = ['B', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// }

// 에러 메시지 표시
// function showError(message) {
//   console.error('Error:', message);
//   errorMessage.textContent = message;
//   errorMessage.style.display = 'block';
// }

const languageDropdown = document.querySelector('.dropdown-menu');
if (languageDropdown) {
  languageDropdown.addEventListener('click', (event) => {
    const langItem = event.target.closest('[onclick*="handleLangChange"]');
    if (langItem) {
      const lang = langItem.getAttribute('onclick').match(/'([^']+)'/)[1];
      handleLangChange(lang);
    }
  });
}

dropdown_menu.addEventListener('click', (event) => {
  const liElement = event.target.closest('li');
  if (liElement) {
    const divElement = liElement.querySelector('div'); // li 안의 div 찾기
    if (divElement) {
      divValue = divElement.textContent.trim(); // div 값 가져오기
      // 선택한 언어를 로컬 저장소에 저장
      // localStorage.setItem("preferredLanguage", divValue);
      if (divValue === '한국어') {
        pageLang = 'ko';
      }
      if (divValue === 'English') {
        pageLang = 'en';
      }
      if (divValue === '日本語') {
        pageLang = 'ja';
      }
      if (divValue === '中文') {
        pageLang = 'jz';
      }

    }

  }
  console.log('divValue ->' + `${divValue}`, 'pageLang ->' + `${pageLang}`);
});

function isMobileDevice() {
  const userAgentCheck = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const screenSizeCheck = window.matchMedia("(max-width: 768px)").matches;

  return userAgentCheck || screenSizeCheck;
}

if (isMobileDevice()) {
  console.log("모바일 기기 또는 작은 화면에서 접속 중입니다.");
} else {
  console.log("데스크톱 기기에서 접속 중입니다.");
}

// 국가 목록을 가져오는 함수
async function fetchCountries(lang) {
  try {
    const countrySelect = document.getElementById('country');
    const currentLang = lang // getCurrentLanguage();

    // 이미 옵션이 로드되어 있다면 다시 로드하지 않음
    if (countrySelect.options.length > 1) {
      return;
    }

    const response = await fetch(`api/country.php?lang=${currentLang}`);
    const data = await response.json();

    if (data.success) {
      // 기존 옵션들 제거 (첫 번째 placeholder 옵션 유지)
      while (countrySelect.options.length > 1) {
        countrySelect.remove(1);
      }

      // 새로운 옵션들 추가
      data.data.forEach(country => {
        const option = document.createElement('option');
        option.value = country.country_code;
        option.textContent = country.country_name;
        countrySelect.appendChild(option);
      });

      // select 요소 업데이트 이벤트 발생
      const event = new Event('change');
      countrySelect.dispatchEvent(event);
    } else {
      console.error('Failed to fetch countries:', data.message);
      showError(getErrorMessage(currentLang, 'fetch_countries_failed'));
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
    showError(getErrorMessage(currentLang, 'fetch_countries_failed'));
  }
}

// 국가 선택 관련 에러 메시지
const countryErrorMessages = {
  ko: {
    fetch_countries_failed: '국가 목록을 불러오는데 실패했습니다.'
  },
  en: {
    fetch_countries_failed: 'Failed to load country list.'
  },
  ja: {
    fetch_countries_failed: '国リストの読み込みに失敗しました。'
  },
  zh: {
    fetch_countries_failed: '加载国家列表失败。'
  }
};

// 에러 메시지 가져오기 함수 수정
function getErrorMessage(lang, key) {
  if (key && countryErrorMessages[lang] && countryErrorMessages[lang][key]) {
    return countryErrorMessages[lang][key];
  }
  return errorMessages[lang] || errorMessages['en'];
}

// 현재 언어 설정을 가져오는 함수
function getCurrentLanguage() {
  // 로컬 스토리지에서 저장된 언어 설정을 가져옴
  let currentLang = localStorage.getItem('preferredLanguage');

  // 저장된 설정이 없으면 기본값으로 'ko' 사용
  if (!currentLang) {
    // 브라우저의 언어 설정 확인
    const browserLang = navigator.language.slice(0, 2);
    // 지원하는 언어인지 확인
    currentLang = ['ko', 'en', 'ja', 'zh'].includes(browserLang) ? browserLang : 'ko';
    // 설정을 로컬 스토리지에 저장
    localStorage.setItem('preferredLanguage', currentLang);
  }

  return currentLang;
}

// 드래그 앤 드롭 이벤트
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
  console.log('File input change event');
  handleFiles(e.target.files);
});

// 에러 메시지 표시 함수
const showError = (message) => {
  console.error('Error message:', message);
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
};

// 주문 폼 표시 함수
const showOrderForm = () => {
  console.log('Switching to order form');
  contactForm.style.display = 'none';
  const orderFormSection = document.getElementById('orderFormSection');
  if (orderFormSection) {
    orderFormSection.style.display = 'block';
    console.log('Order form displayed');
  } else {
    console.error('Order form section not found');
  }
};

// 초기화 완료 로그
console.log('Form handling script initialization completed');


// Contact Form에서 Order Form으로 데이터 전달
function transferDataToOrderForm() {
  console.log('Transferring data to order form');

  // 기본 정보 전달
  document.getElementById('orderName').value = document.getElementById('name').value;
  document.getElementById('orderEmail').value = document.getElementById('email').value;
  document.getElementById('orderPhone').value = document.getElementById('mobile').value;

  // readonly 스타일 적용
  ['orderName', 'orderEmail', 'orderPhone'].forEach(id => {
    const element = document.getElementById(id);
    element.readOnly = true;
    element.classList.add('readonly-field');
  });
}


// 주문 완료 팝업 표시 함수
function showOrderCompletePopup() {
  const popup = document.getElementById('orderCompletePopup');
  if (popup) {
    popup.style.display = 'flex';

    // 현재 언어로 텍스트 업데이트
    updatePopupLanguage(currentLang);
  }
}

// 팝업 닫기 함수
function closeOrderPopup() {
  const popup = document.getElementById('orderCompletePopup');
  if (popup) {
    popup.style.display = 'none';
    // 페이지 새로고침
    window.location.reload();
  }
}

// 팝업 언어 업데이트 함수
function updatePopupLanguage(lang) {
  const popup = document.getElementById('orderCompletePopup');
  if (popup) {
    popup.querySelectorAll(`[data-lang-${lang}]`).forEach(element => {
      element.textContent = element.getAttribute(`data-lang-${lang}`);
    });
  }
}

// ESC 키로 팝업 닫기
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeOrderPopup();
  }
});