sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/Filter"], function (Controller, Filter) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Budgetstopp", {
		
		onInit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.Budgetstopp .. onInit");
            
            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");          
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("budgetstopp").attachPatternMatched(this.onPatternMatched, this);
		},
		
		onPatternMatched: function(oEvent){

            var form = {
                
				fonds: [
					{key: "Fond A", text: "Fond A"},
					{key: "Fond B", text: "Fond B"},
					{key: "Fond C", text: "Fond C"}
				],
				
                konditioneneinigungen: [{
					id : "KE_123456",
					mietbegin : "2014/05/01",
					laufzeit : 80,
					gueltigBis : "2014/09/30",
					bezeichnung : "MF Büro 2. OG",
					nutzungsart : "Büro",
					fond: "Fond A"
				}, {
					id : "KE_123457",
					mietbegin : "2014/05/01",
					laufzeit : 62,
					gueltigBis : "2014/09/30",
					bezeichnung : "MF Büro 7. OG",
					nutzungsart : "Büro",
					fond: "Fond A"
				}, {
					id : "KE_123458",
					mietbegin : "2014/05/01",
					laufzeit : 96,
					gueltigBis : "2014/09/30",
					bezeichnung : "MF Büro 8. OG",
					nutzungsart : "Büro",
					fond: "Fond B"
				}],
				
				selectedFond: null
            };
			
			form.selectedFond = form.fonds[0].key;
			
            var formModel = new sap.ui.model.json.JSONModel(form);
			this.getView().setModel(formModel, "form");
			
			this.applyFilters();
		},
		
		onBack: function(evt){
			this.getOwnerComponent().getRouter().navTo("startseite", null, true);
		},
		
		onDruckenButtonPress: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.Budgetstopp .. onDruckenButtonPress");
		},
		
		onGenehmigungZurueckziehenButtonPress: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.Budgetstopp .. onGenehmigungZurueckziehenButtonPress");
		},
		
		onFondSelektionChange: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.Budgetstopp .. onFondSelektionChange");
			this.applyFilters();
		},
		
		applyFilters: function(){

			var konditioneneinigungenTable = this.getView().byId("konditioneneinigungenTable");
			konditioneneinigungenTable.removeSelections(true);

			var fondSelektion = this.getView().byId("fondSelektion");
			var selectedFond = fondSelektion.getSelectedKey();
			
			console.log(selectedFond);
			
			var filter = new Filter("fond", sap.ui.model.FilterOperator.EQ, selectedFond);
			
			konditioneneinigungenTable.getBinding("items").filter(filter);
		}
        
	});
});