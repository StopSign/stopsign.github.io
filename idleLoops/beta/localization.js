window.Localization = {
  // config
  debug : false, // set to true for more console.log
  defaultLang : 'en-EN', //
  supportedLang : {
    'en-EN' : 'English',
  },
  getKey : 'lg', // key used in the get parameter of the URL to set a specific language
  handle : '#localization_menu', // html selector of the div to put the localization menu in

  // vars
  currentLang : null,
  libs : {},
  lastLib : null,

  // ====== PUBLIC ======
  init : function() { // starts up the module
    Localization.currentLang = Localization.getUrlVars()[Localization.getKey];
    if (typeof(Localization.currentLang) == 'undefined')
      Localization.currentLang = Localization.defaultLang;
  },
  loadLib : function (libName,callback) { // to load a specific lib and have an optional callback
    Localization.loadXML(libName,function(xmlData){
      Localization.saveLib(libName,xmlData);
      if (typeof(callback) != "undefined")
        callback.call(this);
    })
  },
  txt : function(path,lib) { // lib can be ignored to use the last used lib. returns the text for the given key
    if (typeof(lib) == "undefined")
      lib = Localization.lastLib;
    var libObject = $(Localization.libs[lib]);
    if (libObject.length )
    var txt = $(Localization.libs[lib]).find(path).html();
    if (typeof(txt)=="undefined") {
      console.warn("Missing translation in lang '"+ Localization.currentLang + "' for key "+path+" in lib "+lib);
      txt = "["+path+"]";
    }
    return txt;
  },
  txtsObj : function(path,lib) { // lib can be ignored to use the last used lib. returns the texts for the given key as objects
    if (typeof(lib) == "undefined")
      lib = Localization.lastLib;
    return $(Localization.libs[lib]).find(path);
  },

  // ====== PRIVATE ======
  saveLib : function(libName,xmlData) {
    if (Localization.debug)
      console.log("Loaded lib "+libName+" : ",xmlData);
    Localization.libs[libName] = xmlData;
    Localization.lastLib = Localization.lastLib === null ? libName : Localization.lastLib;
  },
  change : function (ev) { // function triggered by the localization menu
    var vars = Localization.getUrlVars();
    vars['lg'] = $(ev.target).val();
    window.location.href=window.location.origin+window.location.pathname+'?'+$.param(vars);
  },
  loadXML : function(libName,callback) {
      $.get('lang/'+Localization.currentLang+'/'+libName+'.xml',null,callback);
  },
  getUrlVars : function() {
      var vars = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
          vars[key] = value;
      });
      return vars;
  },
}
