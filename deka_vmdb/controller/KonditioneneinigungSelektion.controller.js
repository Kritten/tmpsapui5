sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/ui/model/Filter" ], function(Controller, Filter) {

	"use strict";
	return Controller.extend(
			"ag.bpc.Deka.controller.KonditioneneinigungSelektion", {
				
				onInit : function(evt) {
					jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
					jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungSelektion .. onInit");
					
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.getRoute("konditioneneinigungSelektion").attachPatternMatched(this.onPatternMatched, this);
				},

				onPatternMatched: function(oEvent){
					jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungSelektion .. onPatternMatched");
					
					this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");

					var kondsel = { 

						data: [{
							favorit: true,
							id: "KE_123456",
							buchungskreis: "9-30",
							mietbegin: "2014/01/01",
							laufzeit: 120,
							gueltig_bis: new Date("2014/03/31"),
							mietflaeche: "9-30/599/01010001",
							bezeichnung: "MF Handel/Gastronomie",
							nutzungsart: "Handel, Gastronomie",
							hauptnutzfl: 4467,
							angebotsmiete: 10,
							grundausbau: 20,
							mieterausbau: 20,
							wirtschaftseinheit: "0599",
							we_descr: "20006 Washington, 1999 K Street",
							status: "Konditioneneinigung",
							anmerkung: "In Bearbeitung"
						}, 
						{
							favorit : true,
							id : "KE_123456",
							buchungskreis: "9-30",
							mietbegin : "2014/01/01",
							laufzeit : 120,
							gueltig_bis : new Date("2014/03/31"),
							mietflaeche : "9-30/599/01010002",
							bezeichnung : "MF Büro 1. OG",
							nutzungsart : "Büro",
							hauptnutzfl : 4467,
							angebotsmiete : 10,
							grundausbau : 20,
							mieterausbau : 20,
							wirtschaftseinheit: "0599",
							we_descr : "20006 Washington, 1999 K Street",
							status : "Konditioneneinigung",
							anmerkung : "In Bearbeitung"
						}, 
						{
							favorit : false,
							id : "KE_258961",
							buchungskreis: "9-35",
							mietbegin : "2014/05/01",
							laufzeit : 96,
							gueltig_bis : new Date("2014/09/30"),
							mietflaeche : "9-30/599/01020001",
							bezeichnung : "MF Büro 2. OG",
							nutzungsart : "Büro",
							hauptnutzfl : 5000,
							angebotsmiete : 7,
							grundausbau : 15,
							mieterausbau : 15,
							wirtschaftseinheit: "0599",
							we_descr : "20006 Washington, 1999 K Street",
							status : "Ausbauplanung - 40%",
							anmerkung : "Mietfläche in Auswahlpool mit Konkurrenzobjekten"
						}, 
						{
							favorit : false,
							id : "KE_058961",
							buchungskreis: "9-30",
							mietbegin : "2014/05/01",
							laufzeit : 96,
							gueltig_bis : new Date("2014/09/30"),
							mietflaeche : "9-30/599/01020001",
							bezeichnung : "MF Büro 5. OG",
							nutzungsart : "Büro",
							hauptnutzfl : 5000,
							angebotsmiete : 7,
							grundausbau : 15,
							mieterausbau : 15,
							wirtschaftseinheit : "0599",
							we_descr : "20006 Washington, 1999 K Street",
							status : "Ausbauplanung - 40%",
							anmerkung : "Mietfläche in Auswahlpool mit Konkurrenzobjekten"
						}],
						
						facetfilters: null
					};
					
					var filterBuchungskreisValues = [];
					var filterWirtschaftskreisValues = [];
					
					kondsel.data.forEach(function(konditioneneinigung){
						filterBuchungskreisValues.push(konditioneneinigung.buchungskreis);
						filterWirtschaftskreisValues.push(konditioneneinigung.wirtschaftseinheit);
					});
					
					kondsel.facetfilters = [{
						"filterName": "Favorit",
						"values": [{"key": true, "text": "Ja"}, {"key": false, "text": "Nein"}]
					},
					{
						"filterName": "Buchungskreis",
						"values": Array.from(new Set(filterBuchungskreisValues)).map(function(buchungskreis){
							return {"key": buchungskreis, "text": buchungskreis};
						})
					},
					{
						"filterName": "Wirtschaftseinheit",
						"values": Array.from(new Set(filterWirtschaftskreisValues)).map(function(wirtschaftseinheit){
							return {"key": wirtschaftseinheit, "text": wirtschaftseinheit}; 
						})
					}];
					
					var kondModel = new sap.ui.model.json.JSONModel(kondsel);
					this.getView().setModel(kondModel, "kondSel");
					
					var wirtschaftseinheiten = {
						data :[{
							type: "we",
							id: "0599",
							descr: "20006 Washington, 1999 K Street",
							nachhaltigeMiete: 123.49
						}, {
							type: "we",
							id: "0699",
							descr: "20006 Washington, 2500 K Street",
							nachhaltigeMiete: 123.49
						}]
					};
					
					var weModel = new sap.ui.model.json.JSONModel(wirtschaftseinheiten);
					this.getView().setModel(weModel, "we");
					
					var mietvertraege = {
						data :[{
							type: "mv",
							id: "MV_123",
							descr: "Mietvertrag 20006 Washington, 1999 K Street",
							nachhaltigeMiete: 123.49
						}, {
							type: "mv",
							id: "MV_234",
							descr: "Mietvertrag 20006 Washington, 2500 K Street",
							nachhaltigeMiete: 123.49
						}]
					};
					
					var mvModel = new sap.ui.model.json.JSONModel(mietvertraege);
					this.getView().setModel(mvModel, "mv");		
					
					this.applyFilters();
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
					// Holt über die ElementID die Radio Button Group
					var oRBG = this.getView().byId("RBG_Anlage");
					var idx = oRBG.getSelectedIndex();
					
					if (! this._oDialog) {
						this._oDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungSelektionDialog", this);
					}
					
					switch(idx)
					{
						case 0:
							this._oDialog.setModel(this.getView().getModel("we"), "anlRbg");
						break;
						case 1:
							this._oDialog.setModel(this.getView().getModel("mv"), "anlRbg");
						break;
					}
					
					// clear the old search filter
					this._oDialog.getBinding("items").filter([]);
		 
					// toggle compact style
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
					this._oDialog.open();
				},
		 
				onSelectDialogSearch : function(oEvent) {				
					var sValue = oEvent.getParameter("value");
					var oFilter = new Filter("id", sap.ui.model.FilterOperator.Contains, sValue);
					var oBinding = oEvent.getSource().getBinding("items");
					oBinding.filter([oFilter]);
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