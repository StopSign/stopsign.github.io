let menuView = {
   selector : '#menu',
   display : function () {
     $(menuView.selector).html(menuView.html());
   },
   html : function () {
      var html = "";
      html += menuView.htmlChangelog();
      html += menuView.htmlSaveMenu();
      html += menuView.htmlFAQMenu();
      html += menuView.htmlOptionsMenu();
      return html;
   },
   htmlChangelog : function () {
     var html = "<div style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>";
       html += Localization.txt("menu>changelog>meta>title");
       html += "<div class='showthisH' id='changelog'>";

       var versions = Localization.txtsObj("menu>changelog>version");
       $(versions).each(function(x,version) {
         html +=  "<div class='showthat2'>";
         html +=    Localization.txt("menu>changelog>meta>version_prefix")+" "+$(version).attr('verNum');
         html +=    "<div class='showthis2'>";
         html +=      $(version).html();
         html +=   "</div>";
         html +=  "</div><br>";
       });
     html += "</div></div>";
     return html;
   },
   htmlSaveMenu : function () {
     var html = "<div style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>";
     html += Localization.txt("menu>save>meta>title");
     html += "<div class='showthisH'>";
      html += "<div class='button' onclick='save()'>"+Localization.txt("menu>save>manual_save")+"</div><br>";
      html += "<input id='exportImport'><label for='exportImport'>"+Localization.txt("menu>save>input_label")+"</label><br>";
      html += "<div class='button' onclick='exportSave()'>"+Localization.txt("menu>save>export_button")+"</div><br>";
      html += Localization.txt("menu>save>export_comment")+"<br>";
      html += "<div class='button' onclick='importSave()'>"+Localization.txt("menu>save>import_button")+"</div><br>";
      html += Localization.txt("menu>save>import_comment")+"<br>";
     html += "</div>";
     html += "</div>";
     return html;
   },
   htmlFAQMenu : function () {
      var html = "<div style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>";
        html += Localization.txt("menu>faq>meta>title");
        html += "<div class='showthisH'>";
        var q_as = Localization.txtsObj("menu>faq>q_a");
        $(q_as).each(function(x,q_a) {
          html +=    Localization.txt("menu>faq>meta>q_prefix")+" "+$(q_a).find('q').html()+"<br>";
          html +=    Localization.txt("menu>faq>meta>a_prefix")+" "+$(q_a).find('a').html()+"<br><br>";
        });

        html += "</div>";
      html += "</div>";
      return html;
   },
   htmlOptionsMenu : function () {
     var html = "<div style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>";
     html += Localization.txt("menu>options>meta>title");
     html += "<div class='showthisH'>";
      html += "<a href='_blank' href='"+Localization.txt("menu>options>discord>link")+"'>"+Localization.txt("menu>options>discord>title")+"</a><br>";
      if (Object.keys(Localization.supportedLang).length>1)
        html += menuView.htmlLocalizationMenu();
      html += Localization.txt("menu>options>adblock_warning")+"<br>";
      html += "<input id='audioCueToggle' type='checkbox' /><label for='audioCueToggle'>"+Localization.txt("menu>options>pause_audio_cue")+"</label><br>";
     html += "</div>";
     html += "</div>";
     return html;
   },
   htmlLocalizationMenu : function() {
     var lg = Localization.supportedLang;
     var html = "<select id='localization_menu'>";
     $.each(lg,function(val,str) {
       html += "<option value='"+val+"' "+(Localization.currentLang == val ? "selected" : "")+">"+str+"</option>"
     })
     html += "</select>";
     return html;
   },
};
