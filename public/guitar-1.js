import Instrument from './instrument.js';

const guitarTemplate = document.createElement('template');
guitarTemplate.innerHTML = `
<div class="settings">Auto
  <label class="playerToggle">
    <input type="checkbox" checked> 
      <svg class="slider" width="50" height="30" viewbox="0 0 50 30" xmlns="http://www.w3.org/2000/svg">
        <line y2="15" x2="35" y1="15" x1="15" stroke-width="30" stroke="slateblue" stroke-linecap="round"/>
        <circle r=10 cx=15 cy=15 fill="#fff"/>
      </svg>
    </input>
  </label>
</div>
<svg class="guitarBackground" width="250" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5"/>
    </filter>
  </defs>
  <g>
    <rect fill="#aaa" height="325" width="250" y="0" x="0" />
    <rect fill="#fff" height="75" width="250" y="325" x="0" />    
    <line y2="400" x2="25" y1="0" x1="25" stroke-width="4" stroke="#888" stroke-dasharray="4 0.5" />
    <line y2="400" x2="75" y1="0" x1="75" stroke-width="3.5" stroke="#888" stroke-dasharray="4 0.5" />
    <line y2="400" x2="125" y1="0" x1="125" stroke-width="3" stroke="#888" stroke-dasharray="4 0.5" />
    <line y2="400" x2="175" y1="0" x1="175" stroke-width="2.5" stroke="#888" stroke-dasharray="4 0.5" />
    <line y2="400" x2="225" y1="0" x1="225" stroke-width="2" stroke="#888" />
    <rect class="control" fill="green" height="75" width="50" y="325" x="0" style="fill-opacity: .5;" />
    <rect class="control" fill="red" height="75" width="50" y="325" x="50" style="fill-opacity: .5;" />
    <rect class="control" fill="yellow" height="75" width="50" y="325" x="100" style="fill-opacity: .5;" />
    <rect class="control" fill="blue" height="75" width="50" y="325" x="150" style="fill-opacity: .5;" />
    <rect class="control" fill="orange" height="75" width="50" y="325" x="200" style="fill-opacity: .5;" />
  </g>
</svg>
<canvas style="position: absolute; top: 50px; left: 0;" class="guitar" width="250" height="400"></canvas>
`;

export default class Guitar extends Instrument {
  constructor(parent) {
    super(parent)
    let container = document.createElement('div');
    container.style.position = 'relative';
    container.appendChild(guitarTemplate.content.cloneNode(true));  
    parent.appendChild(container);  
    this.graphics = container.querySelector('canvas');
    
    this.colors = ['green', 'red', 'yellow', 'blue', 'orange'];
    
    this.windowSize = 2; // Time window in seconds
    this.scale = 50; // Used map note time to graphics - to be tweaked
    this.mNoteIndex = 0; // Current position in track
    this.offset = 75;
    
    this.noteToStringMap = { D:0, E:1, F:2, G:2, A:3, B:3, C:4 };   
//     this.controls = this.graphics.querySelectorAll('.control');
    
//     this.controls.forEach((control, i) => {
//       control.onclick = () => {
//         this.input(i, true);
//         setTimeout(() => {this.input(i, false) }, 300);
//       }
//     });
    
    this.playerControl = false;
    let playerToggleEl = container.querySelector('.playerToggle > input');
    playerToggleEl.onclick = () => {
      this.playerControl = !playerToggleEl.checked;
    };    
    
    this.ctx = this.graphics.getContext('2d');
  }
   
