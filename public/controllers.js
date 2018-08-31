export default class Controllers {
  
  constructor(element) {
    this.controllerEl = element;
    this.ctrls = [];
    this.refresh();
  }
  
  refresh() {
    this.detect();
    this.showControllers();
  }
  
  showControllers() {
    if(this.ctrls.length > 0) {
      this.controllerEl.innerHTML = `
        <p>Available controllers:</p>
        <ul class="controllerList">
          ${this.ctrls.map(ctrl => `<li class="ctrlId" id="${ctrl.index}">
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

  configure(controller) {
    let itemEls = this.controllerEl.querySelectorAll('.ctrlId');
    let player = itemEls[controller].querySelector('.playerSelect').value;
    let instrument = itemEls[controller].querySelector('.instrumentSelect').value;
    
    if(player < 1) {
      alert('Select a player');
      return;
    }
    
    if(instrument < 1) {
      alert('Select an instrument');
      return;
    }
    instrument--;
    
    let buttons = ['Green', 'Red', 'Yellow', 'Blue', 'Orange', 'Strum Up', 'Strum Down', 'Start', 'Select'];
    this.controllerEl.innerHTML = `
    <p>Assign Player ${player} ${['Guitar', 'Drums'][instrument]} buttons using Controller ${controller + 1}</p>    
    ${buttons.map(button => `<p>${button} <span class="joyButton">TBD</span></p>`).join('')}
    <button class="dialogButton" id="buttonAssignCancel">Cancel</button>
    <button class="dialogButton" id="buttonAssignOk">Ok</button>`;
    this.controllerEl.querySelector('#buttonAssignCancel').onclick = (e) => { 
      this.showControllers(); 
    };
    this.buttonAssignOk = this.controllerEl.querySelector('#buttonAssignOk');
    this.buttonAssignOk.style.display = 'none';
    this.buttonAssignOk.style.float = 'right';
    this.buttonAssignOk.onclick = (e) => { 
      this.showControllers(); 
    };
    this.buttonEls = this.controllerEl.querySelectorAll('.joyButton');
    
    this.ctrls[controller].player = player;
    this.ctrls[controller].joyButtons = [];
    this.startChecking(controller, 0);
  }
  
  startChecking(controller, button) {
    if(button >= this.buttonEls.length) {
      this.buttonAssignOk.style.display = 'block';
      return;
    }
    this.buttonEls[button].innerHTML = 'Waiting...';
    let joyButton = this.check(controller)
    if(joyButton > -1) {
      this.ctrls[controller].joyButtons.push(joyButton);
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
  
  detect() {
    let pads = navigator.getGamepads();
    this.ctrls = [];
    for(let i in pads) {
      let pad = pads[i];
      if(pad && pad.connected) {
        this.ctrls.push(pad);
      }
    }
  }
  
  check(id) {
    var buttons = navigator.getGamepads()[id].buttons;  
    for(let i in buttons) {
      if(buttons[i].pressed) {
        return i;
      }
    } 
    return -1;
  }
  
  checkAssigned(id) {
    var buttons = this.ctrls[id].joyButtons;  
    var res = [];
    for(let i in buttons) {
      res.push(navigator.getGamepads()[id].buttons[buttons[i]].pressed);
    } 
    return res;
  }
}