sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/util/MockServer",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/AppInitHelper",
	"ag/bpc/Deka/util/StaticData",
	/* ... */
	"ag/bpc/Deka/ext/js/q",
	"ag/bpc/Deka/ext/js/underscore-min",
	"ag/bpc/Deka/ext/js/SheetJS/xlsx.core.min"
], function (UIComponent, ResourceModel, MockServer, DataProvider, AppInitHelper, StaticData) {

	"use strict";
	return UIComponent.extend("ag.bpc.Deka.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {

			UIComponent.prototype.init.apply(this, arguments);
			var that = this;

			that.initI18nModel();

			that.initNavigationModel();

			that.initDataProvider({
				// useMockServer: true
				useMockServer: (document.location.hostname === "localhost")
			});

			StaticData.init();

			that.initTextModel();

			that.getRouter().initialize();
		},

		initDataProvider: function (options) {

			var serviceURL;
			var sPath = jQuery.sap.getModulePath("ag.bpc.Deka");

			if (options.useMockServer) {
				serviceURL = "http://mockserver/ZIP_VMDB_SRV/";

				var mockserver = new MockServer({
					rootUri: serviceURL
				});

				mockserver.simulate(sPath + "/model/service.xml", {
					sMockdataBaseUrl: sPath + "/model/mockdata",
					bGenerateMissingMockData: true
				});
				
				mockserver.start();
			} else {
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

			// Model Zugriff mit getModel sollten nicht mehr verwendet werden
			// Rausschmeißen wenn alles über den DataProvider geht
			sap.ui.getCore().setModel(oDataModel, "odata");
			// <

			DataProvider.setModel(oDataModel);
		},

		initNavigationModel: function () {

			// Model für Übergabe komplexer Parameter bei Navigationen
			var navigationModel = new sap.ui.model.json.JSONModel({
				payload: null
			});
			sap.ui.getCore().setModel(navigationModel, "navigation");
		},

		initI18nModel: function () {
			var oi18nModel = new ResourceModel({
				bundleName: "ag.bpc.Deka.i18n.translation",
				// bundleLocale: "de"
			});
			sap.ui.getCore().setModel(oi18nModel, "i18n");
		},

		initTextModel: function () {
			var textModel = new sap.ui.model.json.JSONModel({});
			sap.ui.getCore().setModel(textModel, "text");

			Q.when(StaticData.VERTRAGSARTEN).then(function (vertragsarten) {
				var vertragsartMapping = _.object(_.map(vertragsarten, function (vertragsart) {
					return [vertragsart.VrId, vertragsart.Txtsh];
				}));
				textModel.setProperty("/vertragsart", vertragsartMapping);
			}).done();

			Q.when(StaticData.NUTZUNGSARTEN).then(function (nutzungsarten) {
				var nutzungsartMapping = _.object(_.map(nutzungsarten, function (nutzungsart) {
					return [nutzungsart.NaId, nutzungsart.TextSh];
				}));
				textModel.setProperty("/nutzungsart", nutzungsartMapping);
			}).done();

			Q.when(StaticData.KATEGORIEN).then(function (kategorien) {
				var kategorieMapping = _.object(_.map(kategorien, function (kategorie) {
					return [kategorie.KaId, kategorie.Text];
				}));
				textModel.setProperty("/kategorie", kategorieMapping);
			}).done();

			Q.when(StaticData.ANMERKUNGEN).then(function (anmerkungen) {
				var anmerkungMapping = _.object(_.map(anmerkungen, function (anmerkung) {
					return [anmerkung.Id, anmerkung.Txtmd];
				}));
				textModel.setProperty("/anmerkung", anmerkungMapping);
			}).done();

			Q.when(StaticData.STATUSWERTE).then(function (statuswerte) {
				var statusMapping = _.object(_.map(statuswerte, function (statuswert) {
					return [statuswert.Stid, statuswert.Txtmd];
				}));
				textModel.setProperty("/status", statusMapping);
			}).done();

			Q.when(StaticData.VERMIETUNGSARTEN).then(function (vermietungsarten) {
				var vermietungsartMapping = _.object(_.map(vermietungsarten, function (vermietungsart) {
					return [vermietungsart.key, vermietungsart.text];
				}));
				textModel.setProperty("/vermietungsart", vermietungsartMapping);
			}).done();

			Q.when(StaticData.STOCKWERKE).then(function (stockwerke) {
				var stockwerkMapping = _.object(_.map(stockwerke, function (stockwerk) {
					return [stockwerk.FlId, stockwerk.Txtmd];
				}));
				textModel.setProperty("/stockwerk", stockwerkMapping);
			}).done();

			Q.when(StaticData.KOSTENARTEN).then(function (kostenarten) {
				var kostenartMapping = _.object(_.map(kostenarten, function (kostenart) {
					return [kostenart.KoId, kostenart.Txtmd];
				}));
				textModel.setProperty("/kostenart", kostenartMapping);
			}).done();

			Q.when(StaticData.ERTRAGSARTEN).then(function (ertragsarten) {
				var ertragsartMapping = _.object(_.map(ertragsarten, function (ertragsart) {
					return [ertragsart.ErId, ertragsart.Txtmd];
				}));
				textModel.setProperty("/ertragsart", ertragsartMapping);
			}).done();
		}

	});

});