  initSynth() {    
    this.errorSynth = new Tone.MembraneSynth().toMaster();
    this.sound = presets.rock;      
    
    this.gainIn = new Tone.Gain();
    this.distortion = new Tone.Distortion();
    this.feedbackDelay = new Tone.FeedbackDelay();
    this.tremolo = new Tone.Tremolo().start();
    this.reverb = new Tone.JCReverb();
    this.chorus = new Tone.Chorus();
    
    this.gainIn.gain.value = this.sound.gainIn;
    this.distortion.wet.value = this.sound.distWet;
    this.distortion.distortion = this.sound.distDirt;
    this.feedbackDelay.wet.value = this.sound.delayWet;
    this.feedbackDelay.delayTime.value = this.sound.delayTime;
    this.feedbackDelay.feedback.value = this.sound.delayFeedback;
    this.tremolo.wet.value = this.sound.tremWet;
    this.tremolo.frequency.value = this.sound.tremFreq * 10;
    this.tremolo.depth.value = this.sound.tremDepth;
    this.reverb.wet.value = this.sound.verbWet;
    this.reverb.roomSize.value = this.sound.verbRoom;
    this.chorus.wet.value = this.sound.chorusWet;
    this.chorus.frequency.value = this.sound.chorusFreq * 5;
    this.chorus.depth = this.sound.chorusDepth;
    
    this.synth = new Tone.Sampler({
    			'A2' : 'Open_A2.mp3',
    			'B3' : 'Open_B3.mp3',
    			'D3' : 'Open_D3.mp3',
    			'E2' : 'Open_E2.mp3',
    			'E4' : 'Open_E4.mp3',
    			'G3' : 'Open_G3.mp3'
    		}, {
    			'release' : 1,
    			'baseUrl' : './assets/'
    		}).chain(
      this.gainIn,
      this.distortion,
      this.tremolo,
      this.chorus,
      this.feedbackDelay,
      this.reverb,
      Tone.Master
    );
    
    // this.synth = new Tone.PolySynth(8).toMaster(); // test synth
  }

  
  update(now) {
    // Update existing notes
    this.ctx.clearRect(0, 0, 250, 400);
      
    this.gNotes.forEach((gNote, i) => {
      // Move notes
      let y = (now - gNote.mNote.time) * this.scale;
      this.ctx.beginPath();
      this.ctx.lineWidth = 30;
      this.ctx.lineCap = "round";
      this.ctx.globalAlpha = (gNote.isPlaying ? 0.8 : 0.2);
      this.ctx.strokeStyle = gNote.color;
      this.ctx.moveTo(gNote.x, y + this.offset);
      this.ctx.lineTo(gNote.x, y + this.offset - gNote.length);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.globalAlpha = 1;
      this.ctx.lineWidth = 8;
      this.ctx.lineTo(gNote.x, y + this.offset);
      this.ctx.stroke();
      
      
      
      // gNote.gNoteLine.setAttribute('y1', y + this.offset);
      // gNote.gNoteLine.setAttribute('y2', y + this.offset - gNote.length);
      // gNote.gNoteCentre.setAttribute('cy', y + this.offset);
      // if(gNote.gNoteCircle)
      //   gNote.gNoteCircle.setAttribute('cy', y + this.offset);
      
      // Remove notes outside the render area
      // if(y - gNote.length > 420) {
      //   this.gNotes.splice(i, 1);
      //   this.graphics.removeChild(gNote.gNoteLine);
      //   this.graphics.removeChild(gNote.gNoteCentre);
      //   if(gNote.gNoteCircle)
      //     this.graphics.removeChild(gNote.gNoteCircle);
      // }
    });
    
    // Add new notes within the time window
    let futureNotes = this.mNotes.slice(this.mNoteIndex);
    
    futureNotes.forEach((mNote, i) => {
      if(mNote.time >= now && mNote.time < now + this.windowSize && mNote.duration > 0) {
        let string = this.noteToStringMap[mNote.name.substring(0,1)]; // First charter of note only
        if(mNote.time > 0 && !mNote.added) {
          this.addNote(string, -1000, mNote.duration * this.scale, this.colors[string], mNote);
          mNote.added = true; // Only add notes once
        }
        this.mNoteIndex = i;
      }
      if(mNote.time > now + this.windowSize)
        return;
    });
  }

