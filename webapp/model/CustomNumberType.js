sap.ui.define([
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException"
], function(SimpleType, ValidateException) {

    return SimpleType.extend("model.CustomNumberType", {

        formatValue: function (sValue) {
            if (sValue === "" || sValue === null || sValue === "null") {
                return "";
            }
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: "Standard",
                decimals: 2
            });

            return oNumberFormat.format(sValue);
        },

        parseValue: function (sValue) {
            if (sValue === "" || sValue === null || sValue === "null") {
                return "";
            }
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: "Standard",
                decimals: 2
            });

            return oNumberFormat.parse(sValue);
        },

        validateValue: function (value) {
            if (isNaN(value)) {
                console.log("isNaN");
                throw new ValidateException(value + " ist keine gültige Zahl.");
            }

            if (value === "" || value === null || value === "null") {
                return false;
            } else {
                return true;
            }
        },

        formatDifferenz: function (a, b) {
            var oNumber = Math.round((a * 100 - b * 100) / 100);
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: "Standard",
                decimals: 2
            });
            return oNumberFormat.format(oNumber) + "test";
        }

    });

});