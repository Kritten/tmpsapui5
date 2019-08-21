/* Deprecated */
sap.ui.define([], function() {

    "use strict";
    return {

        loadExternalFiles: function(appBasePath, fnSuccess, fnError){
            var _this = this;

            jQuery.sap.includeScript(appBasePath + "/ext/js/q.js", null, function(){

                Q.all([
                    _this.loadExternalLibraryAsync(appBasePath + "/ext/js/underscore.js"),
                    _this.loadExternalLibraryAsync(appBasePath + "/ext/js/SheetJS/xlsx.core.min.js"),
                    _this.loadExternalStylesheetAsync(appBasePath + "/ext/css/style.css")
                ])
                .then(fnSuccess)
                .catch(fnError)
                .done();
            });
        },

        /**
         * reject wird ausgelöst, wenn css Datei leer ist. Anwendung startet nicht.
         * Daher voerst auskommentiert:  _this.loadExternalStylesheetAsync('./css/style.css')
         */
        loadExternalStylesheetAsync: function(path){
            return Q.Promise(function(resolve, reject){
                jQuery.sap.includeStyleSheet(path, null, resolve, reject);
            });
        },

        loadExternalLibraryAsync: function(path){
            return Q.Promise(function(resolve, reject){
                jQuery.sap.includeScript(path, null, resolve, reject);
            });
        }

    };

});