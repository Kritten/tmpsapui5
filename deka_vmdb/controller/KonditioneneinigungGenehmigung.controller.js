/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:39:37 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:39:37 
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ag/bpc/Deka/util/DataProvider",
    "ag/bpc/Deka/util/ErrorMessageUtil"], function (Controller, DataProvider, ErrorMessageUtil) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungGenehmigung", {

		onInit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungGenehmigung .. onInit");
            var _this = this;

            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("konditioneneinigungGenehmigung").attachPatternMatched(this.onPatternMatched, this);
        },

        onPatternMatched: function(oEvent){
            // Werte vorhalten für Zurück-Navigation
            this._KeId = oEvent.getParameter("arguments").KeId;
            this._Bukrs = oEvent.getParameter("arguments").Bukrs;

            this.ladeGenehmigungen();
        },

        ladeGenehmigungen: function(){
            var _this = this;

            DataProvider.readGenehmigungsprozessSetAsync(_this._KeId, null)
            .then(function(genehmigungen){

                var genehmigungenGruppiert = _.groupBy(genehmigungen, function(genehmigung){
                    return genehmigung.Stufe;
                });

                var stufen = _.map(_.pairs(genehmigungenGruppiert), function(pair){
                    return {
                        Stufe: pair[0],
                        genehmigungen: _.sortBy(pair[1], function(genehmigung){
                            return genehmigung.Index;
                        })
                    };
                });

                var form = {
                    modus: ["show", "edit"][0],
                    stufen: stufen
                };

                console.log(stufen);

                var formModel = new sap.ui.model.json.JSONModel(form);
                _this.getView().setModel(formModel, "form");
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();

        },

        onBearbeitenButtonPress: function(oEvent){
            this.getView().getModel("form").setProperty("/modus", "edit");
        },

        onSpeichernButtonPress: function(oEvent){
            this.getView().getModel("form").setProperty("/modus", "show");
        },

        onAbbrechenButtonPress: function(oEvent){
            this.getView().getModel("form").setProperty("/modus", "show");
        },

        onBack : function(oEvent) {
            this.getOwnerComponent().getRouter().navTo("konditioneneinigungDetails", {
                KeId: this._KeId,
                Bukrs: this._Bukrs
            });
        }


    });

});