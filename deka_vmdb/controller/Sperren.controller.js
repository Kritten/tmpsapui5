/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:43:36 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:43:36 
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ag/bpc/Deka/util/DataProvider",
	"ag/bpc/Deka/util/ErrorMessageUtil"], function (Controller, DataProvider, ErrorMessageUtil) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.Sperren", {

		onInit: function(evt){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.Sperren .. onInit");
            
            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");          
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("sperren").attachPatternMatched(this.onPatternMatched, this);
		},
		
		onBack: function(oEvent){
			this.getOwnerComponent().getRouter().navTo("startseite", null, true);
		},
		
		onPatternMatched: function(oEvent){
			var formModel = new sap.ui.model.json.JSONModel({
				sperren: []
			});
			this.getView().setModel(formModel, "form");

			this.ladeSperren();
		},
		
		onSperreAufhebenButtonPress: function(oEvent){
			var _this = this;

			var items = _this.getView().byId("sperrenTable").getSelectedItems();
			var sperren = _.map(items, function(item){
				return item.getBindingContext("form").getObject();
			});

			Q.all(_.map(sperren, function(sperre){
				return DataProvider.deleteSperreAsync(sperre.KeId, sperre.VaId);
			}))
			.catch(function(oError){
				ErrorMessageUtil.showError(oError);
			})
			.fin(function(){
				_this.ladeSperren();
			})
			.done();
		},

		ladeSperren: function(){
			var _this = this;

			_this.getView().byId("sperrenTable").removeSelections(true);
			_this.getView().getModel("form").setProperty("/sperren", []);

			DataProvider.readSperrenAsync().then(function(sperren){
				_this.getView().getModel("form").setProperty("/sperren", _.map(sperren, function(sperre){
					sperre.Uhrzeit = new Date(sperre.Uhrzeit.ms);
					return sperre;
				}));
			})
			.catch(function(oError){
				console.log(oError);
			})
			.done();
		},
		
		onDruckenButtonPress: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.Sperren .. onDruckenButtonPress");
		}        
        
	});
});