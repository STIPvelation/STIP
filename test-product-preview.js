// test-product-preview.js
class ProductPreviewTest {
  constructor() {
    this.form = document.getElementById('productPreviewForm');
    this.testOutput = document.getElementById('testOutput');
    this.testResults = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.testResults = [];

    // Test 1: Check if all required fields exist
    this.runTest('Required Fields Test', () => {
      const requiredFields = ['previewProductCode', 'previewProductName', 'previewQuantity', 'previewPrice'];
      requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) throw new Error(`Missing field: ${fieldId}`);
        if (!field.value) throw new Error(`Empty value for: ${fieldId}`);
      });
      return true;
    });

    // Test 2: Validate product code format
    this.runTest('Product Code Format Test', () => {
      const productCode = document.getElementById('previewProductCode').value;
      if (!/^\d{4}$/.test(productCode)) {
        throw new Error('Invalid product code format');
      }
      return true;
    });

    // Test 3: Validate price format
    this.runTest('Price Format Test', () => {
      const price = document.getElementById('previewPrice').value;
      if (!/^₩[\d,]+$/.test(price)) {
        throw new Error('Invalid price format');
      }
      return true;
    });

    // Test 4: Validate quantity
    this.runTest('Quantity Test', () => {
      const quantity = parseInt(document.getElementById('previewQuantity').value);
      if (isNaN(quantity) || quantity < 1) {
        throw new Error('Invalid quantity');
      }
      return true;
    });

    // Display test results
    this.displayResults();

    // If all tests pass, proceed with form submission
    if (this.testResults.every(result => result.passed)) {
      try {
        // Simulate API call
        const response = await this.simulateApiCall();
        if (response.success) {
          this.log('Form submission successful', 'success');
          window.location.href = 'test-order-form.html';
        }
      } catch (error) {
        this.log(`API Error: ${error.message}`, 'error');
      }
    }
  }

  runTest(testName, testFn) {
    try {
      const result = testFn();
      this.testResults.push({
        name: testName,
        passed: true,
        message: 'Test passed'
      });
    } catch (error) {
      this.testResults.push({
        name: testName,
        passed: false,
        message: error.message
      });
    }
  }

  displayResults() {
    const output = this.testResults.map(result =>
      `${result.name}: ${result.passed ? '✅' : '❌'} ${result.message}`
    ).join('\n');

    this.testOutput.textContent = output;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    this.testOutput.textContent += `\n[${timestamp}] ${type.toUpperCase()}: ${message}`;
  }

  async simulateApiCall() {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate successful response
    return {
      success: true,
      message: 'Product preview data processed successfully'
    };
  }
}

// Initialize test
const productPreviewTest = new ProductPreviewTest();