sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/ErrorMessageUtil",
	"ag/bpc/Deka/util/StaticData"], function (Controller, DataProvider, ErrorMessageUtil, StaticData) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Budgetstopp", {
		
		onInit: function(oEvent){
            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("budgetstopp").attachPatternMatched(this.onPatternMatched, this);
		},
		
		onPatternMatched: function(oEvent){
			var _this = this;

			var formModel = new sap.ui.model.json.JSONModel({
				fonds: [],
				konditioneneinigungen: []
			});
			_this.getView().setModel(formModel, "form");

			DataProvider.readFondsSetAsync().then(function(fonds){
				_this.getView().getModel("form").setProperty("/fonds", fonds);
				_this.getView().getModel("form").setProperty("/selectedFondKey", fonds[0].Dmfonds);
				_this.ladeKonditioneneinigungen();
			})
			.catch(function(oError){
				ErrorMessageUtil.showError(oError);
			})
			.done();
		},
		
		ladeKonditioneneinigungen: function(){
			var _this = this;

			this.getView().byId("konditioneneinigungenTable").removeSelections(true);
			_this.getView().getModel("form").setProperty("/konditioneneinigungen", []);

			var item = _this.getView().byId("idSelectFond").getSelectedItem();
			var fond = item.getBindingContext("form").getObject();

			DataProvider.readFondAsync(fond.Dmfonds).then(function(fond){
				_this.getView().getModel("form").setProperty("/konditioneneinigungen", fond.FoToKo);
			})
			.catch(function(oError){
				ErrorMessageUtil.showError(oError);
			})
			.done();
		},

		onFondSelektionChange: function(oEvent){
            this.ladeKonditioneneinigungen();
		},
		
		onDruckenButtonPress: function(oEvent){
		},
		
		onGenehmigungZurueckziehenButtonPress: function(oEvent){
			var _this = this;

			var items = _this.getView().byId("konditioneneinigungenTable").getSelectedItems();
			var konditioneneinigungen = _.map(items, function(item){
				return item.getBindingContext("form").getObject();
			});

			Q.all(_.map(konditioneneinigungen, function(ke){
				
				return DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
					KeId: ke.KeId, 
					Bukrs: ke.Bukrs, 
					Anmerkung: StaticData.ANMERKUNG.KE.AUS_WICHTIGEM_GRUND_ZURUECKGEZOGEN
				});

			}))
			.catch(function(oError){
				ErrorMessageUtil.showError(oError);
			})
			.fin(function(){
				_this.ladeKonditioneneinigungen();
			})
			.done();
		},

		onBack: function(evt){
			this.getOwnerComponent().getRouter().navTo("startseite", null, true);
		}
        
	});
});