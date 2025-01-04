import { getErrorMessage, showError } from './error_messages.js'; // import 추가

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const currentLang = localStorage.getItem('preferredLanguage') || 'en';
      try {
        // ... (기존 contactForm submit 이벤트 처리 로직)
        // 폼 데이터 로깅
        console.log('Form data:', {
          country: this.country.value,
          name: this.name.value,
          email: this.email.value,
          mobile: this.mobile.value
        });

        // 파일 업로드 처리
        const fileData = new FormData();
        uploadedFiles.forEach((file) => {
          fileData.append('files[]', file);
          console.log('Adding file:', file.name);
        });

        // 파일 업로드 요청
        console.log('Sending file upload request');
        const fileUploadResult = await fetch('upload_file.php', {
          method: 'POST',
          body: fileData
        });

        if (!fileUploadResult.ok) {
          throw new Error(`HTTP error! status: ${fileUploadResult.status}`);
        }

        const fileResponse = await fileUploadResult.json();
        console.log('File upload response:', fileResponse);

        if (!fileResponse.success) {
          throw new Error(fileResponse.message || '파일 업로드에 실패했습니다.');
        }


        // Contact Form 데이터 저장
        const formData = new FormData(this);
        formData.append('lang', document.documentElement.lang || 'ko');
        formData.append('fileInfo', JSON.stringify(fileResponse.files));

        // FormData 내용 로깅
        for (let [key, value] of formData.entries()) {
          console.log('FormData entry:', key, value);
        }

        // 폼 데이터 제출
        console.log('Sending form data');
        const response = await fetch('contactForm_save.php', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Contact form save response:', result);

        if (!result.success) {
          throw new Error(result.message || '저장에 실패했습니다.');
        }

        // 3) order_form 테이블 업데이트
        const updateOrderResponse = await fetch('update_order.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact_form_id: result.contact_id,  // contactForm_save.php에서 반환된 ID
            order_id: sessionStorage.getItem('current_order_id')  // orderForm 처리 시 저장된 ID
          })
        });

        const updateResult = await updateOrderResponse.json();
        if (!updateResult.success) {
          throw new Error(updateResult.message);
        }

        // 성공 처리
        console.log('Form submission successful');
        alert('제출이 완료되었습니다.');

        // 4) 성공 처리
        alert('문의가 성공적으로 등록되었습니다.');
        window.location.href = 'listing.html';
      } catch (error) {
        console.error('Contact form submission error:', error);
        showError(error.message || getErrorMessage(currentLang, 'contact_submission_error')); // 에러 메시지 사용
      }
    });
  }
});

// contactForm event start here
// contactForm.addEventListener('submit', async function (e) {
//   e.preventDefault();
//   // console.log('Contact form submission started');
//   console.log('Contact form submission started');

//   try {
//     // 폼 데이터 로깅
//     console.log('Form data:', {
//       country: this.country.value,
//       name: this.name.value,
//       email: this.email.value,
//       mobile: this.mobile.value
//     });

//     // 파일 업로드 처리
//     const fileData = new FormData();
//     uploadedFiles.forEach((file) => {
//       fileData.append('files[]', file);
//       console.log('Adding file:', file.name);
//     });

//     // 파일 업로드 요청
//     console.log('Sending file upload request');
//     const fileUploadResult = await fetch('upload_file.php', {
//       method: 'POST',
//       body: fileData
//     });

//     if (!fileUploadResult.ok) {
//       throw new Error(`HTTP error! status: ${fileUploadResult.status}`);
//     }

//     const fileResponse = await fileUploadResult.json();
//     console.log('File upload response:', fileResponse);

//     if (!fileResponse.success) {
//       throw new Error(fileResponse.message || '파일 업로드에 실패했습니다.');
//     }


//     // Contact Form 데이터 저장
//     const formData = new FormData(this);
//     formData.append('lang', document.documentElement.lang || 'ko');
//     formData.append('fileInfo', JSON.stringify(fileResponse.files));

//     // FormData 내용 로깅
//     for (let [key, value] of formData.entries()) {
//       console.log('FormData entry:', key, value);
//     }

//     // 폼 데이터 제출
//     console.log('Sending form data');
//     const response = await fetch('contactForm_save.php', {
//       method: 'POST',
//       body: formData
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log('Contact form save response:', result);

//     if (!result.success) {
//       throw new Error(result.message || '저장에 실패했습니다.');
//     }

//     // 3) order_form 테이블 업데이트
//     const updateOrderResponse = await fetch('update_order.php', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         contact_form_id: result.contact_id,  // contactForm_save.php에서 반환된 ID
//         order_id: sessionStorage.getItem('current_order_id')  // orderForm 처리 시 저장된 ID
//       })
//     });

//     const updateResult = await updateOrderResponse.json();
//     if (!updateResult.success) {
//       throw new Error(updateResult.message);
//     }

//     // 성공 처리
//     console.log('Form submission successful');
//     alert('제출이 완료되었습니다.');

//     // 4) 성공 처리
//     alert('문의가 성공적으로 등록되었습니다.');
//     window.location.href = 'listing.html';

//     // 데이터 전달 및 폼 전환
//     // transferDataToOrderForm();

//     // Form 표시 전환
//     // contactForm.style.display = 'none';
//     // orderForm.style.display = 'block';

//     // if (result.success) {
//     //   // OrderForm 표시 및 데이터 전달
//     //   this.style.display = 'none';
//     //   const orderForm = document.getElementById('orderForm');
//     //   orderForm.style.display = 'block';

//     //   // 데이터 전달
//     //   document.getElementById('orderName').value = this.name.value;
//     //   document.getElementById('orderEmail').value = this.email.value;
//     //   document.getElementById('orderPhone').value = this.mobile.value;
//     // } else {
//     //   throw new Error(result.message);
//     // }

//   } catch (error) {
//     console.error('Contact form submission error:', error);
//     showError(error.message || '처리 중 오류가 발생했습니다.');
//   }
// });