sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"ag/bpc/Deka/util/NavigationPayloadUtil",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/ErrorMessageUtil",
	"ag/bpc/Deka/util/StaticData",
	"ag/bpc/Deka/util/TranslationUtil"], function(Controller, Filter, NavigationPayloadUtil, DataProvider, ErrorMessageUtil, StaticData, TranslationUtil) {

	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungSelektion", {

		onInit : function() {
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
			this.getView().setModel(sap.ui.getCore().getModel("text"), "text");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("konditioneneinigungSelektion").attachPatternMatched(this.onPatternMatched, this);
		},

		onPatternMatched: function(){
			var _this = this;

			StaticData.USER.then(function(user){
				_this.getView().byId("idKeAnlagePanel").setVisible(user.BtnAm);
				return DataProvider.readKondSelSetAsync();
			})
			.then(function(konditioneneinigungen){

				var favoritValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.Favorit; }));
				var buchungskreisValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.Bukrs; }));
				var wirtschaftseinheitValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.WeId; }));
				var regionalbueroValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.Regionalbuero; }));
				var keIdValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.KeId; }));
				var indBezValues= _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.IndBez; }));
				var anmerkungValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.Anmerkung; }));
				var erstellerValues = _.uniq(_.map(konditioneneinigungen, function(ke){ return ke.Ersteller; }));

				var jsonData = {
					data: konditioneneinigungen,
					facetfilterValues: {
						Favorit: _.map(favoritValues, function(Favorit){ return {key: Favorit, text: Favorit ? TranslationUtil.translate("JA") : TranslationUtil.translate("NEIN")}; }),
						Bukrs: _.map(buchungskreisValues, function(Bukrs){ return {key: Bukrs}; }),
						WeId: _.map(wirtschaftseinheitValues, function(WeId){ return {key: WeId}; }),
						Regionalbuero: _.map(regionalbueroValues, function(Regionalbuero){ return {key: Regionalbuero}; }),
						KeId: _.map(keIdValues, function(KeId){ return {key: KeId}; }),
						IndBez: _.map(indBezValues, function(IndBez){ return {key: IndBez}; }),
						Anmerkung: _.map(anmerkungValues, function(Anmerkung){ return {key: Anmerkung}; }),
						Ersteller: _.map(erstellerValues, function(Ersteller){ return {key: Ersteller}; })
					}
				};

				var jsonModel = new sap.ui.model.json.JSONModel(jsonData);
				_this.getView().setModel(jsonModel, "kondSel");
				_this.applyFilters();
			})
			.catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();
		},

		onBack : function() {
			this.getOwnerComponent().getRouter().navTo("startseite");
		},

		onItemPress : function(oEvent) {
			var konditioneneinigung = oEvent.getParameter("listItem").getBindingContext("kondSel").getObject();

			this.getOwnerComponent().getRouter().navTo("konditioneneinigungDetails", {
				KeId: konditioneneinigung.KeId,
				Bukrs: konditioneneinigung.Bukrs
			});
		},

		onAnlegenPress : function () {
			var _this = this;

			var radioButtonIndex = _this.getView().byId("RBG_Anlage").getSelectedIndex();

			switch(radioButtonIndex)
			{
				case 0:
					DataProvider.readWirtschaftseinheitenSetAsync()
					.then(function(wirtschaftseinheiten){
						_this._oDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungSelektionAnlageWirtschaftseinheit", _this);

						var formData = {
							wirtschaftseinheiten: wirtschaftseinheiten
						};

						_this._oDialog.setModel( new sap.ui.model.json.JSONModel(formData) , "form");

						// clear the old search filter
						_this._oDialog.getBinding("items").filter([]);
						_this._oDialog.open();
					})
					.catch(function(oError){
						ErrorMessageUtil.showError(oError);
					})
					.done();
				break;

				case 1:
					DataProvider.readMietvertragSetAsync().then(function(mietvertraege){
						_this._oDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungSelektionAnlageMietvertrag", _this);

						var formData = {
							mietvertraege: mietvertraege
						};

						_this._oDialog.setModel(new sap.ui.model.json.JSONModel(formData), "form");

						// clear the old search filter
						_this._oDialog.getBinding("items").filter([]);
						_this._oDialog.open();
					})
					.catch(function(oError){
						ErrorMessageUtil.showError(oError);
					})
					.done();
				break;

				case 2:
					DataProvider.readKonditioneneinigungSetAsync()
					.then(function(konditioneneinigungen){
						_this._oDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungSelektionAnlageKonditioneneinigung", _this);

						var formData = {
							konditioneneinigungen: konditioneneinigungen
						};

						_this._oDialog.setModel( new sap.ui.model.json.JSONModel(formData) , "form");

						// clear the old search filter
						_this._oDialog.getBinding("items").filter([]);
						_this._oDialog.open();
					})
					.catch(function(oError){
						ErrorMessageUtil.showError(oError);
					})
					.done();
				break;
			}

		},


		onKonditioneneinigungDialogConfirm: function(oEvent){
			var konditioneneinigung = oEvent.getParameter("selectedItem").getBindingContext("form").getObject();

			NavigationPayloadUtil.putPayload({
				KeId: konditioneneinigung.KeId,
				Bukrs: konditioneneinigung.Bukrs
			});

			this.getOwnerComponent().getRouter().navTo("konditioneneinigungAnlegenKe");
		},

		onKonditioneneinigungDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");

			var combinedOrFilter = new Filter([
				new Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("KeId", sap.ui.model.FilterOperator.Contains, sValue),
			], false);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([combinedOrFilter]);
		},


		onWirtschaftseinheitDialogConfirm: function(oEvent){
			var wirtschaftseinheit = oEvent.getParameter("selectedItem").getBindingContext("form").getObject();

			NavigationPayloadUtil.putPayload({
				WeId: wirtschaftseinheit.WeId,
				Bukrs: wirtschaftseinheit.Bukrs
			});

			this.getOwnerComponent().getRouter().navTo("konditioneneinigungAnlegenWe");
		},

		onWirtschaftseinheitDialogSearch: function(oEvent){
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


		onMietvertragDialogConfirm: function(oEvent){
			var mietvertrag = oEvent.getParameter("selectedItem").getBindingContext("form").getObject();

			NavigationPayloadUtil.putPayload({
				WeId: mietvertrag.WeId,
				Bukrs: mietvertrag.Bukrs,
				MvId: mietvertrag.MvId
			});

			this.getOwnerComponent().getRouter().navTo("konditioneneinigungAnlegenMv");
		},

		onMietvertragDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");

			var combinedOrFilter = new Filter([
				new Filter("Bukrs", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("MvId", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Mietername", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Vertart", sap.ui.model.FilterOperator.Contains, sValue),
			], false);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([combinedOrFilter]);
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
			var table = this.getView().byId("idKondSelTable");

			var filtersToApply = [];

			var facetFilterLists = this.getView().byId("idFacetFilter").getLists();

			facetFilterLists.forEach(function(list){

				if(list.getSelectedItems().length > 0){

					var itemFilters = [];

					list.getSelectedItems().forEach(function(item){

						switch(list.getTitle())
						{
							case TranslationUtil.translate("KOND_SEL_COL_FAVORIT"):
								var boolValue = (item.getKey() === "true") ? true : false;
								itemFilters.push( new Filter("Favorit", sap.ui.model.FilterOperator.EQ, boolValue) );
							break;

							case TranslationUtil.translate("KOND_SEL_COL_BUCHUNGSKREIS"):
								itemFilters.push( new Filter("Bukrs", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("KOND_SEL_COL_WIRTSCHAFTSEINHEIT"):
								itemFilters.push( new Filter("WeId", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("KOND_SEL_COL_REGIONALBUERO"):
								itemFilters.push( new Filter("Regionalbuero", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("KOND_SEL_COL_ID"):
								itemFilters.push( new Filter("KeId", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("KOND_SEL_COL_INDBEZ"):
								itemFilters.push( new Filter("IndBez", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("KOND_SEL_COL_ANMERKUNG"):
								itemFilters.push( new Filter("Anmerkung", sap.ui.model.FilterOperator.EQ, item.getKey()) );
							break;

							case TranslationUtil.translate("KOND_SEL_COL_ERSTELLER"):
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
			}
			else
			{
				table.getBinding("items").filter([]);
			}

		}

	});
});