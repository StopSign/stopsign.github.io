let trackedResourcesView = {
   selector : '#trackedResources',
   display : function () {
     $(trackedResourcesView.selector).html(trackedResourcesView.html());
   },
   html : function () {
     var html = "";
     var resources = Localization.txtsObj("tracked_resources>resource");
     $(resources).each(function(x,resource) {
       html += "<div class='showthat resource'";
       if ($(resource).attr('initialy_hidden'))
          html += " style='display:none' id='"+$(resource).find('id').text()+"Div'";
       html += ">";
       html += "<div class='bold'>"+$(resource).find('title').text()+"</div>";
       if (!$(resource).attr('no_count'))
          html += " <div id='"+$(resource).find('id').text()+"'>0</div>";
       html += "<div class='showthis'>"+$(resource).find('desc').text();
       if (!$(resource).attr('no_reset_on_restart'))
           html += "<br>"+Localization.txt("tracked_resources>reset_on_restart_txt");
       html += "</div></div>";
     });
     return html;
   },
};
