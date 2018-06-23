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
    // this.synth = new Tone.Sampler({
    // 			'A2' : 'Open_A2.[mp3|ogg]',
    // 			'B3' : 'Open_B3.[mp3|ogg]',
    // 			'D3' : 'Open_D3.[mp3|ogg]',
    // 			'E2' : 'Open_E2.[mp3|ogg]',
    // 			'E4' : 'Open_E4.[mp3|ogg]',
    // 			'G3' : 'Open_G3.[mp3|ogg]'
    // 		}, {
    // 			'release' : 1,
    // 			'baseUrl' : './audio/'
    // 		}).toMaster();
    this.synth = new Tone.MembraneSynth().toMaster(); // Temporary
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