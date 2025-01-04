import { getErrorMessage, showError } from './error_messages.js'; // import 추가

document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const currentLang = localStorage.getItem('preferredLanguage') || 'en';
      try {
        // ... (기존 orderForm submit 이벤트 처리 로직)
        const formData = new FormData(this);
        formData.append('lang', currentLang);

        const response = await fetch('process_order.php', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        console.log('Order submission response:', result);

        if (!result.success) {
          throw new Error(result.message || '주문 처리에 실패했습니다.');
        }

        // 성공 시 팝업 표시
        showOrderCompletePopup();

      } catch (error) {
        console.error('Order submission error:', error);
        showError(error.message || getErrorMessage(currentLang, 'order_submission_error', 'payment')); // 에러 메시지 사용
      }
    });
  }
});
// // Order Form 제출 처리 수정
// orderForm.addEventListener('submit', async function (e) {
//   e.preventDefault();
//   console.log('Order form submission started');

//   try {
//     const formData = new FormData(this);
//     formData.append('lang', currentLang);

//     const response = await fetch('process_order.php', {
//       method: 'POST',
//       body: formData
//     });

//     const result = await response.json();
//     console.log('Order submission response:', result);

//     if (!result.success) {
//       throw new Error(result.message || '주문 처리에 실패했습니다.');
//     }

//     // 성공 시 팝업 표시
//     showOrderCompletePopup();

//   } catch (error) {
//     console.error('Order submission error:', error);
//     showError(error.message);
//   }
// });