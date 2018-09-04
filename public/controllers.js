export default class Controllers {
  
  constructor(element) {
    this.controllerEl = element;
    let controllers = localStorage.getItem('controllers');
    if(controllers)
      this.selectedControllers = JSON.parse(controllers);
    else {
      this.refresh();
    }
  }
  
  refresh() {
    this.selectedControllers = [];
    this.availableControllers = [];
    this.detectControllers();
    this.showAvailableControllers();
  }
  
  showAvailableControllers() {
    if(this.availableControllers.length > 0) {
      this.controllerEl.innerHTML = `
        <p>Available controllers:</p>
        <ul class="controllerList">
          ${this.availableControllers.map(ctrl => `<li class="ctrlId" id="${ctrl.index}">
            <p>${ctrl.index + 1} ${ctrl.id}</p>
            <p>
              <select class="playerSelect">
                <option value="0">Select player:</option>
                <option value="1">Player 1</option>
                <option value="2">Player 2</option>
              </select>
              <select class="instrumentSelect">
                <option value="0">Instrument:</option>
                <option value="1">Guitar</option>
                <option value="2">Drums</option>
              </select>
              <button class="ctrlAssign">Assign</button>
            </p>
          </li>`).join('')}
        </ul>
        `;
    }
    else {
      this.controllerEl.innerHTML = `
        <p>Available controllers:</p>
        <ul class="controllerList">
          <li class="ctrlId">No controllers found</li>
        </ul>`;
    }
    let buttons = this.controllerEl.querySelectorAll('.ctrlAssign');
    buttons.forEach((button, i) => {
      button.onclick = (e) => { this.configure(i); };
    });
  }

  configure(controllerIndex) {
    let itemEls = this.controllerEl.querySelectorAll('.ctrlId');
    let playerId = itemEls[controllerIndex].querySelector('.playerSelect').value;
    let instrument = itemEls[controllerIndex].querySelector('.instrumentSelect').value;
    
    if(playerId < 1) {
      alert('Select a player');
      return;
    }
    
    if(instrument < 1) {
      alert('Select an instrument');
      return;
    }
    
    let buttons = ['Green', 'Red', 'Yellow', 'Blue', 'Orange', 'Strum Up', 'Strum Down', 'Start', 'Select'];
    this.controllerEl.innerHTML = `
    <p>Assign Player ${playerId} ${['Guitar', 'Drums'][instrument - 1]} buttons using Controller ${controllerIndex + 1}</p>    
    ${buttons.map(button => `<p>${button} <span class="joyButton">TBD</span></p>`).join('')}
    <button class="dialogButton" id="buttonAssignCancel">Cancel</button>
    <button class="dialogButton" id="buttonAssignOk">Ok</button>`;
    this.controllerEl.querySelector('#buttonAssignCancel').onclick = (e) => { 
      this.showAvailableControllers(); 
    };
    this.buttonAssignOk = this.controllerEl.querySelector('#buttonAssignOk');
    this.buttonAssignOk.style.display = 'none';
    this.buttonAssignOk.style.float = 'right';
    this.buttonAssignOk.onclick = (e) => { 
      localStorage.setItem('controllers', JSON.stringify(this.selectedControllers));
      this.showAvailableControllers(); 
    };
    this.buttonEls = this.controllerEl.querySelectorAll('.joyButton');
    
    let selectedController = this.availableControllers[controllerIndex];
    selectedController.playerId = playerId;
    selectedController.assignedButtons = [];
    this.selectedControllers.push(selectedController);
    this.startChecking(selectedController, 0);
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