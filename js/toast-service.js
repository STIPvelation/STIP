// toast-service.js
class ToastService {
  constructor() {
    this.createToastContainer();
  }

  createToastContainer() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          this.container.removeChild(toast);
        }, 300);
      }, 3000);
    }, 100);
  }
}

window.toastService = new ToastService();