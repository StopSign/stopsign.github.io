Views.registerView('menu',{
   selector : '#menu',
   html : function () {
      var html = "";
      html += Views.menu.htmlChangelog();
      html += Views.menu.htmlSaveMenu();
      html += Views.menu.htmlFAQMenu();
      html += Views.menu.htmlOptionsMenu();
      return html;
   },
   htmlChangelog : function () {
     var html = "<div style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>";
       html += _txt("menu>changelog>meta>title");
       html += "<div class='showthisH' id='changelog'>";

       var versions = _txtsObj("menu>changelog>version");
       $(versions).each(function(x,version) {
         html +=  "<div class='showthat2'>";
         html +=    _txt("menu>changelog>meta>version_prefix")+" "+$(version).attr('verNum');
         html +=    "<div class='showthis2'>";
         html +=      $(version).text();
         html +=   "</div>";
         html +=  "</div><br>";
       });
     html += "</div></div>";
     return html;
   },
   htmlSaveMenu : function () {
     var html = "<div style='display:inline-block;height:30px;margin-left:10px;cursor:pointer;'>";
     html += "<div onclick='showSavingDiv()'>" + _txt("menu>save>meta>title") + "</div>";
     html += "<div id='savingDiv' class='showthis' style='cursor:default'>";
        html += "<div style='float:right;cursor:pointer' class='fa fa-times' onclick='hideSavingDiv()'></div>";
       html += "<div class='button' onclick='save()'>"+_txt("menu>save>manual_save")+"</div><br>";
       html += "<textarea id='exportImportList'></textarea><label for='exportImportList'> "+_txt("menu>save>list_label")+"</label><br>";
       html += "<div class='button' onclick='exportCurrentList()'>"+_txt("menu>save>export_button")+"</div>";
       html += "<div class='button' onclick='importCurrentList()'>"+_txt("menu>save>import_button")+"</div><br>";
       html += _txt("menu>save>list_comment")+ "<br><br>";
      html += "<input id='exportImport'><label for='exportImport'> "+_txt("menu>save>input_label")+"</label><br>";
      html += "<div class='button' onclick='exportSave()'>"+_txt("menu>save>export_button")+"</div><br>";
      html += _txt("menu>save>export_comment")+"<br>";
      html += "<div class='button' onclick='importSave()'>"+_txt("menu>save>import_button")+"</div><br>";
      html += _txt("menu>save>import_comment");
      html += "<div class='showthat2'>"+_txt("menu>save>import_hover_special")+"<div class='showthis2'>"+_txt("menu>save>import_hover_special_tooltip")+"</div></div><br>";
     html += "</div>";
     html += "</div>";
     return html;
   },
   htmlFAQMenu : function () {
      var html = "<div style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>";
        html += _txt("menu>faq>meta>title");
        html += "<div class='showthisH'>";
        var q_as = _txtsObj("menu>faq>q_a");
        $(q_as).each(function(x,q_a) {
          html +=    _txt("menu>faq>meta>q_prefix")+" "+$(q_a).find('q').html()+"<br>";
          html +=    _txt("menu>faq>meta>a_prefix")+" "+$(q_a).find('a').html()+"<br><br>";
        });

        html += "</div>";
      html += "</div>";
      return html;
   },
   htmlOptionsMenu : function () {
     var html = "<div style='display:inline-block;height:30px;margin-left:10px;' class='showthatH'>";
     html += _txt("menu>options>meta>title");
     html += "<div class='showthisH'>";
      html += "<a target='_blank' href='"+_txt("menu>options>discord>link")+"'>"+_txt("menu>options>discord>title")+"</a><br>";
      if (Object.keys(Localization.supportedLang).length>1)
        html += Views.menu.htmlLocalizationMenu();
      html += _txt("menu>options>adblock_warning")+"<br>";
      html += "<input id='audioCueToggle' type='checkbox' /><label for='audioCueToggle'>"+_txt("menu>options>pause_audio_cue")+"</label><br>";
     html += "</div>";
     html += "</div>";
     return html;
   },
   htmlLocalizationMenu : function() {
     var lg = Localization.supportedLang;
     var html = _txt("menu>options>localization_title")+" : <select id='localization_menu' onchange='Localization.change();'>";
     $.each(lg,function(val,str) {
       html += "<option value='"+val+"' "+(Localization.currentLang == val ? "selected" : "")+">"+str+"</option>"
     })
     html += "</select><br>";
     return html;
   },
});
