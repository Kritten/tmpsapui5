sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/ui/model/Filter" ], function(Controller, Filter) {

	"use strict";
	return Controller.extend(
			"ag.bpc.Deka.controller.KonditioneneinigungSelektion", {
				
				onInit : function(evt) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
					jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungSelektion .. onInit");
					
					this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
					
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.getRoute("konditioneneinigungSelektion").attachPatternMatched(this.onPatternMatched, this);
				},

				onPatternMatched: function(oEvent){
					jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungSelektion .. onPatternMatched");
					var _this = this;

					var oDataModel = sap.ui.getCore().getModel("odata");

					oDataModel.read("/KonditioneneinigungSet", {
						success: function(oData){
							console.log(oData);

							var jsonData = {
								data: [],
								facetfilters: null
							};

							oData.results.forEach(function(konditioneneinigung){

								// Backend JSON Struktur -> Frontend JSON Struktur
								jsonData.data.push({
									id: konditioneneinigung.KeId,
									laufzeit: konditioneneinigung.LzFirstbreak,
									mietbegin: konditioneneinigung.Mietbeginn,
									maklerkosten: konditioneneinigung.MkMonate,
									beratungskosten: konditioneneinigung.BkMonatsmieten,
									anmerkung: konditioneneinigung.Anmerkung,
									status: konditioneneinigung.Status,
									// fehlende Felder
									favorit: (Math.random() < 0.5),
									buchungskreis: "9-30",
									bezeichnung: "MF Handel/Gastronomie",
									mietflaeche: "9-30/599/01010001",
									nutzungsart: "Handel, Gastronomie",
									hauptnutzfl: 1234,
									angebotsmiete: 10,
									grundausbau: 20,
									mieterausbau: 20,
									wirtschaftseinheit: "0599",
									we_descr: "20006 Washington, 1999 K Street",
									gueltig_bis: new Date("2014/03/31")
								});
							});


							var filterBuchungskreisValues = [];
							var filterWirtschaftskreisValues = [];
							
							jsonData.data.forEach(function(konditioneneinigung){
								filterBuchungskreisValues.push(konditioneneinigung.buchungskreis);
								filterWirtschaftskreisValues.push(konditioneneinigung.wirtschaftseinheit);
							});
							
							jsonData.facetfilters = [{
								filterName: "Favorit",
								values: [{key: true, text: "Ja"}, {key: false, text: "Nein"}]
							},
							{
								filterName: "Buchungskreis",
								values: Array.from(new Set(filterBuchungskreisValues)).map(function(buchungskreis){
									return {key: buchungskreis, text: buchungskreis};
								})
							},
							{
								filterName: "Wirtschaftseinheit",
								values: Array.from(new Set(filterWirtschaftskreisValues)).map(function(wirtschaftseinheit){
									return {key: wirtschaftseinheit, text: wirtschaftseinheit}; 
								})
							}];

							var jsonModel = new sap.ui.model.json.JSONModel(jsonData);
							_this.getView().setModel(jsonModel, "kondSel");

							_this.applyFilters();
						}
					});
					
				},

				// Klick auf den Zurück-Pfeil
				onBack : function(evt) {
					// Ruft die Startseite auf
					this.getOwnerComponent().getRouter().navTo("startseite");
				},
				
				// Auswahl der anzuzeigenden KEs
				onComboBoxChange : function(evt) {
					this.applyFilters();
				},
				
				// Klick auf eine Zeile in der Tabelle
				onItemPress : function(evt) {
					var kondid = this.getView().getModel("kondSel").getProperty(evt.getParameters("listItem").listItem.getBindingContext('kondSel').sPath);

					// Ruft die Detailsseite auf (Anzeige)
					this.getOwnerComponent().getRouter().navTo(
						"konditioneneinigungDetails", 
						{
							id: kondid.id
						}
					);
				},
		 
				onAnlegenPress : function (oEvent) {
					jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungSelektion .. onAnlegenPress");
					var _this = this;

					// Holt über die ElementID die Radio Button Group
					var oRBG = this.getView().byId("RBG_Anlage");
					var idx = oRBG.getSelectedIndex();
					
					if (! this._oDialog) {
						this._oDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungSelektionDialog", this);
					}
					
					var oDataModel = sap.ui.getCore().getModel("odata");

					switch(idx)
					{
						case 0:
							oDataModel.read("/WirtschaftseinheitenSet", {
								success: function(oData){
									console.log(oData);

									var jsonData = {
										data: []
									};

									oData.results.forEach(function(wirtschaftseinheit){
										jsonData.data.push({
											type: "we",
											id: wirtschaftseinheit.WeId,
											descr: wirtschaftseinheit.Plz + " " + wirtschaftseinheit.Ort + ", " + wirtschaftseinheit.StrHnum
										});
									});
									
									_this._oDialog.setModel( new sap.ui.model.json.JSONModel(jsonData) , "anlRbg");
									
									// clear the old search filter
									_this._oDialog.getBinding("items").filter([]);
									_this._oDialog.open();
								}
							});

						break;

						case 1:
							oDataModel.read("/MietvertragSet", {
								success: function(oData){
									console.log(oData);

									var jsonData = {
										data: []
									};

									oData.results.forEach(function(mietvertrag){
										jsonData.data.push({
											type: "mv",
											id: mietvertrag.MvId,
											descr: mietvertrag.Vertart
										});
									});
									
									_this._oDialog.setModel( new sap.ui.model.json.JSONModel(jsonData) , "anlRbg");
									
									// clear the old search filter
									_this._oDialog.getBinding("items").filter([]);
									_this._oDialog.open();
								}
							});
						break;
					}

				},
		 
				onSelectDialogSearch : function(oEvent) {				
					var sValue = oEvent.getParameter("value");

					var combinedOrFilter = new Filter([
						new Filter("id", sap.ui.model.FilterOperator.Contains, sValue),
						new Filter("descr", sap.ui.model.FilterOperator.Contains, sValue)
					], false);

					var oBinding = oEvent.getSource().getBinding("items");
					oBinding.filter([combinedOrFilter]);
				},
		 
				onSelectDialogConfirm: function(oEvent) {
					jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungSelektion .. onSelectDialogConfirm");
					
					var selectedObject = oEvent.getParameter("selectedItem").getBindingContext("anlRbg").getObject();
					
					switch(selectedObject.type)
					{
						case "we":
							this.getOwnerComponent().getRouter().navTo("konditioneneinigungAnlegenWe", {weId: selectedObject.id});
						break;
						
						case "mv":
							this.getOwnerComponent().getRouter().navTo("konditioneneinigungAnlegenMv", {mvId: selectedObject.id});
						break;
					}
	
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
					
					var table = this.getView().byId("idKondSelTable");
					
					var filtersToApply = [];
					
					var dropdownFilter = this.getView().byId("cb_work");
					var selectedDropdownFilter = dropdownFilter.getSelectedKey();
					
					if(selectedDropdownFilter === "work")
					{
						var filter = new Filter("anmerkung", sap.ui.model.FilterOperator.EQ, "In Bearbeitung");
						filtersToApply.push(filter);
					}
					
					var facetFilterLists = this.getView().byId("idFacetFilter").getLists();
																		
					facetFilterLists.forEach(function(list){
						
						if(list.getSelectedItems().length > 0){
							
							var itemFilters = [];
																		
							list.getSelectedItems().forEach(function(item){
								
								switch(list.getTitle())
								{
									case "Favorit":
										var boolValue = (item.getKey() === "true") ? true : false;
										itemFilters.push( new Filter("favorit", sap.ui.model.FilterOperator.EQ, boolValue) );
									break;
									
									case "Buchungskreis":
										itemFilters.push( new Filter("buchungskreis", sap.ui.model.FilterOperator.EQ, item.getKey()) );
									break;
									
									case "Wirtschaftseinheit":
										itemFilters.push( new Filter("wirtschaftseinheit", sap.ui.model.FilterOperator.EQ, item.getKey()) );
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