import Guitar from './guitar.js';
import Drums from './drums.js';

function animate() {
  if(audioOn)
    updateInstruments(Tone.now());
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

const loaderModalEl = document.querySelector('.loaderModal');
function hideLoader() {
  loaderModalEl.style.display = 'none';
}

function showLoader() {
  loaderModalEl.style.display = 'flex';
}

let midi = {};
let mNotes = [];
let songList = [];
let instruments = [];
const instrumentsEl = document.querySelector('.instruments');
const songsEl = document.querySelector('.songs');  

function loadSong(song) {
  document.querySelector('.title').style.display = 'none';
    showLoader();
    if(audioInit) {
      Tone.Transport.stop(); 
      Tone.Transport.clear();
      instruments = [];
      audioInit = false;
      audioOn = false;
      audioControlsEl.src = './icons/play.svg';
    }
    initSong(song);
    document.querySelector('.audioControl').style.display = 'block';
}

const songListEl = document.querySelector('.songList');

function updateInstruments(now) {
  instruments.forEach((inst) => {
    if(inst.update)
       inst.update(now);
  });                      
}

function inputInstruments(input, state) {
  instruments.forEach((inst) => {
    if(inst.input)
       inst.input(input, state);
  });                      
}

showLoader();
fetch('/songs')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    songList = data;
    songList.forEach((song, i) => {
      let li = document.createElement("li");
      li.setAttribute('class', 'songListItem');
      li.innerHTML = `${song.artist} - ${song.title} (${song.tracks.length} tracks)`;
      li.onclick = () => {
        loadSong(song);
      };
      songListEl.appendChild(li);
    });
    hideLoader();
  });

function initSong(song) {
  instrumentsEl.innerHTML = '';
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
      hideLoader();
    });
}

const audioControlsEl = document.querySelector('.audioControl');

let audioOn = false;
let audioInit = false;
function initAudio() {
  showLoader();
  audioOn = true;    
  Tone.context = new AudioContext();
  Tone.Transport.bpm.value = midi.header.bpm;
  instruments.forEach((inst) => {
    inst.initSynth();
    let midiPart = new Tone.Part(function(time, note) {
      note.ready = true;
      if(note.gNote && note.gNote.isPlayerNote)
        note.ready = inst.playCheck(note.gNote);
      if(note.ready) {
        inst.play(note);
        inst.synth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
      }
    }, inst.mNotes).start(+2.5);
  });
  Tone.Transport.on('start', () => {
    audioControlsEl.src = './icons/pause.svg';
    hideLoader();
  });
  Tone.Transport.start('2.5', '0'); 
  audioInit = true;
}

audioControlsEl.onclick = (event) => {
  if(!audioInit) {
    showLoader();
    // Workaround to give time for the loader to appear
    setTimeout(() => { 
      initAudio();    
    }, 100);
  }
  else 
    audioOn ? pause() : play();
};

var pauseTime = 0;
function pause() {
  audioControlsEl.src = './icons/play.svg';
  Tone.Transport.pause();  
  pauseTime = Tone.now();
  audioOn = false;
}

function play() {
  audioControlsEl.src = './icons/pause.svg';
  Tone.Transport.start(pauseTime); 
  audioOn = true;
}

window.addEventListener('keydown', function (e) {
  if(e.keyCode === 81) {
    inputInstruments(0, true);
  }
  else if(e.keyCode === 87) {
    inputInstruments(1, true);
  }
  else if(e.keyCode === 69) {
    inputInstruments(2, true);
  }
  else if(e.keyCode === 82) {
    inputInstruments(3, true);
  }
  else if(e.keyCode === 84) {
    inputInstruments(4, true);
  }
});

window.addEventListener('keyup', function (e) {
  if(e.keyCode === 81) {
    inputInstruments(0, false);
  }
  else if(e.keyCode === 87) {
    inputInstruments(1, false);
  }
  else if(e.keyCode === 69) {
    inputInstruments(2, false);
  }
  else if(e.keyCode === 82) {
    inputInstruments(3, false);
  }
  else if(e.keyCode === 84) {
    inputInstruments(4, false);
  }
});

const helpIconEl = document.querySelector('.helpIcon');
var helpModalEl = document.querySelector('.helpModal');
var helpOnScreen = false;
helpIconEl.onclick = helpModalEl.onclick = () => {
  if(helpOnScreen) {
    helpModalEl.style.display = 'none';
    helpOnScreen = false;
  }
  else {
    helpModalEl.style.display = 'flex';
    helpOnScreen = true;
  }  
}

const settingsIconEl = document.querySelector('.settingsIcon');
var settingsModalEl = document.querySelector('.settingsModal');
var settingsOnScreen = false;
settingsIconEl.onclick = settingsModalEl.onclick = () => {
  if(settingsOnScreen) {
    settingsModalEl.style.display = 'none';
    settingsOnScreen = false;
  }
  else {
    settingsModalEl.style.display = 'flex';
    settingsOnScreen = true;
  }  
}

const songListIconEl = document.querySelector('.songListIcon');
var songListModalEl = document.querySelector('.songListModal');
var songListOnScreen = false;
songListIconEl.onclick = songListModalEl.onclick = () => {
  if(songListOnScreen) {
    songListModalEl.style.display = 'none';
    songListOnScreen = false;
  }
  else {
    songListModalEl.style.display = 'flex';
    songListOnScreen = true;
  }  
}