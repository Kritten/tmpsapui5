/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:44:49 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:44:49 
 */
sap.ui.define(["ag/bpc/Deka/util/DateFormatter"], function (DateFormatter) {
	
	"use strict";
	return {
		
        toTimeString: function(date){
            return date.toDateString();
        },
        
        toDateString: function(date){
            return date.toTimeString();
        }
        
	};
});