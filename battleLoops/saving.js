//contains non-specific saving/loading functions

let saving = {
    clearSave: function() {
        console.log("Clearing save")
        window.localStorage[saveName] = "";
        location.reload();
    },
    load: function() {
        initialize.initializeData();

        let toLoad = {};

        if (localStorage[saveName]) {
            try {
                toLoad = JSON.parse(localStorage[saveName]);
            } catch (e) {
                saving.exportFile(localStorage[saveName], "KTL_Error_File")
            }
        }

        if(!isLoadingEnabled) {
            console.log('Save ignored.');
            toLoad = {};
        }



        if(localStorage[saveName] && Object.keys(toLoad).length > 0) {
            onLoad.handleLoad(data, toLoad);
        }

        onLoad.afterLoad()
    },
    save: function() {
        data.lastVisit = Date.now();
        let sdata = structuredClone(data);
        window.localStorage[saveName] = JSON.stringify(sdata);
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
            saving.validateGzipData(compressedData);
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
    },
    validateGzipData: function(data) {
        // Check magic number
        if (data.length < 2 || data[0] !== 0x1F || data[1] !== 0x8B) {
            throw new Error('Invalid gzip header: missing magic bytes');
        }

        // Check compression method (should be 8 for DEFLATE)
        if (data.length >= 3 && data[2] !== 8) {
            console.warn('Unknown compression method:', data[2]);
        }

        return true;
    }
}
