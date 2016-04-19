sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Startseite", {
		
		onInit: function(evt){
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");			
		},
        
    // Kacheln vom Startbildschirm werden angeklickt    
	onKondTilePress: function(evt) {
		// Navigation zur der View
		this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion");
	},
	
	onVermTilePress: function(evt) {
		// Navigation zur der View
		this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetSelektion");
	},
	
	onBudsTilePress: function(evt) {
		// Navigation zur der View
		this.getOwnerComponent().getRouter().navTo("budgetstopp");
	},
	
	onBeriTilePress: function(evt) {
		// Navigation zur der View
		this.getOwnerComponent().getRouter().navTo("berichte");
	},
	
	onSperTilePress: function(evt) {
		// Navigation zur der View
		this.getOwnerComponent().getRouter().navTo("sperren");
	}
	
	});
});