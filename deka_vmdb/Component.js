sap.ui.define([
	"sap/ui/core/UIComponent", 
	"sap/ui/model/resource/ResourceModel", 
	"sap/ui/core/util/MockServer",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/AppInitHelper",
	"ag/bpc/Deka/util/StaticData"], function (UIComponent, ResourceModel, MockServer, DataProvider, AppInitHelper, StaticData) {
	
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

				StaticData.init();

				_this.initTextModel();

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
				mockserver.simulate(sPath + "/model/service-v13.xml", {
					sMockdataBaseUrl: sPath + "/model/mockdata",
					bGenerateMissingMockData: true
				});
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
		},

		initTextModel: function(){
			var textModel = new sap.ui.model.json.JSONModel({});
			sap.ui.getCore().setModel(textModel, "text");

            Q.when(StaticData.VERTRAGSARTEN).then(function(vertragsarten){
                var vertragsartMapping = _.object(_.map(vertragsarten, function(vertragsart){
                    return [vertragsart.VrId, vertragsart.Txtsh];
                }));
                textModel.setProperty("/vertragsart", vertragsartMapping);
            }).done();

			Q.when(StaticData.NUTZUNGSARTEN).then(function(nutzungsarten){
				var nutzungsartMapping = _.object(_.map(nutzungsarten, function(nutzungsart){
                    return [nutzungsart.NaId, nutzungsart.TextSh];
                }));
                textModel.setProperty("/nutzungsart", nutzungsartMapping);
			}).done();

			Q.when(StaticData.KATEGORIEN).then(function(kategorien){
                var kategorieMapping = _.object(_.map(kategorien, function(kategorie){
                    return [kategorie.KaId, kategorie.Text];
                }));
				textModel.setProperty("/kategorie", kategorieMapping);
			}).done();

			Q.when(StaticData.ANMERKUNGEN).then(function(anmerkungen){
                var anmerkungMapping = _.object(_.map(anmerkungen, function(anmerkung){
                    return [anmerkung.Id, anmerkung.Txtmd];
                }));
				textModel.setProperty("/anmerkung", anmerkungMapping);
			}).done();

			Q.when(StaticData.STATUSWERTE).then(function(statuswerte){
                var statusMapping = _.object(_.map(statuswerte, function(statuswert){
                    return [statuswert.Stid, statuswert.Txtmd];
                }));
				textModel.setProperty("/status", statusMapping);
			}).done();

			Q.when(StaticData.VERMIETUNGSARTEN).then(function(vermietungsarten){
                var vermietungsartMapping = _.object(_.map(vermietungsarten, function(vermietungsart){
                    return [vermietungsart.key, vermietungsart.text];
                }));
				textModel.setProperty("/vermietungsart", vermietungsartMapping);
			}).done();

		}

	});
});