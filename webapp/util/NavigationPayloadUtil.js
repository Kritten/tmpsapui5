sap.ui.define([], function () {

    "use strict";
	return {

        putPayload: function(payload){
            var navigationModel = sap.ui.getCore().getModel("navigation");
            navigationModel.setProperty("/payload", payload);
        },

        takePayload: function(){
            var navigationModel = sap.ui.getCore().getModel("navigation");

            var payload = navigationModel.getProperty("/payload");
            navigationModel.setProperty("/payload", null);

            return payload;
        }
    };

});