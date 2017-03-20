sap.ui.define(["sap/m/MessageBox"], function(MessageBox) {

    "use strict";
    return {

        showODataError: function(oError){

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
        },

        parseErrorMessage: function(responseText){
            var message = "Ein unbekannter Fehler ist aufgetreten";

            var response = JSON.parse(responseText);

            if(response.error)
            {
                if(response.error.innererror) {
                    var messages = _.map(response.error.innererror.errordetails, function(errordetails){
                        return errordetails.message;
                    });
                    message = messages.join('\n');
                }
                else{
                    message = response.error.message.value;
                }
            }

            return message;
        },

        showError: function(oError) {
            var errorMessage = 'Ein unbekannter Fehler ist aufgetreten';

            if(oError) 
            {
                if(oError.responseText)
                {
                    errorMessage = this.parseErrorMessage(oError.responseText);
                } 
                else 
                {
                    errorMessage = (typeof oError === 'string') ? oError : JSON.stringify(oError);
                }
            }
            
            MessageBox.error(errorMessage);
        }

    };
});