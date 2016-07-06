/* 
    Author: Christian Hoff
*/

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "ag/bpc/Deka/util/PrinterUtil"], function (Controller, MessageBox, PrinterUtil) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungDetails", {
        
		onInit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onInit");
            
            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            
            // Das View kann auf drei unterschiedliche Arten aufgerufen werden
            // - Konditioneneinigung anzeigen
            // - Konditioneneinigung anlegen auf Basis einer Wirtschaftseinheit
            // - Konditioneneinigung anlegen auf Basis eines Mietvertrags
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("konditioneneinigungDetails").attachPatternMatched(this.onKonditioneneinigungAnzeigen, this);
            oRouter.getRoute("konditioneneinigungAnlegenWe").attachPatternMatched(this.onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit, this);
            oRouter.getRoute("konditioneneinigungAnlegenMv").attachPatternMatched(this.onKonditioneneinigungAnlegenAufBasisEinesMietvertrags, this);
            oRouter.getRoute("konditioneneinigungAnlegenKe").attachPatternMatched(this.onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung, this);
		},
        
        onKonditioneneinigungAnzeigen: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnzeigen");
            var _this = this;

            var Bukrs = oEvent.getParameter("arguments").Bukrs;
            var KeId = oEvent.getParameter("arguments").KeId;

            var oDataModel = sap.ui.getCore().getModel("odata");

            oDataModel.read("/KonditioneneinigungSet(" 
                + "Bukrs=" + "'" + Bukrs + "'" 
                + ","
                + "KeId=" + "'" + KeId + "'"
                + ")",
            {

                urlParameters: {
                    "$expand": "KeToOb"
                },

                success: function(oData){
                    console.log(oData);

                    // Struktur aufbereiten für UI5 Binding
                    oData.Favorit = (Math.random() > 0.5); // Feld ist zur Zeit noch ein String
                    oData.KeToOb = oData.KeToOb.results;

                    // Zusätzliche Felder
                    oData.mieteGesamt = {vermietungsaktivitaet: null, konditioneneinigung: null};
                    oData.kostenGesamt = {vermietungsaktivitaet: null, konditioneneinigung: null};
                    oData.arbeitsvorrat = null;

                    var form = {
                        modus: "show", // show, new, edit
                        konditioneneinigung: oData,
                    };

                    var user = {
                        rolle: "FM" // FM, AM 
                    };
                    
                    var formModel = new sap.ui.model.json.JSONModel(form);
                    var userModel = new sap.ui.model.json.JSONModel(userModel);
                    
                    _this.getView().setModel(userModel, "user");
                    _this.getView().setModel(formModel, "form");
                    
                    _this.clearValidationState();
                }
            });
            
        },
        
        onKonditioneneinigungAnlegen: function(oEvent){
            
            var form = {
                modus: "new", // show, new, edit
                
                konditioneneinigung: {

                    KeId: "",
                    Bukrs: "",
                    MfSplit: "",
                    AuthUser: "",
                    Favorit: "",
                    LzFirstbreak: "",
                    WeId: "",
                    MzMonate: "",
                    Status: "",
                    Anmerkung: "",
                    Aktiv: "",
                    Mietbeginn: null,
                    Bemerkung: "",
                    GnStufe: "",
                    BkMonatsmieten: "",
                    GnFm: "",
                    GnFmDurch: "",
                    GnGl: "",
                    GnGlDurch: "",
                    MkMonate: "",
                    Currency: "",
                    GnAl: "",
                    GnAlDurch: "",
                    Unit: "",
                    GnGf: "",
                    GnGfDurch: "",

                    KeToOb: [],
                    KeToWe: [],
                    
                    // keine OData Felder
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
        },
        
        onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit");
            
            this.onKonditioneneinigungAnlegen(oEvent);
            var WeId = oEvent.getParameter("arguments").WeId;
            var Bukrs = oEvent.getParameter("arguments").Bukrs;
        },
        
        onKonditioneneinigungAnlegenAufBasisEinesMietvertrags: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinesMietvertrags");
        
            this.onKonditioneneinigungAnlegen(oEvent);
            var MvId = oEvent.getParameter("arguments").MvId;
            var Bukrs = oEvent.getParameter("arguments").Bukrs;
        },

        onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung");

            this.onKonditioneneinigungAnlegen(oEvent);
            var KeId = oEvent.getParameter("arguments").KeId;
            var Bukrs = oEvent.getParameter("arguments").Bukrs;
        },
        
        onBack : function(oEvent) {
            this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
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
            var formData = this.getView().getModel("form").getData();
            this._formDataBackup = jQuery.extend(true, {}, formData);

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
                this.getView().getModel("form").setProperty("/modus", "show");
            }
            else
            {              
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
                            _this.getView().getModel("form").setProperty("/modus", "show");
                            _this.clearValidationState();
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
            
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            
            var mieteGesamtKE = 0;
            var kostenGesamtKE = 0;
            
            mietflaechenangaben.forEach(function(mietflaechenangabe){
                mieteGesamtKE += mietflaechenangabe.Hnfl * mietflaechenangabe.NhMiete;
                kostenGesamtKE += mietflaechenangabe.Hnfl + (mietflaechenangabe.GaKosten + mietflaechenangabe.MaKosten);
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
                    title:"{i18n>HINWEIS}",
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
                
                this.getView().getModel("form").setData(this._formDataBackup);
                this.getView().getModel("form").setProperty("/modus", "show");
            }

        },
        
        onMietflaechenAngabenLoeschenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenAngabenLoeschenButtonPress");
            
            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            var selectedItems = mietflaechenangabenTable.getSelectedItems();
                                    
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");

            console.log(mietflaechenangaben);
            
            // ES6 Zukunftstechnologie - eventuell überarbeiten
            var objectsToRemove = selectedItems.map(item => item.getBindingContext("form").getObject() );
            mietflaechenangaben = mietflaechenangaben.filter(ma => objectsToRemove.indexOf(ma) === -1  );
            
            console.log(mietflaechenangaben);
            
            this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);

            // Selektion aufheben nach dem Löschen
            mietflaechenangabenTable.removeSelections(true);
        },
        
        onMietflaechenAngabeHinzufuegenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenAngabeHinzufuegenButtonPress");
            
            // Dialog öffnen
            
            if (! this._mietflaechenSelektionDialog) {
                this._mietflaechenSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.MietflaechenSelektion", this);
            }
            
            var mietflaechenSelektionDialogModel = new sap.ui.model.json.JSONModel({
                mietflaechen: [
                    {
                        KeId: "",
                        VaId: "",
                        MoId: "01010002",
                        WeId: "599",
                        Bukrs: "9-30",
                        Nutzart: "Handel, Gastronomie",
                        Whrung: "EUR",
                        Hnfl: 9000.00,
                        HnflAlt: 9000.00,
                        MaKosten: 30.00,
                        NhMiete: 9.140833,
                        AnMiete: 12.00,
                        GaKosten: 20.00
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
                var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
                
                selectedItems.forEach(function(item){
                    var mietflaechenangabe = item.getBindingContext().getObject();
                    mietflaechenangaben.push(mietflaechenangabe);
                });
                
                this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);
            }
        },
        
        onMietflaechenSelektionDialogSearch: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenSelektionDialogSearch");
            
        },
        
        onAusbaukostenVerteilenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onAusbaukostenVerteilenButtonPress");
            
            if (!this._ausbaukostenVerteilenDialog) {
                this._ausbaukostenVerteilenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.AusbaukostenVerteilen", this);
                this.getView().addDependent(this._ausbaukostenVerteilenDialog);
            }
            
            // über Einträge iterieren und Nutzungsarten sammeln
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            
			if(mietflaechenangaben.length === 0){
// TODO: Fehlermeldung
				return;
			}
            
            var vorhandeneNutzungsarten = {};
            
            mietflaechenangaben.forEach(function(mietflaechenangabe){
                // key - value .. in dem Fall beides gleich
                vorhandeneNutzungsarten[mietflaechenangabe.Nutzart] = {key: mietflaechenangabe.Nutzart, text: mietflaechenangabe.Nutzart};
            });
            
            // Object-Properties to Array
            var vorhandeneNutzungsarten = Object.keys(vorhandeneNutzungsarten).map(function (key) {
                return vorhandeneNutzungsarten[key]
            });
            
            var dialogModel = new sap.ui.model.json.JSONModel({
                nutzungsarten: vorhandeneNutzungsarten,
                nutzungsart: vorhandeneNutzungsarten[0].key, // Vorbelegung auf gültigen Wert notwendig - sonst Buggy
                grundausbaukosten: 25,
                mietausbaukosten: 50
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

            console.log(verteilung);

            // Logik zur Verteilung der Ausbaukosten
        
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            
            var sumHauptnutzflaeche = 0;
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if(mietflaechenangabe.Nutzart === verteilung.nutzungsart)
                {
                    sumHauptnutzflaeche += mietflaechenangabe.Hnfl;
                }
            });
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if(mietflaechenangabe.Nutzart === verteilung.nutzungsart)
                {
                    mietflaechenangabe.GaKosten = (mietflaechenangabe.Hnfl / sumHauptnutzflaeche) * verteilung.grundausbaukosten;
                    mietflaechenangabe.MaKosten = (mietflaechenangabe.Hnfl / sumHauptnutzflaeche) * verteilung.mietausbaukosten;
                }
            });
            
            this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);
        },
        
        onAusbaukostenVerteilenFragmentAbbrechenButtonPress: function(oEvent){
            this._ausbaukostenVerteilenDialog.close();
        },
        
        onDruckenButtonPress: function(oEvent){
                        
            var konditioneneinigung = this.getView().getModel("form").getProperty("/konditioneneinigung");
            var printableHtml = PrinterUtil.generatePrintableHtmlForKonditioneneinigung(konditioneneinigung);

            var printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
            printWindow.document.write(printableHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        },

        onFavoritButtonPress: function(oEvent){
            
            var favorit = this.getView().getModel("form").getProperty("/konditioneneinigung/Favorit");

            if(favorit)
            {
                this.getView().getModel("form").setProperty("/konditioneneinigung/Favorit", false);
                
                MessageBox.information("Die Vermietungsaktivität wurde von den Favoriten entfernt.", {
                    title:"{i18n>HINWEIS}"
                });
            }
            else
            {
                this.getView().getModel("form").setProperty("/konditioneneinigung/Favorit", true);
                
                MessageBox.information("Die Vermietungsaktivität wurde zu den Favoriten hinzugefügt.", {
                    title:"{i18n>HINWEIS}"
                });
            }
        }
        
	});
});