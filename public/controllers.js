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
    
    player.controllerId = controller.index;
    player.assignedInputs = [];
    
    this.detectInput(player, 0);
  }
  
  onCancel() {}
  
  onOk() {}
  
  detectInput(player, button) {
    
    let controller = navigator.getGamepads()[player.controllerId];
    if(button >= this.buttonEls.length) {
      this.buttonAssignOk.style.display = 'block';
      return;
    }
    this.buttonEls[button].innerHTML = 'Waiting...';
    let joyInput = this.detectButton(controller);
    if(joyInput > -1) {
      if(!this.locked) {
        player.assignedInputs.push({ button: button, isButton: true, controllerInputId: joyInput});
        this.buttonEls[button].innerHTML = 'JOY ' + joyInput;
        this.locked = true;
        button++;
      }
    }
    else {
      let axis = this.detectAxis(controller);
      joyInput = axis.index;
      if(joyInput > -1) {
        if(!this.locked) {
          player.assignedInputs.push({ button: button, isAxis: true, value: axis.value, controllerInputId: joyInput});
          this.buttonEls[button].innerHTML = 'AXIS ' + joyInput;
          this.locked = true;
          button++;
        }
      }
    }
    
    if(this.locked && joyInput === -1) 
      this.locked = false;
    
    setTimeout(() => {
      this.detectInput(player, button);
    }, 100);
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
      let value = Math.round(pad.axes[i]);
      // Test axes against initial values rounded 
      if(value !== Math.round(controller.initialAxes[i])) { 
        return {index:i, value: value};
      }
    } 
    return {index: -1, value: 0};
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
  
  getInputStates(player) {
    var result = [];
    let pad = navigator.getGamepads()[player.controllerId];   
    if(!pad) 
      return [];
    player.assignedInputs.forEach((input, i) => {
      if(input.isButton) 
        result.push(pad.buttons[input.controllerInputId].pressed);
      else if(input.isAxis) {
        result.push((Math.round(pad.axes[input.controllerInputId]) === input.value)? true : false);
      }
    });
    // console.log(result)        
    return result;
  }
}