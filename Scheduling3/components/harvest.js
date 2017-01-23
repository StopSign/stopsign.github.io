function Harvest() {
  this.secondsNeeded = 60*5;
  this.secondsPassed = 0;
  
  this.tick = function() {
    var finishedHarvest = false;
    this.secondsPassed++;
    if(this.secondsPassed >= this.secondsNeeded) {
      finishedHarvest = true;
      this.secondsPassed = 0;
    }
    var percentage = (this.secondsPassed / this.secondsNeeded)
    drawProgress(this.aProgress, percentage, this.$pCaption);
    return finishedHarvest;
  }
  
  this.initialize = function() {
    this.iProgress = document.getElementById('inactiveProgress');
    this.aProgress = document.getElementById('activeProgress');
    this.iProgressCTX = this.iProgress.getContext('2d');
    drawInactive(this.iProgressCTX);
  }
  
  function drawInactive(iProgressCTX) {
    iProgressCTX.lineCap = 'square';
    var size = 100;
    //outer ring
    iProgressCTX.beginPath();
    iProgressCTX.lineWidth = 15;
    iProgressCTX.strokeStyle = '#e1e1e1';
    iProgressCTX.arc(size, size, 94, 0, 2 * Math.PI);
    iProgressCTX.stroke();

    //progress bar
    iProgressCTX.beginPath();
    iProgressCTX.lineWidth = 0;
    iProgressCTX.fillStyle = '#e6e6e6';
    iProgressCTX.arc(size, size, 88, 0, 2 * Math.PI);
    iProgressCTX.fill();

    //progressbar caption
    iProgressCTX.beginPath();
    iProgressCTX.lineWidth = 0;
    iProgressCTX.fillStyle = '#fff';
    iProgressCTX.arc(size, size, 73, 0, 2 * Math.PI);
    iProgressCTX.fill();
  }
  
  function drawProgress(bar, percentage, $pCaption) {
    var barCTX = bar.getContext("2d");
    var quarterTurn = Math.PI / 2;
    var endingAngle = ((2 * percentage * .985) * Math.PI) - quarterTurn; //.985 because lineWidth
    var startingAngle = 0 - quarterTurn;
    
    bar.width = bar.width;
    barCTX.lineCap = 'square';

    barCTX.beginPath();
    barCTX.lineWidth = 10;
    barCTX.strokeStyle = '#76e1e5';
    barCTX.arc(100, 100, 79, startingAngle, endingAngle);
    barCTX.stroke();
  }
  
  var harvest = "harvest"
  
  this.div = "<div class='harvest text'>"+
    "<div class='progress-bar'>"+
      "<canvas id='inactiveProgress' class='progress-inactive' height='210px' width='210px'></canvas>"+
      "<canvas id='activeProgress' class='progress-active' height='210px' width='210px'></canvas>"+
      "<div style='position:absolute;left:47px;font-size:20px;top:66px;'>Harvest <img src='images/ghost.png' class='largeIcon'> in</div>"+
      "<p>{{harvest.secondsNeeded - harvest.secondsPassed}}</p>"+
    "</div>"+
  "</div>"
  
}