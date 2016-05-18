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