import Player from './player.js';

export default class Settings {
  
  constructor(element, controllers) {
    this.settingsEl = element;
    this.controllers = controllers;
    this.controllers.onOk = () => { this.showSettings() };
    this.controllers.onCancel = () => { this.showSettings() };
    this.players = [];
    let playersStore = localStorage.getItem('players');
    if(playersStore) {
      let playerData = JSON.parse(playersStore);
      playerData.forEach(player => {
        let p = new Player();
        p.controllerId = player.controllerId;
        p.controllerIndex = player.controllerIndex;
        p.assignedInputs = player.assignedInputs;
        this.players.push(p);
      });
    }
    else
      this.players = [new Player(),new Player(),new Player(),new Player()];
    this.showSettings();
  }
   
  showSettings() {
    this.settingsEl.innerHTML = `
      <p>Assign player controls:</p>
      <ul class="playerList">
        ${this.players.map((player, i) => `<li class="playerConfigLI">
          <span>Player ${i + 1}</span>
          <select class="controllerSelect">
            <option value="pointer">Mouse/Touch</option>
            ${this.controllers.availableControllers.map((controller, i) => `<option value="${i}">${controller.id}</option>`).join('')}
          </select>
          <img class="configureControllerIcon icon settingsIcon" src="./icons/settings.svg">
        </li>`).join('')}
      </ul>
      <button class="dialogButton" id="buttonSettingsCancel">Cancel</button>
      <button class="dialogButton" id="buttonSettingsOk">Ok</button>
    `;    
    
    this.settingsEl.querySelector('#buttonSettingsCancel').onclick = (e) => { this.onCancel(); };
    let buttonSettingsOk = this.settingsEl.querySelector('#buttonSettingsOk');
    buttonSettingsOk.style.float = 'right';
    buttonSettingsOk.onclick = (e) => { 
      localStorage.setItem('players', JSON.stringify(this.players));
      this.onOk(); 
    };
    
    let controllerSelects = this.settingsEl.querySelectorAll('.controllerSelect');
    controllerSelects.forEach((select, i) => {
      select.selectedIndex = this.players[i].controllerIndex;
      select.onchange = (e) => {
        this.players[i].controllerIndex = select.selectedIndex;
      };
    });
    
    let icons = this.settingsEl.querySelectorAll('.configureControllerIcon');
    let itemEls = this.settingsEl.querySelectorAll('.playerConfigLI');
    icons.forEach((icon, i) => {
      icon.onclick = (e) => { 
        let controller = itemEls[i].querySelector('.controllerSelect').value;
        if(controller === 'pointer')
          alert('Touch or mouse left click on the control bar.');
        else 
          this.controllers.configure(this.players[i], this.controllers.availableControllers[parseInt(controller)]);
      };
    });
  }
  
  onCancel() {}
  
  onOk() {}
}