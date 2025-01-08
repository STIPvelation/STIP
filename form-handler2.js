// 폼 제출 처리를 위한 메인 함수
// listing.html Form handler
// creat by lee d.h 25-01-07

async function handleFormSubmit(formData) {
  try {
    // 1. 파일 업로드 처리
    const fileResult = await uploadFiles(formData);
    if (!fileResult.success) {
      throw new Error(fileResult.message);
    }

    // 2. 파일 정보를 formData에 추가
    formData.append('file_name', fileResult.data.originalName);
    formData.append('file_path', fileResult.data.filePath);
    formData.append('file_size', fileResult.data.fileSize);
    formData.append('file_type', fileResult.data.fileType);

    // 3. 폼 데이터 저장
    const saveResult = await saveFormData(formData);
    if (!saveResult.success) {
      throw new Error(saveResult.message);
    }

    return saveResult;

  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

// 파일 업로드 함수
async function uploadFiles(formData) {
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
    console.error('File upload error:', error);
    throw error;
  }
}

// 폼 데이터 저장 함수
async function saveFormData(formData) {
  try {
    const response = await fetch('contactForm_save.php', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Form save error:', error);
    throw error;
  }
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const paymentForm = document.getElementById('paymentForm');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(contactForm);
      formData.append('lang', getCurrentLanguage());

      // 폼 데이터 로깅
      console.log('Form data:', Object.fromEntries(formData));

      const result = await handleFormSubmit(formData);

      if (result.success) {
        console.log('Form submitted successfully:', result);
        contactForm.style.display = 'none';
        paymentForm.style.display = 'block';
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      showError('폼 제출 중 오류가 발생했습니다.');
    }
  });
});

// 에러 메시지 표시 함수
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger mt-3';
  errorDiv.textContent = message;

  const existingError = document.querySelector('.alert-danger');
  if (existingError) {
    existingError.remove();
  }

  const form = document.getElementById('contactForm');
  form.insertBefore(errorDiv, form.firstChild);
}