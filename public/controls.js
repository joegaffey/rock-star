let audioOn = false;
const audioControlsEl = document.querySelector('.audioControls');
const img = audioControlsEl.children[0];

audioControlsEl.onclick = (event) => {
  if(!audioInit) {
    initAudio();
    audioOn = true;
    Tone.Transport.start("0", "0"); 
    img.src = './audioOn.svg';
    return;
  }
  if(audioOn) {
    audioOn = false;
    Tone.Transport.pause();
    img.src = './audioOn.svg';
  }
  else {
    audioOn = true;
    Tone.Transport.start(); 
    img.src = './audioOff.svg';
  }
};