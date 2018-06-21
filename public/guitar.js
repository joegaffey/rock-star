const guitarTemplate = document.createElement('template');
guitarTemplate.innerHTML = `
<svg class="neck" width="220" height="400" xmlns="http://www.w3.org/2000/svg">
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
    <rect fill="#333" height="100%" width="100%" y="0" x="0" />
    <line y2="400" x2="10" y1="0" x1="10" stroke-width="4" stroke="#bbb" stroke-dasharray="4 0.5" />
    <line y2="400" x2="50" y1="0" x1="50" stroke-width="3.5" stroke="#bbb" stroke-dasharray="4 0.5" />
    <line y2="400" x2="90" y1="0" x1="90" stroke-width="3" stroke="#bbb" stroke-dasharray="4 0.5" />
    <line y2="400" x2="130" y1="0" x1="130" stroke-width="2.5" stroke="#bbb" stroke-dasharray="4 0.5" />
    <line y2="400" x2="170" y1="0" x1="170" stroke-width="2" stroke="#bbb" />
    <line y2="400" x2="210" y1="0" x1="210" stroke-width="1.75" stroke="#bbb" />
  </g>
</svg>
`;

class Guitar {
  constructor(element) {
    var container = document.createElement('span');
    container.appendChild(guitarTemplate.content.cloneNode(true));  
    element.appendChild(container);  
    this.graphics = container.querySelector('g');
    
    this.colors = ['red', 'green', 'blue', 'yellow', 'orange', 'brown'];
    
    this.gNotes = []; // Note graphics (svg)
    this.mNotes = []; // Note music (Tone.js)

    this.windowSize = 2; // Time window in seconds
    this.scale = 50; // Used map note time to graphics - to be tweaked
    this.mNoteIndex = 0; // Current position in track
    
    this.nameToStringMap = { A:0, B:1, C:2, D:3, E:4, F:5, G:5 };      
  }

  update(now) {
    // Update existing notes
    this.gNotes.forEach((note, i) => {
      // Move notes
      let y = (now - note.mNote.time) * this.scale;// * note.mNote.velocity;
      note.setAttribute('y1', note._y1 = y);
      note.setAttribute('y2', note._y2 = y + note.length);

      // Remove notes outside the render area
      if(note._y1 > 420) {
        this.gNotes.splice(i, 1);
        this.graphics.removeChild(note);
      }
    });
    
    // Add new notes within the time window
    let futureNotes = this.mNotes.slice(this.mNoteIndex);
    
    futureNotes.forEach((mNote, i) => {
      if(mNote.time > now && mNote.time < now + this.windowSize && mNote.duration > 0) {
        let string = this.nameToStringMap[mNote.name.substring(0,1)];
        if(mNote.time > 0 && !mNote.added) {
          this.addNote(string * 40 + 10, -1000, mNote.duration * this.scale, this.colors[string], mNote);
          mNote.added = true; // Only add notes once
        }
        this.mNoteIndex = i;
      }
      if(mNote.time > now + this.windowSize)
        return;
    });
  }

  addNote(x, y, length, color, mNote) {
    let note = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    note.setAttribute('x1', x);
    note.setAttribute('y1', y);
    note.setAttribute('x2', x);
    note.setAttribute('y2', y + length);
    note.setAttribute('stroke', color);
    note.setAttribute('stroke-linecap', 'round');
    note.setAttribute('stroke-width', '20');
    note.setAttribute('opacity', 0.5);
    // note.setAttribute('filter', 'url(#glow)');
    note._y1 = y;
    note._y2 = y + length;
    note.length = length;
    note.mNote = mNote;
    this.gNotes.push(note);
    this.graphics.appendChild(note);
  }
}