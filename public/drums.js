import Instrument from './instrument.js';

const drumsTemplate = document.createElement('template');
drumsTemplate.innerHTML = `
<style>
  .base {
    fill: #fff;
    opacity: 0.5;
    r: 50;
  }
  .inner { 
    pointer-events: none; 
    fill: #fff;
    opacity: 0.25;
    r: 25;
  }
</style>
<svg class="drums" width="250" height="400" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect fill="#ccc" height="100%" width="100%" y="0" x="0" />
    <circle class="base" cx="85%" cy="60%"/>
    <circle class="base" cx="15%" cy="60%"/>
    <circle class="base" cx="30%" cy="35%"/>
    <circle class="base" cx="70%" cy="35%"/>
    <circle class="base" cx="50%" cy="75%"/>    
    <circle class="pad" cx="85%" cy="60%" r="50" fill="green" opacity="0.5"/>
    <circle class="pad" cx="15%" cy="60%" r="50" fill="red" opacity="0.5"/>
    <circle class="pad" cx="30%" cy="35%" r="50" fill="#999900" opacity="0.5"/>
    <circle class="pad" cx="70%" cy="35%" r="50" fill="blue" opacity="0.5"/>
    <circle class="pad" cx="50%" cy="75%" r="50" fill="darkorange" opacity="0.5"/>
    <circle class="inner" cx="85%" cy="60%" r="25"/>
    <circle class="inner" cx="15%" cy="60%" r="25"/>    
    <circle class="inner" cx="70%" cy="35%" r="25"/>
    <circle class="inner" cx="30%" cy="35%" r="25"/>
    <circle class="inner" cx="50%" cy="75%" r="25"/>    
  </g>
</svg>
`;

export default class Drums extends Instrument {    
  constructor(parent, settings) {
    super(parent, settings);
    this.container.appendChild(drumsTemplate.content.cloneNode(true));  
    this.graphics = this.container.querySelector('g');
    this.noteToDrumMap = { A:0, B:1, C:2, D:2, E:3, F:4, G:4 };   
    
    this.pads = Array.from(this.graphics.children).slice(6, 11);
    this.pads[4].isPedal = true;
    this.minRadius = 30;
    this.maxRadius = 50;
        
    this.pads.forEach((pad) => {
      pad.radius = this.maxRadius;
      pad.addEventListener('click', () => {
        this.hitPad(pad);
      });
    });    
    
    setInterval(() => {
      if(!this.playerControl)
        return;
      let lowest = this.maxRadius;
      this.pads.forEach((pad) => {
        if(pad.radius < lowest)
           lowest = pad.radius;
      });
      
      let res = Math.floor((lowest - this.minRadius) * (100 / (this.maxRadius - this.minRadius)));
      if(res <= 0)
        this.player.avg = 0;
      else if(res >= 100)
        this.player.avg = 100;
      else
        this.player.avg = res;
    }, 1000);
    
    this.shrinkRate = 0.3;
    this.growRate = 0.1;
    this.pedalRate = 0.5;
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
  
  update(now) {}
  
  input(states) {
    states.forEach((state, i) => {
      if(state)
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