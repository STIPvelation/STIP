// 이벤트 리스너 분리
// product_preview_form.js
import { getErrorMessage, showError } from './error_messages.js'; // import 추가

document.addEventListener('DOMContentLoaded', () => {
  const productPreviewForm = document.getElementById('productPreviewForm');
  if (productPreviewForm) {
    productPreviewForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const currentLang = localStorage.getItem('preferredLanguage') || 'en';
      productPreviewForm.style.display = 'none';

      try {
        // ... (기존 productPreviewForm submit 이벤트 처리 로직)
        // Product Preview 데이터 수집
        const previewData = {
          productCode: document.getElementById('previewProductCode').value,
          productName: document.getElementById('previewProductName').value,
          quantity: document.getElementById('previewQuantity').value,
          price: document.getElementById('previewPrice').value
        };

        // Product Preview 데이터 저장
        const saveResponse = await fetch('productPreviewForm_save.php', {
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

        // orderForm의 텍스트 업데이트
        updateFormLanguage(orderForm, currentLang);

        // Order Form에 데이터 설정
        document.getElementById('hidden_productCode').value = previewData.productCode;
        document.getElementById('hidden_productName').value = previewData.productName;
        document.getElementById('hidden_price').value = previewData.price;

      } catch (error) {
        console.error('Product preview error:', error);
        showError(getErrorMessage(currentLang, 'product_preview_error')); // 에러 메시지 사용
      }
    });
  }
});

// productPreviewForm.addEventListener('submit', async function (e) {
//   /* ... (기존 productPreviewForm submit 이벤트 처리 로직) */
//   // 현재 언어 설정 가져오기
//   const currentLang = localStorage.getItem('preferredLanguage') || 'en';

//   productPreviewForm.style.display = 'none';

//   // orderForm 표시 및 언어 적용
//   // const orderForm = document.getElementById('orderForm');
//   // orderForm.style.display = 'block';

//   // orderForm의 텍스트 업데이트
//   // updateFormLanguage(orderForm, currentLang);

//   try {
//     // Product Preview 데이터 수집
//     const previewData = {
//       productCode: document.getElementById('previewProductCode').value,
//       productName: document.getElementById('previewProductName').value,
//       quantity: document.getElementById('previewQuantity').value,
//       price: document.getElementById('previewPrice').value
//     };

//     // Product Preview 데이터 저장
//     const saveResponse = await fetch('productPreviewForm_save.php', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(previewData)
//     });

//     if (!saveResponse.ok) {
//       throw new Error('Failed to save product preview');
//     }

//     // Order Form으로 데이터 전달 및 화면 전환
//     productPreviewForm.style.display = 'none';
//     const orderForm = document.getElementById('orderForm');
//     orderForm.style.display = 'block';

//     // orderForm의 텍스트 업데이트
//     updateFormLanguage(orderForm, currentLang);

//     // Order Form에 데이터 설정
//     document.getElementById('hidden_productCode').value = previewData.productCode;
//     document.getElementById('hidden_productName').value = previewData.productName;
//     document.getElementById('hidden_price').value = previewData.price;

//   } catch (error) {
//     console.error('Product preview error:', error);
//     alert('처리 중 오류가 발생했습니다.');
//   }

// });