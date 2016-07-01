sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Sperren", {

		onInit: function(evt){
            jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
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

            var oDataModel = sap.ui.getCore().getModel("odata");

            oDataModel.read("/SperreSet", {
                success: function(oData){
                    console.log(oData);

					var form = {
						sperren: oData.results
					};

					form.sperren.forEach(function(sperre){
						sperre.Uhrzeit = new Date(sperre.Uhrzeit.ms);
					});

					var formModel = new sap.ui.model.json.JSONModel(form);
					_this.getView().setModel(formModel, "form");
                }
            });



		},
		
		onSperreAufhebenButtonPress: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.Sperren .. onSperreAufhebenButtonPress");
			
			var sperrenTable = this.getView().byId("sperrenTable");
			var selectedItems = sperrenTable.getSelectedItems();

            var sperren = this.getView().getModel("form").getProperty("/sperren");
            
            // ES6 Zukunftstechnologie - eventuell überarbeiten
            var objectsToRemove = selectedItems.map(item => item.getBindingContext("form").getObject() );
            sperren = sperren.filter(ma => objectsToRemove.indexOf(ma) === -1  );            
            
            this.getView().getModel("form").setProperty("/sperren", sperren);

            // Selektion aufheben nach dem Löschen
            sperrenTable.removeSelections(true);
		},
		
		onDruckenButtonPress: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.Sperren .. onDruckenButtonPress");
		}        
        
	});
});