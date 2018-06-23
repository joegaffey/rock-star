import Instrument from './instrument.js';

const guitarTemplate = document.createElement('template');
guitarTemplate.innerHTML = `
<svg class="neck" width="200" height="400" xmlns="http://www.w3.org/2000/svg">
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
    <rect fill="#555" height="325" width="166" y="0" x="17.5" />
    <rect fill="#555" height="400" width="17.5" y="0" x="0" />
    <rect fill="#555" height="400" width="17.5" y="0" x="182.5" />
    <line y2="400" x2="33" y1="0" x1="33" stroke-width="4" stroke="#aaa" stroke-dasharray="4 0.5" />
    <line y2="400" x2="66" y1="0" x1="66" stroke-width="3.5" stroke="#aaa" stroke-dasharray="4 0.5" />
    <line y2="400" x2="99" y1="0" x1="99" stroke-width="3" stroke="#aaa" stroke-dasharray="4 0.5" />
    <line y2="400" x2="132" y1="0" x1="132" stroke-width="2.5" stroke="#aaa" stroke-dasharray="4 0.5" />
    <line y2="400" x2="165" y1="0" x1="165" stroke-width="2" stroke="#aaa" />
    <rect class="control" fill="green" height="75" width="33" y="325" x="17.5" style="fill-opacity: .25;" />
    <rect class="control" fill="red" height="75" width="33" y="325" x="50.5" style="fill-opacity: .25;" />
    <rect class="control" fill="yellow" height="75" width="33" y="325" x="83.5" style="fill-opacity: .25;" />
    <rect class="control" fill="blue" height="75" width="33" y="325" x="117" style="fill-opacity: .25;" />
    <rect class="control" fill="orange" height="75" width="33" y="325" x="150.5" style="fill-opacity: .25;" />
  </g>
</svg>
`;

export default class Guitar extends Instrument {
  constructor(parent) {
    super(parent)
    let container = document.createElement('span');
    container.appendChild(guitarTemplate.content.cloneNode(true));  
    parent.appendChild(container);  
    this.graphics = container.querySelector('g');
    
    this.colors = ['green', 'red', 'yellow', 'blue', 'orange'];
    
    this.windowSize = 2; // Time window in seconds
    this.scale = 50; // Used map note time to graphics - to be tweaked
    this.mNoteIndex = 0; // Current position in track
    this.offset = 75;
    
    this.noteToStringMap = { A:0, B:1, C:2, D:2, E:3, F:3, G:4 };   
    this.controls = this.graphics.querySelectorAll('.control');
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
    this.synth = new Tone.PolySynth(8).toMaster(); // Temporary
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
          this.addNote(string * 33 + 33, -1000, mNote.duration * this.scale, this.colors[string], mNote);
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
    gNote.setAttribute('opacity', 0.1);
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
      this.controls[input].setAttribute('style', 'opacity: 0.25;');
    }, 200);
  }
}