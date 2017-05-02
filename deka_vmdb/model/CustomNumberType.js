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
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: 'Standard',
                decimals: 2
            });

            return oNumberFormat.parse(sValue);
        },

        validateValue: function(value){
            var sValue = value.toString();
            var digits = sValue.split("");

            digits = digits.reverse();

            if(digits[2] !== "."){
                // Zahl hat entweder mehr oder weniger als 2 Nachkommastellen
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
            });

            return true;
        }
    });
});