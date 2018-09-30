import Instrument from './instrument.js';

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
    this.noteToDrumMap = { A:0, B:1, C:2, D:2, E:3, F:4, G:4 };   
    
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
    
    setInterval(() => {
      if(!this.playerControl)
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
    
    this.shrinkRate = this.growRate = 1;
    this.pedalRate = 2;
    
    this.ctx = this.container.querySelector('canvas').getContext('2d');
  }

  initSynth() {    
    this.synth = new Tone.Sampler({
      'B0'  : 'Acoustic Bass Drum.wav',
      'C1'  : 'Bass Drum 1.wav',
      'C#1' : 'Side Stick.wav',
      'D1'  : 'Acoustic Snare.wav',
      'Eb1' : 'Hand Clap.wav',
      'E1'  : 'Electric Snare.wav',
      'F1'  : 'Low Floor Tom.wav',
      'F#1' : 'Closed Hi Hat.wav',
      'G1'  : 'High Floor Tom.wav',
      'Ab1' : 'Pedal Hi-Hat.wav',
      'A1'  : 'Low Tom.wav',
      'Bb1' : 'Open Hi-Hat.wav',
      'B1'  : 'Low-Mid Tom.wav',
      'C2'  : 'Hi Mid Tom.wav',
      'C#2' : 'Crash Cymbal 1.wav',
      'D2'  : 'High Tom.wav',
      'Eb2' : 'Ride Cymbal 1.wav',
      'E2'  : 'Chinese Cymbal.wav',
      'F2'  : 'Ride Bell.wav',
      'F#2' : 'Tambourine.wav',
      'G2'  : 'Splash Cymbal.wav',
      'Ab2' : 'Cowbell.wav',
      'A2'  : 'Crash Cymbal 2.wav',
      'Bb2' : 'Vibraslap.wav',
      'B2'  : 'Ride Cymbal 2.wav',
      'C3'  : 'Hi Bongo.wav',
      'C#3' : 'Low Bongo.wav',
      'D3'  : 'Mute Hi Conga.wav',
      'Eb3' : 'Open Hi Conga.wav',
      'E3'  : 'Low Conga.wav',
      'F3'  : 'High Timbale.wav',
      'F#3' : 'Low Timbale.wav',
      'G3'  : 'High Agogo.wav',
      'Ab3' : 'Low Agogo.wav',
      'A3'  : 'Cabasa.wav',
      'Bb3' : 'Maracas.wav',
      'B3'  : 'Short Whistle.wav',
      'C4'  : 'Long Whistle.wav',
      'C#4' : 'Short Guiro.wav',
      'D4'  : 'Long Guiro.wav',
      'Eb4' : 'Claves.wav',
      'E4'  : 'Hi Wood Block.wav',
      'F4'  : 'Low Wood Block.wav',
      'F#4' : 'Mute Cuica.wav',
      'G4'  : 'Open Cuica.wav',
      'Ab4' : 'Mute Triangle.wav',
      'A4'  : 'Open Triangle.wav'
    },{
      'release' : 1,
      'baseUrl' : './assets/'
    }).toMaster();
  }
  
  play(mNote) {
    let padId = this.noteToDrumMap[mNote.name.substring(0,1)];
    let pad = this.pads[padId];
    
    if(this.playerControl && pad.radius > this.minRadius)
      pad.radius -= this.shrinkRate;
    
    pad.setAttribute('r', Math.round(pad.radius) + 10);
    setTimeout(() => {
      pad.setAttribute('r', Math.round(pad.radius));
    }, 50);
  }
  
  playCheck(gNote) {
    return true;
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
    
    futureNotes.forEach((mNote, i) => {
      if(mNote.time < now + this.windowSize && mNote.duration > 0) {
        let pad = this.noteToDrumMap[mNote.name.substring(0,1)]; // First charter of note only
        if(mNote.time >= 0 && !mNote.added) {
          this.addNote(pad, -1000, this.colors[pad], mNote);
          mNote.added = true; // Only add notes once
        }
        this.mNoteIndex = i;
      }
      if(mNote.time > now + this.windowSize)
        return;
      if(mNote.gNote && mNote.gNote.isPlayerNote && (mNote.time - now + 5) < 0.5)
        mNote.gNote.upComing  = true;
    });
  }
  
  addNote(pad, y, color, mNote) {
    let gNote = {};
    gNote.endY = this.pads[pad].getAttribute('cy');
    gNote.x = this.pads[pad].getAttribute('cx');
    gNote.color = color;
    gNote.pad = pad;
    if(pad === 2 || pad === 3 )
      gNote.offset = 0;
    else
      gNote.offset = this.offset;    
    gNote.mNote = mNote;
    mNote.gNote = gNote;       
    this.gNotes.push(gNote);   
  }
  
  drawNote(y, gNote) {
    if(y + this.offset + gNote.offset > gNote.endY)
      return;
    this.ctx.beginPath();
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = gNote.color;
    this.ctx.arc(gNote.x, y + this.offset + gNote.offset, 4, 0, 6.28);
    this.ctx.fill(); 
  }
  
  input(states) {
    states.forEach((state, i) => {
      if(state && i < 5)
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