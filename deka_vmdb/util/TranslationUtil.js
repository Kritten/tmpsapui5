sap.ui.define([], function() {

    "use strict";
    return {
        translate: function(key){
            return sap.ui.getCore().getModel("i18n").getProperty(key);
        }
    };

});