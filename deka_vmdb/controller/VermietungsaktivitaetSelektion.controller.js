sap.ui.define([
	"sap/ui/core/mvc/Controller", 
	"sap/ui/model/Filter", 
	"sap/m/MessageToast", 
	"ag/bpc/Deka/util/ExcelImportUtil",
	"ag/bpc/Deka/util/NavigationPayloadUtil",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/StaticData"], function (Controller, Filter, MessageToast, ExcelImportUtil, NavigationPayloadUtil, DataProvider, StaticData) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.VermietungsaktivitaetSelektion", {
		
		onInit: function(evt){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetSelektion .. onInit");
			
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("vermietungsaktivitaetSelektion").attachPatternMatched(this.onPatternMatched, this);
		}, 
		
		// Klick auf den Zurück-Pfeil
		onBack: function(evt){
			// Ruft die Startseite auf
			this.getOwnerComponent().getRouter().navTo("startseite", null, true);
		},
		
		onPatternMatched: function(oEvent){
			var _this = this;

			var anmerkungMapping = {};
			var statusMapping = {};
			var vermietungsartMapping = {};

			Q.when(StaticData.ANMERKUNGEN).then(function(anmerkungen){
                anmerkungMapping = _.object(_.map(anmerkungen, function(anmerkung){
                    return [anmerkung.Id, anmerkung.Txtmd];
                }));
				return Q.when(StaticData.STATUSWERTE);
			})
			.then(function(statuswerte){
                statusMapping = _.object(_.map(statuswerte, function(statuswert){
                    return [statuswert.Stid, statuswert.Txtmd];
                }));
				return Q.when(StaticData.VERMIETUNGSARTEN);
			})
			.then(function(vermietungsarten){
                vermietungsartMapping = _.object(_.map(vermietungsarten, function(vermietungsart){
                    return [vermietungsart.key, vermietungsart.text];
                }));
				return DataProvider.readVermSelSetAsync();
			})
			.then(function(vermietungsaktivitaeten){
				
				var jsonData = {
					data: vermietungsaktivitaeten,
					facetfilters: null
				};

				var filterBuchungskreisValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Bukrs; }));
				var filterWirtschaftseinheitValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.WeId; }));
				var filterAnmerkungValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Anmerkung; }));
				var filterStatusValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Status; }));
				var filterExternerDienstleisterValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Dienstleister; }));
				var filterVermietungsartValues = _.uniq(_.map(vermietungsaktivitaeten, function(va){ return va.Vermietungsart; }));
				
				jsonData.facetfilters = [{
					filterName: "Favorit",
					values: [{key: true, text: "Ja"}, {key: false, text: "Nein"}]
				}, {
					filterName: "Buchungskreis",
					values: _.map(filterBuchungskreisValues, function(Bukrs){ return {key: Bukrs, text: Bukrs}; })
				}, {
					filterName: "Wirtschaftseinheit",
					values: _.map(filterWirtschaftseinheitValues, function(WeId){ return {key: WeId, text: WeId}; })
				}, {
					filterName: "Anmerkung",
					values: _.map(filterAnmerkungValues, function(Anmerkung){ return {key: Anmerkung, text: anmerkungMapping[Anmerkung]}; })
				}, {
					filterName: "Status",
					values: _.map(filterStatusValues, function(Status){ return {key: Status, text: statusMapping[Status]}; })
				}, {
					filterName: "Externer Dienstleister",
					values: _.map(filterExternerDienstleisterValues, function(ExternerDienstleister){ return {key: ExternerDienstleister, text: ExternerDienstleister}; })
				}, {
					filterName: "Vermietungsart",
					values: _.map(filterVermietungsartValues, function(Vermietungsart){ return {key: Vermietungsart, text: vermietungsartMapping[Vermietungsart]}; })
				}];
							
				var jsonModel = new sap.ui.model.json.JSONModel(jsonData);
				_this.getView().setModel(jsonModel, "vermSel");
				
				_this.applyFilters();
			})
			.catch(function(oError){
				ErrorMessageUtil.showError(oError);
            })
            .done();

		},
				
		// Auswahl der anzuzeigenden VAs
		onComboBoxChange : function(evt) {
			this.applyFilters();
		},

		onAnlegenPress : function (oEvent) {
			var _this = this;
						
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

			var oDataModel = sap.ui.getCore().getModel("odata");

			oDataModel.read("/KonditioneneinigungSet", {
				success: function(oData){
					console.log(oData);

					if (! _this._selectDialogRegelvermietung) {
						_this._selectDialogRegelvermietung = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetSelektionDialogRegelvermietung", _this);
					}

					var jsonData = {
						data: oData.results
					};
					
					_this._selectDialogRegelvermietung.setModel( new sap.ui.model.json.JSONModel(jsonData) , "selektionsModel");
					
					// clear the old search filter
					_this._selectDialogRegelvermietung.getBinding("items").filter([]);
					_this._selectDialogRegelvermietung.open();
				}
			});
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

					var jsonData = {
						data: oData.results
					};
					
					_this._selectDialogKleinvermietung.setModel( new sap.ui.model.json.JSONModel(jsonData) , "selektionsModel");
					
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

					var jsonData = {
						data: oData.results
					};
					
					_this._selectDialogExterneVermietung.setModel( new sap.ui.model.json.JSONModel(jsonData) , "selektionsModel");
					
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
				data: null,
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
				
				// Validierung
				_this._excelImportDialog.getModel("excelImportModel").setProperty("/valid", true);
				_this._excelImportDialog.getModel("excelImportModel").setProperty("/data", {});

				NavigationPayloadUtil.putPayload(vermietungsaktivitaet);
				_this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenImport");
			})
			.catch(function(error){
				console.log(error);
			})
			.done();

		},

		onExcelImportDialogAbbrechenButtonPress: function(oEvent){
			this._excelImportDialog.close();
		},

		onExcelImportDialogAfterClose: function(oEvent){
			this._excelImportDialog.destroy();
			delete this._excelImportDialog;
		},
	
		onRegelvermietungSelectDialogConfirm: function(oEvent) {	
			var konditioneneinigungen = [];

			var selectedItems = oEvent.getParameter("selectedItems");

			if(selectedItems.length > 0)
			{
				selectedItems.forEach(function(item){
					konditioneneinigungen.push({
						KeId: item.getBindingContext("selektionsModel").getObject().KeId,
						Bukrs: item.getBindingContext("selektionsModel").getObject().Bukrs,
					});
				});

				NavigationPayloadUtil.putPayload(konditioneneinigungen);
				this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenRV");
			}
		},

		onRegelvermietungSelectDialogSearch : function(oEvent) {				
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("KeId", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		onKleinvermietungSelectDialogConfirm: function(oEvent){
			NavigationPayloadUtil.putPayload({});
			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenKV");
		},

		onKleinvermietungSelectDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("WeId", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		onExterneVermietungSelectDialogConfirm: function(oEvent){
			NavigationPayloadUtil.putPayload({});
			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenEV");
		},

		onExterneVermietungSelectDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("WeId", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		
		// Klick auf eine Zeile in der Tabelle
		onItemPress : function(oEvent) {
			
			var vermietungsaktivitaet = oEvent.getParameter("listItem").getBindingContext('vermSel').getObject();
			
			this.getOwnerComponent().getRouter().navTo(
				"vermietungsaktivitaetDetails", 
				{
					VaId: vermietungsaktivitaet.VaId,
					Bukrs: vermietungsaktivitaet.Bukrs
				}
			);

		},
		
		
		onFacetFilterReset: function(oEvent) {
						
			var lists = oEvent.getSource().getLists();
								
			lists.forEach(function(list){
				list.setSelectedKeys();
			});

			this.applyFilters();
		},

		
		onFacetFilterListClose: function(oEvent){
			this.applyFilters();
		},

		
		applyFilters: function(){
			
			var table = this.getView().byId("idVermSelTable");
			
			var filtersToApply = [];
			
			/*			
			var dropdownFilter = this.getView().byId("cb_work");
			var selectedDropdownFilter = dropdownFilter.getSelectedKey();
			
			if(selectedDropdownFilter === "work")
			{
				var filter = new Filter("Anmerkung", sap.ui.model.FilterOperator.EQ, "In Bearbeitung");
				filtersToApply.push(filter);
			} 
			*/
			
			var facetFilterLists = this.getView().byId("idFacetFilter").getLists();
																
			facetFilterLists.forEach(function(list){
				
				if(list.getSelectedItems().length > 0){
					
					var itemFilters = [];
																
					list.getSelectedItems().forEach(function(item){
						
						switch(list.getTitle())
						{
							case "Favorit":
								var boolValue = (item.getKey() === "true") ? true : false;
								itemFilters.push( new Filter("Favorit", sap.ui.model.FilterOperator.EQ, boolValue) );
							break;
							
							case "Buchungskreis":
								itemFilters.push( new Filter("Bukrs", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;
							
							case "Wirtschaftseinheit":
								itemFilters.push( new Filter("WeId", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case "Anmerkung":
								itemFilters.push( new Filter("Anmerkung", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case "Status":
								itemFilters.push( new Filter("Status", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case "Externer Dienstleister":
								itemFilters.push( new Filter("Dienstleister", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;
						
							case "Vermietungsart":
								itemFilters.push( new Filter("Vermietungsart", sap.ui.model.FilterOperator.EQ, item.getKey()) );
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
			}
			else
			{
				table.getBinding("items").filter([]);
			}

		}		
		        
	});
});