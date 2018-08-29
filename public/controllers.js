export default class Controllers {
  
  constructor(element) {
    this.controllerEl = element;
    this.ctrls = [];
    this.refresh();
  }
  
  refresh() {
    this.detect();
    this.updateUI();
  }
  
  updateUI() {
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

  configure(i) {
    let itemEls = this.controllerEl.querySelectorAll('.ctrlId');
    let player = itemEls[i].querySelector('.playerSelect').value;
    let instrument = itemEls[i].querySelector('.instrumentSelect').value;
    
    if(player < 1) {
      alert('Select a player');
      return;
    }
    
    if(instrument < 1) {
      alert('Select an instrument');
      return;
    }
    instrument--;
    i++;
    
    this.controllerEl.innerHTML = `
    <p>Assign Player ${player} ${['Guitar', 'Drums'][instrument]} buttons using Controller ${i}</p>
    <p class="waiting">Green  <span class="joyButton">(Waiting...)</span></p>
    <p class="notReady">Red <span class="joyButton">TBD</span></p>
    <p class="notReady">Yellow <span class="joyButton">TBD</span></p>
    <p class="notReady">Blue <span class="joyButton">TBD</span></p>
    <p class="notReady">Orange <span class="joyButton">TBD</span></p>
    <p class="notReady">Strum Up <span class="joyButton">TBD</span></p>
    <p class="notReady">Strum Down <span class="joyButton">TBD</span></p>
    <button id="buttonAssignCancel">Cancel</button>`;    
    let button = this.controllerEl.querySelector('#buttonAssignCancel');
    button.onclick = (e) => { this.updateUI(); };
  }

   
  detect() {
    let pads = navigator.getGamepads();
    this.ctrls = [];
    for(let i in pads){
      let pad = pads[i];
      if(pad && pad.connected) {
        this.ctrls.push(pad);
      }
    }
  }

  check() {
    var pads = navigator.getGamepads();  
    
    for (let pad in pads) {
      try {   
        if(pad.buttons[0].value === 1) {

        }
        if(pad.buttons[1].value === 1) {

        }      
        if(pad.buttons[2].value === 1) {  

        }
      }
      catch(e) { console.log(e); }
    }
  }
}