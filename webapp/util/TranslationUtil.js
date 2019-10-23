sap.ui.define([], function() {

	var isLocaleDE = sap.ui.getCore().getConfiguration().getLanguage().toLowerCase().indexOf('de') !== -1;

    "use strict";
    return {
        translate: function(key){
            return sap.ui.getCore().getModel("i18n").getProperty(key);
        },
        parseFloatLocale: function(sValue) {
         if(isLocaleDE === true) {
         	sValue = sValue.replace(/\,/g, 'COMMA').replace(/\./g, '').replace(/COMMA/g, '.');
         }
         
         return parseFloat(sValue);
        },
    };

});