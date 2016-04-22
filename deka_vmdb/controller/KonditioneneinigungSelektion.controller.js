sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/ui/model/Filter" ], function(Controller, Filter) {

	"use strict";
	return Controller.extend(
			"ag.bpc.Deka.controller.KonditioneneinigungSelektion", {
	
				_map: {
					"all": undefined,
					"work": "In Bearbeitung"
				},
				
				
				onInit : function(evt) {
					this.getView().setModel(sap.ui.getCore().getModel("i18n"),
							"i18n");

					var kondsel = { data :[ {
						favorit : true,
						id : "KE_123456",
						mietbegin : new Date("2014/01/01"),
						laufzeit : 120,
						gueltig_bis : new Date("2014/03/31"),
						mietflaeche : "9-30/599/01010001",
						bezeichnung : "MF Handel/Gastronomie",
						nutzungsart : "Handel, Gastronomie",
						hauptnutzfl : 4467,
						angebotsmiete : 10,
						grundausbau : 20,
						mieterausbau : 20,
						we : "0599",
						we_descr : "20006 Washington, 1999 K Street",
						status : "Konditioneneinigung",
						anmerkung : "In Bearbeitung"
					}, {
						favorit : true,
						id : "KE_123456",
						mietbegin : new Date("2014/01/01"),
						laufzeit : 120,
						gueltig_bis : new Date("2014/03/31"),
						mietflaeche : "9-30/599/01010002",
						bezeichnung : "MF Büro 1. OG",
						nutzungsart : "Büro",
						hauptnutzfl : 4467,
						angebotsmiete : 10,
						grundausbau : 20,
						mieterausbau : 20,
						we : "0599",
						we_descr : "20006 Washington, 1999 K Street",
						status : "Konditioneneinigung",
						anmerkung : "In Bearbeitung"
					}, {
						favorit : false,
						id : "KE_258961",
						mietbegin : new Date("2014/05/01"),
						laufzeit : 96,
						gueltig_bis : new Date("2014/09/30"),
						mietflaeche : "9-30/599/01020001",
						bezeichnung : "MF Büro 2. OG",
						nutzungsart : "Büro",
						hauptnutzfl : 5000,
						angebotsmiete : 7,
						grundausbau : 15,
						mieterausbau : 15,
						we : "0599",
						we_descr : "20006 Washington, 1999 K Street",
						status : "Ausbauplanung - 40%",
						anmerkung : "Mietfläche in Auswahlpool mit Konkurrenzobjekten"
					}, {
						id : "KE_058961",
						mietbegin : new Date("2014/05/01"),
						laufzeit : 96,
						gueltig_bis : new Date("2014/09/30"),
						mietflaeche : "9-30/599/01020001",
						bezeichnung : "MF Büro 5. OG",
						nutzungsart : "Büro",
						hauptnutzfl : 5000,
						angebotsmiete : 7,
						grundausbau : 15,
						mieterausbau : 15,
						we : "0599",
						we_descr : "20006 Washington, 1999 K Street",
						status : "Ausbauplanung - 40%",
						anmerkung : "Mietfläche in Auswahlpool mit Konkurrenzobjekten"
					}],
					facetfilter : [{
	               		title: "Liste ID",
               			item: {id: "id"}
               		}]
					
					};
					
					//					               
	                //{id: "id", field: "id"},
	                //{id: "mietbegin", field: "mietbegin"}
					//

					var kondModel = new sap.ui.model.json.JSONModel(kondsel);
					this.getView().setModel(kondModel, "kondSel");
					
					var wirtschaftseinheiten = { data :[ {
						id : "0599",
						descr : "20006 Washington, 1999 K Street",
					},
					{
						id : "0699",
						descr : "20006 Washington, 2500 K Street",
					} ]
					};
					
					var weModel = new sap.ui.model.json.JSONModel(wirtschaftseinheiten);
					this.getView().setModel(weModel, "we");
					
					var mietvertraege = { data :[ {
						id : "MV_123",
						descr : "Mietvertrag 20006 Washington, 1999 K Street",
					},
					{
						id : "MV_234",
						descr : "Mietvertrag 20006 Washington, 2500 K Street",
					} ]
					};
					
					var mvModel = new sap.ui.model.json.JSONModel(mietvertraege);
					this.getView().setModel(mvModel, "mv");		
					
					// Auswahl der vorbelegten ComboBox auslesen (hier wird kein Event erzeugt)
					var comboBox = this.getView().byId("cb_work");
					var selKey = comboBox.getSelectedKey();
						
					var oKEFilter = new Filter("anmerkung", sap.ui.model.FilterOperator.EQ, this._map[selKey]);
					this._oKondTab = this.getView().byId("idKondSelTable").getBinding("items");					
					this._oKondTab.filter([oKEFilter]);

				},

				// Klick auf den Zurück-Pfeil
				onBack : function(evt) {
					// Ruft die Startseite auf
					this.getOwnerComponent().getRouter().navTo("startseite");
				},
				
				// Auswahl der anzuzeigenden KEs
				onComboBoxChange : function(evt) {		
					var selectedKey = evt.getSource().getSelectedKey();
				
					switch (selectedKey) 
					{
						case "all":
							// Alle Filter löschen
							this._oKondTab.filter([]);	
						break;
						
						case "work":
							// Filter neu setzen
							var oKEFilter = this._oKondTab.filter;	
							oKEFilter = new Filter("anmerkung", sap.ui.model.FilterOperator.EQ, this._map[selectedKey]);;
							this._oKondTab.filter([oKEFilter]);
						break;
						
						default:
						break;
					}

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
				
				// Select Dialog für die Auswahl der Wirtschaftseinheit
				onExit : function () {
					if (this._oDialog) {
						this._oDialog.destroy();
					}
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
		 
				handleSearch : function(oEvent) {				
					var sValue = oEvent.getParameter("value");
					var oFilter = new Filter("id", sap.ui.model.FilterOperator.Contains, sValue);
					var oBinding = oEvent.getSource().getBinding("items");
					oBinding.filter([oFilter]);
				},
		 
				handleClose: function(oEvent) {
					
					console.log("handleClose");
					
					var aContexts = oEvent.getParameter("selectedContexts");
					
					console.log(aContexts);
					
					if (aContexts.length) {
						
						// Holt über die ElementID die Radio Button Group
						var oRBG = this.getView().byId("RBG_Anlage");
						var idx = oRBG.getSelectedIndex();
						
						console.log(idx);

						switch(idx) {
						case 0:
							var weid = this.getView().getModel("we").getProperty(aContexts[0].getPath());
							
							// Ruft die Detailsseite auf (Anlegen)
							this.getOwnerComponent().getRouter().navTo(
								"konditioneneinigungAnlegenWe", 
								{
									weId: weid.id 
								}
							);
						break;
						case 1:
							console.log("Basis MV");
							
							var mvid = this.getView().getModel("mv").getProperty(aContexts[0].getPath());
							
							console.log(mvid);
							
							// Ruft die Detailsseite auf (Anlegen)
							this.getOwnerComponent().getRouter().navTo(
								"konditioneneinigungAnlegenMv",
								{
									mvId: mvid.id
								}
							);
						break;
						}				
						
						if (! this._oDialog) {						
							this._oDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungSelektionDialog", this);
						}
		
					}
					oEvent.getSource().getBinding("items").filter([]);			
				},
				
				// Facet Filter
				onhandleFacetFilterReset : function(evt) {
					
				},
				
				_applyFilter: function(oFilter) {
					// Get the table (last thing in the VBox) and apply the filter
					var aVBoxItems = this.getView().byId("idKondSelTable").getItems();
					var oTable = aVBoxItems[aVBoxItems.length-1];
					oTable.getBinding("items").filter(oFilter);
				},
		 
				handleFacetFilterReset: function(oEvent) {
					var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
					var aFacetFilterLists = oFacetFilter.getLists();
					for(var i=0; i < aFacetFilterLists.length; i++) {
						for(var i=0; i < aFacetFilterLists.length; i++) {
							aFacetFilterLists[i].setSelectedKeys();
						}
					}
					this._applyFilter([]);
				},
		 
				handleListClose: function(oEvent) {
					// Get the Facet Filter lists and construct a (nested) filter for the binding
					var oFacetFilter = oEvent.getSource().getParent();
					var mFacetFilterLists = oFacetFilter.getLists().filter(function(oList) {
							return oList.getActive() && oList.getSelectedItems().length;
						});
		 
		 
					// Build the nested filter with ORs between the values of each group and
					// ANDs between each group
					var oFilter = new Filter(mFacetFilterLists.map(function(oList) {
						return new Filter(oList.getSelectedItems().map(function(oItem) {
							return new Filter(oList.getTitle(), "EQ", oItem.getText());
						}), false);
					}), true);
		 
					this._applyFilter(oFilter);
				}
				
				
			

			});
});