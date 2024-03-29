sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"ag/bpc/Deka/util/ExcelImportUtil",
	"ag/bpc/Deka/util/NavigationPayloadUtil",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/StaticData",
	"ag/bpc/Deka/util/ErrorMessageUtil",
	"ag/bpc/Deka/util/TranslationUtil"
], function (Controller, Filter, MessageToast, ExcelImportUtil, NavigationPayloadUtil, DataProvider, StaticData, ErrorMessageUtil, TranslationUtil) {

	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.VermietungsaktivitaetSelektion", {

		onInit: function(){
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
			this.getView().setModel(sap.ui.getCore().getModel("text"), "text");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("vermietungsaktivitaetSelektion").attachPatternMatched(this.onPatternMatched, this);
		},

		onPatternMatched: function(){
			var _this = this;

			StaticData.USER.then(function(user){
				_this.getView().byId("idVaAnlagePanel").setVisible(user.BtnAm);
				// _this.getView().byId("idVaAnlagePanel").setVisible(true);
				return DataProvider.readVermSelSetAsync();
			})
			.then(function(vermietungsaktivitaeten){

				var favoritValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Favorit; }));
				var buchungskreisValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Bukrs; }));
				var wirtschaftseinheitValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.WeId; }));
				var regionalbueroValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Regionalbuero; }));
				var vaIdValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.VaId; }));
				var anmerkungValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Anmerkung; })).filter(function(anmerkung ) {
					return anmerkung !== '81';
				});
				var statusValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Status; }));
				var dienstleisterValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Dienstleister; }));
				var vermietungsartValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Vermietungsart; }));
				var kategorieValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Kategorie; }));
				var erstellerValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Ersteller; }));

				var aPartitions = _.partition(vermietungsaktivitaeten, { Anmerkung: '81' });
				console.log('aPartitions', aPartitions);
				var jsonData = {
					data: aPartitions[1],
					dataStale: aPartitions[0],
					facetfilterValues: {
						Favorit: _.map(favoritValues, function(Favorit){ return {key: Favorit, text: Favorit ? TranslationUtil.translate("JA") : TranslationUtil.translate("NEIN")}; }),
						Bukrs: _.map(buchungskreisValues, function(Bukrs){ return {key: Bukrs}; }),
						WeId: _.map(wirtschaftseinheitValues, function(WeId){ return {key: WeId}; }),
						Regionalbuero: _.map(regionalbueroValues, function(Regionalbuero){ return {key: Regionalbuero}; }),
						VaId: _.map(vaIdValues, function(vaId){ return {key: vaId}; }),
						Anmerkung: _.map(anmerkungValues, function(Anmerkung){ return {key: Anmerkung}; }),
						Status: _.map(statusValues, function(Status){ return {key: Status}; }),
						Dienstleister: _.map(dienstleisterValues, function(Dienstleister){ return {key: Dienstleister}; }),
						Vermietungsart: _.map(vermietungsartValues, function(Vermietungsart){ return {key: Vermietungsart}; }),
						Kategorie: _.map(kategorieValues, function(Kategorie){ return {key: Kategorie}; }),
						Ersteller: _.map(erstellerValues, function(Ersteller){ return {key: Ersteller}; })
					}
				};

				var jsonModel = new sap.ui.model.json.JSONModel(jsonData);
				_this.getView().setModel(jsonModel, "vermSel");
				_this.applyFilters();
			})
			.catch(function(oError){
				ErrorMessageUtil.showError(oError);
            })
            .done();
		},

		onBack: function(){
			this.getOwnerComponent().getRouter().navTo("startseite", null, true);
		},

		// Auswahl der anzuzeigenden VAs
		onComboBoxChange : function() {
			this.applyFilters();
		},

		onAnlegenPress : function () {
			// Holt über die ElementID die Radio Button Group
			var oRBG = this.getView().byId("RBG_Anlage");
			var idx = oRBG.getSelectedIndex();

			switch(idx)
			{
				case 0:
					this.showSelectDialogRegelvermietung();
				break;

				case 1:
					this.showSelectDialogKleinvermietung();
				break;

				case 2:
					this.showSelectDialogExterneVermietung();
				break;

				case 3:
					this.showExcelImportDialog();
				break;
			}

		},

		showSelectDialogRegelvermietung: function(){
			var _this = this;

			DataProvider.readKonditioneneinigungSetAsync(null, "Anmerkung eq '03'")
			.then(function(konditioneneinigungen){

				if (! _this._selectDialogRegelvermietung) {
					_this._selectDialogRegelvermietung = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetSelektionDialogRegelvermietung", _this);
				}

				var formData = {
					konditioneneinigungen: konditioneneinigungen
				};

				_this._selectDialogRegelvermietung.setModel(new sap.ui.model.json.JSONModel(formData), "form");

				// clear the old search filter
				_this._selectDialogRegelvermietung.getBinding("items").filter([]);
				_this._selectDialogRegelvermietung.open();
			})
            .catch(function(oError){
                console.log(oError);
				console.log("catchblock");

				if (! _this._selectDialogRegelvermietung) {
					_this._selectDialogRegelvermietung = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetSelektionDialogRegelvermietung", _this);
				}

				var formData = {
					konditioneneinigungen: []
				};

				_this._selectDialogRegelvermietung.setModel(new sap.ui.model.json.JSONModel(formData), "form");

				// clear the old search filter
				_this._selectDialogRegelvermietung.getBinding("items").filter([]);
				_this._selectDialogRegelvermietung.open();
            })
            .done();
		},

		showSelectDialogKleinvermietung: function(){
			var _this = this;

			var oDataModel = sap.ui.getCore().getModel("odata");

			oDataModel.read("/WirtschaftseinheitenSet", {
				success: function(oData){
					console.log(oData);

					if (! _this._selectDialogKleinvermietung) {
						_this._selectDialogKleinvermietung = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetSelektionDialogKleinvermietung", _this);
					}

					var formData = {
						wirtschaftseinheiten: oData.results
					};

					_this._selectDialogKleinvermietung.setModel(new sap.ui.model.json.JSONModel(formData), "form");

					// clear the old search filter
					_this._selectDialogKleinvermietung.getBinding("items").filter([]);
					_this._selectDialogKleinvermietung.open();
				}
			});
		},

		showSelectDialogExterneVermietung: function(){
			var _this = this;

			var oDataModel = sap.ui.getCore().getModel("odata");

			oDataModel.read("/WirtschaftseinheitenSet", {
				success: function(oData){
					console.log(oData);

					if (! _this._selectDialogExterneVermietung) {
						_this._selectDialogExterneVermietung = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetSelektionDialogExterneVermietung", _this);
					}

					var formData = {
						wirtschaftseinheiten: oData.results
					};

					_this._selectDialogExterneVermietung.setModel(new sap.ui.model.json.JSONModel(formData), "form");

					// clear the old search filter
					_this._selectDialogExterneVermietung.getBinding("items").filter([]);
					_this._selectDialogExterneVermietung.open();
				}
			});
		},

		showExcelImportDialog: function(){
			if (! this._excelImportDialog) {
				this._excelImportDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetSelektionExcelImportDialog", this);
			}

			var jsonData = {
				valid: false
			};

			this._excelImportDialog.setModel( new sap.ui.model.json.JSONModel(jsonData), "excelImportModel");
			this._excelImportDialog.open();
		},

		onExcelImportDialogFileUploadChange: function(oEvent){
			var _this = this;

			var files = oEvent.getParameter("files");

			ExcelImportUtil.importVermietungsaktivitaetFromFile(files[0]).then(function(vermietungsaktivitaet){
				console.log(vermietungsaktivitaet);
				NavigationPayloadUtil.putPayload(vermietungsaktivitaet);
				_this._excelImportDialog.getModel("excelImportModel").setProperty("/valid", true);
			})
			.catch(function(error){
				console.log(error);
				_this._excelImportDialog.getModel("excelImportModel").setProperty("/valid", false);
			})
			.done();

		},

		onExcelImportDialogAnlegenButtonPress: function(){
			console.warn(123123);
			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenImport");
		},

		onExcelImportDialogAbbrechenButtonPress: function(){
			this._excelImportDialog.close();
		},

		onExcelImportDialogAfterClose: function(){
			this._excelImportDialog.destroy();
			delete this._excelImportDialog;
		},

		onRegelvermietungSelectDialogConfirm: function(oEvent) {

			var selectedItems = oEvent.getParameter("selectedItems");

			if(selectedItems.length > 0)
			{
				var keKeys = _.map(selectedItems, function(item){
					return {
						KeId: item.getBindingContext("form").getObject().KeId,
						Bukrs: item.getBindingContext("form").getObject().Bukrs
					};
				});

				NavigationPayloadUtil.putPayload(keKeys);
				this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenRV");
			}
		},

		onRegelvermietungSelectDialogSearch : function(oEvent) {
			var sValue = oEvent.getParameter("value");

			var combinedOrFilter = new Filter([
				new Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("WeId", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("KeId", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("IndBez", sap.ui.model.FilterOperator.Contains, sValue),
			], false);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([combinedOrFilter]);
		},

		onKleinvermietungSelectDialogConfirm: function(oEvent){

			var selectedItem = oEvent.getParameter("selectedItem");
			var we = selectedItem.getBindingContext("form").getObject();

			NavigationPayloadUtil.putPayload({
				WeId: we.WeId,
				Bukrs: we.Bukrs
			});

			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenKV");
		},

		onKleinvermietungSelectDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");

			var combinedOrFilter = new Filter([
				new Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("WeId", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Plz", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Ort", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("StrHnum", sap.ui.model.FilterOperator.Contains, sValue)
			], false);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([combinedOrFilter]);
		},

		onExterneVermietungSelectDialogConfirm: function(oEvent){

			var selectedItem = oEvent.getParameter("selectedItem");
			var we = selectedItem.getBindingContext("form").getObject();

			NavigationPayloadUtil.putPayload({
				WeId: we.WeId,
				Bukrs: we.Bukrs
			});

			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenEV");
		},

		onExterneVermietungSelectDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");

			var combinedOrFilter = new Filter([
				new Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("WeId", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Plz", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Ort", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("StrHnum", sap.ui.model.FilterOperator.Contains, sValue)
			], false);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([combinedOrFilter]);
		},


		// Klick auf eine Zeile in der Tabelle
		onItemPress : function(oEvent) {

			var vermietungsaktivitaet = oEvent.getParameter("listItem").getBindingContext("vermSel").getObject();

			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetDetails", {
				VaId: vermietungsaktivitaet.VaId,
				Bukrs: vermietungsaktivitaet.Bukrs
			});

		},


		onFacetFilterReset: function(oEvent) {

			var lists = oEvent.getSource().getLists();

			lists.forEach(function(list){
				list.setSelectedKeys();
			});

			this.applyFilters();
		},


		onFacetFilterListClose: function(){
			this.applyFilters();
		},


		applyFilters: function(){

			var table = this.getView().byId("idVermSelTable");
			
			table.setNoDataText(null);

			var filtersToApply = [];

			var facetFilterLists = this.getView().byId("idFacetFilter").getLists();

			facetFilterLists.forEach(function(list){

				if(list.getSelectedItems().length > 0){

					var itemFilters = [];

					list.getSelectedItems().forEach(function(item){

						switch(list.getTitle())
						{
							case TranslationUtil.translate("VERM_SEL_COL_FAVORIT"):
								var boolValue = (item.getKey() === "true") ? true : false;
								itemFilters.push( new Filter("Favorit", sap.ui.model.FilterOperator.EQ, boolValue) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_BUCHUNGSKREIS"):
								itemFilters.push( new Filter("Bukrs", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_WIRTSCHAFTSEINHEIT"):
								itemFilters.push( new Filter("WeId", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_REGIONALBUERO"):
								itemFilters.push( new Filter("Regionalbuero", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_ID"):
								itemFilters.push( new Filter("VaId", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_ANMERKUNG"):
								itemFilters.push( new Filter("Anmerkung", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_STATUS"):
								itemFilters.push( new Filter("Status", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_DIENSTLEISTER"):
								itemFilters.push( new Filter("Dienstleister", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_VERMIETUNGSART"):
								itemFilters.push( new Filter("Vermietungsart", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_KATEGORIE"):
								itemFilters.push( new Filter("Kategorie", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("VERM_SEL_COL_ERSTELLER"):
								itemFilters.push( new Filter("Ersteller", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							default:
							break;
						}

					});

					var listFilter = new Filter(itemFilters, false);
					filtersToApply.push(listFilter);
				}

			});

			console.log("filtersToApply.length = " + filtersToApply.length);

			if(filtersToApply.length > 0)
			{
				// Alle Filter mit AND verknüpfen
				var combinedFilter = new Filter(filtersToApply, true);
				table.getBinding("items").filter(combinedFilter);
				
				if (table.getItems().length === 0) {
					console.log('CHECKING FOR 81');
					var facetFilterId = this.getView().byId("idFacetFilterId");
					if (facetFilterId.getSelectedItems().length === 1) {
						console.log('POSSIBLE 81');
						var idVa = facetFilterId.getSelectedItems()[0].getKey();

						if (_.any(this.getView().getModel("vermSel").getProperty('/dataStale'), { VaId:  idVa})) {
							console.log('found');
					         var oBundle = this.getView().getModel("i18n").getResourceBundle();
					         var sMsg = oBundle.getText("VA_VERKNUEPFT");
							table.setNoDataText(sMsg);
							
						}
					}
				}
			}
			else
			{
				table.getBinding("items").filter([]);
			}
			console.warn(table.getItems());
			console.log(table.getItems().length);

		}

	});
});