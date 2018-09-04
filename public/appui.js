import Modal from './modal.js';

export default class AppUI {
  
  constructor() {
    this.loaderModalEl = document.querySelector('.loaderModal');
    this.controllerEl = document.querySelector('.controllerEl');
    this.instrumentsEl = document.querySelector('.instruments');
    this.songsEl = document.querySelector('.songs');  
    this.songListEl = document.querySelector('.songList');
    this.audioControlsEl = document.querySelector('.audioControl');
    
    this.settingsModal = new Modal(document.querySelector('.settingsModal'));
    const settingsIconEl = document.querySelector('.settingsIcon');
    settingsIconEl.onclick = () => { this.settingsModal.toggle(); };
    
    this.songListModal = new Modal(document.querySelector('.songListModal'));
    const songListIconEl = document.querySelector('.songListIcon');
    songListIconEl.onclick = () => { this.songListModal.toggle(); };
    
    const helpModal = new Modal(document.querySelector('.helpModal'));
    const helpIconEl = document.querySelector('.helpIcon');
    helpIconEl.onclick = () => { helpModal.toggle(); };    
  }
  
  hideLoader() {
    this.loaderModalEl.style.display = 'none';
  }

  showLoader() {
    this.loaderModalEl.style.display = 'flex';
  }
  
  hideTitle() {
    document.querySelector('.title').style.display = 'none';
  }
  
  showPlayIcon() {
    this.audioControlsEl.src = './icons/play.svg';
  }
  
  showPauseIcon() {
    this.audioControlsEl.src = './icons/pause.svg';
  }
  
  showAudioControlIcon() {
    this.audioControlsEl.style.display = 'block';
  }
  
  clearInstruments() {
    this.instrumentsEl.innerHTML = '';
  }
  
  showSongs(songs, app) {
    songs.forEach((song, i) => {
      let li = document.createElement("li");
      li.setAttribute('class', 'songListItem');
      li.innerHTML = `${song.artist} - ${song.title} (${song.tracks.length} tracks)`;
      li.onclick = () => {
        app.loadSong(song);
        this.songListModal.toggle();
      };
      this.songListEl.appendChild(li);
    });
  }
}