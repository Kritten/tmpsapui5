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