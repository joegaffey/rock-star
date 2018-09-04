import Instrument from './instrument.js';

export default class Player {
  
  constructor() {
    this.controller = null; //@TODO
    this.instrument = null; //@TODO
    
    this.score = 0;
    this.misses = 0;
    this.hits = 0;
  }
  
  miss() {
    this.misses++;
    this.score -= 25;
  }
  
  hit() {
    this.hits++;
    this.score += 50; 
  }
  
  get avg() {
    if(this.hits + this.misses === 0)
      return 0;
    else 
      return Math.round((100 * this.hits) / (this.hits + this.misses));
  }
}