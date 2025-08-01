/*
*     'archive_location_filter':
*         Filter function that will run for each archive path.
*
*     'unsupported_webgl_callback':
*         Function that is called if WebGL is not supported.
*
*     'engine_arguments':
*         List of arguments (strings) that will be passed to the engine.
*
*     'custom_heap_size':
*         Number of bytes specifying the memory heap size.
*
*     'disable_context_menu':
*         Disables the right-click context menu on the canvas element if true.
*
*     'retry_time':
*         Pause before retry file loading after error.
*
*     'retry_count':
*         How many attempts we do when trying to download a file.
*
*     'can_not_download_file_callback':
*         Function that is called if you can't download file after 'retry_count' attempts.
*
*     'exe_name':
*         Executable name which used for find right binary to load
*
*     'resize_window_callback':
*         Function that is called when resize/orientationchanges/focus events happened
*
*     'start_success':
*         Function that is called just before main is called upon successful load.
*
*     'start_error':
*         Function that is called if startup fails for any reason.
*
*     'update_progress':
*         Function that is called as progress is updated. Parameter progress is updated 0-100.
*
*     'update_imports':
*         Function that is called right before wasm instantiation. Imports
*         are passed into the function and can be modified and will be
*         subsequently passed on to WebAssembly.
*/
var CUSTOM_PARAMETERS = {
    archive_location_filter: function( path ) {
        return ("archive" + path + "");
    },
    engine_arguments: ["--verify-graphics-calls=false",],
    custom_heap_size: 1073741824,
    full_screen_container: "#canvas-container",
    disable_context_menu: true,
    retry_time:1.0,
    retry_count:10,
    unsupported_webgl_callback: function() {
        var e = document.getElementById("webgl-not-supported");
        e.style.display = "block";
    },
    start_success: function() {
    },
    start_error: function(error) {
    },
    update_progress: function(progress) {
    },
    update_imports: function(imports) {
    },
    resize_window_callback: function() {
        var is_iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var buttonHeight = 0;
        var prevInnerWidth = -1;
        var prevInnerHeight = -1;
        
        
        buttonHeight = 42;
        
        // Hack for iOS when exit from Fullscreen mode
        if (is_iOS) {
            window.scrollTo(0, 0);
        }
    
        var app_container = document.getElementById('app-container');
        var game_canvas = document.getElementById('canvas');
        var innerWidth = window.innerWidth;
        var innerHeight = window.innerHeight - buttonHeight;
        if (prevInnerWidth == innerWidth && prevInnerHeight == innerHeight)
        {
            return;
        }
        prevInnerWidth = innerWidth;
        prevInnerHeight = innerHeight;
        var width = 1920;
        var height = 1080;
        var targetRatio = width / height;
        var actualRatio = innerWidth / innerHeight;
    
    
    
        //Fit
        if (actualRatio > targetRatio) {
            width = innerHeight * targetRatio;
            height = innerHeight;
            app_container.style.marginLeft = ((innerWidth - width) / 2) + "px";
            app_container.style.marginTop = "0px";
        }
        else {
            width = innerWidth;
            height = innerWidth / targetRatio;
            app_container.style.marginLeft = "0px";
            app_container.style.marginTop = ((innerHeight - height) / 2) + "px";
        }
    
    
        var dpi = 1;
    
        app_container.style.width = width + "px";
        app_container.style.height = height + buttonHeight + "px";
        game_canvas.width = Math.floor(width * dpi);
        game_canvas.height = Math.floor(height * dpi);
    }
};

// file downloader
// wraps XMLHttpRequest and adds retry support and progress updates when the
// content is gzipped (gzipped content doesn't report a computable content length
// on Google Chrome)
var FileLoader = {
    options: {
        retryCount: 4,
        retryInterval: 1000,
    },
    // do xhr request with retries
    request: function(url, method, responseType, currentAttempt) {
        if (typeof method === 'undefined') throw TypeError("No method specified");
        if (typeof method === 'responseType') throw TypeError("No responseType specified");
        if (typeof currentAttempt === 'undefined') currentAttempt = 0;
        var obj = {
            send: function() {
                var onprogress = this.onprogress;
                var onload = this.onload;
                var onerror = this.onerror;
                var onretry = this.onretry;

                var xhr = new XMLHttpRequest();
                xhr._loadedSize = 0;
                xhr.open(method, url, true);
                xhr.responseType = responseType;
                xhr.onprogress = function(event) {
                    if (onprogress) onprogress(xhr, event, xhr._loadedSize);
                    xhr._loadedSize = event.loaded;
                };
                xhr.onerror = function(event) {
                    if (currentAttempt == FileLoader.options.retryCount) {
                        if (onerror) onerror(xhr, event);
                        return;
                    }
                    if (onretry) onretry(xhr, event, xhr._loadedSize, currentAttempt);
                    xhr._loadedSize = 0;
                    currentAttempt += 1;
                    setTimeout(obj.send.bind(obj), FileLoader.options.retryInterval);
                };
                xhr.onload = function(event) {
                    if (onload) onload(xhr, event);
                };
                xhr.send(null);
            }
        };
        return obj;
    },
    // Do HTTP HEAD request to get size of resource
    // callback will receive size or undefined in case of an error
    size: function(url, callback) {
        var request = FileLoader.request(url, "HEAD", "text");
        request.onerror = function(xhr, e) {
            callback(undefined);
        };
        request.onload = function(xhr, e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var total = xhr.getResponseHeader('content-length');
                    callback(total);
                } else {
                    callback(undefined);
                }
            }
        };
        request.send();
    },
    // Do HTTP GET request
    // onprogress(loadedDelta)
    // onerror(error)
    // onload(response)
    // onretry(loadedSize, currentAttempt)
    load: function(url, responseType, onprogress, onerror, onload, onretry) {
        var request = FileLoader.request(url, "GET", responseType);
        request.onprogress = function(xhr, e, ls) {
            var delta = e.loaded - ls;
            onprogress(delta);
        };
        request.onerror = function(xhr, e) {
            onerror("Error loading '" + url + "' (" + e + ")");
        };
        request.onload = function(xhr, e) {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var res = xhr.response;
                    if (responseType == "json" && typeof res === "string") {
                        onload(JSON.parse(res));
                    } else {
                        onload(res);
                    }
                } else {
                    onerror("Error loading '" + url + "' (" + e + ")");
                }
            }
        };
        request.onretry = function(xhr, event, loadedSize, currentAttempt) {
            onretry(loadedSize, currentAttempt);
        };
        request.send();
    }
};


