window.Localization = {
    // config
    // set to true for more console.log
    debug: false,
    defaultLang: "en-EN",
    supportedLang: {
        "en-EN": "English",
        "fr-FR": "Français",
    },
    // key used in the get parameter of the URL to set a specific language
    getKey: "lg",
    // html selector of the div to put the localization menu in
    handle: "#localization_menu",

    // vars
    currentLang: null,
    libs: {},
    lastLib: null,

    // ====== PUBLIC ======
    // starts up the module
    init() {
        Localization.currentLang = Localization.getUrlVars()[Localization.getKey];
        if (typeof(Localization.currentLang) === "undefined")
            Localization.currentLang = Localization.defaultLang;
    },
    // to load a specific lib and have an optional callback
    loadLib(libName, callback) {
        Localization.loadXML(libName, function(xmlData) {
            Localization.saveLib(libName, xmlData);
            if (typeof(callback) !== "undefined") callback.call(this);
        });
    },
    // lib can be ignored to use the last used lib. returns the text for the given key
    txt(path, lib) {
        // eslint-disable-next-line no-param-reassign
        if (typeof(lib) === "undefined") lib = "game";
        const libObject = $(Localization.libs[lib]);
        let txt;
        if (libObject.length) txt = $(Localization.libs[lib]).find(path).text();

        if (txt === "") {
            console.warn(`Missing text in lang '${Localization.currentLang}' for key ${path} in lib ${lib}`);
            txt = $(Localization.libs.fallback).find(path).text();
            if (txt === "") {
                console.warn(`Missing fallback for key ${path}`);
                txt = `[${path}]`;
            }
        }
        return txt;
    },
    // lib can be ignored to use the last used lib. returns the texts for the given key as objects
    txtsObj(path, lib) {
        if (typeof(lib) === "undefined") return $(Localization.libs[Localization.lastLib]).find(path);
        return $(Localization.libs[lib]).find(path);
    },
    // will update every dom element using the .localized class, with a valid js-data "lockey"
    localizePage(lib) {
        $(".localized").each((_index, localizedElement) => {
            $(localizedElement).html(Localization.txt($(localizedElement).data("lockey"), lib));
        }); 
    },

    // ====== PRIVATE ======
    saveLib(libName, xmlData) {
        if (Localization.debug)
            console.log(`Loaded lib ${libName} : `, xmlData);
        Localization.libs[libName] = xmlData;
        Localization.lastLib = Localization.lastLib === null ? libName : Localization.lastLib;
    },
    // function triggered by the localization menu
    change() {
        const vars = Localization.getUrlVars();
        vars.lg = $(Localization.handle).val();
        window.location.href = `${window.location.origin + window.location.pathname}?${$.param(vars)}`;
    },
    loadXML(libName, callback) {
        if (libName === "fallback") $.get("lang/en-EN/game.xml", null, callback, "xml");
        else $.get(`lang/${Localization.currentLang}/${libName}.xml`, null, callback, "xml");
    },
    getUrlVars() {
        const vars = {};
        parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/giu, (_m, key, value) => {
            vars[key] = value;
        });
        return vars;
    },
};

Localization.init();
// binding the _txt function for simplier use
window._txt = Localization.txt;
window._txtsObj = Localization.txtsObj;

let locCheck = false;
Localization.loadLib("fallback", () => {
    Localization.loadLib("game", () => locCheck = true);
});