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
            if(number === ""){
                return "";
            }        

            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: 'Standard'
            });
            console.log(oNumberFormat, "oFormat");

            return oNumberFormat.format(number);
        },

        parseNumber: function(numberString){
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                style: 'Standard'
            });
            console.log(oNumberFormat, "oFormat");

            return oNumberFormat.parse(numberString);
        }        
	};
});