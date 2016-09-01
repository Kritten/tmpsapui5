sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	
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

            var form = {

                modus: ["show", "edit"][0],

                level: [
                    {
                        title: "Genehmigungslevel 1",                        
                        genehmiger: [{
                            selected: "00000001",
                            available: [
                                {key: "00000001", text: "Max Mustermann"},
                                {key: "00000002", text: "Gerd Hoffmann"}  
                            ],
                            status: "genehmigt",
                            editable: false
                        }, {
                            selected: "00000002",
                            available: [
                                {key: "00000001", text: "Max Mustermann"},
                                {key: "00000002", text: "Gerd Hoffmann"}  
                            ],
                            status: "genehmigt",
                            editable: false
                        }]
                    },
                    {
                        title: "Genehmigungslevel 2",  
                        genehmiger: [{
                            selected: "00000001",
                            available: [
                                {key: "00000001", text: "Anke Peters"},
                                {key: "00000002", text: "Alexander Hofmann"}  
                            ],
                            status: "offen",
                            editable: true
                        }, {
                            selected: "00000001",
                            available: [
                                {key: "00000001", text: "Kerstin Fröhn"},
                                {key: "00000002", text: "Hauke Thomsen"}  
                            ],
                            status: "offen",
                            editable: true
                        }, {
                            selected: "00000001",
                            available: [
                                {key: "00000001", text: "Arabella Rolando"},
                                {key: "00000002", text: "Sabine Friedrichs"}  
                            ],
                            status: "offen",
                            editable: true
                        }]
                    },
                    {
                        title: "Genehmigungslevel 3",
                        genehmiger: [{
                            selected: "00000001",
                            available: [
                                {key: "00000001", text: "Rita Gerke"},
                                {key: "00000002", text: "Anja Rudde"}  
                            ],
                            status: "offen",
                            editable: true
                        }, {
                            selected: "00000001",
                            available: [
                                {key: "00000001", text: "Simone Holsten"},
                                {key: "00000002", text: "Katja Rudolphsen"}  
                            ],
                            status: "offen",
                            editable: true
                        }]
                    }
                ]
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            
            this.getView().setModel(formModel, "form");
        },

        onBearbeitenButtonPress: function(oEvent){
            this.getView().getModel("form").setProperty("/modus", "edit");
        },

        onSpeichernButtonPress: function(oEvent){

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