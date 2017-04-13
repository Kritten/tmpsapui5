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

                var formModel = new sap.ui.model.json.JSONModel(form);
                _this.getView().setModel(formModel, "form");

                _this.ladeMoeglicheGenehmiger();
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();

        },

        ladeMoeglicheGenehmiger: function(){
            var _this = this;
            var form = _this.getView().getModel("form");

            var stufen = form.oData.stufen;

            for(var i = 0; i < stufen.length; i++){
                var genehmigungen = stufen[i].genehmigungen;

                for(var j = 0; j < genehmigungen.length; j++){
                    var aktGenehmigung = genehmigungen[j];
                    var aktGenehmiger = genehmigungen[j].Genehmiger;
                    var aktStufe = stufen[i].Stufe;

                    DataProvider.readGenehmigerSetAsync(aktGenehmiger, aktStufe)
                    .then(function(genehmigerSet){                      
                        aktGenehmigung.available = genehmigerSet;
                        // var slist = _this.getView().byId("stufenList");
                        // var sItem = slist.getAggregation("items");
                        // console.log(sItem, "sitem");
                        // var tItem = sItem.getAggregation("content")[0].getItems()[j].getAggregation("cells")[0];

                        // console.log(tItem, "tItem");
                    }).done();
                }
            }

            console.log(form, "form");
        },

        onBearbeitenButtonPress: function(oEvent){
            this.getView().getModel("form").setProperty("/modus", "edit");
            
            var stufen = this.getView().byId("stufenList");
            var numStufen = stufen.getItems().length;
            var sTables;

            // Über Stufen iterieren
            for(var i = 0; i < numStufen; i = i + 1){
                var stufenItem = stufen.getItems()[i];
                sTables = stufenItem.getAggregation("content");
                
                // Wahrscheinlich ist sTables.length immer = 1
                for(var j=0; j < sTables.length; j = j+1){
                    var table = sTables[j];
                    var tableItems = table.getItems();

                    for(var k=0; k < tableItems.length; k = k + 1){
                        var tZeile = tableItems[k];
                        var zCells = tZeile.getAggregation("cells");

                       console.log(zCells[0].getItems(), "zCellItems"); 
                    }
                }
            }
            // for each (stufe)
            //    for each (zeile der tabelle)
            //        moeglicheGenehmiger = request(stufe, aktueller wert der dropdownliste)
            //        dropdownbox.available = moeglicheGenehmiger
            //
        },

        onSpeichernButtonPress: function(oEvent){
            this.getView().getModel("form").setProperty("/modus", "show");

            // for each (stufe)
            //    for each (zeile der tabelle)
            //        speicherRequestAbschicken (updateGenehmigungsprozess)
            //
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