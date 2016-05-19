sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.VermietungsaktivitaetDetails", {
		
		onInit: function(evt){
            jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onInit");
            
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
			
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("vermietungsaktivitaetDetails").attachPatternMatched(this.onVermietungsaktivitaetAnzeigen, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenWe").attachPatternMatched(this.onVermietungsaktivitaetAnlegenAufBasisEinerWirtschaftseinheit, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenMv").attachPatternMatched(this.onVermietungsaktivitaetAnlegenAufBasisEinesMietvertrags, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenKe").attachPatternMatched(this.onVermietungsaktivitaetAnlegenAufBasisEinerKonditioneneinigung, this);
		},
        
		onVermietungsaktivitaetAnzeigen: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnzeigen");
			
            var form = {
                modus: "show", // show, new, edit
                
                vermietungsaktivitaet: {
                    id: "VA_123456",
                    buchungskreis: "9-30",
                    wirtschaftseinheit: "0599",
                    bezeichnung: "20006 Washington, 1999 K Street",
                    
                    mietflaechenangaben: [],
                    
                    gemeinsameAngaben: {
                        mietbeginn: null,
                        laufzeit1stBreak: null,
                        gueltigkeitKonditioneneinigung: null,
                        mietfreieZeit: null,
                        maklerkosten: null,
                        beratungskosten: null
                    },
                                        
                    mieteGesamt: {vermietungsaktivitaet: null, konditioneneinigung: null},
                    kostenGesamt: {vermietungsaktivitaet: null, konditioneneinigung: null},
                    
                    arbeitsvorrat: null
                }
            };
            
            var user = {
                rolle: "FM" // FM, AM 
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            var userModel = new sap.ui.model.json.JSONModel(userModel);
            
            this.getView().setModel(userModel, "user");
			this.getView().setModel(formModel, "form");
		},
		
		onVermietungsaktivitaetAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinerWirtschaftseinheit");
		},
		
		onVermietungsaktivitaetAnlegenAufBasisEinesMietvertrags: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinesMietvertrags");
		},
		
		onVermietungsaktivitaetAnlegenAufBasisEinerKonditioneneinigung: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinerKonditioneneinigung");
		}
		
        
	});
});