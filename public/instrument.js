import Player from './player.js';

export default class Instrument {    
  constructor(parent) {
    if(!parent)
      throw new Error('You have to accept the parent DOM element as a paramter!');
    this.gNotes = []; // Note graphics
    this.mNotes = []; // Note music (Tone.js)
    this.player = new Player();
  }

  /**
   * Create your instrument synth here as 'this.synth'
   */
  initSynth() {
    throw new Error('You have to implement the method "initSynth"!');
  }
  
  /**
   * Called once per RAF with the current Tone.js time 
   */
  update(now) {
    throw new Error('You have to implement the method "update"!');
  }
  
  /**
   * Called when ever a note is played
   */
  play(note) {
    throw new Error('You have to implement the method "play"!');
  }
}