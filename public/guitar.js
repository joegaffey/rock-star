import Instrument from './instrument.js';

const guitarTemplate = document.createElement('template');
guitarTemplate.innerHTML = `
<svg class="guitarBackground" width="250" height="400" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect fill="#aaa" height="325" width="250" y="0" x="0" />
    <rect fill="#fff" height="75" width="250" y="325" x="0" />    
    <line y2="400" x2="25" y1="0" x1="25" stroke-width="4" stroke="#888" stroke-dasharray="4 0.5" />
    <line y2="400" x2="75" y1="0" x1="75" stroke-width="3.5" stroke="#888" stroke-dasharray="4 0.5" />
    <line y2="400" x2="125" y1="0" x1="125" stroke-width="3" stroke="#888" stroke-dasharray="4 0.5" />
    <line y2="400" x2="175" y1="0" x1="175" stroke-width="2.5" stroke="#888" stroke-dasharray="4 0.5" />
    <line y2="400" x2="225" y1="0" x1="225" stroke-width="2" stroke="#888" />
  </g>
</svg>
<canvas style="position: absolute; top: 50px; left: 0;" class="guitar" width="250" height="400"></canvas>
<svg class="guitarControls" style="position: absolute; bottom: 0; left: 0;" width="250" height="75" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect class="control" fill="green" height="20" width="50" y="0" x="0" style="fill-opacity: .2;" />
    <rect class="control" fill="red" height="20" width="50" y="0" x="50" style="fill-opacity: .2;" />
    <rect class="control" fill="yellow" height="20" width="50" y="0" x="100" style="fill-opacity: .2;" />
    <rect class="control" fill="blue" height="20" width="50" y="0" x="150" style="fill-opacity: .2;" />
    <rect class="control" fill="orange" height="20" width="50" y="0" x="200" style="fill-opacity: .2;" />
  </g>
</svg>
`;

export default class Guitar extends Instrument {
  constructor(parent, settings) {
    super(parent, settings)
    this.container.appendChild(guitarTemplate.content.cloneNode(true));  
    parent.appendChild(this.container);  
    this.graphics = this.container.querySelector('canvas');
    
    this.colors = ['green', 'red', 'yellow', 'blue', 'orange'];
    
    this.windowSize = 2; // Time window in seconds
    this.scale = 50; // Used map note time to graphics - to be tweaked
    this.mNoteIndex = 0; // Current position in track
    this.offset = 75;
    
    this.noteToStringMap = { D:0, E:1, F:2, G:2, A:3, B:3, C:4 };   
    this.controls = this.container.querySelectorAll('.control');
    
    this.errorRate = 0.9;
    this.STRUM_TIMEOUT = 200;
    
    this.controls.forEach((control, i) => {
      control.onclick = () => {
        this.input(i, true);
        setTimeout(() => { this.input(i, false); }, 300);
        this.strumOn = true;
        setTimeout(() => { this.strumOn = false; }, 300);
      }
    });    
    
    this.ctx = this.graphics.getContext('2d');
  }
   
  initSynth() {    
    this.errorSynth = new Tone.Sampler({
      'B0'  : 'buzzer.mp3'
    },{
      attack: 0,
      release: 0,
      baseUrl: './assets/'
    }).toMaster();
    this.errorSynth.volume.value = 10;
    
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
    
    let instrument = 'guitar-electric'; 
    if(this.name === 'bass')
      instrument = 'bass-electric';
    
    this.synth = SampleLibrary.load({
      instruments: instrument,
      minify: true
    });
    this.synth.chain(
      this.gainIn,
      this.distortion,
      this.tremolo,
      this.chorus,
      this.feedbackDelay,
      this.reverb,
      Tone.Master
    );
    
    // this.synth = new Tone.PolySynth(8).toMaster(); // Simple test synth
  }
  
  update(now) {
    // Update existing notes
    this.ctx.clearRect(0, 0, 250, 400);
      
    this.gNotes.forEach((gNote, i) => {
      let y = (now - gNote.mNote.time) * this.scale;
    
      if(this.playerControl && !gNote.isPlayerNote)
        this.drawShadowNote(y, gNote);
      else 
        this.drawPlayerNote(y, gNote);
      
      // Remove notes outside the render area
      if(y - gNote.length > 420) {
        this.gNotes.splice(i, 1);
      }
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
  
  drawPlayerNote(y, gNote) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 30;
    this.ctx.lineCap = "round";
    this.ctx.globalAlpha = ((gNote.isPlaying) ? 0.5 : 0.2);
    this.ctx.strokeStyle = ((gNote.isError) ? 'grey' : gNote.color);
    this.ctx.moveTo(gNote.x, y + this.offset);
    this.ctx.lineTo(gNote.x, y + this.offset - gNote.length);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = gNote.color;
    this.ctx.arc(gNote.x, y + this.offset, 4, 0, 6.28);
    this.ctx.fill();

    if(gNote.isPlayerNote) {
      if(gNote.circle > 50)
        gNote.circle = 5;
      this.ctx.lineWidth = 3;
      this.ctx.globalAlpha = 20 / (gNote.circle * 5);
      this.ctx.beginPath();
      this.ctx.arc(gNote.x, y + this.offset, gNote.circle++, 0, 2 * Math.PI);
      this.ctx.stroke();
    }   
  }
  
  drawShadowNote(y, gNote) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 30;
    this.ctx.lineCap = "round";
    this.ctx.globalAlpha = ((gNote.isPlaying) ? 0.25 : 0.1);
    this.ctx.strokeStyle = 'grey';
    this.ctx.shadowBlur = 0;
    this.ctx.moveTo(gNote.x, y + this.offset);
    this.ctx.lineTo(gNote.x, y + this.offset - gNote.length);
    this.ctx.stroke();
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
    gNote.isError = false;
    mNote.gNote = gNote;       
    if(this.playerControl && Math.random() > this.errorRate) {
      gNote.isPlayerNote = true;
      gNote.circle = 10;
    }
    this.gNotes.push(gNote);   
  }
  
  playCheck(gNote) {
    if(!this.playerControl)
      return true; 
    
    if(this.controls[gNote.string].on && this.strumOn) {
      this.player.hit();
      return true;
    }
    else {
      this.error(gNote)
      return false;
    }
  }
  
  error(gNote) {
    gNote.isError = true;
    this.player.miss();
    this.errorSynth.triggerAttack('B0');    
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
    if(input === 5 || input === 6) {
      this.strumOn = state;
    }
    else if(input < 5) {
      this.controls[input].on = state;
      if(state)
        this.controls[input].setAttribute('style', 'opacity: 1;');
      else
        this.controls[input].setAttribute('style', 'opacity: 0.2;');
    }
    if(this.strumOn) {
      setTimeout(() => {
        this.strumOn = false;
      }, this.STRUM_TIMEOUT);
    }
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