  addNote(string, y, length, color, mNote) {
    let x = string * 50 + 25;
    let gNote = {};
    gNote.x = x;
    gNote.color = color;
    gNote.length = length;
    gNote.string = string;
    gNote.mNote = mNote;
    gNote.isPlayerNote = false;
    gNote.isPlaying = false;
    mNote.gNote = gNote;     
    
//     let gNoteLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//     gNoteLine.setAttribute('x1', x);
//     gNoteLine.setAttribute('y1', y);
//     gNoteLine.setAttribute('x2', x);
//     gNoteLine.setAttribute('y2', y - length);
//     gNoteLine.setAttribute('opacity', '0.3');
//     gNoteLine.setAttribute('stroke', color);
//     gNoteLine.setAttribute('class', 'gNoteLine');
//     gNote.gNoteLine = gNoteLine;
    
//     let gNoteCentre = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
//     gNoteCentre.setAttribute('cx', x);
//     gNoteCentre.setAttribute('cy', y);
//     gNoteCentre.setAttribute('r', '3');
//     gNoteCentre.setAttribute('fill', color); 
//     gNote.gNoteCentre = gNoteCentre;
    
//     if(this.playerControl && Math.random() > 0.8) {
//       gNote.isPlayerNote = true;
//       let gNoteCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
//       gNoteCircle.setAttribute('cx', x);
//       gNoteCircle.setAttribute('cy', y);
//       gNoteCircle.setAttribute('stroke', color); 
//       gNoteCircle.setAttribute('class', 'gNoteCircle'); 
//       gNote.gNoteCircle = gNoteCircle;
//     }
        
    this.gNotes.push(gNote);
    
    // this.graphics.appendChild(gNote.gNoteLine);
    // this.graphics.appendChild(gNote.gNoteCentre);   
    // if(gNote.gNoteCircle)
    //   this.graphics.appendChild(gNote.gNoteCircle);        
  }
  
  playCheck(gNote) {
    if(!this.playerControl)
      return true; 
    if(this.controls[gNote.string].on)
      return true;
    else {
      this.errorNote(gNote)
      return false;
    }
  }
  
  errorNote(gNote) {
    gNote.gNoteLine.setAttribute('stroke', 'grey');
    gNote.gNoteLine.setAttribute('opacity', '1');
    this.errorSynth.triggerAttackRelease('E4', gNote.mNote.duration);    
  }
  
  play(mNote) {
    if(mNote.gNote)
      mNote.gNote.isPlaying = true;
    else {
      console.log('No note graphics...');
      console.log(mNote);
    } 
  }
  
  input(input, state) {
    if(state)
      this.controls[input].setAttribute('style', 'opacity: 0.75;');
    else
      this.controls[input].setAttribute('style', 'opacity: 0.5;');
    this.controls[input].on = state;
  }
}

// Copied from TonePen - https://codepen.io/iamjoshellis/pen/ZOAzrN
const presets = {
  'delay': {
    gainIn: 1,
    distWet: 0,
    distDirt: 0,
    delayWet: 0.4,
    delayTime: 0.3,
    delayFeedback: 0.5,
    tremWet: 0,
    tremFreq: 0,
    tremDepth: 0,
    verbWet: 0,
    verbRoom: 0,
    chorusWet: 0,
    chorusFreq: 0,
    chorusDepth: 0,
  },
  'rock': {
    gainIn: 1,
    distWet: 1,
    distDirt: 1,
    delayWet: 0,
    delayTime: 0,
    delayFeedback: 0,
    tremWet: 0,
    tremFreq: 0,
    tremDepth: 0,
    verbWet: 0.1,
    verbRoom: 0.1,
    chorusWet: 0,
    chorusFreq: 0,
    chorusDepth: 0,
  },
  'clean': {
    gainIn: 1,
    distWet: 0,
    distDirt: 0,
    delayWet: 0.2,
    delayTime: 0.4,
    delayFeedback: 0.4,
    tremWet: 0,
    tremFreq: 0,
    tremDepth: 0,
    verbWet: 0.3,
    verbRoom: 0.3,
    chorusWet: 0.7,
    chorusFreq: 0.1,
    chorusDepth: 0.5,
  },
  'blues': {
    gainIn: 1,
    distWet: 0.4,
    distDirt: 0.3,
    delayWet: 0,
    delayTime: 0,
    delayFeedback: 0,
    tremWet: 0.7,
    tremFreq: 0.6,
    tremDepth: 0.9,
    verbWet: 0.3,
    verbRoom: 0.3,
    chorusWet: 0,
    chorusFreq: 0,
    chorusDepth: 0,
  },
  'billTed': {
    gainIn: 1,
    distWet: 1,
    distDirt: 1,
    delayWet: 1,
    delayTime: 1,
    delayFeedback: 1,
    tremWet: 1,
    tremFreq: 1,
    tremDepth: 1,
    verbWet: 1,
    verbRoom: 1,
    chorusWet: 1,
    chorusFreq: 1,
    chorusDepth: 1,
  }
}