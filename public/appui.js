import Modal from './modal.js';
import BarChart from './barchart.js';

export default class AppUI {
  
  constructor() {
    this.loaderModalEl = document.querySelector('.loaderModal');
    this.settingsEl = document.querySelector('.settingsEl');
    this.instrumentsEl = document.querySelector('.instruments');
    this.songsEl = document.querySelector('.songs');  
    this.songListEl = document.querySelector('.songList');
    this.instrumentListEl = document.querySelector('.instrumentList');
    this.audioControlsEl = document.querySelector('.audioControl');
    this.closeControlsEl = document.querySelector('.closeControl');
    
    this.instrumentListModal = new Modal(document.querySelector('.instrumentListModal'));
    
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
  
  showCloseIcon() {
    this.closeControlsEl.style.display = 'block';
  }
  
  hideCloseIcon() {
    this.closeControlsEl.style.display = 'none';
  }
  
  showPauseIcon() {
    this.audioControlsEl.src = './icons/pause.svg';
  }
  
  showAudioControlIcon() {
    this.audioControlsEl.style.display = 'block';
  }
  
  hideAudioControlIcon() {
    this.audioControlsEl.style.display = 'none';
  }
  
  clearInstruments() {
    this.instrumentsEl.innerHTML = '';
  }
  
  showSongs(songs, app) {
    songs.forEach((song, i) => {
      let li = document.createElement("li");
      li.setAttribute('class', 'songListItem');
      li.innerHTML = `${song.artist} - ${song.title} (${this.secondsToMinutesAndSeconds(song.duration)})`;
      li.onclick = () => {
        app.loadSong(song);
        this.songListModal.hide();
        // this.instrumentListModal.show();
        // app.getSongData(song.url, this.showInstrumentList.bind(this));
      };
      this.songListEl.appendChild(li);
    });
  }
  
  showInstrumentList(data) {
    let supportedInstruments = ['guitar', 'bass', 'drums'];
    
    data.tracks.forEach((track, i) => {
      if(supportedInstruments.includes(track.instrumentFamily)) {
        let li = document.createElement("li");
        li.setAttribute('class', 'instrumentListItem');
        li.innerHTML = `<select>
                          <option>Unassigned</option>
                          <option>Computer</option>
                          <option>Player 1</option>
                          <option>Player 2</option>
                          <option>Player 3</option>
                          <option>Player 4</option>
                        </select>
                        ${track.instrumentFamily} - ${track.instrument}
                        <br/>
                        <canvas class="barChart" width=300 height=30></canvas>`;
        console.log(li.querySelector('.barChart'))
        let canvas = li.querySelector('.barChart');
        new BarChart(canvas, [10,20,30,40,50,60,70,80], 'red');
        this.instrumentListEl.appendChild(li);
      }
    });
  }
  
  secondsToMinutesAndSeconds(duration) {
    let minutes = Math.floor(duration / 60);
    let seconds = Math.round(duration - (minutes * 60));
    return `${minutes}:${seconds}`;
  }
}