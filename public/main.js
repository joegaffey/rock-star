import Guitar from './guitar.js';
import Drums from './drums.js';

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
        let instrument = null;
        if(track.instrument === 'guitar' || track.instrument === 'bass')
          instrument = new Guitar(instrumentsEl);
        else if(track.instrument === 'drums')
          instrument = new Drums(instrumentsEl);
        if(instrument) {
          instrument.mNotes = midi.tracks[track.id].notes;
          instruments.push(instrument);
          console.log(track.instrument + 
                      ' track: ' + track.id + ' - ' + 
                      instrument.mNotes.length + ' notes');
        }
      });
  });
}

let audioOn = false;
let audioInit = false;
function initAudio() {
  Tone.context = new AudioContext();
  Tone.Transport.bpm.value = midi.header.bpm;
  instruments.forEach((inst) => {
    inst.initSynth();
    let midiPart = new Tone.Part(function(time, note) {
      note.ready = true; // TBD add player mechabnism to make note ready
      if(note.ready) {
        inst.play(note);
        inst.synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
      }
    }, inst.mNotes).start(+2.5);
  });
  Tone.Transport.start('2.5', '0'); 
  audioInit = true;
  audioOn = true;
  img.src = './audioOff.svg';
}

const audioControlsEl = document.querySelector('.audioControls');
let img = audioControlsEl.children[0];

audioControlsEl.onclick = (event) => {
  if(!audioInit) 
    initAudio();
  else 
    toggleAudio();
};

function toggleAudio() {
    if(audioOn) {
    audioOn = false;
    Tone.Transport.pause();
    img.src = './audioOn.svg';
  }
  else {
    audioOn = true;
    Tone.Transport.start(); 
    img.src = './audioOff.svg';
  }
}