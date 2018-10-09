import Guitar from './guitar.js';
import Drums from './drums.js';
import Settings from './settings.js';
import Controllers from './controllers.js';
import AppUI from './appui.js';
import Synths from './synths.js';
  
class App {
  
  constructor() {     
    this.songList = [];
    this.instruments = [];
    this.isPaused = false;
    this.isAudioStarted = false;
    this.isSongFinished = true;
    
    this.ui = new AppUI(this);
    this.ui.closeControlsEl.onclick = () => { 
      this.ui.hideCloseIcon();
      this.ui.hideAudioControlIcon();
      this.endSongNoDelay(); 
    };   
        
    this.controllers = new Controllers(this.ui.settingsEl);   
    this.settings = new Settings(this.ui.settingsEl, this.controllers);
    this.settings.onOk = () => this.ui.settingsModal.hide();
    this.settings.onCancel = () => this.ui.settingsModal.hide();    
        
    this.init();
  }
  
  init() {
    this.ui.showLoader();
    fetch('songs.json')
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.songList = data;
        this.ui.showSongs(data, this);
        this.ui.hideLoader();
      });
    
    this.ui.audioControlsEl.onclick = () => {
      if(!this.isAudioStarted) {
        this.ui.showLoader();
        // Workaround to give time for the loader to appear
        setTimeout(() => { 
          this.startAudio(); 
        }, 100);
        
        this.players = 0;
        this.instruments.forEach(instrument => {
          if(instrument.player)
            this.players++;
        });
        this.ui.showCloseIcon();
      }
      else 
        this.isPaused ? this.unPause() : this.pause();
    };
    
    requestAnimationFrame(this.animate.bind(this));
    
    setInterval(() => {
      if(this.players === 0)
        return;
      let gameOver = true; 
      this.settings.players.forEach(player => {
        if(player.instrument && !player.instrument.finished)        
          gameOver = false;
      });
      if(!this.isSongFinished && gameOver) {
        this.endSongNoDelay();
      }
    }, 1000);
  }

  animate() {
    if(this.isAudioStarted && !this.isPaused) {
      this.updateInstruments(Tone.now());
    }
    
    this.settings.players.forEach(player => {
      if(player.instrument) {
        player.instrument.input(this.controllers.getInputStates(player));
      }
    });
    requestAnimationFrame(this.animate.bind(this));
  }

  updateInstruments(now) {
    this.instruments.forEach((inst) => {
      if(inst.update)
         inst.update(now);
    });                      
  }
  
  loadSongData(song, data) {
    this.ui.showLoader();
    this.songData = data;
    
    if(!this.isSongFinished)
      this.endSongNoDelay();
    
    this.currentSong = song;
    this.ui.hideTitle();
    
    console.log('Loading: ' + song.title);  
    document.querySelector('.songTitle').innerHTML = `${song.title} (${song.artist})`;
    
    this.ui.showPlayIcon();
    this.ui.showAudioControlIcon();  
    this.ui.clearInstruments();
    
    this.instruments = [];
    this.bgTracks = [];         
    
    data.tracks.forEach((track, i) => {
      let instrument = null;
      if(data.selectedTracks.includes(track.id)) { //TBD -  ['drums', 'guitar', 'bass'].includes(track.instrumentFamily)
        if(track.instrumentFamily === 'guitar' || track.instrumentFamily === 'bass')
          instrument = new Guitar(this.ui.instrumentsEl, this.settings.players);
        else if(track.instrumentFamily === 'drums')
          instrument = new Drums(this.ui.instrumentsEl, this.settings.players);
      }
      else if(track.instrumentFamily) {
        track.synth = this.familyToSynth(track.instrumentFamily);
        if(track.synth) {
          this.bgTracks.push(track);
          console.log('Background ' + track.instrument + ' track: ' + track.id + ' - ' + track.notes.length + ' notes');
        }
      }
      
      if(instrument) {
        instrument.name = track.instrument;
        instrument.instrumentFamily = track.instrumentFamily;
        instrument.mNotes = track.notes;
        this.instruments.push(instrument);
        console.log('Instrument ' + track.instrument + ' track: ' + track.id + ' - ' + instrument.mNotes.length + ' notes');
      }
    });
    
    this.ui.hideLoader();
  }
  
  familyToSynth(family) {
    const familyToSynthMap = {"drums": "drums", 
                              "bass": "guitar", 
                              "guitar": "guitar", 
                              "reed": "saxophone", 
                              "piano": "piano", 
                              "pipe": "flute" };
    return familyToSynthMap[family];
  }
  
  loadSong(song) {   
    this.ui.showLoader();
    
    MidiConvert.load(song.url, data => {
      this.loadSongData(song, data);
      this.ui.hideLoader();        
    });
  }
  
  getSongData(url, callback) {
    MidiConvert.load(url, data => {
      callback(data);
    });
  }

  startAudio() {
    this.ui.showLoader();
    this.finishedTracks = this.totalTracks = 0;
    this.isSongFinished = false;
    
    Tone.context = new Tone.Context();
    Tone.Transport.bpm.value = this.songData.header.bpm;
    
    this.loadingSynths = 0;    
    this.loadInstruments();
    this.loadBackgroundTracks(); 
  }
  
  loadInstruments() {
    console.log('Loading ' + this.instruments.length + ' instrument(s)');
    this.instruments.forEach((instrument) => {
      if(instrument.player)
        instrument.player.reset();
      console.log('Loading instrument ' + instrument.name + '. ' + instrument.mNotes.length + ' notes.')
      this.loadingSynths++;
      instrument.initSynth(() => { 
        this.onSynthLoad();
      });
      this.totalTracks++;
    });
  }
  
  loadBackgroundTracks() {
    console.log('Loading ' + this.bgTracks.length + ' background track(s)');
    this.bgTracks.forEach((track, i) => {
      
      if(track.notes.length > 0) {
        this.totalTracks++;
        console.log('Loading  background ' + track.instrument + '. ' + track.notes.length + ' notes. Synth: ' + track.synth)
      
        this.loadingSynths++;
        if(['drums', 'guitar', 'bass'].includes(track.synth)) {
          if(track.synth === 'drums')
            track.synth = new Synths().drums(() => { this.onSynthLoad(); });
          else if(['guitar', 'bass'].includes(track.synth)) {
             track.synth = SampleLibrary.load({
                instruments: 'guitar-electric',
                onload: () => { this.onSynthLoad(); },
                minify: true
              }).toMaster();
              // @TODO Why is this not working?
              // track.synth = new Synths().guitar(() => { this.onSynthLoad(); });  
          }            
        }
        else {
          let synth = SampleLibrary.load({
            instruments: track.synth,
            onload: () => { this.onSynthLoad(); },
            minify: true
          });
          track.synth = synth;
          synth.toMaster();    
        }
      }
    });
  }
  
  startInstruments() {
    console.log('Starting ' + this.instruments.length + ' instrument(s)');
    this.instruments.forEach((instrument) => {
      let currentNote = 0;
      instrument.isPlaying = true;
      let midiPart = new Tone.Part((time, note) => {
        note.ready = true;
        
        if(note.gNote && !note.gNote.isPlayerNote)
          instrument.synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        instrument.play(note);
        
        currentNote++;
        if(currentNote >= midiPart.length)
          this.trackFinished();
        
      }, instrument.mNotes).start(+2.5);
    });
  }
  
  startBackgroundTracks() {
    console.log('Starting ' + this.bgTracks.length + ' background track(s)');
    this.bgTracks.forEach((track) => {
      let currentNote = 0;
        let midiPart = new Tone.Part((time, note) => {
          try {
            track.synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
          }
          catch(e) {
            console.log('Error on note:');
            console.log(note);
            console.error(e);
          }
          currentNote++;
          if(currentNote >= midiPart.length)
            this.trackFinished();
        }, track.notes).start(+2.5);  
    });
  }
  
  onSynthLoad() {
    console.log('Loaded synth #' + this.loadingSynths);
    this.loadingSynths--;
    if(this.loadingSynths === 0) {
      Tone.Transport.on('start', () => {
        this.ui.showPauseIcon();
        this.ui.hideLoader();
        this.isAudioStarted = true;
      });  
      this.startBackgroundTracks();
      this.startInstruments();
      Tone.Transport.start('2.5', '0'); 
    }
  }
  
  trackFinished() {
    this.finishedTracks++;
    if(this.finishedTracks >= this.totalTracks)
      this.endSong();
  }
  
  endSong() {
    setTimeout(() => {
      this.endSongNoDelay();
    }, 5000);
  }   
  
  endSongNoDelay() {    
    console.log('Ending song');
    this.settings.players.forEach(player => {
      if(player.instrument) {
        player.instrument.endSong();
        player.instrument = null;
        player.reset();
      }
    });
      
    this.ui.showPlayIcon();
    this.ui.hideCloseIcon();
    this.ui.hideAudioControlIcon();
    
    Tone.Transport.stop(); 
    Tone.Transport.cancel();
    Tone.context.close();
    
    this.instruments = [];
    this.bgTracks = [];
    
    this.isPaused = false;
    this.isAudioStarted = false;
    this.isSongFinished = true;
  }

  pause() {
    this.ui.showPlayIcon();
    Tone.Transport.pause();  
    this.pauseTime = Tone.now();
    this.isPaused = true;
  }

  unPause() {
    this.ui.showPauseIcon();
    Tone.Transport.start(this.pauseTime);
    this.isPaused = false;
  }
}

const app = new App();