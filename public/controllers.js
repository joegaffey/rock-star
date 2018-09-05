export default class Controllers {
  
  constructor(element) {
    this.controllerEl = element;
    this.availableControllers = [];
    this.detectControllers();
  }
  
  configure(player, controller) {
    let buttons = ['Green', 'Red', 'Yellow', 'Blue', 'Orange', 'Strum Up', 'Strum Down', 'Start', 'Select'];
    this.controllerEl.innerHTML = `
    <p>Assign controller ${controller.index + 1} buttons.</p>    
    ${buttons.map(button => `<p>${button} <span class="joyButton">TBD</span></p>`).join('')}
    <button class="dialogButton" id="buttonAssignCancel">Cancel</button>
    <button class="dialogButton" id="buttonAssignOk">Ok</button>`;
    this.controllerEl.querySelector('#buttonAssignCancel').onclick = (e) => { 
      this.onCancel(); 
    };
    this.buttonAssignOk = this.controllerEl.querySelector('#buttonAssignOk');
    this.buttonAssignOk.style.display = 'none';
    this.buttonAssignOk.style.float = 'right';
    this.buttonAssignOk.onclick = (e) => { 
      this.onOk(); 
    };
    
    this.buttonEls = this.controllerEl.querySelectorAll('.joyButton');
    
    controller.player = player;
    controller.assignedButtons = [];
    player.controller = controller;
    
    this.startChecking(controller, 0);
  }
  
  onCancel() {}
  
  onOk() {}
  
  startChecking(controller, button) {
    if(button >= this.buttonEls.length) {
      this.buttonAssignOk.style.display = 'block';
      return;
    }
    this.buttonEls[button].innerHTML = 'Waiting...';
    let joyButton = this.checkForButtonPress(controller)
    if(joyButton > -1) {
      controller.assignedButtons.push(joyButton);
      this.buttonEls[button].innerHTML = 'JOY ' + joyButton;
      setTimeout(() => {
        this.startChecking(controller, button + 1);
      }, 500);      
    }
    else {
      setTimeout(() => {
        this.startChecking(controller, button);
      }, 500);      
    }
  }
  
  checkForButtonPress(controller) {
    let pad = navigator.getGamepads()[controller.index];    
    for(let i in pad.buttons) {
      if(pad.buttons[i].pressed) {
        return i;
      }
    } 
    return -1;
  }
  
  detectControllers() {
    let pads = navigator.getGamepads();
    this.availableControllers = [];
    for(let i in pads) {
      let pad = pads[i];
      if(pad && pad.connected) {
        this.availableControllers.push(pad);
      }
    }
  }
  
  checkController(controller) {
    var buttons = controller.assignedButtons;  
    let pad = navigator.getGamepads()[controller.index];    
    if(!pad) {
      return [];
    }
    var result = [];
    for(let i in buttons) {
      result.push(pad.buttons[buttons[i]].pressed);
    } 
    return result;
  }
}