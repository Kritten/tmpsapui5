sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ag/bpc/Deka/util/DataProvider"], function (Controller, DataProvider) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Sperren", {

		onInit: function(evt){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.Sperren .. onInit");
            
            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");          
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("sperren").attachPatternMatched(this.onPatternMatched, this);
		},
		
		onBack: function(oEvent){
			this.getOwnerComponent().getRouter().navTo("startseite", null, true);
		},
		
		onPatternMatched: function(oEvent){
			var _this = this;

			DataProvider.readSperrenAsync().then(function(sperren){

				var form = {
					sperren: _.map(sperren, function(sperre){
						sperre.Uhrzeit = new Date(sperre.Uhrzeit.ms);
						return sperre;
					})
				};

				var formModel = new sap.ui.model.json.JSONModel(form);
				_this.getView().setModel(formModel, "form");

			})
			.catch(function(oError){
				console.log(oError);
			})
			.done();

		},
		
		onSperreAufhebenButtonPress: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.Sperren .. onSperreAufhebenButtonPress");
			
			var sperrenTable = this.getView().byId("sperrenTable");
			var selectedItems = sperrenTable.getSelectedItems();

            var sperren = this.getView().getModel("form").getProperty("/sperren");

			var selectedSperren = [];
			selectedItems.forEach(function(selectedItem){
				selectedSperren.push( selectedItem.getBindingContext("form").getObject() );
			});

			selectedSperren.forEach(function(sperre){
				var i = sperren.length;
				while (i--) {
					if( (sperren[i].KeId === sperre.KeId) && (sperren[i].VaId === sperre.VaId) && (sperren[i].Benutzer === sperre.Benutzer) ){
						sperren.splice(i, 1);
					}
				}
			});

            this.getView().getModel("form").setProperty("/sperren", sperren);

            // Selektion aufheben nach dem Löschen
            sperrenTable.removeSelections(true);
		},
		
		onDruckenButtonPress: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.Sperren .. onDruckenButtonPress");
		}        
        
	});
});