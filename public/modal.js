export default class Modal {
  
  constructor(element) {
    this.element = element;
    this.onScreen = false;
    const closeEl = document.createElement('span');
    closeEl.classList.add('closeModal');
    this.element.querySelector('.modalTitle').appendChild(closeEl);
    closeEl.onclick = () => {
      this.toggle();
    }
  }
  
  toggle() {
    if(this.onScreen) {
      this.onClose();
      this.element.style.display = 'none';
      this.onScreen = false;
    }
    else {
      this.onOpen();
      this.element.style.display = 'flex';
      this.onScreen = true;
    }
  }
  
  onOpen() {}   
  onClose() {}    
}