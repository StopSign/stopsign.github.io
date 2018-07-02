Views.registerView('timeControls',{
   selector : '#timeControls',
   html : function () {
      var html = "";

      // play/pause
      html += "<div id='pausePlay' onclick='pauseGame()'' class='button control'>"+_txt("time_controls>pause_button")+"</div>";

      // checkbox pause on restart
      html += "<div class='control'><input type='checkbox' id='pauseBeforeRestart'><label for='pauseBeforeRestart'>"+_txt('time_controls>pause_before_restart')+"</label></div>";

      // restart button and its hover
      html += "<div onclick='restart()' class='button showthat control'>"+_txt('time_controls>restart_button');
        html += "<div class='showthis' style='color:black;width:230px;'>"+_txt('time_controls>restart_text')+"</div>";
      html += "</div>";

      // story
      html += "<div class='showthat control'>";
        html += "<div class='showthat' onmouseover='view.updateStory(storyShowing)' style='height:30px;'>";
        html += "<div class='large bold'>"+_txt('time_controls>story_title')+"</div><div id='newStory' style='color:red;display:none;'>(!)</div>";
        html += "<div class='showthis' style='width:400px;'>";
          // story controls
          html += "<div style='margin-left:175px;' class='actionIcon fa fa-arrow-left control' id='storyLeft' onclick='view.updateStory(storyShowing-1)'></div>";
          html += "<div style='' id='storyPage' class='bold control'></div>";
          html += "<div style='' class='actionIcon fa fa-arrow-right control' id='storyRight' onclick='view.updateStory(storyShowing+1)'></div>";
          // story texts
          _txtsObj("time_controls>stories>story").each(function(x,story) {
            html += "<div id='story"+$(story).attr('num')+"'>";
              html += $(story).text();
            html += "</div>";
          })
        html += "</div>";
      html += "</div></div>";

      // bonus Seconds
      html += "<div class='button showthat control' onclick='toggleOffline()'>"+_txt('time_controls>bonus_seconds>title');
        html += "<div class='showthis' style='width:230px;color:black;'>"+_txt('time_controls>bonus_seconds>main_text');
          html += "<div class='bold' id='isBonusOn'>"+_txt('time_controls>bonus_seconds>state>off')+"</div><br>";
          html += "<div class='bold'>"+_txt('time_controls>bonus_seconds>counter_text')+"</div> <div id='bonusSeconds'></div>";
        html += "</div>";
      html +="</div>";

      return html;
   },
});
