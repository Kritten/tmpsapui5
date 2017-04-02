sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ag/bpc/Deka/util/StaticData",
	"ag/bpc/Deka/util/ErrorMessageUtil"], function (Controller, StaticData, ErrorMessageUtil) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Startseite", {
		
		onInit: function(evt){
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("startseite").attachPatternMatched(this.onPatternMatch, this);
		},
        
		onPatternMatch: function(oEvent){
			var _this = this;

			StaticData.USER.then(function(user){
				_this.getView().byId('idKonditioneneinigungTile').setVisible(true);
				_this.getView().byId('idVermietungsaktivitaetTile').setVisible(true);
				_this.getView().byId('idBudgetstoppTile').setVisible(!user.BtnAm);
				_this.getView().byId('idSperreTile').setVisible(!user.BtnFm);
			})
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();
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