/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:44:36 
 * @Last Modified by: Christian Hoff (best practice consulting AG)
 * @Last Modified time: 2017-05-03 22:40:35
 */
sap.ui.define([], function() {

    "use strict";
    return {

        loadExternalFiles: function(appBasePath, fnSuccess, fnError){
            var _this = this;

            jQuery.sap.includeScript(appBasePath + '/../js/q.js', null, function(){

                Q.all([
                    _this.loadExternalLibraryAsync(appBasePath + '/../js/underscore-min.js'),
                    _this.loadExternalLibraryAsync(appBasePath + '/../js/SheetJS/xlsx.core.min.js'),
                    _this.loadExternalStylesheetAsync(appBasePath + '/../css/style.css')
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