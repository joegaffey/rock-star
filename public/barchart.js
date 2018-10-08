export default class BarChart {
  
  constructor(canvas, values, color) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.barWidth = canvas.width / values.length;
    this.color = color;
    this.values = values;
    this.render();
  }
  
  render() {
    let x = 0;
    while (x < this.values.length) {
      this.drawBar(x * this.barWidth, this.values[x] * (this.canvas.height / 100), this.barWidth, this.color); 
      x++;
    }
  }

  drawBar(x, y, width, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(x, this.canvas.height);
    this.ctx.lineTo(x, this.canvas.height - y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }  
}