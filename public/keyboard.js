export default class Keyboard {
  
  constructor() {
    this.setupKeys();
  }
  
  setupKeys() {  
    window.addEventListener('keydown', (e) => {
      if(e.keyCode === 81) {
        this.onKeyDown(0, true);
      }
      else if(e.keyCode === 87) {
        this.onKeyDown(1, true);
      }
      else if(e.keyCode === 69) {
        this.onKeyDown(2, true);
      }
      else if(e.keyCode === 82) {
        this.onKeyDown(3, true);
      }
      else if(e.keyCode === 84) {
        this.onKeyDown(4, true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if(e.keyCode === 81) {
        this.onKeyUp(0, false);
      }
      else if(e.keyCode === 87) {
        this.onKeyUp(1, false);
      }
      else if(e.keyCode === 69) {
        this.onKeyUp(2, false);
      }
      else if(e.keyCode === 82) {
        this.onKeyUp(3, false);
      }
      else if(e.keyCode === 84) {
        this.onKeyUp(4, false);
      }
    });
  }
  
  onKeyDown(input, state) {}
  onKeyUp(input, state) {}
}