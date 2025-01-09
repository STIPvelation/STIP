// 에러 메시지 처리 분리 (error_messages.js)
// error_messages.js
export const countryErrorMessages = {
  // ... (이전 답변과 동일)
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
export const paymentErrorMessages = {
  // ... (이전 답변과 동일)
  ko: {
    name_mismatch: '카드 소유자 이름이 입력하신 이름과 일치하지 않습니다.',
    invalid_card: '올바른 카드 번호를 입력해주세요.',
    invalid_expiry: '올바른 만료일을 입력해주세요.',
    invalid_cvv: '올바른 CVV를 입력해주세요.',
    payment_failed: '결제 처리에 실패했습니다.',
    payment_success: '결제가 완료되었습니다.',
    processing_error: '결제 처리 중 오류가 발생했습니다.'
  },
  en: {
    name_mismatch: 'Cardholder name does not match the name you entered.',
    invalid_card: 'Please enter a valid card number.',
    invalid_expiry: 'Please enter a valid expiry date.',
    invalid_cvv: 'Please enter a valid CVV.',
    payment_failed: 'Payment processing failed.',
    payment_success: 'Payment completed successfully.',
    processing_error: 'An error occurred during payment processing.'
  },
  ja: {
    name_mismatch: 'カード名義人が入力された名前と一致しません。',
    invalid_card: '有効なカード番号を入力してください。',
    invalid_expiry: '有効な有効期限を入力してください。',
    invalid_cvv: '有効なCVVを入力してください。',
    payment_failed: '決済処理に失敗しました。',
    payment_success: '決済が完了しました。',
    processing_error: '決済処理中にエラーが発生しました。'
  },
  zh: {
    name_mismatch: '持卡人姓名与您输入的姓名不符。',
    invalid_card: '请输入有效的卡号。',
    invalid_expiry: '请输入有效的有效期。',
    invalid_cvv: '请输入有效的CVV。',
    payment_failed: '支付处理失败。',
    payment_success: '支付已完成。',
    processing_error: '支付处理过程中发生错误。'
  }
};
export const fileUploadMessages = {
  // ... (이전 답변과 동일)
  ko: {
    allowedTypes: '허용된 파일 형식: PDF, DOC, DOCX. 최대 파일 크기: 5MB',
    invalidType: '허용된 파일 형식이 아닙니다. PDF, DOC, DOCX 파일만 업로드 가능합니다.',
    sizeExceeded: '파일 크기가 5MB를 초과합니다.',
    dragAndDrop: '파일을 드래그하여 놓거나 클릭하여 선택하세요',
    delete: '삭제'
  },
  en: {
    allowedTypes: 'Allowed file types: PDF, DOC, DOCX. Maximum file size: 5MB',
    invalidType: 'Invalid file type. Only PDF, DOC, DOCX files are allowed.',
    sizeExceeded: 'File size exceeds 5MB limit.',
    dragAndDrop: 'Drag and drop files here or click to select',
    delete: 'Delete'
  },
  ja: {
    allowedTypes: '許可されているファイル形式：PDF、DOC、DOCX。最大ファイルサイズ：5MB',
    invalidType: '無効なファイル形式です。PDF、DOC、DOCXファイルのみアップロード可能です。',
    sizeExceeded: 'ファイルサイズが5MBを超えています。',
    dragAndDrop: 'ファイルをドラッグ＆ドロップまたはクリックして選択',
    delete: '削除'
  },
  zh: {
    allowedTypes: '允许的文件类型：PDF、DOC、DOCX。最大文件大小：5MB',
    invalidType: '文件类型无效。仅允许PDF、DOC、DOCX文件。',
    sizeExceeded: '文件大小超过5MB限制。',
    dragAndDrop: '拖放文件到这里或点击选择',
    delete: '删除'
  }
};

export function getErrorMessage(lang, key, messageType = 'country') {
  // ... (이전 답변과 동일)
  const messageGroups = {
    'country': countryErrorMessages,
    'payment': paymentErrorMessages,
    'fileUpload': fileUploadMessages
  };
  const messages = messageGroups[messageType];
  return messages[lang]?.[key] || messages['ko']?.[key] || '알 수 없는 오류'; // 기본 오류 메시지 추가
}

export function showError(message) {
  // ... (이전 답변과 동일)
  alert(message); // 간단하게 alert으로 표시. 필요에 따라 변경 가능
}

// const countryErrorMessages = {
//   /* ... (기존 코드와 동일) */
//   ko: {
//     fetch_countries_failed: '국가 목록을 불러오는데 실패했습니다.'
//   },
//   en: {
//     fetch_countries_failed: 'Failed to load country list.'
//   },
//   ja: {
//     fetch_countries_failed: '国リストの読み込みに失敗しました。'
//   },
//   zh: {
//     fetch_countries_failed: '加载国家列表失败。'
//   }
// };
// const paymentErrorMessages = {
//   /* ... (기존 코드와 동일) */
//   ko: {
//     name_mismatch: '카드 소유자 이름이 입력하신 이름과 일치하지 않습니다.',
//     invalid_card: '올바른 카드 번호를 입력해주세요.',
//     invalid_expiry: '올바른 만료일을 입력해주세요.',
//     invalid_cvv: '올바른 CVV를 입력해주세요.',
//     payment_failed: '결제 처리에 실패했습니다.',
//     payment_success: '결제가 완료되었습니다.',
//     processing_error: '결제 처리 중 오류가 발생했습니다.'
//   },
//   en: {
//     name_mismatch: 'Cardholder name does not match the name you entered.',
//     invalid_card: 'Please enter a valid card number.',
//     invalid_expiry: 'Please enter a valid expiry date.',
//     invalid_cvv: 'Please enter a valid CVV.',
//     payment_failed: 'Payment processing failed.',
//     payment_success: 'Payment completed successfully.',
//     processing_error: 'An error occurred during payment processing.'
//   },
//   ja: {
//     name_mismatch: 'カード名義人が入力された名前と一致しません。',
//     invalid_card: '有効なカード番号を入力してください。',
//     invalid_expiry: '有効な有効期限を入力してください。',
//     invalid_cvv: '有効なCVVを入力してください。',
//     payment_failed: '決済処理に失敗しました。',
//     payment_success: '決済が完了しました。',
//     processing_error: '決済処理中にエラーが発生しました。'
//   },
//   zh: {
//     name_mismatch: '持卡人姓名与您输入的姓名不符。',
//     invalid_card: '请输入有效的卡号。',
//     invalid_expiry: '请输入有效的有效期。',
//     invalid_cvv: '请输入有效的CVV。',
//     payment_failed: '支付处理失败。',
//     payment_success: '支付已完成。',
//     processing_error: '支付处理过程中发生错误。'
//   }

// };
// const fileUploadMessages = {
//   /* ... (기존 코드와 동일) */
//   ko: {
//     allowedTypes: '허용된 파일 형식: PDF, DOC, DOCX. 최대 파일 크기: 5MB',
//     invalidType: '허용된 파일 형식이 아닙니다. PDF, DOC, DOCX 파일만 업로드 가능합니다.',
//     sizeExceeded: '파일 크기가 5MB를 초과합니다.',
//     dragAndDrop: '파일을 드래그하여 놓거나 클릭하여 선택하세요',
//     delete: '삭제'
//   },
//   en: {
//     allowedTypes: 'Allowed file types: PDF, DOC, DOCX. Maximum file size: 5MB',
//     invalidType: 'Invalid file type. Only PDF, DOC, DOCX files are allowed.',
//     sizeExceeded: 'File size exceeds 5MB limit.',
//     dragAndDrop: 'Drag and drop files here or click to select',
//     delete: 'Delete'
//   },
//   ja: {
//     allowedTypes: '許可されているファイル形式：PDF、DOC、DOCX。最大ファイルサイズ：5MB',
//     invalidType: '無効なファイル形式です。PDF、DOC、DOCXファイルのみアップロード可能です。',
//     sizeExceeded: 'ファイルサイズが5MBを超えています。',
//     dragAndDrop: 'ファイルをドラッグ＆ドロップまたはクリックして選択',
//     delete: '削除'
//   },
//   zh: {
//     allowedTypes: '允许的文件类型：PDF、DOC、DOCX。最大文件大小：5MB',
//     invalidType: '文件类型无效。仅允许PDF、DOC、DOCX文件。',
//     sizeExceeded: '文件大小超过5MB限制。',
//     dragAndDrop: '拖放文件到这里或点击选择',
//     delete: '删除'
//   }
// };

// function getErrorMessage(lang, key, messageType = 'country') { // messageType 추가
//   const messageGroups = {
//     'country': countryErrorMessages,
//     'payment': paymentErrorMessages,
//     'fileUpload': fileUploadMessages
//   };
//   const messages = messageGroups[messageType];
//   return messages[lang]?.[key] || messages['ko']?.[key] || '알 수 없는 오류'; // 기본 오류 메시지 추가
// }

// function showError(message) {
//   alert(message); // 간단하게 alert으로 표시. 필요에 따라 변경 가능
// }