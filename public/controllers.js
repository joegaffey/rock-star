export default class Controllers {
  
  constructor(element) {
    this.controllerListEl = element;
    this.ctrls = [];
    this.refresh();
  }
  
  refresh() {
    this.detect();
    this.updateUI();
  }
  
  updateUI() {
    if(this.ctrls.length > 0) {
      this.controllerListEl.innerHTML = `
        <ul class="controllerList">
          ${this.ctrls.map(ctrl => `<li class="ctrlId" id="${ctrl.index}">
            <div>${ctrl.index} ${ctrl.id}</div>
            <div>
              <select>
                <option value="0">Select player:</option>
                <option value="1">Player 1</option>
                <option value="1">Player 2</option>
              </select>
              <select>
                <option value="0">Instrument:</option>
                <option value="1">Guitar</option>
                <option value="1">Drums</option>
              </select>
              <button class="ctrlAssign">Assign</button>
            </div>
          </li>`).join('')}
        </ul>
        `;
    }
    else {
      this.controllerListEl.innerHTML = `
      <ul class="controllerList"><li class="ctrlId">None</ul>`;
    }
    let buttons = this.controllerListEl.querySelectorAll('.ctrlAssign');
    buttons.forEach((button, i) => {
      button.onclick = (e) => {
        this.configure(i);
      };
    });
  }

  configure(id) {
    alert('Coming soon...');
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