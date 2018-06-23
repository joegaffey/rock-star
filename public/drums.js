import Instrument from './instrument.js';

const drumsTemplate = document.createElement('template');
drumsTemplate.innerHTML = `
<svg class="drums" width="250" height="400" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect fill="#aaa" height="100%" width="100%" y="0" x="0" />
    <circle cx="25%" cy="25%" r="45" fill="white"/>
    <circle cx="75%" cy="25%" r="45" fill="white" />
    <circle cx="25%" cy="50%" r="45" fill="white" />
    <circle cx="75%" cy="50%" r="45" fill="white" />
    <circle cx="25%" cy="75%" r="45" fill="white" />
    <circle cx="75%" cy="75%" r="45" fill="white" />
  </g>
</svg>
`;

export default class Drums extends Instrument{    
  constructor(parent) {
    super(parent);
    let container = document.createElement('div');
    container.appendChild(drumsTemplate.content.cloneNode(true));  
    parent.appendChild(container);  
    this.graphics = container.querySelector('g');
    this.noteToDrumMap = { A:0, B:1, C:2, D:3, E:4, F:5, G:5 };   
    this.colors = ['green', 'red', 'yellow', 'blue', 'orange', 'pink'];
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

    // this.synth = new Tone.MembraneSynth().toMaster(); // Test synth
  }
  
  play(note) {
    let drumId = this.noteToDrumMap[note.name.substring(0,1)];
    let drum = this.graphics.children[drumId + 1];
    drum.setAttribute('fill', this.colors[drumId]);
    setTimeout(() => {
      drum.setAttribute('fill', 'white');
    }, 50);
  }
  
  update(now) {
    //TBD
  }
  
  input(input) {
    // TBD
  }
}