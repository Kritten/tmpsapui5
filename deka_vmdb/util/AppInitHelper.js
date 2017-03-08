sap.ui.define([], function() {

    "use strict";
    return {

        loadExternalFiles: function(fnSuccess, fnError){
            var _this = this;

            jQuery.sap.includeScript('./js/q.js', null, function(){

                Q.all([
                    _this.loadExternalLibraryAsync('./js/underscore-min.js'),
                    _this.loadExternalLibraryAsync('./js/SheetJS/xlsx.core.min.js')
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
            return Q.Promise(function(resolve, reject, notify){
                jQuery.sap.includeStyleSheet(path, null, resolve, reject);
            });
        },

        loadExternalLibraryAsync: function(path){
            return Q.Promise(function(resolve, reject, notify){
                jQuery.sap.includeScript(path, null, resolve, reject);
            });
        }

    };
});