/*
 * @Author: Christian Hoff (best practice consulting AG)
 * @Date: 2017-04-05 21:44:59
 * @Last Modified by:   Christian Hoff (best practice consulting AG)
 * @Last Modified time: 2017-04-05 21:44:59
 */
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


        // Lecacy Funktion. Show etablieren. Erst parsen, dann anzeigen
        showError: function(oError) {
            var error = this.parseErrorMessage(oError);
            MessageBox.error(error.text);
        },


        show: function(error){
            MessageBox.error(error.text);
        },


        parseErrorMessage: function(oError){
            var error = {
                type: 'ERROR'
            };

            if(oError.responseText){
                try {
                    var response = JSON.parse(oError.responseText);

                    if(response.error && response.error.code){

                        // SAP Nachrichtenklasse und Nummer holen
                        var matches = response.error.code.match(/([A-Z_]+)\/([0-9]+)/);

                        if(matches){
                            error.msgid = matches[1];
                            error.msgno = matches[2];

                            if(error.msgid === 'ZCL_ZIP_VMDB_MESSAGE'){
                                error.type = 'WARNING';
                            }
                        }

                        if(response.error.innererror) {
                            var messages = _.map(response.error.innererror.errordetails, function(errordetails){
                                return errordetails.message;
                            });
                            error.text = messages.join('\n');
                        }
                        else{
                            error.text = response.error.message.value;
                        }
                    }
                } catch (parseError) {
                    error.text = oError.responseText;
                }
            }
            else {
                error.text = (typeof oError === 'string') ? oError : JSON.stringify(oError);
            }

            return error;
        }

    };
});