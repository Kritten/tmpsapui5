sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Budgetstopp", {
		
		onInit: function(oEvent){
            jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.Budgetstopp .. onInit");
            
            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");          
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("budgetstopp").attachPatternMatched(this.onPatternMatched, this);
		},
		
		onPatternMatched: function(oEvent){

            var form = {
                
                konditioneneinigungen: [{
					id : "KE_058961",
					mietbegin : "2014/05/01",
					laufzeit : 96,
					gueltigBis : "2014/09/30",
					bezeichnung : "MF Büro 5. OG",
					nutzungsart : "Büro"
				}]
            };
			
            var formModel = new sap.ui.model.json.JSONModel(form);
			this.getView().setModel(formModel, "form");
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
        
	});
});