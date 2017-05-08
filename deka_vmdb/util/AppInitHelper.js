/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:44:36 
 * @Last Modified by: Christian Hoff (best practice consulting AG)
 * @Last Modified time: 2017-05-04 21:13:35
 */

/* Deprecated */
sap.ui.define([], function() {

    "use strict";
    return {

        loadExternalFiles: function(appBasePath, fnSuccess, fnError){
            var _this = this;

            jQuery.sap.includeScript(appBasePath + '/ext/js/q.js', null, function(){

                Q.all([
                    _this.loadExternalLibraryAsync(appBasePath + '/ext/js/underscore-min.js'),
                    _this.loadExternalLibraryAsync(appBasePath + '/ext/js/SheetJS/xlsx.core.min.js'),
                    _this.loadExternalStylesheetAsync(appBasePath + '/ext/css/style.css')
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