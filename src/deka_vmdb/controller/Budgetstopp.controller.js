sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/ErrorMessageUtil",
	"ag/bpc/Deka/util/StaticData",
	"ag/bpc/Deka/util/TranslationUtil"
], function (Controller, MessageBox, DataProvider, ErrorMessageUtil, StaticData, TranslationUtil) {

	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Budgetstopp", {

		onInit: function(){
            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("budgetstopp").attachPatternMatched(this.onPatternMatched, this);
		},

		onPatternMatched: function(){
			var _this = this;

			var formModel = new sap.ui.model.json.JSONModel({});
			_this.getView().setModel(formModel, "form");

			DataProvider.readFondsSetAsync().then(function(fonds){
				_this.getView().getModel("form").setProperty("/fonds", fonds);
				_this.getView().getModel("form").setProperty("/selectedFond", fonds[0]);
				_this.getView().getModel("form").setProperty("/selectedFondKey", fonds[0].Dmfonds);
				_this.ladeKonditioneneinigungen();
			})
			.catch(function(oError){
				ErrorMessageUtil.showError(oError);
			})
			.done();
		},

		ladeKonditioneneinigungen: function(){
			var _this = this;

			this.getView().byId("konditioneneinigungenTable").removeSelections(true);
			_this.getView().getModel("form").setProperty("/konditioneneinigungen", []);

			var item = _this.getView().byId("idSelectFond").getSelectedItem();
			var fond = item.getBindingContext("form").getObject();
			_this.getView().getModel("form").setProperty("/selectedFond", fond);

			DataProvider.readFondAsync(fond.Dmfonds).then(function(fond){
				_this.getView().getModel("form").setProperty("/konditioneneinigungen", fond.FoToKo);
			})
			.catch(function(oError){
				ErrorMessageUtil.showError(oError);
			})
			.done();
		},

		onFondSelektionChange: function(){
            this.ladeKonditioneneinigungen();
		},

		onDruckenButtonPress: function(){
		},

		onGenehmigungZurueckziehenButtonPress: function(){
			var _this = this;

			var items = _this.getView().byId("konditioneneinigungenTable").getSelectedItems();

			var fondItem = _this.getView().byId("idSelectFond").getSelectedItem();
			var fond = fondItem.getBindingContext("form").getObject();
			var dmFonds = fond.Dmfonds;

			if(items.length > 0){
				var konditioneneinigungen = _.map(items, function(item){
					return item.getBindingContext("form").getObject();
				});

				var dialog = new sap.m.Dialog({
					title: TranslationUtil.translate("HINWEIS"),
					type: sap.m.DialogType.Message,
					icon: "sap-icon://message-warning",
					state: sap.ui.core.ValueState.Warning,
					content: [
						new sap.m.Text({
							text: TranslationUtil.translate("KE_GENEHMIGUNG_ZURUECKZIEHEN_GRUND")
						}),
						new sap.m.TextArea("idGenehmigungZurueckziehenBegruendungTextArea", {
							liveChange: function(oEvent) {
								var sText = oEvent.getParameter("value");
								var parent = oEvent.getSource().getParent();
								parent.getBeginButton().setEnabled(sText.length > 0);
							},
							width: "100%",
							placeholder: TranslationUtil.translate("BEGRUENDUNG")
						})
					],
					beginButton: new sap.m.Button({
						text: TranslationUtil.translate("AKZEPTIEREN"),
						enabled: false,
						press: function () {

							var sText = sap.ui.getCore().byId("idGenehmigungZurueckziehenBegruendungTextArea").getValue();

							Q.all(_.map(konditioneneinigungen, function(ke){

								return DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
									KeId: ke.KeId,
									Bukrs: ke.Bukrs,
									Anmerkung: StaticData.ANMERKUNG.KE.BUDGETSTOPP,
									Bemerkung: sText,
									FondsBgtstp: dmFonds
								});

							}))
							.then(function(){
								MessageBox.information(TranslationUtil.translate("KE_GENEHMIGUNG_ZURUECKGEZOGEN"), {
									title: TranslationUtil.translate("HINWEIS")
								});
							})
							.catch(function(oError){
								ErrorMessageUtil.showError(oError);
							})
							.fin(function(){
								dialog.close();

								_this.ladeKonditioneneinigungen();
							});


						}
					}),
					endButton: new sap.m.Button({
						text: TranslationUtil.translate("ABBRECHEN"),
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
			}
		},

		onBack: function(){
			this.getOwnerComponent().getRouter().navTo("startseite", null, true);
		}

	});
});