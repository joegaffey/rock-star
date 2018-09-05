export default class Controllers {
  
  constructor(element) {
    this.controllerEl = element;
    let controllers = localStorage.getItem('controllers');
    this.detectControllers();
    if(controllers)
      this.selectedControllers = JSON.parse(controllers);
    else {
      this.refresh();
    }
  }
  
  refresh() {
    this.selectedControllers = [];
    this.availableControllers = [];
  }
  
  configure(playerId, controllerIndex) {
    let buttons = ['Green', 'Red', 'Yellow', 'Blue', 'Orange', 'Strum Up', 'Strum Down', 'Start', 'Select'];
    this.controllerEl.innerHTML = `
    <p>Assign Player ${playerId + 1} buttons using Controller ${controllerIndex + 1}</p>    
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
      localStorage.setItem('controllers', JSON.stringify(this.selectedControllers));
      this.onOk(); 
    };
    
    this.buttonEls = this.controllerEl.querySelectorAll('.joyButton');
    
    let selectedController = this.availableControllers[controllerIndex];
    selectedController.playerId = playerId;
    selectedController.assignedButtons = [];
    this.selectedControllers.push(selectedController);
    this.startChecking(selectedController, 0);
  }
  
  onCancel() {
    console.error('Must provide an implmentation of onCancel');
  }
  
  onOk() {
    console.error('Must provide an implmentation of onOk');
  }
  
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
  
  checkForButtonPress(controller) {
    let pad = navigator.getGamepads()[controller.index];    
    for(let i in pad.buttons) {
      if(pad.buttons[i].pressed) {
        return i;
      }
    } 
    return -1;
  }
  
  checkAssignedControllers(id) {
    let controller = this.selectedControllers[id];
    if(!controller)
      return [];
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