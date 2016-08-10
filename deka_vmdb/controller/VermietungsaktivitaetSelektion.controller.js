sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/Filter", "sap/m/MessageBox"], function (Controller, Filter, MessageBox) {
	
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

			var oDataModel = sap.ui.getCore().getModel("odata");

			oDataModel.read("/VermietungsaktivitaetSet", {

				urlParameters:{
					"$expand": "VaToOb"
				},

				success: function(oData){
					console.log(oData);

					var jsonData = {
						data: [],
						facetfilters: null
					};

					oData.results.forEach(function(vermietungsaktivitaet){

						vermietungsaktivitaet.Favorit = (Math.random() > 0.5); // Feld ist zur Zeit noch ein String

						// Pro Objekt einen separaten Eintrag
						vermietungsaktivitaet.VaToOb.results.forEach(function(objekt){
							var _vermietungsaktivitaet = jQuery.extend(true, {}, vermietungsaktivitaet);
							_vermietungsaktivitaet.VaToOb = objekt;
							jsonData.data.push(_vermietungsaktivitaet);
						});
						
					});

					var filterBuchungskreisValues = [];
					var filterWirtschaftseinheitValues = [];
					var filterAnmerkungValues = [];
					var filterStatusValues = [];
					
					jsonData.data.forEach(function(vermietungsaktivitaet){
						filterBuchungskreisValues.push(vermietungsaktivitaet.Bukrs);
						filterWirtschaftseinheitValues.push(vermietungsaktivitaet.WeId);
						filterAnmerkungValues.push(vermietungsaktivitaet.Anmerkung);
						filterStatusValues.push(vermietungsaktivitaet.Status);
					});
					
					jsonData.facetfilters = [{
						filterName: "Favorit",
						values: [{key: true, text: "Ja"}, {key: false, text: "Nein"}]
					}, {
						filterName: "Buchungskreis",
						values: _.map(_.uniq(filterBuchungskreisValues), function(Bukrs){ return {key: Bukrs, text: Bukrs}; })
					}, {
						filterName: "Wirtschaftseinheit",
						values: _.map(_.uniq(filterWirtschaftseinheitValues), function(WeId){ return {key: WeId, text: WeId}; })
					}, {
						filterName: "Anmerkung",
						values: _.map(_.uniq(filterAnmerkungValues), function(Anmerkung){ return {key: Anmerkung, text: Anmerkung}; })
					}, {
						filterName: "Status",
						values: _.map(_.uniq(filterStatusValues), function(Status){ return {key: Status, text: Status}; })
					}];
								
					var jsonModel = new sap.ui.model.json.JSONModel(jsonData);
					_this.getView().setModel(jsonModel, "vermSel");
					
					_this.applyFilters();
				}
			});
					
		},
				
		// Auswahl der anzuzeigenden VAs
		onComboBoxChange : function(evt) {
			this.applyFilters();
		},

		onAnlegenPress : function (oEvent) {
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetSelektion .. onAnlegenPress");
			var _this = this;
			
			if (! this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetSelektionDialog", this);
			}
			
			var oDataModel = sap.ui.getCore().getModel("odata");

			oDataModel.read("/KonditioneneinigungSet", {
				success: function(oData){
					console.log(oData);

					var jsonData = {
						data: oData.results
					};
					
					_this._oDialog.setModel( new sap.ui.model.json.JSONModel(jsonData) , "selektionsModel");
					
					// clear the old search filter
					_this._oDialog.getBinding("items").filter([]);
					_this._oDialog.open();
				}
			});

		},
		
		onSelectDialogSearch : function(oEvent) {				
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("id", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
	
		onSelectDialogConfirm: function(oEvent) {
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetSelektion .. onSelectDialogConfirm");
			
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

				this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetAnlegenKe", {
					KEs: JSON.stringify( konditioneneinigungen )
				});
			}
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