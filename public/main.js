// import Guitar from 'guitar.js';

function animate() {
  if(audioOn) {    
    let now = Tone.now();
    updateInstruments(now)
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

let midi = {};
let mNotes = [];
let songList = [];
const instruments = [];
const instrumentsEl = document.querySelector('.instruments');
const songsEl = document.querySelector('.songs');

function updateInstruments(now) {
  instruments.forEach((inst) => {
    if(inst.update)
       inst.update(now);
  });                      
}

fetch('/songs')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    songList = data;
    songList.forEach(song => {
      let button = document.createElement('button');
      button.innerText = song.title;
      button.onclick = () => {
        initSong(song);        
        songsEl.style.display = 'none';
        // document.querySelector('.audioControls').style.visibility = 'visible';
        document.querySelector('.audioControls').style.display = 'block';
      };
      songsEl.appendChild(button);
    });
  });

function initSong(song) {
  console.log('Playing: ' + song.title);  
  fetch('/songs/' + song.id)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      midi = data;
      song.tracks.forEach((track) => {
        let instrument = {};
        if(track.instrument === 'guitar')
          instrument = new Guitar(instrumentsEl);
        instrument.mNotes = midi.tracks[track.id].notes;
        instruments.push(instrument);
        console.log(track.instrument + 
                    ' track: ' + track.id + ' - ' + 
                    instrument.mNotes.length + ' notes');
      });
  });
}

let audioInit = false;
function initAudio() {
  Tone.context = new AudioContext();
  const synth = new Tone.PolySynth(8).toMaster();
  Tone.Transport.bpm.value = midi.header.bpm;
  instruments.forEach((inst) => {
    let midiPart = new Tone.Part(function(time, note) {
      synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, inst.mNotes).start(+2);
  });
  audioInit = true;
}

