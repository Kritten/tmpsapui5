sap.ui.define([], function () {

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