var EngineLoader = {
    arc_sha1: "",
    wasm_sha1: "",
    wasm_size: 2541820,
    wasmjs_sha1: "",
    wasmjs_size: 279074,
    wasm_pthread_sha1: "",
    wasm_pthread_size: 2000000,
    wasmjs_pthread_sha1: "",
    wasmjs_pthread_size: 250000,
    asmjs_sha1: "",
    asmjs_size: 4000000,
    wasm_instantiate_progress: 0,

    stream_wasm: "true" === "true",

    updateWasmInstantiateProgress: function(totalDownloadedSize) {
        EngineLoader.wasm_instantiate_progress = totalDownloadedSize * 0.1;
    },

    getWasmSize: function() {
        if (Module['isWASMPthreadSupported'])
            return EngineLoader.wasm_pthread_size;
        return EngineLoader.wasm_size;
    },

    getWasmJSSize: function() {
        if (Module['isWASMPthreadSupported'])
            return EngineLoader.wasmjs_pthread_size;
        return EngineLoader.wasmjs_size;
    },

    getWasmSha1: function() {
        if (Module['isWASMPthreadSupported'])
            return EngineLoader.wasm_pthread_sha1;
        return EngineLoader.wasm_sha1;
    },

    getWasmJSSha1: function() {
        if (Module['isWASMPthreadSupported'])
            return EngineLoader.wasmjs_pthread_sha1;
        return EngineLoader.wasmjs_sha1;
    },

    getWasmName: function(exeName) {
        if (Module['isWASMPthreadSupported'])
            return exeName + '_pthread.wasm';
        return exeName + '.wasm';
    },

    getWasmJSName: function(exeName) {
        if (Module['isWASMPthreadSupported'])
            return exeName + '_pthread_wasm.js';
        return exeName + '_wasm.js';
    },

    // load and instantiate .wasm file using XMLHttpRequest
    loadAndInstantiateWasmAsync: function(src, imports, successCallback) {
        FileLoader.load(src, "arraybuffer",
            function(delta) {
                ProgressUpdater.updateCurrent(delta);
            },
            function(error) { throw error; },
            async function(wasm) {
                if (wasm.byteLength != EngineLoader.getWasmSize()) {
                   console.warn("Unexpected wasm size: " + wasm.byteLength + ", expected: " + EngineLoader.getWasmSize());
                }
                if (EngineLoader.getWasmSha1()) {
                    const digest = await window.crypto.subtle.digest("SHA-1", wasm);
                    const sha1 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
                    if (sha1 != EngineLoader.getWasmSha1()) {
                        const error = new Error("Unexpected wasm sha1: " + sha1 + ", expected: " + EngineLoader.getWasmSha1());
                        if (typeof CUSTOM_PARAMETERS["start_error"] === "function") {
                           CUSTOM_PARAMETERS["start_error"](error);
                        }
                        throw error;
                    }
                }
                var wasmInstantiate = WebAssembly.instantiate(new Uint8Array(wasm), imports).then(function(output) {
                    Module.instance = output.instance;
                    successCallback(output.instance, output.module);
                }).catch(function(e) {
                    console.log('wasm instantiation failed! ' + e);
                    if (typeof CUSTOM_PARAMETERS["start_error"] === "function") {
                        CUSTOM_PARAMETERS["start_error"](e);
                    }
                    throw e;
                });
            },
            function(loadedDelta, currentAttempt){
                ProgressUpdater.updateCurrent(-loadedDelta);
            });
    },

    // stream and instantiate .wasm file
    streamAndInstantiateWasmAsync: async function(src, imports, successCallback) {
        // https://stackoverflow.com/a/69179454
        var fetchFn = fetch;
        if (typeof TransformStream === "function" && ReadableStream.prototype.pipeThrough) {
            async function fetchWithProgress(path) {
                const response = await fetch(path);
                if (response.ok) {
                    const ts = new TransformStream({
                        transform (chunk, controller) {
                            ProgressUpdater.updateCurrent(chunk.byteLength);
                            controller.enqueue(chunk);
                        }
                    });

                    return new Response(response.body.pipeThrough(ts), response);
                } else {
                    return new Response(null, response);
                }
            }
            fetchFn = fetchWithProgress;
        }

        WebAssembly.instantiateStreaming(fetchFn(src), imports).then(function(output) {
            ProgressUpdater.updateCurrent(EngineLoader.wasm_instantiate_progress);
            Module.instance = output.instance;
            successCallback(output.instance, output.module);
        }).catch(function(e) {
            console.log('wasm streaming instantiation failed! ' + e);
            console.log('Fallback to wasm loading');
            try {
                EngineLoader.loadAndInstantiateWasmAsync(src, imports, successCallback);
            } catch (error) {
                 if (typeof CUSTOM_PARAMETERS["start_error"] === "function") {
                    CUSTOM_PARAMETERS["start_error"](error);
                 } else {
                    throw error;
                 }
            }
        });
    },

    // instantiate the .wasm file either by streaming it or first loading and then instantiate it
    // https://github.com/emscripten-core/emscripten/blob/main/test/manual_wasm_instantiate.html
    loadWasmAsync: function(exeName) {
        Module.instantiateWasm = function(imports, successCallback) {
            if (typeof CUSTOM_PARAMETERS["update_imports"] === "function") {
                var callback = CUSTOM_PARAMETERS["update_imports"];
                callback(imports);
            }
            if (EngineLoader.stream_wasm && (typeof WebAssembly.instantiateStreaming === "function")) {
                EngineLoader.streamAndInstantiateWasmAsync(EngineLoader.getWasmName(exeName), imports, successCallback);
            }
            else {
                EngineLoader.loadAndInstantiateWasmAsync(EngineLoader.getWasmName(exeName), imports, successCallback);
            }
            return {}; // Compiling asynchronously, no exports.
        };

        EngineLoader.loadAndRunScriptAsync(EngineLoader.getWasmJSName(exeName), EngineLoader.getWasmJSSize(), EngineLoader.getWasmJSSha1());
    },

    loadAsmJsAsync: function(exeName) {
        EngineLoader.loadAndRunScriptAsync(exeName + '_asmjs.js', EngineLoader.asmjs_size, EngineLoader.asmjs_sha1);
    },

    // load and start engine script (asm.js or wasm.js)
    loadAndRunScriptAsync: function(src, expectedLength, expectedSHA1) {
        FileLoader.load(src, "text",
            function(delta) {
                ProgressUpdater.updateCurrent(delta);
            },
            function(error) { throw error; },
            async function(response) {
                if (response.length != expectedLength) {
                    console.warn("Unexpected JS size: " + response.length + ", expected: " + expectedLength);
                }
                if (expectedSHA1) {
                    const digest = await window.crypto.subtle.digest("SHA-1", new TextEncoder().encode(response));
                    const sha1 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
                    if (sha1 != expectedSHA1) {
                        const error = new Error("Unexpected sha1: " + sha1 + ", expected: " + expectedSHA1);
                        if (typeof CUSTOM_PARAMETERS["start_error"] === "function") {
                            CUSTOM_PARAMETERS["start_error"](error);
                        } else {
                             throw error;
                        }
                    }
                }
                Module["mainScriptUrlOrBlob"] = src;

                const script = document.createElement('script');
                script.src = src;
                script.type = "text/javascript";
                document.body.appendChild(script);
            },
            function(loadedDelta, currentAttempt){
                ProgressUpdater.updateCurrent(-loadedDelta);
            });
    },

    // left as entrypoint for backward capability
    // start loading archive_files.json
    // after receiving it - start loading engine and data concurrently
    load: function(appCanvasId, exeName) {
        if (typeof CUSTOM_PARAMETERS["update_progress"] === "function") {
            ProgressUpdater.addListener(CUSTOM_PARAMETERS["update_progress"]);
        }

        ProgressView.addProgress(Module.setupCanvas(appCanvasId));
        CUSTOM_PARAMETERS['exe_name'] = exeName;

        FileLoader.options.retryCount = CUSTOM_PARAMETERS["retry_count"];
        FileLoader.options.retryInterval = CUSTOM_PARAMETERS["retry_time"] * 1000;
        // Load and assemble archive
        GameArchiveLoader.addFileDownloadErrorListener((error) => {
           if (typeof CUSTOM_PARAMETERS["can_not_download_file_callback"] === "function") {
               CUSTOM_PARAMETERS["can_not_download_file_callback"](error);
           } else if (typeof CUSTOM_PARAMETERS["start_error"] === "function") {
               CUSTOM_PARAMETERS["start_error"](error);
           }
        });
        GameArchiveLoader.addFileLoadedListener(Module.onArchiveFileLoaded);
        GameArchiveLoader.addArchiveLoadedListener(Module.onArchiveLoaded);
        GameArchiveLoader.setFileLocationFilter(CUSTOM_PARAMETERS["archive_location_filter"]);
        GameArchiveLoader.loadArchiveDescription('/archive_files.json');

        // move resize callback setup here to make possible to override callback
        // from outside of dmloader.js
        if (typeof CUSTOM_PARAMETERS["resize_window_callback"] === "function") {
            var callback = CUSTOM_PARAMETERS["resize_window_callback"];
            callback();
            window.addEventListener('resize', callback, false);
            window.addEventListener('orientationchange', callback, false);
            window.addEventListener('focus', callback, false);
        }
    }
};


