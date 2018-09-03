import Player from './player.js';

const template = document.createElement('template');
template.innerHTML = `
<div class="settings">Auto
  <label class="playerToggle">
    <input type="checkbox" checked> 
      <svg class="slider" width="50" height="30" viewbox="0 0 50 30" xmlns="http://www.w3.org/2000/svg">
        <line y2="15" x2="35" y1="15" x1="15" stroke-width="30" stroke="slateblue" stroke-linecap="round"/>
        <circle r=10 cx=15 cy=15 fill="#fff"/>
      </svg>
    </input>
  </label>
  <!--
  <div class="dropdown">
    <button class="dropbtn">Auto</button>
    <div class="dropdown-content">
      <a href="#">Player 1</a>
      <a href="#">Player 2</a>
    </div>
  </div>
  -->
</div>`;

export default class Instrument {    
  
  constructor(parent) {
    if(!parent)
      throw new Error('You have to accept the parent DOM element as a paramter!');
    else {
      this.container = document.createElement('div');
      this.container.style.position = 'relative';
      this.container.appendChild(template.content.cloneNode(true));  
      parent.appendChild(this.container); 
      
      this.playerControl = false;
      let playerToggleEl = this.container.querySelector('.playerToggle > input');
      playerToggleEl.onclick = () => {
        this.playerControl = !playerToggleEl.checked;
      };
    }
    this.gNotes = []; // Note graphics
    this.mNotes = []; // Note music (Tone.js)
    this.player = new Player();
  }

  /**
   * Create your instrument synth here as 'this.synth'
   */
  initSynth() {
    throw new Error('You have to implement the method "initSynth"!');
  }
  
  /**
   * Called once per RAF with the current Tone.js time 
   */
  update(now) {
    throw new Error('You have to implement the method "update"!');
  }
  
  /**
   * Called when ever a note is played
   */
  play(note) {
    throw new Error('You have to implement the method "play"!');
  }
}