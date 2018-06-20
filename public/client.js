const ns = 'http://www.w3.org/2000/svg';
const svgElement = document.querySelector('.neck');
const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'brown'];
const notes = [];

function addNote(x, y, length, color, mNote) {
    let note = document.createElementNS(ns, 'line');
    note.setAttribute('x1', x);
    note.setAttribute('y1', y);
    note.setAttribute('x2', x);
    note.setAttribute('y2', y + length);
    note.setAttribute('stroke', color);
    note.setAttribute('stroke-linecap', 'round');
    note.setAttribute('stroke-width', '20');
    note._y1 = y;
    note._y2 = y + length;
    note.length = length;
    note.mNote = mNote;
    notes.push(note);
    svgElement.appendChild(note);
}

const windowSize = 2;
const scale = 50;
let nameToStringMap = { A:0, B:1, C:2, D:3, E:4, F:5, G:5 };  
let mNoteIndex = -1;
function animate() {
  if(audioOn) {    
    // console.log(notes.length + ' graphical notes');
    let now = Tone.now();
    
    // Add new notes within the time window
    mNotes.forEach((mNote, i) => {
      // console.log(now + ' ' + mNote.time);
      if(i > mNoteIndex && mNote.time > now && mNote.time < now + windowSize) {
        // console.log(mNote.name + ' added. Duration ' + mNote.duration);
        let string = nameToStringMap[mNote.name.substring(0,1)];
        if(mNote.time > 0) 
          addNote(string * 40 + 10, -1000, mNote.duration * scale, colors[string], mNote);
        mNoteIndex = i;
      }
    });

    // Move notes
    notes.forEach((note, i) => {
      let y = (now - note.mNote.time) * scale * note.mNote.velocity;
      note.setAttribute('y1', note._y1 = y);
      note.setAttribute('y2', note._y2 = y + note.length);

      // Remove notes outside the render area
      if(note._y1 > 420)
          notes.splice(i, 1);
    });
  }
  requestAnimationFrame(animate);
}

let midi = {};

let mNotes;
fetch('/songs/latest')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    midi = data;
    mNotes = midi.tracks[2].notes;
    console.log(mNotes.length + ' notes in track');
    initAudio();
  });

let audioOn = false;
const audioControlsEl = document.querySelector('.audioControls');
audioControlsEl.onclick = (event) => {
  if(!audioInit) {
    initAudio();
    audioOn = true;
    Tone.Transport.start("0", "0"); 
    audioControlsEl.children[1].style.display = 'block';  
    audioControlsEl.children[0].style.display = 'none';
    return;
  }
  if(audioOn) {
    audioOn = false;
    Tone.Transport.pause();
    audioControlsEl.children[1].style.display = 'none';
    audioControlsEl.children[0].style.display = 'block';
  }
  else {
    audioOn = true;
    Tone.Transport.start(); 
    audioControlsEl.children[1].style.display = 'block';  
    audioControlsEl.children[0].style.display = 'none';
  }
};

let audioInit = false;
function initAudio() {
  Tone.context = new AudioContext();
  const synth = new Tone.PolySynth(8).toMaster();
  Tone.Transport.bpm.value = midi.header.bpm;
	let midiPart = new Tone.Part(function(time, note) {
    synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
	}, mNotes).start(+2);
  audioInit = true;
  requestAnimationFrame(animate);
}
