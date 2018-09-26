import Instrument from './instrument.js';

const drumsTemplate = document.createElement('template');
drumsTemplate.innerHTML = `
<svg class="drums" width="250" height="400" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect fill="#ccc" height="100%" width="100%" y="0" x="0" />
    <circle cx="25%" cy="33%" r="50" fill="green" opacity="0.5"/>
    <circle cx="75%" cy="33%" r="50" fill="red" opacity="0.5"/>
    <circle cx="25%" cy="66%" r="50" fill="#999900" opacity="0.5"/>
    <circle cx="75%" cy="66%" r="50" fill="blue" opacity="0.5"/>
    <circle cx="50%" cy="50%" r="50" fill="darkorange" opacity="0.5"/>
    <circle cx="25%" cy="33%" r="25" fill="#fff" opacity="0.25"/>
    <circle cx="75%" cy="33%" r="25" fill="#fff" opacity="0.25"/>
    <circle cx="25%" cy="66%" r="25" fill="#fff" opacity="0.25"/>
    <circle cx="75%" cy="66%" r="25" fill="#fff" opacity="0.25"/>    
    <circle cx="50%" cy="50%" r="25" fill="#fff" opacity="0.25"/>    
  </g>
</svg>
`;

export default class Drums extends Instrument {    
  constructor(parent, settings) {
    super(parent, settings);
    this.container.appendChild(drumsTemplate.content.cloneNode(true));  
    this.graphics = this.container.querySelector('g');
    this.noteToDrumMap = { A:0, B:1, C:2, D:2, E:3, F:4, G:4 };   
    
    let playerSelectEls = this.container.querySelectorAll('.dropdown-content > div');
    playerSelectEls.forEach((select, i) => {
      select.onclick = () => { alert('Drum support coming soon!'); }
    });
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
  
  play(mNote) {
    let drumId = this.noteToDrumMap[mNote.name.substring(0,1)];
    let drum = this.graphics.children[drumId + 1];
    drum.setAttribute('r', 60);
    // drum.setAttribute('opacity', 0.60);
    setTimeout(() => {
      drum.setAttribute('r', 50);
      // drum.setAttribute('opacity', 0.5);
    }, 50);
  }
  
  playCheck(gNote) {
    return true;
  }
  
  update(now) {
    //TBD
  }
  
  input(input, state) {
    // TBD
  }
}