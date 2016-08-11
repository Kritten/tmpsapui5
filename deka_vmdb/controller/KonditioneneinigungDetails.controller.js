sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "ag/bpc/Deka/util/PrinterUtil", "sap/ui/model/Filter"], function (Controller, MessageBox, PrinterUtil, Filter) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungDetails", {

		onInit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onInit");
            var _this = this;

            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            
            // View nach oben Scrollen, da die Scrollposition von vorherigen Anzeigen übernommen wird
            this.getView().addEventDelegate({
                onAfterShow: function(oEvent) {
                    _this.getView().byId("idKonditioneneinigungDetails").scrollTo(0, 0);
                }
            });

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

            var Bukrs = oEvent.getParameter("arguments").Bukrs;
            var KeId = oEvent.getParameter("arguments").KeId;

            this.leseKonditioneneinigungUndInitialisiereModel(Bukrs, KeId);
        },


        onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit");
            var _this = this;

            var WeId = oEvent.getParameter("arguments").WeId;
            var Bukrs = oEvent.getParameter("arguments").Bukrs;

            var oDataModel = sap.ui.getCore().getModel("odata");

            oDataModel.read("/WirtschaftseinheitenSet(Bukrs='" + Bukrs + "',WeId='" + WeId + "')", {

                success: function(oData){
                    console.log(oData);

                    _this.onKonditioneneinigungAnlegen(oEvent);

                    _this.getView().getModel("form").setProperty("/konditioneneinigung/WeId", oData.WeId); 
                    _this.getView().getModel("form").setProperty("/konditioneneinigung/Bukrs", oData.Bukrs); 
                }
            });

        },


        onKonditioneneinigungAnlegenAufBasisEinesMietvertrags: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinesMietvertrags");
            var _this = this;

            var MvId = oEvent.getParameter("arguments").MvId;
            var Bukrs = oEvent.getParameter("arguments").Bukrs;

            var oDataModel = sap.ui.getCore().getModel("odata");

            oDataModel.read("/MietvertragSet(Bukrs='" + Bukrs + "',MvId='" + MvId + "')", {

                urlParameters: {
                    "$expand": "MvToWe"
                },

                success: function(oData){
                    console.log(oData);

                    _this.onKonditioneneinigungAnlegen(oEvent);

                    _this.getView().getModel("form").setProperty("/konditioneneinigung/MvId", MvId); 
                    _this.getView().getModel("form").setProperty("/konditioneneinigung/WeId", oData.MvToWe.WeId); 
                    _this.getView().getModel("form").setProperty("/konditioneneinigung/Bukrs", oData.MvToWe.Bukrs); 
                }
            });
        },

        onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung");

            this.onKonditioneneinigungAnlegen(oEvent);
            var KeId = oEvent.getParameter("arguments").KeId;
            var Bukrs = oEvent.getParameter("arguments").Bukrs;
        },


        leseKonditioneneinigungUndInitialisiereModel: function(Bukrs, KeId){
            var _this = this;
            
            var oDataModel = sap.ui.getCore().getModel("odata");

            oDataModel.read("/KonditioneneinigungSet(Bukrs='"+Bukrs+"',KeId='"+KeId+"')", {

                urlParameters: {
                    "$expand": "KeToOb"
                },

                success: function(oData){
                    console.log(oData);

                    // Struktur aufbereiten für UI5 Binding                    
                    oData.Favorit = (Math.random() > 0.5); // Feld ist zur Zeit noch ein String
                    oData.Editable = (Math.random() > 0.5);

                    oData.KeToOb = oData.KeToOb.results;

                    // Zahlen in Strings umwandeln, weil Input Felder die Eingaben sowieso als String speichern
                    oData.KeToOb.forEach(function(objekt){
                        objekt.HnflAlt = objekt.HnflAlt.toString();
                        objekt.AnMiete = objekt.AnMiete.toString();
                        objekt.GaKosten = objekt.GaKosten.toString();
                        objekt.MaKosten = objekt.MaKosten.toString();

                        // Manuelles zurücksetzen des Confirmation Flag
                        // Wichtig, weil der Mockserver die Werte speichert
                        // Backend würde kein X bei Confirmation liefern
                        objekt.Confirmation = "";
                    });

                    // Zusätzliche Felder
                    oData.mieteGesamt = {vermietungsaktivitaet: null, konditioneneinigung: null};
                    oData.kostenGesamt = {vermietungsaktivitaet: null, konditioneneinigung: null};
                    oData.arbeitsvorrat = null;

                    var form = {
                        modus: "show", // show, new, edit
                        konditioneneinigung: oData
                    };

                    var user = {
                        rolle: "FM" // FM, AM 
                    };
                    
                    var formModel = new sap.ui.model.json.JSONModel(form);
                    var userModel = new sap.ui.model.json.JSONModel(userModel);
                    
                    _this.getView().setModel(userModel, "user");
                    _this.getView().setModel(formModel, "form");
                    
                    _this.enhanceModelWithViewSettings();
                    _this.clearValidationState();
                }
            });

        },

        onKonditioneneinigungAnlegen: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onKonditioneneinigungAnlegen");
            var _this = this;
            
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
                    Bonitaet: "",
                    GueltigkKe: null,

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
            
            this.enhanceModelWithViewSettings();
            this.clearValidationState();
        },

        /**
         * Liest Währungen und Umrechnungskurse aus dem Backend und initialisiert das Popup hinter dem Zahnrad
         */
        enhanceModelWithViewSettings: function(){
            var _this = this;

            var viewsettings = {
                waehrungen: [],
                zeitspannen: [
                    {key: "MONAT", text: "Monatsmiete"},
                    {key: "JAHR", text: "Jahresmiete"}
                ],
                waehrungSelectedKey: "",
                waehrungSelected: null,
                zeitspanneSelectedKey: "",
                zeitspanneSelected: null
            };

            viewsettings.zeitspanneSelectedKey = viewsettings.zeitspannen[0].key;
            viewsettings.zeitspanneSelected = viewsettings.zeitspannen[0];

            // Ausgangswährung ermitteln
            var ausgangsWaehrung = "EUR";
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            if(mietflaechenangaben.length > 0){
                ausgangsWaehrung = mietflaechenangaben[0].Whrung;
            }

            var oDataModel = sap.ui.getCore().getModel("odata");

            oDataModel.read("/WaehrungSet", {

                urlParameters: {
                    "$filter": "Gdat eq datetime'2001-01-01T00:00:00' and Von eq '"+ausgangsWaehrung+"'"
                },

                success: function(oData){
                    console.log(oData);

                    oData.results.forEach(function(waehrung){
                        viewsettings.waehrungen.push( {key: waehrung.Nach, text: waehrung.Nach, umrechungskurs: waehrung.Ukurs} );
                    });

                    if(viewsettings.waehrungen.length > 0){
                        viewsettings.waehrungSelectedKey = viewsettings.waehrungen[0].key;
                        viewsettings.waehrungSelected = viewsettings.waehrungen[0];
                    }

                    _this.getView().getModel("form").setProperty("/viewsettings", viewsettings);
                }

            });
        },

        onPopoverZeitspanneSelect: function(oEvent){

            var item = oEvent.getParameter("selectedItem");
            var zeitspanne = item.getBindingContext("form").getObject();

            this.getView().getModel("form").setProperty("/viewsettings/zeitspanneSelected", zeitspanne);
        },


        onPopoverWaehrungSelect: function(oEvent){

            var item = oEvent.getParameter("selectedItem");
            var waehrung = item.getBindingContext("form").getObject();

            this.getView().getModel("form").setProperty("/viewsettings/waehrungSelected", waehrung);
        },


        onBack : function(oEvent) {
            this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
        },
        

        handleTableSettingsButton: function(oEvent){
            var _this = this;

            // create popover
			if (! this._tableViewSettingsPopover) {
				this._tableViewSettingsPopover = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungDetailsPopover", this);
                this._tableViewSettingsPopover.setModel( this.getView().getModel("form"), "form" );
				this.getView().addDependent(this._tableViewSettingsPopover);
			}

            // Wartet nicht auf vorausgehenden Request
            // Anders zur Zeit nicht möglich, da Popup ansonsten nicht geöffnet wird
            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._tableViewSettingsPopover.openBy(oButton);
            });

        },


        onBearbeitenButtonPress: function(evt){
            jQuery.sap.log.info(".. onBearbeitenButtonPress");
            
            // Alten Zustand sichern für eventuelle Wiederherstellung
            var formData = this.getView().getModel("form").getData();
            this._formDataBackup = jQuery.extend(true, {}, formData);

            this.getView().getModel("form").setProperty("/modus", "edit");
        },


        onSpeichernButtonPress: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onSpeichernButtonPress");
            var _this = this;

            // Eingaben validieren
            // Daten ins Backend schicken
            // Neues Modell auf Basis der Backenddaten anbinden
                      
            var validationSuccess = this.validateForm();
            
            if(validationSuccess)
            {
                this.speichern();
            }
            else
            {
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


        // Create
        konditioneneinigungAnlegen: function(){

        },


        // Update
        konditioneneinigungAktualisieren: function(){
            var _this = this;

            var promises = [];

            // Iteriert über alle Objekte der KE und vergleicht sie mit dem Stand bevor der Benutzer auf "Bearbeiten gedrückt hat".
            // Unterscheidet sich ein Objekt vom alten Zustand wird ein Update ausgeführt.
            var keAlt = this._formDataBackup.konditioneneinigung;
            var keNeu = this.getView().getModel("form").getData().konditioneneinigung;

            for(var i=0; i<keNeu.KeToOb.length; i++)
            {
                var objektVonNeu = keNeu.KeToOb[i];

                for(var j=0; j<keAlt.KeToOb.length; j++)
                {
                    var objektVonAlt = keAlt.KeToOb[j];

                    if(objektVonNeu.MoId === objektVonAlt.MoId)
                    {
                        if( (objektVonNeu.HnflAlt !== objektVonAlt.HnflAlt) || (objektVonNeu.AnMiete !== objektVonAlt.AnMiete) || (objektVonNeu.GaKosten !== objektVonAlt.GaKosten) || (objektVonNeu.MaKosten !== objektVonAlt.MaKosten) )
                        {                            
                            var promise = this.asyncUpdateObjekt(objektVonNeu, i);
                            promises.push(promise);
                        }

                        break;
                    }
                }
            }

            if(promises.length > 0)
            {
                Q.allSettled(promises).then(function(results){
                    jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. Q: allSettled");

                    var objekteMitWarnungen = [];

                    results.forEach(function(result){

                        if(result.state === "rejected"){
                            // result.reason ist das übergebene Objekt von reject()
                            objekteMitWarnungen.push( result.reason );
                        }

                    });

                    // Wenn Objekte nicht direkt gespeichert werden konnten, hat der Benutzer trotzdem die Möglichkeit zu speichern
                    // Das Speichern wird hierbei mit dem Confirmation Flag erneut ausgeführt
                    if(objekteMitWarnungen.length > 0)
                    {
                        MessageBox.show("Objekte sind fehlerhaft. Drücken Sie auf 'OK' um die Konditioneneinigung trotz fehlerhafter Objekte zu speichern.", {
                            title: "Warnung",
                            icon: sap.m.MessageBox.Icon.WARNING,
                            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.ABORT],
                            onClose: function(action){

                                // Warnung wurde ignoriert
                                // Confirmation Flag bei den jeweiligen Objekten setzen
                                if(action === sap.m.MessageBox.Action.OK)
                                {
                                    objekteMitWarnungen.forEach(function(objekt){
                                        _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb/" + objekt.objektIndex + "/Confirmation", "X");
                                    });

                                    _this.speichern();
                                }
                                else
                                {
                                    var Bukrs = _this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs");
                                    var KeId = _this.getView().getModel("form").getProperty("/konditioneneinigung/KeId");

                                    _this.leseKonditioneneinigungUndInitialisiereModel(Bukrs, KeId);
                                    _this.getView().getModel("form").setProperty("/modus", "show");
                                }

                            }
                        });
                    }
                    else
                    {
                        var Bukrs = _this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs");
                        var KeId = _this.getView().getModel("form").getProperty("/konditioneneinigung/KeId");

                        _this.leseKonditioneneinigungUndInitialisiereModel(Bukrs, KeId);
                        _this.getView().getModel("form").setProperty("/modus", "show");
                    }

                }).done();
            }
            else
            {
                // Keine Änderungen getätigt
                _this.getView().getModel("form").setProperty("/modus", "show");
            }
        },


        /**
         * Q Promise Funktion
         * Führt asynchronen UPDATE Request für Konditioneneinigung aus
         * Ergebnis wird als Promise zurückgeliefert
         */
        asyncUpdateKonditioneneinigung: function(konditioneneinigung){

            return Q.Promise(function(resolve, reject, notify) {

            });
        },


        /**
         * Q Promise Funktion
         * Führt asynchronen UPDATE Request für ein Objekt der Konditioneneinigung aus
         * Ergebnis wird als Promise zurückgeliefert
         */
        asyncUpdateObjekt: function(objekt, objektIndex){
            var _this = this;            

            return Q.Promise(function(resolve, reject, notify) {

                var oDataModel = sap.ui.getCore().getModel("odata");
                
                var objektPayload = {
                    Confirmation: objekt.Confirmation,
                    KeId: objekt.KeId,
                    VaId: objekt.VaId,
                    MoId: objekt.MoId,
                    WeId: objekt.WeId,
                    Bukrs: objekt.Bukrs,
                    Switch: objekt.Switch,
                    Aktiv: objekt.Aktiv,
                    NutzartAlt: objekt.NutzartAlt,
                    MonatJahr: objekt.MonatJahr,
                    Nutzart: objekt.Nutzart,
                    Whrung: objekt.Whrung,
                    HnflUnit: objekt.HnflUnit,
                    AnMiete: parseFloat( objekt.AnMiete.replace(',', '.') ),
                    GaKosten: parseFloat( objekt.GaKosten.replace(',', '.') ),
                    Hnfl: objekt.Hnfl,
                    HnflAlt: parseFloat( objekt.HnflAlt.replace(',', '.') ),
                    MaKosten: parseFloat( objekt.MaKosten.replace(',', '.') ),
                    NhMiete: objekt.NhMiete
                };
              
                oDataModel.update("/ObjektSet(KeId='"+objekt.KeId+"',VaId='"+objekt.VaId+"',MoId='"+objekt.MoId+"',WeId='"+objekt.WeId+"',Bukrs='"+objekt.Bukrs+"')", objektPayload, {
                    success: function(){
                        if(objekt.Confirmation === "X"){
                            resolve();
                        }
                        else {
                            // Dummy Logik für Testzwecke
                            // Bei success sollte immer ein resolve erfolgen
                            reject({
                                objekt: objekt,
                                objektIndex: objektIndex
                            });
                        }
                    },
                    error: function(oError){
                        reject({
                            objekt: objekt,
                            objektIndex: objektIndex
                        });
                    }
                });

            });

        },


        /**
         * Führt Aufrufe ans Backend aus um die Konditioneneinigung und dessen Objekte zu speichern.
         */
        speichern: function(){

            var modus = this.getView().getModel("form").getProperty("/modus");   

            switch(modus)
            {
                case "new":
                    this.konditioneneinigungAnlegen();
                break;

                case "edit":
                    this.konditioneneinigungAktualisieren();
                break;

                default:
                break;
            }            
        },


        aenderungsstatusBeiKonditioneneinigungVormerken: function(){

            var keAlt = this._formDataBackup.konditioneneinigung;
            var keNeu = this.getView().getModel("form").getData().konditioneneinigung;           

            var aenderungenVorhanden = false;

            if(keNeu.LzFirstbreak !== keAlt.LzFirstbreak){
                aenderungenVorhanden = true;
            }

            // ... weitere Felder überprüfen


            return aenderungenVorhanden;
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
                
                // TODO: Validierungslogik klären

                if(mietflaechenangabe.AnMiete.match(/^\d+((\.|,)\d\d?)?$/) === null)
                {
                    item.getCells()[6].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[6].setValueStateText("Bitte geben Sie Wert mit maximal zwei Nachkommastellen ein.");
                    validationResult = false;
                }
                else
                {
                    var AnMiete = parseFloat( mietflaechenangabe.AnMiete.replace(",", ".") );
                    if(AnMiete <= 0){
                        item.getCells()[6].setValueState(sap.ui.core.ValueState.Error);
                        item.getCells()[6].setValueStateText("Bitte geben Sie einen Wert größer 0 ein.");
                        validationResult = false;
                    }
                }
                
                if(mietflaechenangabe.GaKosten.match(/^\d+((\.|,)\d\d?)?$/) === null)
                {
                    item.getCells()[7].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[7].setValueStateText("Bitte geben Sie Wert mit maximal zwei Nachkommastellen ein.");
                    validationResult = false;
                }
                else
                {
                    var GaKosten = parseFloat( mietflaechenangabe.GaKosten.replace(",", ".") );
                    if(GaKosten <= 0){
                        item.getCells()[7].setValueState(sap.ui.core.ValueState.Error);
                        item.getCells()[7].setValueStateText("Bitte geben Sie einen Wert größer 0 ein.");
                        validationResult = false;
                    }
                }

                if(mietflaechenangabe.MaKosten.match(/^\d+((\.|,)\d\d?)?$/) === null)
                {
                    item.getCells()[8].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[8].setValueStateText("Bitte geben Sie Wert mit maximal zwei Nachkommastellen ein.");
                    validationResult = false;
                }
                else
                {
                    var MaKosten = parseFloat( mietflaechenangabe.MaKosten.replace(",", ".") );
                    if(MaKosten <= 0){
                        item.getCells()[8].setValueState(sap.ui.core.ValueState.Error);
                        item.getCells()[8].setValueStateText("Bitte geben Sie einen Wert größer 0 ein.");
                        validationResult = false;
                    }
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
                item.getCells()[6].setValueState(sap.ui.core.ValueState.None);
                item.getCells()[7].setValueState(sap.ui.core.ValueState.None);  
                item.getCells()[8].setValueState(sap.ui.core.ValueState.None);  
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
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onAbbrechenButtonPress");
            
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
                
                var Bukrs = this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs");
                var KeId = this.getView().getModel("form").getProperty("/konditioneneinigung/KeId");

                this.leseKonditioneneinigungUndInitialisiereModel(Bukrs, KeId);

                //this.getView().getModel("form").setData(this._formDataBackup);
                //this.getView().getModel("form").setProperty("/modus", "show");
            }
        },


        onMietflaechenAngabenLoeschenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onMietflaechenAngabenLoeschenButtonPress");
            
            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            
            // Objekte der ausgewählten Mietflächenangaben sammeln
            var selectedMietflaechenangaben = [];
            mietflaechenangabenTable.getSelectedItems().forEach(function(selectedItem){
                selectedMietflaechenangaben.push( selectedItem.getBindingContext("form").getObject() );
            });

            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");

			selectedMietflaechenangaben.forEach(function(mietflaechenangabe){
				var i = mietflaechenangaben.length;
				while (i--) {
					if(mietflaechenangaben[i].MoId === mietflaechenangabe.MoId){
						mietflaechenangaben.splice(i, 1);
					}
				}
			});
            
            this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);

            // Selektion aufheben nach dem Löschen
            mietflaechenangabenTable.removeSelections(true);
        },


        onMietflaechenAngabeHinzufuegenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onMietflaechenAngabeHinzufuegenButtonPress");
            var _this = this;
            
            if (! this._mietflaechenSelektionDialog) {
                this._mietflaechenSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.MietflaechenSelektion", this);
                this.getView().addDependent(this._mietflaechenSelektionDialog);
            }

            var oDataModel = sap.ui.getCore().getModel("odata");

            var WeId = _this.getView().getModel("form").getProperty("/konditioneneinigung/WeId"); 
            var Bukrs = _this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs"); 
            var MvId = _this.getView().getModel("form").getProperty("/konditioneneinigung/MvId"); 

            var requestUrl = "";
            var expandValue = "";

            // Objekte (Mietflächen) lesen
            // Request abhängig davon, ob die KE auf einer Wirtschaftseinheit, einem Mietvertrag oder auf einer anderen Konditioneneinigung basiert
            if(MvId !== undefined)
            {
                requestUrl = "/MietvertragSet(Bukrs='"+Bukrs+"',MvId='"+MvId+"')";
                expandValue = "MvToMo";   
            }
            else
            {
                requestUrl = "/WirtschaftseinheitenSet(Bukrs='"+Bukrs+"',WeId='"+WeId+"')";
                expandValue = "WeToMo";        
            }
            
            oDataModel.read(requestUrl, {

                urlParameters: {
                    "$expand": expandValue
                },

                success: function(oData){
                    console.log(oData);

                    var aVorhandeneMoIds = [];
                    var mietflaechenangaben = _this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
                    
                    mietflaechenangaben.forEach(function(mietflaechenangabe){
                        aVorhandeneMoIds.push( mietflaechenangabe.MoId );
                    });

                    var jsonData = {
                        mietflaechen: []
                    };

                    oData[expandValue].results.forEach(function(objekt){

                        // nur Objekte Anzeigen, die noch nicht in der Liste sind
                        if(jQuery.inArray(objekt.MoId, aVorhandeneMoIds) === -1)
                        {
                            jsonData.mietflaechen.push( objekt );
                        }
                    });

                    var jsonModel = new sap.ui.model.json.JSONModel(jsonData);

                    _this._mietflaechenSelektionDialog.setModel(jsonModel);
                    _this._mietflaechenSelektionDialog.open();
                },

                error: function(error){
                    MessageBox.error("Es konnten keine Objekte geladen werden.");
                }
            });

        },
        
        onMietflaechenSelektionDialogConfirm: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onMietflaechenSelektionDialogConfirm");
            
            var selectedItems = oEvent.getParameter("selectedItems");
            
            if(selectedItems.length > 0)
            {
                var wirtschaftseinheitId = selectedItems[0].getBindingContext().getObject().WeId;
                var auswahlValide = true;

                // Prüfen ob alle ausgewählten Objekte zur selben Wirtschaftseinheit gehören
                selectedItems.forEach(function(item){
                    var mietflaechenangabe = item.getBindingContext().getObject();

                    if(mietflaechenangabe.WeId !== wirtschaftseinheitId){
                        auswahlValide = false;
                    }
                });

                if(auswahlValide)
                {
                    var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");

                    selectedItems.forEach(function(item){
                        var mietflaechenangabe = item.getBindingContext().getObject();
                        mietflaechenangaben.push(mietflaechenangabe);
                    });
                    
                    this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);
                }
                else
                {
                    MessageBox.error("Es können nur Mietflächen der selben Wirtschaftseinheit hinzugefügt werden.");
                }
            }
        },
        
        onMietflaechenSelektionDialogSearch: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onMietflaechenSelektionDialogSearch");

			var sValue = oEvent.getParameter("value");

            var combinedOrFilter = new Filter([
                new Filter("MoId", sap.ui.model.FilterOperator.Contains, sValue),
                new Filter("WeId", sap.ui.model.FilterOperator.Contains, sValue)
            ], false);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([combinedOrFilter]);
        },
        
        onAusbaukostenVerteilenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onAusbaukostenVerteilenButtonPress");
            
            if (!this._ausbaukostenVerteilenDialog) {
                this._ausbaukostenVerteilenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.AusbaukostenVerteilen", this);
                this.getView().addDependent(this._ausbaukostenVerteilenDialog);
            }
            
            // über Einträge iterieren und Nutzungsarten sammeln
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            
			if(mietflaechenangaben.length === 0){
                MessageBox.error("Eine Verteilung ohne Mietflächen ist nicht möglich.");
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
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onAusbaukostenVerteilenFragmentAkzeptierenButtonPress");
            
            this._ausbaukostenVerteilenDialog.close();
            
            var dialogModel = this._ausbaukostenVerteilenDialog.getModel();
            
            var verteilung = {
                nutzungsart: dialogModel.getProperty("/nutzungsart"),
                grundausbaukosten: dialogModel.getProperty("/grundausbaukosten"),
                mietausbaukosten: dialogModel.getProperty("/mietausbaukosten")
            }

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