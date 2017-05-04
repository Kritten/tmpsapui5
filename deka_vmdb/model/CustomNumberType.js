sap.ui.define([
    "sap/ui/model/SimpleType", "sap/ui/model/ValidateException"
], function(SimpleType, ValidateException) {
    return SimpleType.extend("model.CustomNumberType", {
        formatValue: function(sValue, sInternalType){
            if(sValue === "" || sValue === null || sValue === "null") {
                return "";
            }         
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: 'Standard',
                decimals: 2
            });

            return oNumberFormat.format(sValue);
        },

        parseValue: function(sValue, sInternalType){ 
            if(sValue === "" || sValue === null || sValue === "null") {
                return "";
            }           
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: 'Standard',
                decimals: 2
            });

            return oNumberFormat.parse(sValue);
        },

        validateValue: function(value){
            // Validierung:
            // 1. Anzahl Nachkommastellen überprüfen            
            // 2. Überprüfen, dass nur Zahlen eingegeben wurden
            /*var nachkommastellen = 2; 

            var sValue = value.toString();
            var digits = sValue.split("");

            digits = digits.reverse();

            if(digits[nachkommastellen] !== "."){
                // Zahl hat falsche Anzahl Nachkommastellen
                return false;
            }else{
                // Punkt entfernen
                digits.splice(2,1);
            }

            _.map(digits, function(digit){
                if( isNaN(parseInt(digit)) ) {
                    // Zahl enthält einen Buchstaben oder Sonderzeichen
                    return false;
                }
            });*/

            if(value === "" || value === null){
                return false;
            }else{                
                return true;
            }
        }
    });
});