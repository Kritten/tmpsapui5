/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:44:49 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:44:49 
 */
sap.ui.define(["ag/bpc/Deka/util/NumberFormatter"], function (NumberFormatter) {
	
	"use strict";
	return {
		toLocalFormat: function(number){
            var lang = sap.ui.getCore().getConfiguration().getLanguage();

            var groupSep;
            var decSep;

            switch(lang){
                case "de-DE":
                    groupSep = ".";
                    decSep   = ",";
                    break;
                case "en-EN":
                    groupSep = ",";
                    decSep   = ".";
                    break;
                default:
                    // Standard: deutsch
                    groupSep = ".";
                    decSep   = ",";
            }

            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                maxFractionDigits: 2,
                groupingEnabled: true,
                groupingSeparator: groupSep,
                decimalSeparator: decSep
            });            

            return oNumberFormat.format(number);
        },

        parseNumber: function(number){
            var lang = sap.ui.getCore().getConfiguration().getLanguage();

            var groupSep;
            var decSep;

            switch(lang){
                case "de-DE":
                    groupSep = ".";
                    decSep   = ",";
                    break;
                case "en-EN":
                    groupSep = ",";
                    decSep   = ".";
                    break;
                default:
                    // Standard: deutsch
                    groupSep = ".";
                    decSep   = ",";
            }

            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                maxFractionDigits: 2,
                groupingEnabled: true,
                groupingSeparator: groupSep,
                decimalSeparator: decSep
            });            
            
            return oNumberFormat.parse(number);
        }        
	};
});