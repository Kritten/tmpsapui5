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
                modus: "show", // show, new, edit
                
                konditioneneinigung: {
                    id: "KE_123456",
                    gueltigeKonditioneneinigung: "2014-08-01",
                    buchungskreis: "9-30",
                    wirtschaftseinheit: "0599",
                    bezeichnung: "20006 Washington, 1999 K Street",
                    
                    gemeinsameAngaben:{
                        mietbeginn: "2016-01-01"
                    },
                    
                    mietflaechenangaben: [],
                    
                    mieteGesamt: {vermietungsaktivitaet: null, konditioneneinigung: null},
                    kostenGesamt: {vermietungsaktivitaet: null, konditioneneinigung: null},
                    
                    arbeitsvorrat: null
                }
            };
            
            var user = {
                rolle: "FM" // FM, AM 
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            var userModel = new sap.ui.model.json.JSONModel(userModel);
            
            this.getView().setModel(userModel, "user");
			this.getView().setModel(formModel, "form");
            
            this.clearValidationState();
            this.berechneMieteUndKosten();
        },
        
        onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit");
            
            var wirtschaftseinheitId = oEvent.getParameter("arguments").weId;
                        
            this.onKonditioneneinigungAnzeigen(oEvent);
            this.getView().getModel("form").setProperty("/modus", "new");
            
            this.clearValidationState();
        },
        
        onKonditioneneinigungAnlegenAufBasisEinesMietvertrags: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinesMietvertrags");
            
            this.onKonditioneneinigungAnzeigen(oEvent);
            this.getView().getModel("form").setProperty("/modus", "new");
            
            this.clearValidationState();
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
            

            var validationSuccess = this.validateForm();
            
            if(validationSuccess)
            {
                this.clearValidationState();
                this.getView().getModel("form").setProperty("/modus", "show");
            }
            else
            {
                //MessageBox.error("Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.");
                
                var _this = this;
                
                var dialog = new sap.m.Dialog({
                    title: "Warnung",
                    type: "Message",
                    state: "Warning",
                    content: new sap.m.Text({
                        text: "Validierung fehlgeschlagen. Sie können die Konditioneneinigung zunächst im Arbeitsvorrat speichern oder Ihre Eingaben überprüfen."
                    }),
                    beginButton: new sap.m.Button({
                        text: 'Im Arbeitsvorrat speichern',
                        press: function () {
                            // Backend aufrufen
                            // Im Arbeitsvorrat speichern
                            _this.getView().getModel("form").setProperty("/konditioneneinigung/arbeitsvorrat", true);                            
                            dialog.close();
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: 'Abbrechen',
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
        
        validateForm: function(){
            
            var validationResult = true;
            
            // vorhandene States zurücksetzen
            this.clearValidationState();
            
            if(this.getView().byId("dateMietbeginn").getDateValue() === null)
            {
                this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateMietbeginn").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("dateMietbeginn").getDateValue() < Date.now())
            {
                this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateMietbeginn").setValueStateText("Das Datum des Mietbeginns muss in der Zukunft liegen.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("laufzeitBis1stBreak").getValue() === "")
            {
                this.getView().byId("laufzeitBis1stBreak").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("laufzeitBis1stBreak").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("laufzeitBis1stBreak").getValue() < 0)
            {
                this.getView().byId("laufzeitBis1stBreak").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("laufzeitBis1stBreak").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("dateGueltigkeitKonditioneneinigung").getDateValue() === null)
            {
                this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("dateGueltigkeitKonditioneneinigung").getDateValue() < Date.now())
            {
                this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueStateText("Das Datum der Gültigkeit muss in der Zukunft liegen.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("mietfreieZeitenInMonaten").getValue() === "")
            {
                this.getView().byId("mietfreieZeitenInMonaten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("mietfreieZeitenInMonaten").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("mietfreieZeitenInMonaten").getValue() < 0)
            {
                this.getView().byId("mietfreieZeitenInMonaten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("mietfreieZeitenInMonaten").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("maklerkostenInMonatsmieten").getValue() === "")
            {
                this.getView().byId("maklerkostenInMonatsmieten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("maklerkostenInMonatsmieten").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("maklerkostenInMonatsmieten").getValue() < 0)
            {
                this.getView().byId("maklerkostenInMonatsmieten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("maklerkostenInMonatsmieten").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("beratungskostenInMonatsmieten").getValue() === "")
            {
                this.getView().byId("beratungskostenInMonatsmieten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("beratungskostenInMonatsmieten").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("beratungskostenInMonatsmieten").getValue() < 0)
            {
                this.getView().byId("beratungskostenInMonatsmieten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("beratungskostenInMonatsmieten").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
            
            var mietflaechenangabenItems = this.getView().byId("mietflaechenangabenTable").getItems();
            
            if(mietflaechenangabenItems.length === 0)
            {
                this.getView().byId("mietflaechenangabenErrorBox").setVisible(true);
                this.getView().byId("mietflaechenangabenErrorBox").setText("Es muss mindestens eine Mietflächenangabe hinzugefügt werden.");
                validationResult = false;
            }
            
            mietflaechenangabenItems.forEach(function(item){
                
                var mietflaechenangabe = item.getBindingContext("form").getObject();
                
                if(mietflaechenangabe.angebotsmiete < 0 || mietflaechenangabe.angebotsmiete === ""){
                    item.getCells()[5].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[5].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
                if(mietflaechenangabe.grundbaukosten < 0 || mietflaechenangabe.grundbaukosten === ""){
                    item.getCells()[6].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[6].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
                if(mietflaechenangabe.mieterausbaukosten < 0 || mietflaechenangabe.mieterausbaukosten === ""){
                    item.getCells()[7].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[7].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
            });        
            
            
            return validationResult;
        },
        
        clearValidationState: function(){
            this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("laufzeitBis1stBreak").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("mietfreieZeitenInMonaten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("maklerkostenInMonatsmieten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("beratungskostenInMonatsmieten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("mietflaechenangabenErrorBox").setVisible(false);
            
            var mietflaechenangabenItems = this.getView().byId("mietflaechenangabenTable").getItems();
            
            mietflaechenangabenItems.forEach(function(item){
                item.getCells()[5].setValueState(sap.ui.core.ValueState.None);
                item.getCells()[6].setValueState(sap.ui.core.ValueState.None);  
                item.getCells()[7].setValueState(sap.ui.core.ValueState.None);  
            });   
        },
        
        berechneMieteUndKosten: function(){
            
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/mietflaechenangaben");
            
            var mieteGesamtKE = 0;
            var kostenGesamtKE = 0;
            
            mietflaechenangaben.forEach(function(mietflaechenangabe){
                mieteGesamtKE += mietflaechenangabe.hauptnutzflaeche * mietflaechenangabe.nachhaltigeMiete;
                kostenGesamtKE += mietflaechenangabe.hauptnutzflaeche + (mietflaechenangabe.grundbaukosten + mietflaechenangabe.mieterausbaukosten);
            });
                      
            this.getView().getModel("form").setProperty("/konditioneneinigung/mieteGesamt/vermietungsaktivitaet", "-"); 
            this.getView().getModel("form").setProperty("/konditioneneinigung/mieteGesamt/konditioneneinigung", mieteGesamtKE); 
            
            this.getView().getModel("form").setProperty("/konditioneneinigung/kostenGesamt/vermietungsaktivitaet", "-"); 
            this.getView().getModel("form").setProperty("/konditioneneinigung/kostenGesamt/konditioneneinigung", kostenGesamtKE); 
        },
        
        onAbbrechenButtonPress: function(evt){
            jQuery.sap.log.info(".. onAbbrechenButtonPress");          
            
            this.clearValidationState();
            
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
                                    
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/mietflaechenangaben");

            console.log(mietflaechenangaben);
            
            // ES6 Zukunftstechnologie - eventuell überarbeiten
            var objectsToRemove = selectedItems.map(item => item.getBindingContext("form").getObject() );
            mietflaechenangaben = mietflaechenangaben.filter(ma => objectsToRemove.indexOf(ma) === -1  );
            
            /*
            // über selectedItems iterieren und löschen
            selectedItems.forEach(function(item){
                var mietflaechenangabe = item.getBindingContext("form").getObject();
                var removeIndex = mietflaechenangaben.indexOf(mietflaechenangabe);
                
                console.log("removing item: " + removeIndex);
                mietflaechenangaben.splice(removeIndex, 1);
            });
            */
            
            console.log(mietflaechenangaben);
            
            this.getView().getModel("form").setProperty("/konditioneneinigung/mietflaechenangaben", mietflaechenangaben);

            // Selektion aufheben nach dem Löschen
            mietflaechenangabenTable.removeSelections(true);
        },
        
        onMietflaechenAngabeHinzufuegenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenAngabeHinzufuegenButtonPress");
            
            // Dialog öffnen
            
            if (! this._mietflaechenSelektionDialog) {
                this._mietflaechenSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungDetailsMietflaechenSelektion", this);
            }
            
            var mietflaechenSelektionDialogModel = new sap.ui.model.json.JSONModel({
                "mietflaechen": [
                    {
                        "mietflaeche": "9-30/599/01010002",
                        "bezeichnung": "MF Handel/Gastronomie 1.OG",
                        "nutzungsart": "Handel, Gastronomie",
                        "nutzungsartAlternativ": "Lager",
                        "hauptnutzflaeche": 9000.00,
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
                        "hauptnutzflaeche": 1000.00,
                        "mietflaecheAlternativ": 2500.00,
                        "nachhaltigeMiete": 9.140833,
                        "angebotsmiete": 12.00,
                        "grundbaukosten": 20.00,
                        "mieterausbaukosten": 30.00
                    },
                    {
                        "mietflaeche": "9-30/599/01010002",
                        "bezeichnung": "MF Handel/Wertstoffe 1.OG",
                        "nutzungsart": "Handel, Wertstoffe",
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
            });
            
            this._mietflaechenSelektionDialog.setModel(mietflaechenSelektionDialogModel);
            
            this._mietflaechenSelektionDialog.open();
        },
        
        onMietflaechenSelektionDialogConfirm: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenSelektionDialogConfirm");
            
            var selectedItems = oEvent.getParameter("selectedItems");
            
            if(selectedItems.length > 0)
            {
                var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/mietflaechenangaben");
                
                selectedItems.forEach(function(item){
                    var mietflaechenangabe = item.getBindingContext().getObject();
                    mietflaechenangaben.push(mietflaechenangabe);
                });
                
                this.getView().getModel("form").setProperty("/konditioneneinigung/mietflaechenangaben", mietflaechenangaben);
            }

// TODO: berechnung an Change Event hängen
            this.berechneMieteUndKosten();
        },
        
        onMietflaechenSelektionDialogSearch: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenSelektionDialogSearch");
            
        },
        
        onAusbaukostenVerteilenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onAusbaukostenVerteilenButtonPress");
            
            if (!this._ausbaukostenVerteilenDialog) {
                this._ausbaukostenVerteilenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungDetailsAusbaukostenVerteilen", this);
                this.getView().addDependent(this._ausbaukostenVerteilenDialog);
            }
            
            
            // über Einträge iterieren und Nutzungsarten sammeln
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/mietflaechenangaben");
            
            var vorhandeneNutzungsarten = {};
            
            mietflaechenangaben.forEach(function(mietflaechenangabe){
                // key - value .. in dem Fall beides gleich
                vorhandeneNutzungsarten[mietflaechenangabe.nutzungsart] = {"key": mietflaechenangabe.nutzungsart, "text": mietflaechenangabe.nutzungsart};
            });
            
            // Object-Properties to Array
            var vorhandeneNutzungsarten = Object.keys(vorhandeneNutzungsarten).map(function (key) {
                return vorhandeneNutzungsarten[key]
            });
            
            var dialogModel = new sap.ui.model.json.JSONModel({
                "nutzungsarten": vorhandeneNutzungsarten,
                "nutzungsart": null,
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
                nutzungsart: dialogModel.getProperty("/nutzungsart"),
                grundausbaukosten: dialogModel.getProperty("/grundausbaukosten"),
                mietausbaukosten: dialogModel.getProperty("/mietausbaukosten")
            }

            // Logik zur Verteilung der Ausbaukosten
        
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/mietflaechenangaben");
            
            var sumHauptnutzflaeche = 0;
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if(mietflaechenangabe.nutzungsart === verteilung.nutzungsart)
                {
                    sumHauptnutzflaeche += mietflaechenangabe.hauptnutzflaeche;
                }
            });
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if(mietflaechenangabe.nutzungsart === verteilung.nutzungsart)
                {
                    mietflaechenangabe.grundbaukosten = (mietflaechenangabe.hauptnutzflaeche / sumHauptnutzflaeche) * verteilung.grundausbaukosten;
                    mietflaechenangabe.mieterausbaukosten = (mietflaechenangabe.hauptnutzflaeche / sumHauptnutzflaeche) * verteilung.mietausbaukosten;
                }
            });
            
            this.getView().getModel("form").setProperty("/konditioneneinigung/mietflaechenangaben", mietflaechenangaben);
        },
        
        onAusbaukostenVerteilenFragmentAbbrechenButtonPress: function(oEvent){
            this._ausbaukostenVerteilenDialog.close();
        }
        
	});
});