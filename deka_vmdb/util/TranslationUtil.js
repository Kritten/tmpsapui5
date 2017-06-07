/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:45:27 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:45:27 
 */
sap.ui.define([], function() {

    "use strict";
    return {
        translate: function(key){         
            return sap.ui.getCore().getModel("i18n").getProperty(key);
        }
    };
});