import Instrument from './instrument.js';

export default class Player {
  
  constructor() {
    this.reset();
  }
  
  reset() {
    this.score = 0;
    this.misses = 0;
    this.hits = 0;
    this.accuracy = 100;
  }
  
  miss() {
    this.misses++;
    this.score -= 25;
    this.instrument.accuracy = this.avg;
  }
  
  hit() {
    this.hits++;
    this.score += 50; 
    this.instrument.accuracy = this.avg;
  }
  
  get avg() {
    if(this.hits + this.misses > 0)
      return Math.round((100 * this.hits) / (this.hits + this.misses));
    else 
      return this.accuracy;
  }
  
  set avg(avg) {
    this.accuracy = avg;
    if(this.instrument)
      this.instrument.accuracy = this.accuracy;
  }
}