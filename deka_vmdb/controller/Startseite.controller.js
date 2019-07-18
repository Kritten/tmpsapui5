sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ag/bpc/Deka/util/StaticData",
	"ag/bpc/Deka/util/ErrorMessageUtil"
], function (Controller, StaticData, ErrorMessageUtil) {

	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Startseite", {

		onInit: function(){
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("startseite").attachPatternMatched(this.onPatternMatch, this);
		},

		onPatternMatch: function(){
			var _this = this;

			StaticData.USER.then(function(user){
				_this.getView().byId("idKonditioneneinigungTile").setVisible(true);
				_this.getView().byId("idVermietungsaktivitaetTile").setVisible(true);
				_this.getView().byId("idBudgetstoppTile").setVisible(user.BtnFm);
				_this.getView().byId("idSperreTile").setVisible(user.BtnAm);
			})
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();
		},

		// Kacheln vom Startbildschirm werden angeklickt
		onKondTilePress: function() {
			// Navigation zur der View
			this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion");
		},

		onVermTilePress: function() {
			// Navigation zur der View
			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetSelektion");
		},

		onBudsTilePress: function() {
			// Navigation zur der View
			this.getOwnerComponent().getRouter().navTo("budgetstopp");
		},

		onSperTilePress: function() {
			// Navigation zur der View
			this.getOwnerComponent().getRouter().navTo("sperren");
		}

	});
});