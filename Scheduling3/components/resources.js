function Resources() {
  this.souls = 0;
  this.electronics = 0;
  this.robots = 0;
  
  this.tick = function() {
    this.electronics += this.electronicsGain
  }
  
  this.div = "<div style='position:absolute;margin-left:10px;' class='text'>"+
      "<div style='position:absolute;top:38px;font-size:18px;width:100px;'><img src='images/ghost.png' class='largeIcon'>{{resources.souls}}</div>"+
      "<div style='position:absolute;top:55px;font-size:18px;width:100px;'><img src='images/elec.png' class='largeIcon'>{{resources.electronics}}</div>"+
      "<div style='position:absolute;top:72px;font-size:18px;width:100px;'><img src='images/robot.png' class='largeIcon'>{{resources.robots}}</div>"+
    "</div>";
    
}