import Guitar from './guitar.js';
import Drums from './drums.js';
import Settings from './settings.js';
import Controllers from './controllers.js';
// import Keyboard from './keyboard.js';
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
    this.ui.closeControlsEl.onclick = () => { 
      this.ui.hideCloseIcon();
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
        
        let players = 0;
        this.instruments.forEach(instrument => {
          if(instrument.player)
            players++;
        });
        this.ui.showCloseIcon();
        this.sendGameStart(players);
      }
      else 
        this.isPlaying ? this.pause() : this.play();
    };
    
    requestAnimationFrame(this.animate.bind(this));
    
    setInterval(() => {
      var stats = [];
      this.settings.players.forEach(player => {
        stats.push(player.avg);
      });
      this.sendPlayerStats(stats);  
    }, 2000);
  }

  animate() {
    if(this.isPlaying)
      this.updateInstruments(Tone.now());
    this.settings.players.forEach(player => {
      if(player.instrument && player.controllerId) {        
        this.controllers.getInputStates(player).forEach((state, i) => {
          player.instrument.input(i, state);
        });
      }
    });
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
  
  sendGameStart(players) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var init = {
      method: 'POST',
      body: JSON.stringify({playerCount: players}),
      headers: headers
    };
    var request = new Request(STATS_SERVICE_URL + '/games', init);  
    fetch(request);
  }
  
  sendGameEnd() {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var init = {
      method: 'PUT',
      body: JSON.stringify({ action: 'end' }),
      headers: headers
    };
    var request = new Request(STATS_SERVICE_URL + '/games', init);  
    fetch(request);
  }

  updateInstruments(now) {
    this.instruments.forEach((inst) => {
      if(inst.update)
         inst.update(now);
    });                      
  }

  loadSong(song) {
    this.currentSong = song;
    this.ui.hideTitle();
    this.ui.showLoader();
    this.ui.showPlayIcon();
    this.ui.showAudioControlIcon();  
    this.ui.clearInstruments();
    
    Tone.Transport.stop(); 
    Tone.Transport.clear();
    
    this.instruments = [];
    this.bgTracks = [];
    this.audioInit = false;
    this.isPlaying = false;
    
    console.log('Playing: ' + song.title);  
    fetch(SONG_SERVICE_URL + '/songs/' + song.id)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.instruments = [];
        this.bgTracks = [];
        Tone.Transport.bpm.value = data.header.bpm;
        song.tracks.forEach((track) => {
          let instrument = null;
          if(track.instrument === 'guitar' || track.instrument === 'bass')
            instrument = new Guitar(this.ui.instrumentsEl, this.settings.players);
          else if(track.instrument === 'drums')
            instrument = new Drums(this.ui.instrumentsEl, this.settings.players);
          if(instrument) {
            instrument.name = data.tracks[track.id].instrument;
            if(!instrument.name)
              instrument.name = track.instrument;
            instrument.mNotes = data.tracks[track.id].notes;
            this.instruments.push(instrument);
            console.log(track.instrument + ' track: ' + track.id + ' - ' + instrument.mNotes.length + ' notes');
          }
          else {
            let bgTrack = data.tracks[track.id];
            bgTrack.synth = track.synth;
            this.bgTracks.push(bgTrack);
          }
        });
        document.querySelector('.songTitle').innerHTML = `${song.title} (${song.artist})`;
        this.ui.hideLoader();
      });  
  }

  initAudio() {
    this.ui.showLoader();
    Tone.context = new AudioContext();
    
    this.finishedTracks = this.totalTracks = 0;
    
    this.instruments.forEach((inst) => {
      inst.initSynth();
      this.totalTracks++;
      let currentNote = 0;
      let midiPart = new Tone.Part((time, note) => {
        note.ready = true;
        
        if(note.gNote && note.gNote.isPlayerNote)
          note.ready = inst.playCheck(note.gNote);
        if(note.ready) {
          inst.play(note);
          inst.synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        }
        
        currentNote++;
        if(currentNote >= midiPart.length)
          this.trackFinished();
        
      }, inst.mNotes).start(+2.5);
    });
    
    console.log(this.bgTracks.length + ' background track(s)');
    
    this.bgTracks.forEach((track, i) => {
      this.totalTracks++;
      console.log(track.instrument + ' ' + track.notes.length + ' notes. Synth: ' + track.synth)
      
      let synth = SampleLibrary.load({
        instruments: track.synth,
        minify: true
      });
      synth.toMaster();
      let currentNote = 0;
      let midiPart = new Tone.Part((time, note) => {
        try {
          synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
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
        
    this.audioInit = true;
    
    Tone.Transport.on('start', () => {
      this.ui.showPauseIcon();
      this.ui.hideLoader();
    });
    
    Tone.Transport.start('2.5', '0'); 
    this.isPlaying = true;
  }
  
  trackFinished() {
    this.finishedTracks++;
    if(this.finishedTracks >= this.totalTracks) {
      this.endSong();
      this.ui.hideCloseIcon();
    }
  }
  
  endSong() {
    setTimeout(() => {
      this.endSongNoDelay();
    }, 5000);
  }   
  
  endSongNoDelay() {
    
    this.settings.players.forEach(player => {
      if(player.instrument)
       player.instrument.endSong();
    });
      
    this.ui.showPlayIcon();
    
    Tone.Transport.stop(); 
    Tone.Transport.clear();
    this.audioInit = false;
    
    this.instruments = [];
    this.bgTracks = []; 
    this.isPlaying = false;
    this.songFinished = true;

    // this.settings.players.forEach(player => {
    //   player.instrument = null;
    // });
    this.sendGameEnd();
  }

  pause() {
    this.ui.showPlayIcon();
    Tone.Transport.stop();  
    this.pauseTime = Tone.now();
    this.isPlaying = false;
  }

  play() {
    this.ui.showPauseIcon();
    if(this.pauseTime > 0)
      Tone.Transport.start(this.pauseTime); 
    else 
      Tone.Transport.start('2.5', '0'); 
    this.isPlaying = true;
  }
}

const app = new App();