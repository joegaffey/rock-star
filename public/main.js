import Guitar from './guitar.js';
import Drums from './drums.js';
import Settings from './settings.js';
import Controllers from './controllers.js';
import Keyboard from './keyboard.js';
import AppUI from './appui.js';

const SONG_SERVICE_URL = '';
const STATS_SERVICE_URL = '';
  
class App {
  
  constructor() {     
    this.songList = [];
    this.instruments = [];
    this.isPlaying = false;
    this.audioInit = false;
    
    this.ui = new AppUI();
    
    this.controllers = new Controllers(this.ui.settingsEl);
    // this.controllers.onOk = () => this.ui.controllerModal.hide();
    // this.controllers.onCancel = () => this.ui.controllerModal.hide();
    // this.ui.controllerModal.onOpen = () => { this.controllers.refresh(); };
    
    this.settings = new Settings(this.ui.settingsEl, this.controllers);
    this.settings.onOk = () => this.ui.settingsModal.hide();
    this.settings.onCancel = () => this.ui.settingsModal.hide();
    
    
    const keyboard = new Keyboard();
    keyboard.onKeyDown = keyboard.onKeyUp = (input, state) => {
      this.inputInstruments(input, state)
    };       
    this.init();
  }
  
  init() {
    this.ui.showLoader();
    fetch(SONG_SERVICE_URL + '/songs')
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.songList = data;
        this.ui.showSongs(data, this);
        this.ui.hideLoader();
      });
    
    this.ui.audioControlsEl.onclick = () => {
      if(!this.audioInit) {
        this.ui.showLoader();
        // Workaround to give time for the loader to appear
        setTimeout(() => { 
          this.initAudio();    
        }, 100);
      }
      else 
        this.isPlaying ? this.pause() : this.play();
    };
    
    requestAnimationFrame(this.animate.bind(this));
    
    setInterval(() => {
      var stats = [];
      this.instruments.forEach(instrument => {
        stats.push(instrument.player.avg);
      });
      this.sendPlayerStats(stats);  
    }, 2000);
  }

  animate() {
    if(this.isPlaying)
      this.updateInstruments(Tone.now());
    for(let i in this.controllers.selectedControllers) {
      let input = this.controllers.checkAssignedControllers(i);
      this.inputInstruments(0, input[0]);
      this.inputInstruments(1, input[1]);
      this.inputInstruments(2, input[2]);
      this.inputInstruments(3, input[3]);
      this.inputInstruments(4, input[4]);
    }
    requestAnimationFrame(this.animate.bind(this));
  }

  sendPlayerStats(stats) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var init = {
      method: 'PUT',
      body: JSON.stringify(stats),
      headers: headers
    };
    var request = new Request(STATS_SERVICE_URL + '/metrics/players', init);  
    fetch(request);
  }

  loadSong(song) {
    this.ui.hideTitle();
    this.ui.showLoader();
    if(this.audioInit) {
      Tone.Transport.stop(); 
      Tone.Transport.clear();
      this.instruments = [];
      this.audioInit = false;
      this.isPlaying = false;
      this.ui.showPlayIcon();
    }
    this.initSong(song);
    this.ui.showAudioControlIcon();    
  }

  updateInstruments(now) {
    this.instruments.forEach((inst) => {
      if(inst.update)
         inst.update(now);
    });                      
  }

  inputInstruments(input, state) {
    this.instruments.forEach((inst) => {
      if(inst.input)
         inst.input(input, state);
    });                      
  }

  initSong(song) {
    this.ui.clearInstruments();
    console.log('Playing: ' + song.title);  
    fetch(SONG_SERVICE_URL + '/songs/' + song.id)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.instruments = [];
        Tone.Transport.bpm.value = data.header.bpm;
        song.tracks.forEach((track) => {
          let instrument = null;
          if(track.instrument === 'guitar' || track.instrument === 'bass')
            instrument = new Guitar(this.ui.instrumentsEl);
          else if(track.instrument === 'drums')
            instrument = new Drums(this.ui.instrumentsEl);
          if(instrument) {
            instrument.mNotes = data.tracks[track.id].notes;
            this.instruments.push(instrument);
            console.log(track.instrument + 
                        ' track: ' + track.id + ' - ' + 
                        instrument.mNotes.length + ' notes');
          }
        });
        this.ui.hideLoader();
      });
  }

  initAudio() {
    this.ui.showLoader();
    Tone.context = new AudioContext();
    this.instruments.forEach((inst) => {
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
    this.audioInit = true;
    
    Tone.Transport.on('start', () => {
      this.ui.showPauseIcon();
      this.ui.hideLoader();
    });
    Tone.Transport.start('2.5', '0'); 
    this.isPlaying = true;
  }

  pause() {
    this.ui.showPlayIcon();
    Tone.Transport.pause();  
    this.pauseTime = Tone.now();
    this.isPlaying = false;
  }

  play() {
    this.ui.showPauseIcon();
    Tone.Transport.start(this.pauseTime); 
    this.isPlaying = true;
  }
}

const app = new App();