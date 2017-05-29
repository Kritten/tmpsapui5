/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:39:37 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:39:37 
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ag/bpc/Deka/util/DataProvider",
    "ag/bpc/Deka/util/StaticData",
    "ag/bpc/Deka/util/ErrorMessageUtil",
    "ag/bpc/Deka/util/TranslationUtil"], function (Controller, DataProvider, StaticData, ErrorMessageUtil, TranslationUtil) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungGenehmigung", {

		onInit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungGenehmigung .. onInit");
            var _this = this;

            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            this.getView().setModel(sap.ui.getCore().getModel("text"), "text");

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

                // Lade moegliche Genehmiger 
                var promises = [];
                _.map(stufen, function(stufe){
                    _.map(stufe.genehmigungen, function(genehmigung){
                        var genehmiger = genehmigung.Genehmiger;
                        var stufenId = stufe.Stufe;

                        var promise = DataProvider.readGenehmigerSetAsync(genehmiger, stufenId);
                        promise.then(function(genehmigerSet){
                            genehmigung.available = genehmigerSet;                            
                        });
                        promises.push(promise);
                    });
                });    

                Q.all(promises).then(function(){
                    var form = {
                        modus: ["show", "edit"][0],
                        stufen: stufen
                    };
                    var formModel = new sap.ui.model.json.JSONModel(form);
                    formModel.setSizeLimit(1000);
                    console.log(formModel, "formModel");
                    _this.getView().setModel(formModel, "form");   
                });                       
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
            var _this = this;
            var form = this.getView().getModel("form");
            console.log(form, "form");

            var stufen = form.oData.stufen;

            _.map(stufen, function(stufe){
                _.map(stufe.genehmigungen, function(genehmigung){
                    if(genehmigung.Status === "80"){
                        var payload = {
                            "Index": genehmigung.Index,
                            "KeId": _this._KeId,
                            "VaId": '',
                            "Stufe": stufe.Stufe,
                            "Genehmiger": (genehmigung.newKey) ? genehmigung.newKey : genehmigung.Genehmiger,
                            "Status": genehmigung.Status,
                            "Switch": genehmigung.Switch
                        };
                        
                        DataProvider.updateGenehmigungsprozessSetAsync(payload.Index, payload.KeId, payload.VaId, payload.Stufe, payload)
                        .then(function(){
                            _this.refreshView();
                            _this.ladeGenehmigungen();
                        })
                        .catch(function(oError){
                            var error = ErrorMessageUtil.parseErrorMessage(oError);
                            ErrorMessageUtil.show(error);
                        }).done();
                    }
                });
            });
            
        },

        refreshView: function(){
            var oModel = this.getView().getModel("form");

            oModel.refresh();
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