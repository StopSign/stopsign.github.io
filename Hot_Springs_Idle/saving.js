//contains non-specific saving/loading functions

let saving = {
    clearSave: function() {
        console.log("Clearing save")
        window.localStorage[saveName] = "";
        location.reload();
    },
    load: async function() {
        initialize.initializeData();

        let toLoad = {};

        if (!isLoadingEnabled) {
            console.log('Save ignored.');
        } else if (loadStaticSaveFile) {
            try {
                const resp = await fetch("saveFile.txt", { cache: "no-store" });
                if (resp.ok) {
                    const text = await resp.text();
                    if (text.trim()) {
                        const decoded = decode64(text.trim());
                        toLoad = JSON.parse(typeof decoded === "string" ? decoded : "");
                        console.log("Loaded saveFile.txt");
                    }
                }
            } catch (e) {
                console.log("saveFile.txt not found or invalid.", e);
            }
        } else if (localStorage[saveName]) {
            try {
                toLoad = JSON.parse(localStorage[saveName]);
            } catch (e) {
                saving.exportFile(localStorage[saveName], "KTL_Error_File")
            }
        }

        if (Object.keys(toLoad).length > 0) {
            onLoad.handleLoad(data, toLoad);
        }

        onLoad.afterLoad()
    },
    save: function() {
        data.lastVisit = Date.now();
        let sdata = structuredClone(data);
        window.localStorage[saveName] = JSON.stringify(sdata);
    },
    /** Download current game data as encode64 save (place in battleLoops/ for loadStaticSaveFile). */
    saveToFile: function() {
        saving.save();
        const text = window.localStorage[saveName] || JSON.stringify(structuredClone(data));
        const blob = new Blob([encode64(text)], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        a.download = `Hot_Springs_Save_${day}-${month}_${hours}-${minutes}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    /** Pick an encode64 save (same format as Save to file) and load it. */
    importFromFile: function() {
        const input = document.getElementById("importFromFileInput");
        if (!input) return;
        input.value = "";
        input.click();
    },
    onImportFromFileSelected: function(input) {
        const file = input.files && input.files[0];
        input.value = "";
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function() {
            let encoded = typeof reader.result === "string" ? reader.result : "";
            encoded = encoded.replace(/^\uFEFF/, "").trim();
            const text = decode64(encoded);
            if (typeof text !== "string" || !saving.isValidSaveText(text)) {
                alert("That file is not a valid save.");
                return;
            }
            try {
                window.localStorage[saveName] = text;
            } catch (e) {
                alert("Could not store that save.");
                return;
            }
            location.reload();
        };
        reader.readAsText(file);
    },
    isValidSaveText: function(text) {
        if (!text) return false;
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            return false;
        }
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
        if (!parsed.progress || typeof parsed.progress !== "object" || Array.isArray(parsed.progress)) return false;
        if (!parsed.battle || typeof parsed.battle !== "object" || Array.isArray(parsed.battle)) return false;
        return true;
    },
    exportSave: function() {
        saving.save();
        document.getElementById("exportImportSave").value = window.localStorage[saveName];
        document.getElementById("exportImportSave").select();
        document.execCommand('copy');
        document.getElementById("exportImportSave").value = "";
    },
    exportFile: function(data, name, ext = "txt") {
        const blob = new Blob([data], { type: 'application/gzip' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;

        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        a.download = `${name}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.${ext}`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    },
    exportSaveFile: function(name="BL_Save") {
        saving.save();
        const data = fflate.gzipSync(fflate.strToU8(window.localStorage[saveName]));
        saving.exportFile(data, name, "save")
    },
    importSave: function() {
        if(!document.getElementById('confirmImportCheckbox').checked) {
            return;
        }
        if(!document.getElementById("exportImportSave").value.trim()) {
            saving.clearSave();
            return;
        }
        window.localStorage[saveName] = document.getElementById("exportImportSave").value;
        location.reload();
    },
    importSaveFile: function(name) {
        const input = document.getElementById("importSaveFileInput");
        const file = input.files[0];
        if (!file) return;

        if (file.name.toLowerCase().endsWith(".save")) {
            saving.read_gzip(file);
        } else {
            saving.read_base64(file);
        }
    },
    read_gzip: function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result.trim();
            if (!content) {
                saving.clearSave();
            } else {
                window.localStorage[saveName] = content;
            }
            location.reload();
        };
        reader.readAsText(file);
    },
    read_base64: function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const compressedData = new Uint8Array(content);
            // Decompress
            const decompressed = fflate.gunzipSync(compressedData);

            // Convert to text
            const text = fflate.strFromU8(decompressed);
            if (!content) {
                saving.clearSave();
            } else {
                window.localStorage[saveName] = text;
            }
            location.reload();
        };
        reader.readAsArrayBuffer(file);
    }
}
