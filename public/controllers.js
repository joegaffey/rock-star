export default class Controllers {
  
  constructor(){
    this.ctrls = [];
  }
   
  detectControllers() {
    let pads = navigator.getGamepads();
    this.ctrls = [];
    for(let i in pads){
      let pad = pads[i];
      if(pad && pad.connected) {
        this.ctrls.push(pad);
      }
    }
  }

  checkControllers() {
    var pads = navigator.getGamepads();  
    
    for (let pad in pads) {
      try {   
        if(pad.buttons[0].value === 1) {

        }
        if(pad.buttons[1].value === 1) {

        }      
        if(pad.buttons[2].value === 1) {  

        }
      }
      catch(e) { console.log(e); }
    }
  }
}