/* ********************************************************************* */
/* Load and combine game archive data that is split into archives        */
/* ********************************************************************* */

var GameArchiveLoader = {
    // which files to load
    _files: [],
    _fileIndex: 0,
    // file
    //  name: intended filepath of built object
    //  size: expected size of built object.
    //  data: combined pieces
    //  downloaded: total bytes downloaded
    //  pieces: array of name, offset and data objects
    //  numExpectedFiles: total number of files expected in description
    //  lastRequestedPiece: index of last data file requested (strictly ascending)
    //  totalLoadedPieces: counts the number pieces received

    //MAX_CONCURRENT_XHR: 6,    // remove comment if throttling of XHR is desired.

    isCompleted: false,       // status of process

    _onFileLoadedListeners: [],          // signature: name, data.
    _onArchiveLoadedListeners:[],        // signature: void
    _onFileDownloadErrorListeners: [],   // signature: name

    _archiveLocationFilter: function(path) { return "split" + path; },

    cleanUp: function() {
        this._files =  [];
        this._fileIndex = 0;
        this.isCompleted = false;
        this._onGameArchiveLoaderCompletedListeners = [];
        this._onAllTargetsBuiltListeners = [];
        this._onFileDownloadErrorListeners = [];
    },

    addListener: function(list, callback) {
        if (typeof callback !== 'function') throw TypeError("Invalid callback registration");
        list.push(callback);
    },
    notifyListeners: function(list, data) {
        for (let i=0; i<list.length; ++i) {
            list[i](data);
        }
    },

    addFileDownloadErrorListener: function(callback) {
        this.addListener(this._onFileDownloadErrorListeners, callback);
    },
    notifyFileDownloadError: function(error) {
        this.notifyListeners(this._onFileDownloadErrorListeners, error);
    },

    addFileLoadedListener: function(callback) {
        this.addListener(this._onFileLoadedListeners, callback);
    },
    notifyFileLoaded: function(file) {
        this.notifyListeners(this._onFileLoadedListeners, { name: file.name, data: file.data });
    },

    addArchiveLoadedListener: function(callback) {
        this.addListener(this._onArchiveLoadedListeners, callback);
    },
    notifyArchiveLoaded: function() {
        this.notifyListeners(this._onArchiveLoadedListeners);
    },

    setFileLocationFilter: function(filter) {
        if (typeof filter !== 'function') throw "Invalid filter";
        this._archiveLocationFilter = filter;
    },

    // load the archive_files.json with the list of files and their individual
    // pieces
    // descriptionUrl: location of text file describing files to be preloaded
    loadArchiveDescription: function(descriptionUrl) {
        FileLoader.load(
            this._archiveLocationFilter(descriptionUrl),
            "text",
            function (delta) { },
            function (error) { GameArchiveLoader.notifyFileDownloadError(descriptionUrl); },
            function (text) { GameArchiveLoader.onReceiveDescription(text); },
            function (loadedDelta, currentAttempt) { });
    },

    onReceiveDescription: async function(text) {
        let json;
        try {
            json = JSON.parse(text);
            if (EngineLoader.arc_sha1) {
                const digest = await window.crypto.subtle.digest("SHA-1", (new TextEncoder()).encode(text));
                const sha1 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
                if (sha1 != EngineLoader.arc_sha1) {
                    throw new Error(`Unexpected hash ${sha1} wanted ${EngineLoader.arc_sha1}`);
                }
            }
        } catch (e) {
            GameArchiveLoader.notifyFileDownloadError(e.toString());
            return;
        }

        var totalSize = json.total_size;
        var exeName = CUSTOM_PARAMETERS['exe_name'];
        this._files = json.content;

        var isWASMSupported = Module['isWASMSupported'];
        if (isWASMSupported) {
            EngineLoader.loadWasmAsync(exeName);
            totalSize += EngineLoader.getWasmSize() + EngineLoader.getWasmJSSize();
        } else {
            EngineLoader.loadAsmJsAsync(exeName);
            totalSize += EngineLoader.asmjs_size;
        }
        if (!Module['isDMFSSupported']) {
            // we can download in parallel here because we will not rely on FS, otherwise
            // we have to wait until after the [w]asm is loaded.
            this.downloadContent();
        }
        ProgressUpdater.resetCurrent();
        if (isWASMSupported) {
            EngineLoader.updateWasmInstantiateProgress(totalSize);
        }
        ProgressUpdater.setupTotal(totalSize + EngineLoader.wasm_instantiate_progress);
    },

    downloadContent: async function() {
        var file = this._files[this._fileIndex];

        if (Module['isDMFSSupported']) {
            const path = `${DMSYS.GetUserPersistentDataRoot()}/${file.name}`;
            try { // see if already and stored
                const stat = FS.stat(path);
                if (stat) {
                    let matches = (file.size == stat.size);
                    if (matches && file.sha1) {
                        const stream = FS.open(path, "r");
                        if (stream) {
                            try {
                                const mmap = FS.mmap(stream, stat.size, 0, 0x01, 0x01); //PROT_READ, MAP_SHARED
                                if (mmap) {
                                    const digest = await window.crypto.subtle.digest("SHA-1", mmap);
                                    matches = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('') == file.sha1;
                                }
                            } catch(e) { }
                            FS.close(stream);
                        } else {
                            matches = false;
                        }
                    }
                    if (matches) {
                        this.onFileLoaded(file);
                        return;
                    }
                }
            } catch(_e) { }
            file.stream = FS.open(path, "w+");
        }

        // how many pieces to download at a time
        var limit = file.pieces.length;
        if (typeof this.MAX_CONCURRENT_XHR !== 'undefined') {
            limit = Math.min(limit, this.MAX_CONCURRENT_XHR);
        }

        for (var i=0; i<limit; ++i) {
            this.downloadPiece(file, i);
        }
    },

    notifyDownloadProgress: function(delta) {
        ProgressUpdater.updateCurrent(delta);
    },

    downloadPiece: function(file, index) {
        if (index < file.lastRequestedPiece) {
            throw RangeError("Request out of order: " + file.name + ", index: " + index + ", last requested piece: " + file.lastRequestedPiece);
        }

        var piece = file.pieces[index];
        file.lastRequestedPiece = index;
        file.totalLoadedPieces = 0;

        var url = this._archiveLocationFilter('/' + piece.name);

        FileLoader.load(
            url, "arraybuffer",
            function (delta) {
                GameArchiveLoader.notifyDownloadProgress(delta);
            },
            function (error) {
                GameArchiveLoader.notifyFileDownloadError(error);
            },
            function (response) {
                piece.data = new Uint8Array(response);
                piece.dataLength = piece.data.length;
                total = piece.dataLength;
                downloaded = piece.dataLength;
                GameArchiveLoader.onPieceLoaded(file, piece);
                piece.data = undefined;
            },
            function(loadedDelta, currentAttempt){
                ProgressUpdater.updateCurrent(-loadedDelta);
            });
    },

    addPieceToFile: function(file, piece) {
        if (file.stream !== undefined) {
            FS.write(file.stream, piece.data, 0, piece.data.length, piece.offset);
        } else if (1 == file.pieces.length) {
            file.data = piece.data;
        } else {
            if (!file.data) {
               file.data = new Uint8Array(file.size);
            }
            var start = piece.offset;
            var end = start + piece.data.length;
            if (0 > start) {
                throw RangeError("Buffer underflow. Start: " + start);
            }
            if (end > file.data.length) {
                throw RangeError("Buffer overflow. End : " + end + ", data length: " + file.data.length);
            }
            file.data.set(piece.data, piece.offset);
        }
    },

    onPieceLoaded: function(file, piece) {
        this.addPieceToFile(file, piece);

        ++file.totalLoadedPieces;
        // is all pieces of the file loaded?
        if (file.totalLoadedPieces == file.pieces.length) {
            this.verifyFile(file).then(() => {
                if (file.stream !== undefined) {
                    FS.close(file.stream);
                    file.stream = undefined;
                }
                this.onFileLoaded(file);
            }).catch((e) => {
                console.log('file verification failed! ' + e);
                throw e;
            });
        }
        // continue loading more pieces of the file
        // if not all pieces are already in progress
        else {
            var next = file.lastRequestedPiece + 1;
            if (next < file.pieces.length) {
                this.downloadPiece(file, next);
            }
        }
    },

    verifyFile: function(file) {
        // verify that we downloaded as much as we were supposed to
        var actualSize = 0;
        for (var i=0;i<file.pieces.length; ++i) {
            actualSize += file.pieces[i].dataLength;
        }
        if (actualSize != file.size) {
            return Promise.reject(new Error("Unexpected data size: " + file.name + ", expected size: " + file.size + ", actual size: " + actualSize));
        }

        // verify the pieces
        if (file.pieces.length > 1) {
            var pieces = file.pieces;
            for (i=0; i<pieces.length; ++i) {
                var item = pieces[i];
                // Bounds check
                var start = item.offset;
                var end = start + item.dataLength;
                if (0 < i) {
                    var previous = pieces[i - 1];
                    if (previous.offset + previous.dataLength > start) {
                        return Promise.reject(new RangeError("Segment underflow in file: " + file.name + ", offset: " + (previous.offset + previous.dataLength) + " , start: " + start));
                    }
                }
                if (pieces.length - 2 > i) {
                    var next = pieces[i + 1];
                    if (end > next.offset) {
                        return Promise.reject(new RangeError("Segment overflow in file: " + file.name + ", offset: " + next.offset + ", end: " + end));
                    }
                }
            }
        }
        if (file.sha1) {
            let data = file.data;
            if (file.stream) {
                try {
                    data = FS.mmap(file.stream, file.size, 0, 0x01, 0x01); //PROT_READ, MAP_SHARED
                } catch(e) { }
            }
            if(data) {
                return window.crypto.subtle.digest("SHA-1", data).then((digest) => {
                    const sha1 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
                    if (sha1 !== file.sha1)
                        return Promise.reject(new Error(`Unexpected hash ${sha1} wanted ${file.sha1}`));
                });
            }
        }
        return Promise.resolve();
    },

    onFileLoaded: function(file) {
        this.notifyFileLoaded(file);
        ++this._fileIndex;
        if (this._fileIndex == this._files.length) {
            this.onArchiveLoaded();
        } else {
            this.downloadContent();
        }
    },

    onArchiveLoaded: function() {
        this.isCompleted = true;
        this.notifyArchiveLoaded();
    }
};

