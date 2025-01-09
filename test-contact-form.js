// test-contact-form.js
class ContactFormTest {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.fileInput = document.getElementById('file');
    this.fileList = document.getElementById('fileList');
    this.dropZone = document.getElementById('dropZone');
    this.errorMessage = document.getElementById('errorMessage');
    this.testOutput = document.getElementById('testOutput');
    this.testResults = [];
    this.uploadedFiles = new Map();

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

    // Setup drag and drop
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
  }

  async handleSubmit(e) {
    e.preventDefault();
    console.log('Contact form submission started');
    this.testResults = [];

    try {
      // Test 1: Required Fields
      this.runTest('Required Fields Test', () => {
        const requiredFields = ['name', 'email', 'mobile'];
        requiredFields.forEach(fieldId => {
          const field = document.getElementById(fieldId);
          if (!field.value.trim()) {
            throw new Error(`${fieldId} is required`);
          }
        });
        return true;
      });

      // Test 2: Email Format
      this.runTest('Email Format Test', () => {
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Invalid email format');
        }
        return true;
      });

      // Test 3: File Upload
      if (this.uploadedFiles.size > 0) {
        await this.testFileUpload();
      }

      // If all tests pass, proceed with form submission
      if (this.testResults.every(result => result.passed)) {
        await this.submitForm();
      }

    } catch (error) {
      console.error('Contact form error:', error);
      this.log(`Error: ${error.message}`, 'error');
    }

    this.displayResults();
  }

  async testFileUpload() {
    this.runTest('File Upload Test', () => {
      const totalSize = Array.from(this.uploadedFiles.values())
        .reduce((sum, file) => sum + file.size, 0);

      if (totalSize > 5 * 1024 * 1024) {
        throw new Error('Total file size exceeds 5MB limit');
      }

      const allowedTypes = ['.pdf', '.doc', '.docx'];
      for (const file of this.uploadedFiles.values()) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(ext)) {
          throw new Error(`Invalid file type: ${ext}`);
        }
      }

      return true;
    });
  }

  async submitForm() {
    try {
      // 1. Upload files
      if (this.uploadedFiles.size > 0) {
        const fileData = new FormData();
        this.uploadedFiles.forEach(file => {
          fileData.append('files[]', file);
        });

        const uploadResponse = await fetch('upload_file.php', {
          method: 'POST',
          body: fileData
        });

        const uploadResult = await uploadResponse.json();
        if (!uploadResult.success) {
          throw new Error(uploadResult.message);
        }

        // Add file info to form data
        const fileInfoInput = document.createElement('input');
        fileInfoInput.type = 'hidden';
        fileInfoInput.name = 'fileInfo';
        fileInfoInput.value = JSON.stringify(uploadResult.files);
        this.form.appendChild(fileInfoInput);
      }

      // 2. Submit form data
      const formData = new FormData(this.form);
      const response = await fetch('contactForm_save.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }

      this.log('Form submitted successfully', 'success');
      setTimeout(() => {
        window.location.href = 'listing.html';
      }, 1000);

    } catch (error) {
      throw new Error(`Form submission failed: ${error.message}`);
    }
  }

  handleFiles(files) {
    Array.from(files).forEach(file => {
      const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      this.uploadedFiles.set(fileId, file);
      this.addFileToList(file, fileId);
    });
  }

  addFileToList(file, fileId) {
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

    fileItem.querySelector('.remove-file').addEventListener('click', () => {
      this.uploadedFiles.delete(fileId);
      fileItem.remove();
    });

    this.fileList.appendChild(fileItem);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
}

// Initialize test when document is ready
document.addEventListener('DOMContentLoaded', () => {
  new ContactFormTest();
});