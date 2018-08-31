import Guitar from './guitar.js';
import Drums from './drums.js';
import Controllers from './controllers.js';
import Modal from './modal.js';
import Keyboard from './keyboard.js';

function animate() {
  if(audioOn)
    updateInstruments(Tone.now());
  for(let i in controllers.ctrls) {
    let input = controllers.checkAssigned(i);
    inputInstruments(0, input[0]);
    inputInstruments(1, input[1]);
    inputInstruments(2, input[2]);
    inputInstruments(3, input[3]);
    inputInstruments(4, input[4]);
  }
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

setInterval(() => {
  var stats = [];
  instruments.forEach(instrument => {
    stats.push(instrument.player.avg);
  });
  sendPlayerStats(stats);  
}, 2000);

function sendPlayerStats(stats) {
  var headers = new Headers();
  headers.append('Content-Type', 'application/json');
  var init = {
    method: 'PUT',
    body: JSON.stringify(stats),
    headers: headers
  };
  var request = new Request('/metrics/players', init);  
  fetch(request);
}

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

const keyboard = new Keyboard();
keyboard.onKeyDown = keyboard.onKeyUp = (input, state) => {
  inputInstruments(input, state)
};

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
        songListModal.toggle();
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
      instruments = [];
      Tone.Transport.bpm.value = data.header.bpm;
      song.tracks.forEach((track) => {
        let instrument = null;
        if(track.instrument === 'guitar' || track.instrument === 'bass')
          instrument = new Guitar(instrumentsEl);
        else if(track.instrument === 'drums')
          instrument = new Drums(instrumentsEl);
        if(instrument) {
          instrument.mNotes = data.tracks[track.id].notes;
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

const helpModal = new Modal(document.querySelector('.helpModal'));
const helpIconEl = document.querySelector('.helpIcon');
helpIconEl.onclick = () => { helpModal.toggle(); };

const controllerEl = document.querySelector('.controllerEl');
let controllers = new Controllers(controllerEl);

const settingsModal = new Modal(document.querySelector('.settingsModal'));
settingsModal.onOpen = () => { controllers.refresh(); };
const settingsIconEl = document.querySelector('.settingsIcon');
settingsIconEl.onclick = () => { settingsModal.toggle(); };

const songListModal = new Modal(document.querySelector('.songListModal'));
const songListIconEl = document.querySelector('.songListIcon');
songListIconEl.onclick = () => { songListModal.toggle(); };