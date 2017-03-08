sap.ui.define([
	"sap/ui/core/UIComponent", 
	"sap/ui/model/resource/ResourceModel", 
	"sap/ui/core/util/MockServer",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/AppInitHelper"], function (UIComponent, ResourceModel, MockServer, DataProvider, AppInitHelper) {
	
	"use strict";
	return UIComponent.extend("ag.bpc.Deka.Component", {
		
		metadata: {
			manifest: "json"
		},

		init: function () {

			UIComponent.prototype.init.apply(this, arguments);
			var _this = this;

			AppInitHelper.loadExternalFiles(function(){

				console.log(".. external files loaded .. init app");

				_this.initI18nModel();

				_this.initNavigationModel();

				_this.initDataProvider({
					useMockServer: (document.location.hostname === 'localhost')
				});

				_this.getRouter().initialize();

			});
		},

		initDataProvider: function(options){

			var serviceURL;

			if(options.useMockServer)
			{
				serviceURL = "http://mockserver/ZIP_VMDB_SRV/";

				var mockserver = new MockServer({
					rootUri: serviceURL
				});

				var sPath = jQuery.sap.getModulePath("ag.bpc.Deka");
				mockserver.simulate(sPath + "/model/service-v5.xml");
				mockserver.start();
			}
			else
			{
				if (document.location.origin) {
					// for Chrome
					serviceURL = document.location.origin;
				} else { 
					// for IE
					serviceURL = document.location.protocol + "//" + document.location.host;
				}

				serviceURL += "/sap/opu/odata/sap/ZIP_VMDB_SRV/";
			}

			var oDataModel = new sap.ui.model.odata.v2.ODataModel(serviceURL, {
				useBatch: false,
				defaultUpdateMethod: "Put",
				disableHeadRequestForToken: true
			});

			// > Nur für Abwärtskompatibilität. Rausschmeißen wenn alles gegen den DataProvider geht
			sap.ui.getCore().setModel(oDataModel, "odata");
			// <


			DataProvider.setModel(oDataModel);
		},

		initNavigationModel: function(){

			// Model für Übergabe komplexer Parameter bei Navigationen
			var navigationModel = new sap.ui.model.json.JSONModel({
				payload: null
			});
			sap.ui.getCore().setModel(navigationModel, "navigation");
		},

		initI18nModel: function(){
			// Mehrsprachigkeit
			var sLocale = sap.ui.getCore().getConfiguration().getLanguage(); // Anmeldesprache ermitteln		
			
			var oi18nModel = new ResourceModel({
				bundleName: "ag.bpc.Deka.i18n.translation"
				//,bundleLocale : "en-US"  // zum Test "de" oder "en" eintragen
			});
			sap.ui.getCore().setModel(oi18nModel, "i18n");
		}

	});
});