sap.ui.define([
	"sap/ui/core/mvc/Controller", 
	"sap/ui/model/Filter",
	"ag/bpc/Deka/util/NavigationPayloadUtil",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/ErrorMessageUtil",
	"ag/bpc/Deka/util/StaticData"], function(Controller, Filter, NavigationPayloadUtil, DataProvider, ErrorMessageUtil, StaticData) {

	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungSelektion", {
				
		onInit : function(evt) {			
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("konditioneneinigungSelektion").attachPatternMatched(this.onPatternMatched, this);
		},

		onPatternMatched: function(oEvent){
			var _this = this;

			var anmerkungMapping = {};

			StaticData.ANMERKUNGEN.then(function(anmerkungen){
                anmerkungMapping = _.object(_.map(anmerkungen, function(anmerkung){
                    return [anmerkung.Id, anmerkung.Txtmd];
                }));
				return DataProvider.readKondSelSetAsync();
			})
			.then(function(konditioneneinigungen){

				var jsonData = {
					data: konditioneneinigungen,
					facetfilters: null
				};

				var filterBuchungskreisValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.Bukrs; }));
				var filterWirtschaftseinheitValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.WeId; }));
				var filterAnmerkung = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.Anmerkung; }));

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
					values: _.map(filterAnmerkung, function(Anmerkung){ return {key: Anmerkung, text: anmerkungMapping[Anmerkung]}; })
				}];

				var jsonModel = new sap.ui.model.json.JSONModel(jsonData);
				_this.getView().setModel(jsonModel, "kondSel");

				_this.applyFilters();
			})
			.catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();

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
		onItemPress : function(oEvent) {

			var konditioneneinigung = oEvent.getParameter("listItem").getBindingContext('kondSel').getObject();

			// Ruft die Detailsseite auf (Anzeige)
			this.getOwnerComponent().getRouter().navTo(
				"konditioneneinigungDetails", 
				{
					KeId: konditioneneinigung.KeId,
					Bukrs: konditioneneinigung.Bukrs
				}
			);
		},

		onAnlegenPress : function (oEvent) {
			var _this = this;

			// Holt über die ElementID die Radio Button Group
			var oRBG = this.getView().byId("RBG_Anlage");
			var idx = oRBG.getSelectedIndex();
			
			if (! this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungSelektionAnlageDialog", this);
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
									descr: wirtschaftseinheit.Plz + " " + wirtschaftseinheit.Ort + ", " + wirtschaftseinheit.StrHnum,
									wirtschaftseinheit: wirtschaftseinheit
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
									descr: mietvertrag.Vertart,
									mietvertrag: mietvertrag
								});
							});
							
							_this._oDialog.setModel( new sap.ui.model.json.JSONModel(jsonData) , "anlRbg");
							
							// clear the old search filter
							_this._oDialog.getBinding("items").filter([]);
							_this._oDialog.open();
						}
					});
				break;

				case 2:
					// auf Basis einer Konditioneneinigung
					oDataModel.read("/KonditioneneinigungSet", {
						success: function(oData){
							console.log(oData);

							var jsonData = {
								data: []
							};

							oData.results.forEach(function(konditioneneinigung){
								jsonData.data.push({
									type: "ke",
									id: konditioneneinigung.KeId,
									descr: konditioneneinigung.Mietbeginn + ", " + konditioneneinigung.LzFirstbreak,
									konditioneneinigung: konditioneneinigung
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
			
			var selectedObject = oEvent.getParameter("selectedItem").getBindingContext("anlRbg").getObject();
			
			switch(selectedObject.type)
			{
				case "we":
					NavigationPayloadUtil.putPayload({
						WeId: selectedObject.wirtschaftseinheit.WeId,
						Bukrs: selectedObject.wirtschaftseinheit.Bukrs
					});
					this.getOwnerComponent().getRouter().navTo("konditioneneinigungAnlegenWe");
				break;
				
				case "mv":
					NavigationPayloadUtil.putPayload({
						WeId: selectedObject.mietvertrag.WeId,
						Bukrs: selectedObject.mietvertrag.Bukrs,
						MvId: selectedObject.mietvertrag.MvId
					});
					this.getOwnerComponent().getRouter().navTo("konditioneneinigungAnlegenMv");
				break;

				case "ke":
					NavigationPayloadUtil.putPayload({
						KeId: selectedObject.konditioneneinigung.KeId,
						Bukrs: selectedObject.konditioneneinigung.Bukrs
					});
					this.getOwnerComponent().getRouter().navTo("konditioneneinigungAnlegenKe");
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