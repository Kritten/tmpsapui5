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

        onBeforeRendering: function(){
            this.ladeGenehmigungen();            
        },

        onPatternMatched: function(oEvent){
            // Werte vorhalten für Zurück-Navigation
            this._KeId = oEvent.getParameter("arguments").KeId;
            this._Bukrs = oEvent.getParameter("arguments").Bukrs;       
        },

        uebersetzeStufenHeader: function(){
            var _this = this;
            var stufenList = this.getView().byId("stufenList");
            var stufenItems = stufenList.getItems();
            
            for(var i=0; i < stufenItems.length; i++){
                var stufenItem = stufenItems[i];
                var content = stufenItem.getAggregation("content");
                var table = content[0];
                var headerToolbar = table.getAggregation("headerToolbar");
                var headerText = headerToolbar.getAggregation("content")[0].getProperty("text");

                var i18nText = TranslationUtil.translate(headerText);
                headerToolbar.getAggregation("content")[0].setProperty("text", i18nText);
            }
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

                var formModel = new sap.ui.model.json.JSONModel(form);
                _this.getView().setModel(formModel, "form");

                _this.ladeMoeglicheGenehmiger();
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done(function(){
                _this.uebersetzeStufenHeader();
            });

        },

        ladeMoeglicheGenehmiger: function(){
            var _this = this;
            var form = _this.getView().getModel("form");
            form.setSizeLimit(1000);

            var stufen = form.oData.stufen;
            var stufenList = this.getView().byId("stufenList");

            for(var i = 0; i < stufen.length; i++){
                var genehmigungen = stufen[i].genehmigungen;
                var stufenItem = stufenList.getItems()[i];
                var sTables = stufenItem.getAggregation("content");
                var table = sTables[0];
                var tableItems = table.getItems();

                for(var j = 0; j < genehmigungen.length; j++){
                    var aktGenehmigung = genehmigungen[j];
                    var aktGenehmiger = genehmigungen[j].Genehmiger;
                    var aktStufe = stufen[i].Stufe;    
                    var tZeile = tableItems[j];
                    var zCells = tZeile.getAggregation("cells");
                    var selectCell = zCells[0];
                    console.log(selectCell, "selectCell");                

                    console.log(aktGenehmiger, "aktGenehmiger");
                    DataProvider.readGenehmigerSetAsync(aktGenehmiger, aktStufe)
                    .then(function(genehmigerSet){                     
                        aktGenehmigung.available = genehmigerSet;  
                        selectCell.setSelectedKey(aktGenehmiger);                                      
                    }).done();
                }
            }

           
            console.log(form, "form");
        },

        onBearbeitenButtonPress: function(oEvent){
            this.getView().getModel("form").setProperty("/modus", "edit");
        },

        onSpeichernButtonPress: function(oEvent){
            var _this = this;
            this.getView().getModel("form").setProperty("/modus", "show");
            var form = this.getView().getModel("form");

            var stufen = form.oData.stufen;
            var stufenList = this.getView().byId("stufenList");
            var numStufen = stufenList.getItems().length;
            var sTables;

            // Über Stufen iterieren
            for(var i = 0; i < numStufen; i = i + 1){
                var stufenItem = stufenList.getItems()[i];
                sTables = stufenItem.getAggregation("content");
                
                // Wahrscheinlich ist sTables.length immer = 1
                for(var j=0; j < sTables.length; j = j+1){
                    var table = sTables[j];
                    var tableItems = table.getItems();

                    for(var k=0; k < tableItems.length; k = k + 1){
                        var tZeile = tableItems[k];
                        var zCells = tZeile.getAggregation("cells");

                        var payload = {
                            "Index" : stufen[i].genehmigungen[k].Index,
                            "KeId" : _this._KeId,
                            "VaId" : '',
                            "Stufe" : stufen[i].Stufe,
                            "Genehmiger" : zCells[0].getSelectedKey(),
                            "Status" : stufen[i].genehmigungen[k].Status,
                            "Switch" : stufen[i].genehmigungen[k].Switch
                        }

                        DataProvider.updateGenehmigungsprozessSetAsync(payload.Index, payload.KeId, payload.VaId, payload.Stufe, payload)
                        .catch(function(oError){
                            var error = ErrorMessageUtil.parseErrorMessage(oError);
                            ErrorMessageUtil.show(error);
                        }).done();
                    }
                }
            }
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