import Instrument from './instrument.js';

const drumsTemplate = document.createElement('template');
drumsTemplate.innerHTML = `
<svg class="drums" width="220" height="400" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect fill="#333" height="100%" width="100%" y="0" x="0" />
    <circle cx="60" cy="50" r="40" stroke="#555" stroke-width="3" fill="white" />
    <circle cx="160" cy="50" r="40" stroke="#555" stroke-width="3" fill="white" />
    <circle cx="60" cy="150" r="40" stroke="#555" stroke-width="3" fill="white" />
    <circle cx="160" cy="150" r="40" stroke="#555" stroke-width="3" fill="white" />
    <circle cx="60" cy="250" r="40" stroke="#555" stroke-width="3" fill="white" />
    <circle cx="160" cy="250" r="40" stroke="#555" stroke-width="3" fill="white" />
    <circle cx="60" cy="350" r="40" stroke="#555" stroke-width="3" fill="white" />
    <circle cx="160" cy="350" r="40" stroke="#555" stroke-width="3" fill="white" />
  </g>
</svg>
`;

export default class Drums extends Instrument{    
  constructor(parent) {
    super(parent);
    let container = document.createElement('span');
    container.appendChild(drumsTemplate.content.cloneNode(true));  
    parent.appendChild(container);  
    this.graphics = container.querySelector('g');
    this.noteToDrumMap = { A:0, B:1, C:2, D:3, E:4, F:5, G:5 };   
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
    let drumId = this.noteToDrumMap[note.name.substring(0,1)] + 1;
    let drum = this.graphics.children[drumId];
    drum.setAttribute('fill', 'red');
    setTimeout(() => {
      drum.setAttribute('fill', 'white');
    }, 50);
  }
  
  update(now) {
    //TBD
  }
}