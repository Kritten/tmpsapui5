sap.ui.define(["sap/m/MessageBox"], function(MessageBox) {

    "use strict";
    return {

        showError: function(oError){

            var jsonObj = JSON.parse(oError.responseText);
            var sMessage = "";
            var j = 0;
            if (jsonObj.error.innererror) {

                for ( var i = 0; i < jsonObj.error.innererror.errordetails.length; i++) 
                {
                    if (jsonObj.error.innererror.errordetails[i].severity === "error") 
                    { 
                        if(j > 0 ) 
                        {
                            sMessage = sMessage + "\n";
                        }
                        
                        sMessage = sMessage + jsonObj.error.innererror.errordetails[i].message;
                        j++;
                    }
                }
            }
            if(sMessage === "" && jsonObj.error.message && jsonObj.error.message.value) 
            {
                sMessage = jsonObj.error.message.value;
            }

            if(sMessage === ""){
                sMessage = "Es ist ein Fehlder aufgetreten.";
            }

            MessageBox.alert(sMessage);
        }

    };
});