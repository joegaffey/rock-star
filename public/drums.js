import Instrument from './instrument.js';
import Synths from './synths.js';

const drumsTemplate = document.createElement('template');
drumsTemplate.innerHTML = `
<style>
  .base {
    fill: #fff;
    opacity: 0.5;
    r: 40;
  }
  .inner { 
    pointer-events: none; 
    fill: #fff;
    opacity: 0.25;
    r: 15;
  }
  canvas {
    pointer-events: none; 
  }
</style>
<svg class="drums" width="250" height="400" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect fill="#ccc" height="100%" width="100%" y="0" x="0" />
    <circle class="base" cx="210" cy="360"/>
    <circle class="base" cx="40" cy="360"/>
    <circle class="base" cx="80" cy="280"/>
    <circle class="base" cx="160" cy="280"/>
    <circle class="base" cx="125" cy="360"/>    
    <circle class="pad" cx="210" cy="360" r="40" fill="green" opacity="0.5"/>
    <circle class="pad" cx="40" cy="360" r="40" fill="red" opacity="0.5"/>
    <circle class="pad" cx="80" cy="280" r="40" fill="#999900" opacity="0.5"/>
    <circle class="pad" cx="160" cy="280" r="40" fill="blue" opacity="0.5"/>
    <circle class="pad" cx="125" cy="360" r="40" fill="darkorange" opacity="0.5"/>
    <circle class="inner" cx="210" cy="360" r="25"/>
    <circle class="inner" cx="40" cy="360" r="25"/>    
    <circle class="inner" cx="160" cy="280" r="25"/>
    <circle class="inner" cx="80" cy="280" r="25"/>
    <circle class="inner" cx="125" cy="360" r="25"/>    
  </g>
</svg>
<canvas style="position: absolute; top: 50px; left: 0;" width="250" height="400">></canvas>
`;

export default class Drums extends Instrument {    
  constructor(parent, settings) {
    super(parent, settings);
    this.container.appendChild(drumsTemplate.content.cloneNode(true));  
    this.graphics = this.container.querySelector('g');
    this.noteToDrumMap = { A:0, B:1, C:2, D:2, E:3, F:3, G:4 };   
    
    this.pads = Array.from(this.graphics.children).slice(6, 11);
    this.pads[4].isPedal = true;
    this.minRadius = 20;
    this.maxRadius = 40;
    
    this.colors = ['green', 'red', '#999900', 'blue', 'darkorange'];
    
    this.windowSize = 2; // Time window in seconds
    this.scale = 200; // Used map note time to graphics - to be tweaked
    this.mNoteIndex = 0; // Current position in track
    this.offset = 75;
        
    this.pads.forEach((pad) => {
      pad.radius = this.maxRadius;
      pad.addEventListener('click', () => {
        this.hitPad(pad);
      });
    });    
    
    let difficultyMultiplier = 10;
    this.pedalReset = true;
    
    setInterval(() => {
      if(!this.playerControl || this.finished)
        return;
      let total = 0;
      this.pads.forEach((pad) => {
        total += pad.radius;
      });
      let ratio = (total / 5) / this.maxRadius;
      let res = Math.floor(ratio * 100);
      res = 100 - ((100 - res) * difficultyMultiplier);
      if(res < 0)
        res = 0;
      this.player.avg = res;
    }, 1000);
    
    this.shrinkRate = this.growRate = 2.5;
    this.pedalRate = this.growRate * 2;
    
    this.ctx = this.container.querySelector('canvas').getContext('2d');
  }

  initSynth(callback) {    
    return this.synth = new Synths().drums(callback);
  }
  
  play(mNote) {
    let padId = this.noteToDrumMap[mNote.name.substring(0,1)];
    let pad = this.pads[padId];
    
    if(this.playerControl && pad.radius > this.minRadius)
      pad.radius -= this.shrinkRate;
    
    if(!this.playerControl) {
      pad.setAttribute('r', Math.round(pad.radius) + 10);
      setTimeout(() => {
        pad.setAttribute('r', Math.round(pad.radius));
      }, 50);
    }
  }
  
  update(now) {
    this.ctx.clearRect(0, 0, 250, 400);
      
    this.gNotes.forEach((gNote, i) => {
      let y = (now - gNote.mNote.time) * this.scale - (this.scale * 4);    
      this.drawNote(y, gNote);
      
      // Remove notes outside the render area
      if(y - gNote.length > 420) {
        this.gNotes.splice(i, 1);
      }
    });
    
    // Add new notes within the time window
    let futureNotes = this.mNotes.slice(this.mNoteIndex);    
    
    // Add new notes within the time window
    futureNotes.forEach((mNote, i) => {
      let pad = this.noteToDrumMap[mNote.name.substring(0,1)]; // First character of note only
      if(mNote.time < now + this.windowSize && mNote.duration > 0) {        
        if(mNote.time >= 0 && !mNote.added) {
          this.addNote(pad, -1000, this.colors[pad], mNote);
          mNote.added = true; // Only add notes once
        }
        this.mNoteIndex = i;
      }
      if(mNote.time > now + this.windowSize)
        return;
    });
  }
  
  addNote(pad, y, color, mNote) {
    let gNote = {};
    gNote.endY = this.pads[pad].getAttribute('cy');
    gNote.x = this.pads[pad].getAttribute('cx');
    gNote.color = color;
    gNote.pad = pad;
    if(pad === 2 || pad === 3)
      gNote.offset = 0;
    else
      gNote.offset = this.offset;    
    gNote.mNote = mNote;
    mNote.gNote = gNote;       
    this.gNotes.push(gNote);   
  }
  
  drawNote(y, gNote) {
    let drawY = y + this.offset + gNote.offset;
    if(drawY < gNote.endY) {
      if(drawY < gNote.endY - 25) {
        this.ctx.beginPath();
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = gNote.color;
        this.ctx.arc(gNote.x, drawY, 4, 0, 6.28);
        this.ctx.fill();
      }
      if(drawY > gNote.endY - 25) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = gNote.color;
        this.ctx.arc(gNote.x, drawY, 15, 0, 2 * Math.PI);
        this.ctx.stroke();
      }
    }
  }
  
  input(states) {
    if(states[4] && this.pedalReset) {
      this.hitPad(this.pads[4]);
      this.pedalReset = false;
    }
    else if(!states[4]) {
      this.pedalReset = true;
    }
    states.forEach((state, i) => {
      if(state && i < 4)
         this.hitPad(this.pads[i]);
    });
  }
  
  hitPad(pad) {
    if(pad.radius < this.maxRadius && pad.isPedal)
      pad.radius += this.pedalRate;
    else if(pad.radius < this.maxRadius) 
      pad.radius += this.growRate;
    
    pad.setAttribute('r', Math.round(pad.radius) + 10);
    setTimeout(() => {
      pad.setAttribute('r', Math.round(pad.radius));
    }, 50);
  }
}