/* ********************************************************************* */
/* Default splash and progress visualisation                             */
/* ********************************************************************* */

var ProgressView = {
    progress_id: "defold-progress",
    bar_id: "defold-progress-bar",

    addProgress : function (canvas) {
        /* Insert default progress bar below canvas */
        canvas.insertAdjacentHTML('afterend', '<div id="' + ProgressView.progress_id + '" class="canvas-app-progress"><div id="' + ProgressView.bar_id + '" class="canvas-app-progress-bar" style="transform: scaleX(0.0);"></div></div>');
        ProgressView.bar = document.getElementById(ProgressView.bar_id);
        ProgressView.progress = document.getElementById(ProgressView.progress_id);
    },

    updateProgress: function(percentage) {
        if (ProgressView.bar) {
            ProgressView.bar.style.transform = "scaleX(" + Math.min(percentage, 100) / 100 + ")";
        }
    },

    removeProgress: function () {
        if (ProgressView.progress.parentElement !== null) {
            ProgressView.progress.parentElement.removeChild(ProgressView.progress);

            // Remove any background/splash image that was set in runApp().
            // Workaround for Safari bug DEF-3061.
            Module.canvas.style.background = "none";
        }
    }
};

var ProgressUpdater = {
    current: 0,
    total: 1,

    listeners: [],

    addListener: function(callback) {
        if (typeof callback !== 'function') throw TypeError("Invalid callback registration");
        this.listeners.push(callback);
    },

    notifyListeners: function(percentage) {
        for (i=0; i<this.listeners.length; ++i) {
            this.listeners[i](percentage);
        }
    },

    setupTotal: function (total) {
        this.total = total;
    },

    setCurrent: function (current) {
        this.current = current;
        var percentage = this.calculateProgress();
        ProgressView.updateProgress(percentage);
        this.notifyListeners(percentage);
    },

    updateCurrent: function (diff) {
        this.current += diff;
        var percentage = this.calculateProgress();
        ProgressView.updateProgress(percentage);
        this.notifyListeners(percentage);
    },

    resetCurrent: function () {
        this.current = 0;
    },

    complete: function () {
        this.setCurrent(this.total);
    },

    calculateProgress: function () {
        return this.current / this.total * 100;
    }
};

