sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/model/resource/ResourceModel", "sap/ui/core/util/MockServer"], function (UIComponent, ResourceModel, MockServer) {
	
   "use strict";
   return UIComponent.extend("ag.bpc.Deka.Component", {
	   
		metadata: {
			manifest: "json"
		},

		init: function () {
			
			// call the init function of the parent
			console.log(".. init component");
			UIComponent.prototype.init.apply(this, arguments);
			

            jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);

			// Mehrsprachigkeit
			var sLocale = sap.ui.getCore().getConfiguration().getLanguage(); // Anmeldesprache ermitteln		
			
			var oi18nModel = new ResourceModel({
				bundleName: "ag.bpc.Deka.i18n.translation"
				//,bundleLocale : "en-US"  // zum Test "de" oder "en" eintragen
			});
			sap.ui.getCore().setModel(oi18nModel, "i18n");

			// Model für Übergabe komplexer Parameter bei Navigationen
			var navigationModel = new sap.ui.model.json.JSONModel({
				payload: null
			});
			sap.ui.getCore().setModel(navigationModel, "navigation");

			// URL des OData Services auf dem Gateway
			var serviceUrl = "https://xxx";
			var useMockServer = true;

			if(useMockServer)
			{
				var oMockServer = new MockServer({
					rootUri: "/destinations/mockserver/service.svc/"
				});

				var sPath = jQuery.sap.getModulePath("ag.bpc.Deka");
				oMockServer.simulate(sPath + "/model/service.xml");
				oMockServer.start();

				serviceUrl = "/destinations/mockserver/service.svc/";
			}

			//var oDataModel = new sap.ui.model.odata.ODataModel(serviceUrl);
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(serviceUrl);
			sap.ui.getCore().setModel(oDataModel, "odata");

			this.getRouter().initialize();
		}
   });
});