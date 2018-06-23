import Instrument from './instrument.js';

const guitarTemplate = document.createElement('template');
guitarTemplate.innerHTML = `
<svg class="guitar" width="250" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow">
      <fegaussianblur class="blur" result="coloredBlur" stddeviation="4"></fegaussianblur>
      <femerge>
        <femergenode in="coloredBlur"></femergenode>
        <femergenode in="coloredBlur"></femergenode>
        <femergenode in="coloredBlur"></femergenode>
        <femergenode in="SourceGraphic"></femergenode>
      </femerge>
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
`;

export default class Guitar extends Instrument {
  constructor(parent) {
    super(parent)
    let container = document.createElement('div');
    container.appendChild(guitarTemplate.content.cloneNode(true));  
    parent.appendChild(container);  
    this.graphics = container.querySelector('g');
    
    this.colors = ['green', 'red', 'yellow', 'blue', 'orange'];
    
    this.windowSize = 2; // Time window in seconds
    this.scale = 50; // Used map note time to graphics - to be tweaked
    this.mNoteIndex = 0; // Current position in track
    this.offset = 75;
    
    this.noteToStringMap = { D:0, E:1, F:2, G:2, A:3, B:3, C:4 };   
    this.controls = this.graphics.querySelectorAll('.control');
  }
  
  initSynth() {    
    var dist = new Tone.Distortion(0.8).toMaster();
    this.synth = new Tone.Sampler({
    			'A2' : '43fbe471-8cab-46e5-9cd2-71eff7d8132c%2FOpen_A2.mp3?1529785372303',
    			'B3' : '43fbe471-8cab-46e5-9cd2-71eff7d8132c%2FOpen_B3.mp3?1529785369046',
    			'D3' : '43fbe471-8cab-46e5-9cd2-71eff7d8132c%2FOpen_D3.mp3?1529785364968',
    			'E2' : '43fbe471-8cab-46e5-9cd2-71eff7d8132c%2FOpen_E2.mp3?1529785369821',
    			'E4' : '43fbe471-8cab-46e5-9cd2-71eff7d8132c%2FOpen_E4.mp3?1529785366528',
    			'G3' : '43fbe471-8cab-46e5-9cd2-71eff7d8132c%2FOpen_G3.mp3?1529785361509'
    		}, {
    			'release' : 1,
    			'baseUrl' : 'https://cdn.glitch.com/'
    		}).toMaster().connect(dist);
    // this.synth = new Tone.PolySynth(8).toMaster(); // alt synth for testing
  }

  update(now) {
    // Update existing notes
    this.gNotes.forEach((note, i) => {
      // Move notes
      let y = (now - note.mNote.time) * this.scale;// * note.mNote.velocity;
      note.setAttribute('y1', note._y1 = y + this.offset);
      note.setAttribute('y2', note._y2 = y + this.offset - note.length);
      note.gNoteCentre.setAttribute('cy', y + this.offset);
      
      // Remove notes outside the render area
      if(note._y1 - note.length > 420) {
        this.gNotes.splice(i, 1);
        this.graphics.removeChild(note);
        this.graphics.removeChild(note.gNoteCentre);
      }
    });
    
    // Add new notes within the time window
    let futureNotes = this.mNotes.slice(this.mNoteIndex);
    
    futureNotes.forEach((mNote, i) => {
      if(mNote.time > now && mNote.time < now + this.windowSize && mNote.duration > 0) {
        let string = this.noteToStringMap[mNote.name.substring(0,1)]; // First charter of note only
        if(mNote.time > 0 && !mNote.added) {
          this.addNote(string * 50 + 25, -1000, mNote.duration * this.scale, this.colors[string], mNote);
          mNote.added = true; // Only add notes once
        }
        this.mNoteIndex = i;
      }
      if(mNote.time > now + this.windowSize)
        return;
    });
  }

  addNote(x, y, length, color, mNote) {
    let gNote = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gNote.setAttribute('x1', x);
    gNote.setAttribute('y1', y);
    gNote.setAttribute('x2', x);
    gNote.setAttribute('y2', y - length);
    gNote.setAttribute('stroke', color);
    gNote.setAttribute('stroke-linecap', 'round');
    gNote.setAttribute('stroke-width', '30');
    gNote.setAttribute('opacity', 0.3);
    // gNote.setAttribute('style', 'filter: url(#glow);');
    gNote._y1 = y;
    gNote._y2 = y + length;
    gNote.length = length;
    gNote.mNote = mNote;
    mNote.gNote = gNote;
    
    let gNoteCentre = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    gNoteCentre.setAttribute('cx', x);
    gNoteCentre.setAttribute('cy', y);
    gNoteCentre.setAttribute('r', '3');
    gNoteCentre.setAttribute('fill', color); 
    gNote.gNoteCentre = gNoteCentre;
        
    this.gNotes.push(gNote);
    this.graphics.appendChild(gNote);
    this.graphics.appendChild(gNoteCentre);        
  }
  
  play(note) {
    if(note.gNote)
      note.gNote.setAttribute('opacity', '0.6');
  }
  
  input(input) {
    this.controls[input].setAttribute('style', 'opacity: 0.75;');
    setTimeout(() => {
      this.controls[input].setAttribute('style', 'opacity: 0.5;');
    }, 200);
  }
}