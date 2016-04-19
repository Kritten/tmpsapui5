sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/resource/ResourceModel"], function (UIComponent, ResourceModel) {
	
   "use strict";
   return UIComponent.extend("ag.bpc.Deka.Component", {
	   
		metadata: {
			manifest: "json"
		},

		init : function () {
			
			// call the init function of the parent
			console.log(".. init component");
			UIComponent.prototype.init.apply(this, arguments);
			
			var jsonModel = new sap.ui.model.json.JSONModel({
                
			})
			
			sap.ui.getCore().setModel(jsonModel);
			
			// Mehrsprachigkeit
			var sLocale = sap.ui.getCore().getConfiguration().getLanguage(); // Anmeldesprache ermitteln		
			console.log("locale: " + sLocale);
			
			var oi18nModel = new ResourceModel({
				bundleName: "ag.bpc.Deka.i18n.translation"
				//,bundleLocale : "en-US"  // zum Test "de" oder "en" eintragen
			});
					

			
			sap.ui.getCore().setModel(oi18nModel, "i18n");
			
			
			this.getRouter().initialize();
		}
   });
});