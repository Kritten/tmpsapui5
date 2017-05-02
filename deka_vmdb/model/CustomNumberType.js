sap.ui.define([
    "sap/ui/model/SimpleType", "sap/ui/model/ValidateException"
], function(SimpleType, ValidateException) {
    return SimpleType.extend("model.CustomNumberType", {
        formatValue: function(sValue, sInternalType){
            if(sValue === ""){
                return "";
            }         
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: 'Standard',
                decimals: 2
            });

            return oNumberFormat.format(sValue);
        },

        parseValue: function(sValue, sInternalType){
            // TODO: Anpassen für internationale Formate
           // return sValue.replace(",", ".");

           var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: 'Standard',
                decimals: 2
            });

            return oNumberFormat.parse(sValue);
        },

        validateValue: function(sValue){
            //TODO: implement
            return true;
        }
    });
});