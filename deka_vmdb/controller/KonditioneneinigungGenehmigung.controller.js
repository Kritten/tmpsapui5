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

            var form = {
                level: [
                    {
                        title: "Genehmigungslevel 1",
                        genehmiger: "00000001", 
                        status: "genehmigt", 
                        class: "sapThemePositiveText",
                        moeglicheGenehmiger: [
                            {key: "00000001", text: "Max Mustermann"},
                            {key: "00000002", text: "Gerd Hoffmann"}
                        ],
                        editable: false
                    },
                    {
                        title: "Genehmigungslevel 2", 
                        genehmiger: "00000001", 
                        status: "offen",
                        class: "sapThemeCriticalText",
                        moeglicheGenehmiger: [
                            {key: "00000001", text: "Herbert Schmidt"},
                            {key: "00000002", text: "Peter Schneider"}
                        ],
                        editable: true
                    },
                    {
                        title: "Genehmigungslevel 3", 
                        genehmiger: "00000001", 
                        status: "offen",
                        class: "sapThemeCriticalText",
                        moeglicheGenehmiger: [
                            {key: "00000001", text: "Simon Petersen"},
                            {key: "00000002", text: "Simone Petersen"}
                        ],
                        editable: true
                    }
                ]
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            
            this.getView().setModel(formModel, "form");
        }


    });

});