/* DEPRECATED!
* Use ProgressUpdater and ProgressView instead.
* Left for backward compatability.
*/
var Progress = {
    addListener: function(callback) {
        ProgressUpdater.addListener(callback);
    },

    notifyListeners: function(percentage) {
        // no-op
    },

    addProgress : function (canvas) {
        ProgressView.addProgress(canvas);
    },

    updateProgress: function(percentage) {
        // no-op
    },

    calculateProgress: function (from, to, current, total) {
        // no-op
    },

    removeProgress: function () {
        ProgressView.removeProgress();
    }
};

/* ********************************************************************* */
/* Module is Emscripten namespace                                        */
/* ********************************************************************* */

var Module = {
    engineVersion: "1.10.2",
    engineSdkSha1: "7a0e23b3fcab4c5db82f2b32f5d8ac5df9467c9d",
    noInitialRun: true,

    _filesToPreload: [],
    _archiveLoaded: false,
    _preLoadDone: false,
    _isEngineLoaded: false,
    _isMainCalled: false,

    // Persistent storage
    persistentStorage: true,
    _syncInProgress: false,
    _syncNeeded: false,
    _syncInitial: false,
    _syncMaxTries: 3,
    _syncTries: 0,

    arguments: [],

    print: function(text) { console.log(text); },
    printErr: function(text) { console.error(text); },

    setStatus: function(text) { console.log(text); },

    isDMFSSupported: (function() {
        // DMFS is meant as a mount for FS to provide another way to acess resources, by default we just use IDBFS
        if (typeof DMFS === "undefined")
            return false;
        return true;
    })(),

    isWASMSupported: (function() {
        try {
            if (typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
                const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                if (module instanceof WebAssembly.Module)
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        } catch (e) {
        }
        return false;
    })(),

    prepareErrorObject: function (err, url, line, column, errObj) {
        line = typeof line == "undefined" ? 0 : line;
        column = typeof column == "undefined" ? 0 : column;
        url = typeof url == "undefined" ? "" : url;
        var errorLine = url + ":" + line + ":" + column;

        var error = errObj || (typeof window.event != "undefined" ? window.event.error : "" ) || err || "Undefined Error";
        var message = "";
        var stack = "";

        if (typeof error == "object" && typeof error.stack != "undefined" && typeof error.message != "undefined") {
            stack = String(error.stack);
            message = String(error.message);
        } else {
            stack = String(error).split("\n");
            message = stack.shift();
            stack = stack.join("\n");
        }
        stack = stack || errorLine;

        var callLine = /at (\S+:\d*$)/.exec(message);
        if (callLine) {
            message = message.replace(/(at \S+:\d*$)/, "");
            stack = callLine[1] + "\n" + stack;
        }

        message = message.replace(/(abort\(.+\)) at .+/, "$1");
        stack = stack.replace(/\?{1}\S+(:\d+:\d+)/g, "$1");
        stack = stack.replace(/ *at (\S+)$/gm, "@$1");
        stack = stack.replace(/ *at (\S+)(?: \[as \S+\])? +\((.+)\)/g, "$1@$2");
        stack = stack.replace(/^((?:Object|Array)\.)/gm, "");
        stack = stack.split("\n");

        return { stack:stack, message:message };
    },

    hasWebGPUSupport: function() {
        var webgpu_support = false;
        try {
            var canvas = document.createElement("canvas");
            var webgpu = canvas.getContext("webgpu");
            if (webgpu && webgpu instanceof GPUCanvasContext) {
                webgpu_support = true;
            }
        } catch (error) {
            console.log("An error occurred while detecting WebGPU support: " + error);
            webgpu_support = false;
        }

        return webgpu_support;
    },

    hasWebGLSupport: function() {
        var webgl_support = false;
        try {
            // create canvas to simply check is rendering context supported
            // real render context created by glfw
            var canvas = document.createElement("canvas");
            var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (gl && gl instanceof WebGLRenderingContext) {
                webgl_support = true;
            }
        } catch (error) {
            console.log("An error occurred while detecting WebGL support: " + error);
            webgl_support = false;
        }

        return webgl_support;
    },

    setupCanvas: function(appCanvasId) {
        appCanvasId = (typeof appCanvasId === 'undefined') ? 'canvas' : appCanvasId;
        Module.canvas = document.getElementById(appCanvasId);
        return Module.canvas;
    },


    /**
    * Module.runApp - Starts the application given a canvas element id
    **/
    runApp: function(appCanvasId, _) {
        window.addEventListener("error", (errorEvent) => {
            var errorObject = Module.prepareErrorObject(errorEvent.message, errorEvent.filename, errorEvent.lineno, errorEvent.colno, errorEvent.error);
            Module.ccall('JSWriteDump', 'null', ['string'], [JSON.stringify(errorObject.stack)]);
        });
        Module._isEngineLoaded = true;
        Module.setupCanvas(appCanvasId);

        Module.arguments = CUSTOM_PARAMETERS["engine_arguments"];

        var fullScreenContainer = CUSTOM_PARAMETERS["full_screen_container"];
        if (typeof fullScreenContainer === "string") {
            fullScreenContainer = document.querySelector(fullScreenContainer);
        }
        Module.fullScreenContainer = fullScreenContainer || Module.canvas;

        if (Module.hasWebGLSupport() || Module.hasWebGPUSupport()) {
            Module.canvas.focus();

            Module.canvas.addEventListener("webglcontextlost", function(event) {
                event.preventDefault();
                dmRenderer.rendererContextEvent(dmRenderer.CONTEXT_LOST_EVENT);
            }, false);
            Module.canvas.addEventListener("webglcontextrestored", function(event) {
                dmRenderer.rendererContextEvent(dmRenderer.CONTEXT_RESTORED_EVENT);
            }, false);
            // Add context menu hide-handler if requested
            if (CUSTOM_PARAMETERS["disable_context_menu"])
            {
                Module.canvas.oncontextmenu = function(e) {
                    e.preventDefault();
                };
            }
            Module._preloadAndCallMain();
        } else {
            // "Unable to start game, WebGL not supported"
            ProgressUpdater.complete();
            Module.setStatus = function(text) {
                if (text) Module.printErr('[missing WebGL] ' + text);
            };

            if (typeof CUSTOM_PARAMETERS["unsupported_webgl_callback"] === "function") {
                CUSTOM_PARAMETERS["unsupported_webgl_callback"]();
            }
        }
    },

    onArchiveFileLoaded: function(file) {
        if (file.data) {
            Module._filesToPreload.push({path: file.name, data: file.data});
        }
    },

    onArchiveLoaded: function() {
        GameArchiveLoader.cleanUp();
        Module._archiveLoaded = true;
        Module._preloadAndCallMain();
    },

    toggleFullscreen: function(element) {
        if (GLFW.isFullscreen) {
            GLFW.cancelFullScreen();
        } else {
            GLFW.requestFullScreen(element);
        }
    },

    preSync: function(done) {
        if (Module.persistentStorage != true) {
            done();
            return;
        }
        // Initial persistent sync before main is called
        FS.syncfs(true, function(err) {
            if (err) {
                Module._syncTries += 1;
                console.info(`Unable to synchronize mounted file systems (attempt ${Module._syncTries} of ${Module._syncMaxTries}): `, err);
                if (Module._syncMaxTries > Module._syncTries) {
                    Module.preSync(done);
                } else {
                    console.warn("Mounted system wasn't synchronized. Retry count was exceeded.");
                    Module._syncTries = 0;
                    Module._syncInitial = true;
                    done();
                }
            } else {
                Module._syncTries = 0;
                Module._syncInitial = true;
                if (done !== undefined) {
                    done();
                }
            }
        });
    },

    preloadAll: function() {
        if (Module._preLoadDone) {
            return;
        }
        Module._preLoadDone = true;
        for (var i = 0; i < Module._filesToPreload.length; ++i) {
            var item = Module._filesToPreload[i];
            FS.createPreloadedFile("", item.path, item.data, true, true);
        }
    },

    // Tries to do a MEM->IDB sync
    // It will flag that another one is needed if there is already one sync running.
    persistentSync: function() {

        if (Module.persistentStorage != true) {
            return;
        }
        // Need to wait for the initial sync to finish since it
        // will call close on all its file streams which will trigger
        // new persistentSync for each.
        if (Module._syncInitial) {
            if (Module._syncInProgress) {
                Module._syncNeeded = true;
            } else {
                Module._startSyncFS();
            }
        }
    },

    preInit: [function() {
        // Mount filesystem on preinit
        var dir = DMSYS.GetUserPersistentDataRoot();
        try {
            FS.mkdir(dir);
        }
        catch (error) {
            Module.persistentStorage = false;
            Module._preloadAndCallMain();
            return;
        }

        try {
            if (Module['isDMFSSupported']) {
                // In DMFS mode we will use that as our mountpoint and make sure that all
                // relative paths point into there.
                FS.mount(new DMFS(CUSTOM_PARAMETERS['exe_name']), {}, dir);
                FS.chdir(dir);
            } else {
                // If IndexedDB is supported we mount the persistent data root as IDBFS,
                // then try to do a IDB->MEM sync before we start the engine to get
                // previously saved data before boot.
                FS.mount(IDBFS, {}, dir);
            }
            // Patch FS.close so it will try to sync MEM->IDB
            var _close = FS.close;
            FS.close = function(stream) {
                var r = _close(stream);
                Module.persistentSync();
                return r;
            };
        }
        catch (error) {
            Module.persistentStorage = false;
            Module._preloadAndCallMain();
            return;
        }

        // Sync IDB->MEM before calling main()
        Module.preSync(function() {
            Module._preloadAndCallMain();
        });
    }],

    preRun: [function() {
        /* If archive is loaded, preload all its files */
        if (Module._archiveLoaded) {
            Module.preloadAll();
        }
    }],

    postRun: [function() {
        if (Module._archiveLoaded) {
            ProgressView.removeProgress();
        } else if (Module['isDMFSSupported']) {
            // kick off the content download now that we have FS access
            GameArchiveLoader.downloadContent();
        }
    }],

    _preloadAndCallMain: function() {
        if (Module._syncInitial || Module.persistentStorage != true) {
            // If the archive isn't loaded,
            // we will have to wait with calling main.
            if (Module._archiveLoaded) {
                Module.preloadAll();
                if (Module._isEngineLoaded) {
                    // "Starting...."
                    ProgressUpdater.complete();
                    Module._callMain();
                }
            }
        }
    },

    _callMain: function(_, _) {
        if (!Module._isMainCalled) {
            Module._isMainCalled = true;
            ProgressView.removeProgress();
            if (typeof CUSTOM_PARAMETERS["start_success"] === "function") {
                CUSTOM_PARAMETERS["start_success"]();
            }
            if (Module.callMain === undefined) {
                Module.noInitialRun = false;
            } else {
                Module.callMain(Module.arguments);
            }
        } else {
            console.warn("Main was called several times!");
        }
    },
    // Wrap IDBFS syncfs call with logic to avoid multiple syncs
    // running at the same time.
    _startSyncFS: function() {
        Module._syncInProgress = true;

        if (Module._syncMaxTries > Module._syncTries) {
            FS.syncfs(false, function(err) {
                Module._syncInProgress = false;

                if (err) {
                    console.info(`Unable to synchronize mounted file systems (attempt ${Module._syncTries} of ${Module._syncMaxTries}): `, err);
                    Module._syncTries += 1;
                } else {
                    Module._syncTries = 0;
                }

                if (Module._syncNeeded) {
                    Module._syncNeeded = false;
                    Module._startSyncFS();
                }

            });
        } else {
            console.warn("Mounted system wasn't synchronized. Retry count was exceeded.");
            Module._syncTries = 0;
        }
    },
};

// common engine setup
Module['persistentStorage'] = (typeof window !== 'undefined') && !!(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB);

Module['INITIAL_MEMORY'] = CUSTOM_PARAMETERS.custom_heap_size;

Module['onRuntimeInitialized'] = function() {
    Module.runApp("canvas");
};

Module["isWASMPthreadSupported"] = false 
    && ((typeof window === 'undefined') || window.isSecureContext && window.crossOriginIsolated)
    && typeof SharedArrayBuffer !== 'undefined';

Module["locateFile"] = function(path, scriptDirectory)
{
    // dmengine*.wasm is hardcoded in the built JS loader for WASM,
    // we need to replace it here with the correct project name.
    if (path == "dmengine.wasm" || path == "dmengine_release.wasm" || path == "dmengine_headless.wasm") {
        if (Module['isWASMPthreadSupported']) {
            path = "HelloDefold_pthread.wasm";
        } else {
            path = "HelloDefold.wasm";
        }
    }
    return scriptDirectory + path;
};


window.addEventListener("error", (errorEvent) => {
    if (typeof CUSTOM_PARAMETERS["start_error"] === "function") {
        CUSTOM_PARAMETERS["start_error"](errorEvent);
    }
    Module.setStatus('Exception thrown, see JavaScript console');
    Module.setStatus = function(text) {
        if (text) Module.printErr('[post-exception status] ' + text);
    };
});
