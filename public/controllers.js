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
    controller.assignedInputs = [];
    player.controller = controller;
    
    this.detectInput(controller, 0);
  }
  
  onCancel() {}
  
  onOk() {}
  
  detectInput(controller, button) {
    if(button >= this.buttonEls.length) {
      this.buttonAssignOk.style.display = 'block';
      return;
    }
    this.buttonEls[button].innerHTML = 'Waiting...';
    let joyInput = this.detectButton(controller)
    if(joyInput > -1) {
      controller.assignedInputs.push({ button: button, isButton: true, controllerInputId: joyInput});
      this.buttonEls[button].innerHTML = 'JOY ' + joyInput;
    }
    else {
      joyInput = this.detectAxis(controller);
      if(joyInput > -1) {
        controller.assignedInputs.push({ button: button, isAxis: true, controllerInputId: joyInput});
        this.buttonEls[button].innerHTML = 'AXIS ' + joyInput;
      }
    }    
    if(joyInput > -1) {
      setTimeout(() => {
        this.detectInput(controller, button + 1);
      }, 500);      
    }
    else {
      setTimeout(() => {
        this.detectInput(controller, button);
      }, 500);      
    }
  }
  
  detectButton(controller) {
    let pad = navigator.getGamepads()[controller.index];    
    for(let i in pad.buttons) {
      if(pad.buttons[i].pressed) {
        return i;
      }
    } 
    return -1;
  }
  
  detectAxis(controller) {
    let pad = navigator.getGamepads()[controller.index];    
    if(!controller.initialAxes)
      controller.initialAxes = pad.axes;
    for(let i in pad.axes) {
      if(pad.axes[i] != controller.initialAxes[i]) {
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
  
  getInputStates(controller) {
    var result = [];
    let pad = navigator.getGamepads()[controller.index];   
    if(!pad) 
      return [];
    controller.assignedInputs.forEach((input, i) => {
      if(input.isButton) 
        result.push(pad.buttons[input.controllerInputId].pressed);
      else if(input.isAxis)
        result.push((Math.abs(pad.axes[input.controllerInputId]) === 1)? true : false);
    });
    return result;
  }
}