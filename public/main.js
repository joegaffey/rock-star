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
    this.isPaused = false;
    this.isAudioStarted = false;
    this.isSongFinished = true;
    
    this.ui = new AppUI();
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
        if(this.currentSong !== 'Practice')
          this.sendGameStart(this.players);
      }
      else 
        this.isPaused ? this.unPause() : this.pause();
    };
    
    requestAnimationFrame(this.animate.bind(this));
    
    let updateTimer = setInterval(() => {
      var stats = [];
      let gameOver = true; 
      this.settings.players.forEach(player => {
        if(player.instrument)
          stats.push(player.avg);
        if(player.instrument && !player.instrument.finished)        
          gameOver = false;
      });
      if(!this.isSongFinished)
        this.sendPlayerStats(stats);  
      if(!this.isSongFinished && this.players > 0 && gameOver) {
        this.endSongNoDelay();
        clearInterval(updateTimer);
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

  sendPlayerStats(stats) {
    if(this.currentSong === 'Practice')
        return;
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
    if(this.currentSong === 'Practice')
        return;
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
    if(this.currentSong === 'Practice')
        return;
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
  
  loadSongData(song, data) {
    this.ui.showPlayIcon();
    this.ui.showAudioControlIcon();  
    this.ui.clearInstruments();
    
    this.instruments = [];
    this.bgTracks = [];          

    song.tracks.forEach((track) => {
      let instrument = null;
      
      if(track.isBackground) {
        let bgTrack = data.tracks[track.id];
        bgTrack.synth = track.synth || track.instrument;
        this.bgTracks.push(bgTrack);
      }
      else if(track.instrument === 'guitar' || track.instrument === 'bass')
        instrument = new Guitar(this.ui.instrumentsEl, this.settings.players);
      else if(track.instrument === 'drums')
        instrument = new Drums(this.ui.instrumentsEl, this.settings.players);
      
      if(instrument) {
        instrument.isPractice = data.tracks[track.id].isPractice;
        instrument.name = data.tracks[track.id].instrument;
        if(!instrument.name)
          instrument.name = track.instrument;
        instrument.mNotes = data.tracks[track.id].notes;
        this.instruments.push(instrument);
        console.log(track.instrument + ' track: ' + track.id + ' - ' + instrument.mNotes.length + ' notes');
      }
    });
  }

  practice() {
    this.ui.showLoader();
    
    if(!this.isSongFinished)
      this.endSongNoDelay();
    
    this.currentSong = 'Practice';
    let song = {};
    song.tracks = [{id: 0, instrument: 'guitar'}, {id: 1, instrument: 'guitar'}, {id: 2, instrument: 'guitar'}, {id: 3, instrument: 'drums'}];
    this.ui.hideTitle();
    
    console.log('Loading: Practice');  
    document.querySelector('.songTitle').innerHTML = `Scales (Practice makes perfect)`;
    
    fetch(SONG_SERVICE_URL + '/practice.json')
      .then(response => {
        return response.json();
      })
      .then(data => {
        data.tracks[0].isPractice = true;
        data.tracks.push(JSON.parse(JSON.stringify(data.tracks[0])));
        data.tracks.push(JSON.parse(JSON.stringify(data.tracks[0])));
        data.tracks.push(JSON.parse(JSON.stringify(data.tracks[0])));
        data.tracks[1].id = 1; data.tracks[1].instrument = 'guitar'; 
        data.tracks[2].id = 2; data.tracks[2].instrument = 'guitar';
        data.tracks[3].id = 3; data.tracks[3].instrument = 'drums';
        data.tracks[3].isPercussion = true;
      
        data.tracks.forEach((track) => {
          let time = 0;
          let delta = 1;
          track.notes.forEach((note) => { note.time = time += (delta *= 0.98); });
        });
        
        this.songData = data;
        this.loadSongData(song, data);
        this.ui.hideLoader();
      }); 
  }

  loadSong(song) {   
    this.ui.showLoader();
    
    if(!this.isSongFinished)
      this.endSongNoDelay();
    
    this.currentSong = song;
    this.ui.hideTitle();
    
    console.log('Loading: ' + song.title);  
    document.querySelector('.songTitle').innerHTML = `${song.title} (${song.artist})`;
    
    fetch(SONG_SERVICE_URL + '/songs/' + song.id)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.songData = data;
        this.loadSongData(song, data);
        this.ui.hideLoader();
      });  
  }

  startAudio() {
    this.ui.showLoader();
    this.finishedTracks = this.totalTracks = 0;
    this.isSongFinished = false;
    
    Tone.context = new Tone.Context();
    Tone.Transport.bpm.value = this.songData.header.bpm;
    
    Tone.Transport.start('2.5', '0');     
    
    console.log('Starting instrument(s)');
    this.startInstruments();
    
    console.log('Starting ' + this.bgTracks.length + ' background track(s)');
    this.startBackgroundTracks();
        
    Tone.Transport.on('start', () => {
      this.ui.showPauseIcon();
      this.ui.hideLoader();
      this.isAudioStarted = true;
    });    
  }
  
  startInstruments() {
    this.instruments.forEach((inst) => {
      inst.initSynth();
      this.totalTracks++;
      let currentNote = 0;
      let midiPart = new Tone.Part((time, note) => {
        note.ready = true;
        
        if(note.gNote && note.gNote.isPlayerNote)
          note.ready = inst.playCheck(note);
        if(note.ready) {
          inst.play(note);
          inst.synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        }
        
        currentNote++;
        if(currentNote >= midiPart.length)
          this.trackFinished();
        
      }, inst.mNotes).start(+2.5);
    });
  }
  
  startBackgroundTracks() {
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
      if(player.instrument)
       player.instrument.endSong();
    });
      
    this.ui.showPlayIcon();
    this.ui.hideCloseIcon();
    
    Tone.Transport.stop(); 
    Tone.Transport.cancel();
    Tone.context.close();
    
    this.instruments = [];
    this.bgTracks = []; 
    
    this.isPaused = false;
    this.isAudioStarted = false;
    this.isSongFinished = true;
    
    this.sendGameEnd();
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