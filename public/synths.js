export default class Synths {
  
  constructor() {}
  
  guitar(instrumentFamily, callback) {
    let sound = guitarPresets.rock;      
    
    let gainIn = new Tone.Gain();
    let distortion = new Tone.Distortion();
    let feedbackDelay = new Tone.FeedbackDelay();
    let tremolo = new Tone.Tremolo().start();
    let reverb = new Tone.JCReverb();
    let chorus = new Tone.Chorus();
    
    gainIn.gain.value = sound.gainIn;
    distortion.wet.value = sound.distWet;
    distortion.distortion = sound.distDirt;
    feedbackDelay.wet.value = sound.delayWet;
    feedbackDelay.delayTime.value = sound.delayTime;
    feedbackDelay.feedback.value = sound.delayFeedback;
    tremolo.wet.value = sound.tremWet;
    tremolo.frequency.value = sound.tremFreq * 10;
    tremolo.depth.value = sound.tremDepth;
    reverb.wet.value = sound.verbWet;
    reverb.roomSize.value = sound.verbRoom;
    chorus.wet.value = sound.chorusWet;
    chorus.frequency.value = sound.chorusFreq * 5;
    chorus.depth = sound.chorusDepth;
    
    let instrument = 'guitar-electric'; 
    // if(instrumentFamily === 'bass')
    //   instrument = 'bass-electric';
    
    let synth = SampleLibrary.load({
        instruments: instrument,
        onload: () => { callback.call(); },
        minify: true
      });
      synth.chain(
        gainIn,
        distortion,
        tremolo,
        chorus,
        feedbackDelay,
        reverb,
        Tone.Master
      );
    return synth;
  }
  
  drums(callback) {
    return new Tone.Sampler({
      'B0'  : 'Acoustic Bass Drum.wav',
      'C1'  : 'Bass Drum 1.wav',
      'C#1' : 'Side Stick.wav',
      'D1'  : 'Acoustic Snare.wav',
      'Eb1' : 'Hand Clap.wav',
      'E1'  : 'Electric Snare.wav',
      'F1'  : 'Low Floor Tom.wav',
      'F#1' : 'Closed Hi Hat.wav',
      'G1'  : 'High Floor Tom.wav',
      'Ab1' : 'Pedal Hi-Hat.wav',
      'A1'  : 'Low Tom.wav',
      'Bb1' : 'Open Hi-Hat.wav',
      'B1'  : 'Low-Mid Tom.wav',
      'C2'  : 'Hi Mid Tom.wav',
      'C#2' : 'Crash Cymbal 1.wav',
      'D2'  : 'High Tom.wav',
      'Eb2' : 'Ride Cymbal 1.wav',
      'E2'  : 'Chinese Cymbal.wav',
      'F2'  : 'Ride Bell.wav',
      'F#2' : 'Tambourine.wav',
      'G2'  : 'Splash Cymbal.wav',
      'Ab2' : 'Cowbell.wav',
      'A2'  : 'Crash Cymbal 2.wav',
      'Bb2' : 'Vibraslap.wav',
      'B2'  : 'Ride Cymbal 2.wav',
      'C3'  : 'Hi Bongo.wav',
      'C#3' : 'Low Bongo.wav',
      'D3'  : 'Mute Hi Conga.wav',
      'Eb3' : 'Open Hi Conga.wav',
      'E3'  : 'Low Conga.wav',
      'F3'  : 'High Timbale.wav',
      'F#3' : 'Low Timbale.wav',
      'G3'  : 'High Agogo.wav',
      'Ab3' : 'Low Agogo.wav',
      'A3'  : 'Cabasa.wav',
      'Bb3' : 'Maracas.wav',
      'B3'  : 'Short Whistle.wav',
      'C4'  : 'Long Whistle.wav',
      'C#4' : 'Short Guiro.wav',
      'D4'  : 'Long Guiro.wav',
      'Eb4' : 'Claves.wav',
      'E4'  : 'Hi Wood Block.wav',
      'F4'  : 'Low Wood Block.wav',
      'F#4' : 'Mute Cuica.wav',
      'G4'  : 'Open Cuica.wav',
      'Ab4' : 'Mute Triangle.wav',
      'A4'  : 'Open Triangle.wav'
    },{
      'release' : 1,
      'onload': () => { callback.call(); },
      'baseUrl' : './assets/'
    }).toMaster();
  }
}

// Copied from TonePen - https://codepen.io/iamjoshellis/pen/ZOAzrN
const guitarPresets = {
  'delay': {
    gainIn: 1,
    distWet: 0,
    distDirt: 0,
    delayWet: 0.4,
    delayTime: 0.3,
    delayFeedback: 0.5,
    tremWet: 0,
    tremFreq: 0,
    tremDepth: 0,
    verbWet: 0,
    verbRoom: 0,
    chorusWet: 0,
    chorusFreq: 0,
    chorusDepth: 0,
  },
  'rock': {
    gainIn: 1,
    distWet: 1,
    distDirt: 1,
    delayWet: 0,
    delayTime: 0,
    delayFeedback: 0,
    tremWet: 0,
    tremFreq: 0,
    tremDepth: 0,
    verbWet: 0.1,
    verbRoom: 0.1,
    chorusWet: 0,
    chorusFreq: 0,
    chorusDepth: 0,
  },
  'clean': {
    gainIn: 1,
    distWet: 0,
    distDirt: 0,
    delayWet: 0.2,
    delayTime: 0.4,
    delayFeedback: 0.4,
    tremWet: 0,
    tremFreq: 0,
    tremDepth: 0,
    verbWet: 0.3,
    verbRoom: 0.3,
    chorusWet: 0.7,
    chorusFreq: 0.1,
    chorusDepth: 0.5,
  },
  'blues': {
    gainIn: 1,
    distWet: 0.4,
    distDirt: 0.3,
    delayWet: 0,
    delayTime: 0,
    delayFeedback: 0,
    tremWet: 0.7,
    tremFreq: 0.6,
    tremDepth: 0.9,
    verbWet: 0.3,
    verbRoom: 0.3,
    chorusWet: 0,
    chorusFreq: 0,
    chorusDepth: 0,
  },
  'billTed': {
    gainIn: 1,
    distWet: 1,
    distDirt: 1,
    delayWet: 1,
    delayTime: 1,
    delayFeedback: 1,
    tremWet: 1,
    tremFreq: 1,
    tremDepth: 1,
    verbWet: 1,
    verbRoom: 1,
    chorusWet: 1,
    chorusFreq: 1,
    chorusDepth: 1,
  }
}