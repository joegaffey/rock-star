import Player from './player.js';
import Settings from './settings.js';

const template = document.createElement('template');
template.innerHTML = `
<div class="settings">
  <img class="gripper left" src="grippy.svg"/>
  <img class="gripper right" src="grippy.svg"/>
  <div class="dropdown">
    <button class="dropbtn">Computer</button>
    <div class="dropdown-content">
      <div>Computer</div>
      <div>Player 1</div>
      <div>Player 2</div>
      <div>Player 3</div>
      <div>Player 4</div>
    </div>
  </div>
</div>
<div class="instrument"></div>
<div class="cexBar">
  <svg class="cexBarSvg" width="30" height="400">
    <rect class="cexItem" x="5" y="5" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="20" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="35" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="50" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="65" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="80" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="95" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="110" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />  
    <rect class="cexItem" x="5" y="125" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="140" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="155" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="170" rx="4" ry="4" width="20" height="10" style="fill:lightgreen" />
    <rect class="cexItem" x="5" y="185" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />
    <rect class="cexItem" x="5" y="200" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />
    <rect class="cexItem" x="5" y="215" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />
    <rect class="cexItem" x="5" y="230" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />  
    <rect class="cexItem" x="5" y="245" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />
    <rect class="cexItem" x="5" y="260" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />
    <rect class="cexItem" x="5" y="275" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />
    <rect class="cexItem" x="5" y="290" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />
    <rect class="cexItem" x="5" y="305" rx="4" ry="4" width="20" height="10" style="fill:darkorange" />
    <rect class="cexItem" x="5" y="320" rx="4" ry="4" width="20" height="10" style="fill:red" />
    <rect class="cexItem" x="5" y="335" rx="4" ry="4" width="20" height="10" style="fill:red" />
    <rect class="cexItem" x="5" y="350" rx="4" ry="4" width="20" height="10" style="fill:red" />  
    <rect class="cexItem" x="5" y="365" rx="4" ry="4" width="20" height="10" style="fill:red" />
    <rect class="cexItem" x="5" y="380" rx="4" ry="4" width="20" height="10" style="fill:red" />
  </svg>
</div>
<div class="infoOverlay name"></div>
<div class="infoOverlay accuracy"><span class="score">100</span>%</div>`;

export default class Instrument {    
  
  constructor(parent, players) {
    if(!parent)
      throw new Error('You have to accept the parent DOM element as a paramter!');
    else {
      this.container = document.createElement('div');
      this.container.style.position = 'relative';
      this.container.classList.add('instrumentContainer');
      
      this.container.appendChild(template.content.cloneNode(true));  
      parent.appendChild(this.container);    
      
      this.container.draggable = true; 
      
      document.addEventListener("dragstart", (ev) => {
          this.dragging = ev.target;
      }, false);
      
      this.container.ondragover = (ev) => { 
        ev.preventDefault();
        // ev.target.style.border = "dotted green";
      };
      
      this.container.ondragleave = (ev) => { 
        ev.preventDefault();
        // ev.target.style.border = "solid black";
      };
      
      this.container.ondrop = this.onDrop.bind(this);
      
      this.playerControl = false;
    }
    
    this.gNotes = []; // Note graphics
    this.mNotes = []; // Note music (Tone.js)
    
    this.playerDropdownEl = this.container.querySelector('.dropbtn');
    let playerSelectEls = this.container.querySelectorAll('.dropdown-content > div');
    playerSelectEls.forEach((select, i) => {
      select.onclick = () => {
        if(select.innerHTML === 'Computer') {
          this.playerControl = false;
          this.player = null;
        }
        else {
          window.dispatchEvent(new CustomEvent('PlayerChange', {detail: {sender: this, before: this.playerDropdownEl.innerHTML, after:select.innerHTML}}));
          this.playerControl = true;
          this.player = players[i - 1];
          this.player.instrument = this;          
        }
        this.playerDropdownEl.innerHTML = select.innerHTML;
      };
    });
    
    window.addEventListener('PlayerChange', e => {
      if(e.detail.sender !== this && this.playerDropdownEl.innerHTML === e.detail.after) {
        this.playerDropdownEl.innerHTML = e.detail.before;
        if(e.detail.before === 'Computer')
          this.playerControl = false;
      }
    });
    
    this.cexBar = this.container.querySelector('.cexBarSvg');
    this.cex = this.CEX_MAX = 30;
    this.CEX_UPDATE_RATE = 1000;
    this.CEX_FACTOR = 1;
    this.CEX_THRESHOLD = 75;
    
    setInterval(() => {
      if(!this.playerControl || this.finished)
        return;
      if(this.player.avg > this.CEX_THRESHOLD && this.cex < this.CEX_MAX) 
        this.cex += this.CEX_FACTOR;
      else
        this.cex -= this.CEX_FACTOR;
      if(this.cex === 0) {
        this.endSong();
        this.playerControl = false;
      }
      this.updateCexBar();
    }, this.CEX_UPDATE_RATE);
  }
  
  onDrop(ev) {
    ev.preventDefault();    
    this.swap(this.container, this.dragging);
  }  
  
  swap(node1, node2) {
    const afterNode2 = node2.nextElementSibling;
    const afterNode1 = node1.previousElementSibling;
    const parent = node1.parentNode;
    node1.replaceWith(node2);
    if(node1 !== afterNode2)
      parent.insertBefore(node1, afterNode2);
    else 
      parent.insertBefore(node1, afterNode1);  
  }

  /**
   * Create your instrument synth here as 'this.synth'
   */
  initSynth() {
    throw new Error('You have to implement the "initSynth" method !');
  }
  
  /**
   * Called once per RAF with the current Tone.js time 
   */
  update(now) {
    throw new Error('You have to implement the "update" method!');
  }
  
  /**
   * Called whenever a note is played
   */
  play(note) {
    throw new Error('You have to implement the "play" method!');
  }
  
  set name(name) {
    this._name = name;
    this.container.querySelector('.name').innerHTML = name;
  }
  
  get name() {
    return this._name;
  }
  
  set accuracy(acc) {
    this.container.querySelector('.score').innerHTML = acc;
  }
  
  endSong() {
    this.finished = true;
    this.container.querySelector('.accuracy').classList.add('maxed');
  }  
  
  updateCexBar() {
    let items = this.cexBar.querySelectorAll('.cexItem');
    items.forEach((el, i) => {
      if(items.length - i > this.cex)
        el.classList.add('invisible');
      else
        el.classList.remove('invisible');
    });
  }
}
