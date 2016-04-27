/* 
    Author: Christian Hoff
*/

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox"], function (Controller, MessageBox) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungDetails", {
        
		onInit: function(oEvent){
            jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onInit");
			
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            
            // Das View kann auf drei unterschiedliche Arten aufgerufen werden
            // - Konditioneneinigung anzeigen
            // - Konditioneneinigung anlegen auf Basis einer Wirtschaftseinheit
            // - Konditioneneinigung anlegen auf Basis eines Mietvertrags
            
            oRouter.getRoute("konditioneneinigungDetails").attachPatternMatched(this.onKonditioneneinigungAnzeigen, this);
            oRouter.getRoute("konditioneneinigungAnlegenWe").attachPatternMatched(this.onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit, this);
            oRouter.getRoute("konditioneneinigungAnlegenMv").attachPatternMatched(this.onKonditioneneinigungAnlegenAufBasisEinesMietvertrags, this);
		},
		        
        onKonditioneneinigungAnzeigen: function(oEvent){
            
            var form = {
                "modus": "show", // show, new, edit
                
                "konditioneneinigung": {
                    "id": "KE_123456",
                    "gueltigeKonditioneneinigung": "2014-08-01",
                    "buchungskreis": "9-30",
                    "wirtschaftseinheit": "0599",
                    "bezeichnung": "20006 Washington, 1999 K Street",
                    
                    "gemeinsameAngaben":{
                        "mietbeginn": "2016-01-01"
                    },
                    
                    "mietflaechenangaben": [
                        {
                            "mietflaeche": "9-30/599/01010002",
                            "bezeichnung": "MF Handel/Gastronomie 1.OG",
                            "nutzungsart": "Handel, Gastronomie",
                            "nutzungsartAlternativ": "Lager",
                            "hauptnutzflaeche": 4467.00,
                            "mietflaecheAlternativ": 2500.00,
                            "nachhaltigeMiete": 9.140833,
                            "angebotsmiete": 12.00,
                            "grundbaukosten": 20.00,
                            "mieterausbaukosten": 30.00
                        },
                        {
                            "mietflaeche": "9-30/599/01010002",
                            "bezeichnung": "MF Handel/Gastronomie 1.OG",
                            "nutzungsart": "Handel, Gastronomie",
                            "nutzungsartAlternativ": "Lager",
                            "hauptnutzflaeche": 4467.00,
                            "mietflaecheAlternativ": 2500.00,
                            "nachhaltigeMiete": 9.140833,
                            "angebotsmiete": 12.00,
                            "grundbaukosten": 20.00,
                            "mieterausbaukosten": 30.00
                        },
                        {
                            "mietflaeche": "9-30/599/01010002",
                            "bezeichnung": "MF Handel/Gastronomie 1.OG",
                            "nutzungsart": "Handel, Gastronomie",
                            "nutzungsartAlternativ": "Lager",
                            "hauptnutzflaeche": 4467.00,
                            "mietflaecheAlternativ": 2500.00,
                            "nachhaltigeMiete": 9.140833,
                            "angebotsmiete": 12.00,
                            "grundbaukosten": 20.00,
                            "mieterausbaukosten": 30.00
                        },
                        {
                            "mietflaeche": "9-30/599/01010002",
                            "bezeichnung": "MF Handel/Gastronomie 1.OG",
                            "nutzungsart": "Handel, Gastronomie",
                            "nutzungsartAlternativ": "Lager",
                            "hauptnutzflaeche": 4467.00,
                            "mietflaecheAlternativ": 2500.00,
                            "nachhaltigeMiete": 9.140833,
                            "angebotsmiete": 12.00,
                            "grundbaukosten": 20.00,
                            "mieterausbaukosten": 30.00
                        }
                    ]
                }
            };
            
            var user = {
                "rolle": "FM" // FM, AM 
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            var userModel = new sap.ui.model.json.JSONModel(userModel);
            
            this.getView().setModel(userModel, "user");
			this.getView().setModel(formModel, "form");
        },
        
        onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit");
            
            var wirtschaftseinheitId = oEvent.getParameter("arguments").weId;
                        
            this.onKonditioneneinigungAnzeigen(oEvent);
            this.getView().getModel("form").setProperty("/modus", "new");
        },
        
        onKonditioneneinigungAnlegenAufBasisEinesMietvertrags: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinesMietvertrags");
            
            this.onKonditioneneinigungAnzeigen(oEvent);
            this.getView().getModel("form").setProperty("/modus", "new");
        },
        
        
        // --------
        
        
        handleTableSettingsButton: function(oEvent){
            
            // create popover
			if (! this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungDetailsPopover", this);
				this.getView().addDependent(this._oPopover);
			}
            
            var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopover.openBy(oButton);
			});
            
        },
        
        
        onBearbeitenButtonPress: function(evt){
            jQuery.sap.log.info(".. onBearbeitenButtonPress");
            
            // Alten Zustand sichern für eventuelle Wiederherstellung
            this._oldFormDataJSON = this.getView().getModel("form").getJSON();
                        
            this.getView().getModel("form").setProperty("/modus", "edit");
        },
        
        onSpeichernButtonPress: function(evt){
            jQuery.sap.log.info(".. onSpeichernButtonPress");
            
            // Eingaben validieren
            // Daten ins Backend schicken
            // Neues Modell auf Basis der Backenddaten anbinden
            
            var validationDidFail = (Math.random() > 0.5);
            
            if(validationDidFail)
            {
                this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateMietbeginn").setValueStateText("Eingaben überprüfen");
                
                sap.m.MessageBox.error("Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre eingaben.");
                //MessageBox.error("Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre eingaben.");
            }
            else
            {
                this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.None);   
                this.getView().getModel("form").setProperty("/modus", "show");
            }
        },
        
        onAbbrechenButtonPress: function(evt){
            jQuery.sap.log.info(".. onAbbrechenButtonPress");          
            
            var modus = this.getView().getModel("form").getProperty("/modus");           
            
            if(modus === "new")
            {
                // wenn modus == new
                // -> Änderungen Verwerfen und Navigation zurück
                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                
                MessageBox.confirm("Wollen Sie den Vorgang wirklich abbrechen?", {
                    title:"Hinweis",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function(action){
                        if(action === sap.m.MessageBox.Action.YES){
                            window.history.go(-1);
                        }
                    }
                });
                
            }
            else if(modus === "edit")
            {
                // wenn modus == edit
                // -> Änderungen Verwerfen
                // -> modus = show
                
                var oldFormData = JSON.parse(this._oldFormDataJSON);
                var formModel = new sap.ui.model.json.JSONModel(oldFormData);
                this.getView().setModel(formModel, "form");
                this.getView().getModel("form").setProperty("/modus", "show");
            }            

        },
        
        onMietflaechenAngabenLoeschenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenAngabenLoeschenButtonPress");
            
            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            var selectedItems = mietflaechenangabenTable.getSelectedItems();
            
            // über selectedItems iterieren und löschen            
        },
        
        onMietflaechenAngabeHinzufuegenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenAngabeHinzufuegenButtonPress");
            
            // Dialog öffnen
        },
        
        onAusbaukostenVerteilenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onAusbaukostenVerteilenButtonPress");
            
            if (!this._ausbaukostenVerteilenDialog) {
                this._ausbaukostenVerteilenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungDetailsAusbaukostenVerteilen", this);
                this.getView().addDependent(this._ausbaukostenVerteilenDialog);
            }
            
            var dialogModel = new sap.ui.model.json.JSONModel({
                "nutzungsarten": [
                    {"key": "0", "text": "Lager"},
                    {"key": "1", "text": "Büro"}
                ],
                "nutzungsart": "0",
                "grundausbaukosten": "25",
                "mietausbaukosten": "50"
            });
            this._ausbaukostenVerteilenDialog.setModel(dialogModel);
 
			this._ausbaukostenVerteilenDialog.open();
        },
        
        onAusbaukostenVerteilenFragmentAkzeptierenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onAusbaukostenVerteilenFragmentAkzeptierenButtonPress");
            
            this._ausbaukostenVerteilenDialog.close();
            
            var dialogModel = this._ausbaukostenVerteilenDialog.getModel();
            
            var verteilung = {
                "nutzungsart": dialogModel.getProperty("/nutzungsart"),
                "grundausbaukosten": dialogModel.getProperty("/grundausbaukosten"),
                "mietausbaukosten": dialogModel.getProperty("/mietausbaukosten")
            }

            // Logik zur Verteilung der Ausbaukosten
            // ...
        },
        
        onAusbaukostenVerteilenFragmentAbbrechenButtonPress: function(oEvent){
            this._ausbaukostenVerteilenDialog.close();
        }
        
	});
});