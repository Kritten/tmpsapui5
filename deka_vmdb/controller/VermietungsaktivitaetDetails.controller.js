sap.ui.define([
    "sap/ui/core/mvc/Controller", 
    "sap/m/MessageBox", 
    "ag/bpc/Deka/util/PrinterUtil",
    "ag/bpc/Deka/util/NavigationPayloadUtil",
    "ag/bpc/Deka/util/DataProvider"], function (Controller, MessageBox, PrinterUtil, NavigationPayloadUtil, DataProvider) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.VermietungsaktivitaetDetails", {
		
		onInit: function(evt){
            var _this = this;
            
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
			
            // View nach oben Scrollen, da die Scrollposition von vorherigen Anzeigen übernommen wird
            this.getView().addEventDelegate({
                onAfterShow: function(oEvent) {
                    _this.getView().byId("idVermietungsaktivitaetDetails").scrollTo(0, 0);
                }
            });

            // Kompaktere Darstellung aller Elemente
            // evtl. hilfreich für später
			// this.getView().addStyleClass("sapUiSizeCompact");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("vermietungsaktivitaetDetails").attachPatternMatched(this.onVermietungsaktivitaetAnzeigen, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenRV").attachPatternMatched(this.onVermietungsaktivitaetAnlegenRegelvermietung, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenKV").attachPatternMatched(this.onVermietungsaktivitaetAnlegenKleinvermietung, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenEV").attachPatternMatched(this.onVermietungsaktivitaetAnlegenExterneVermietung, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenImport").attachPatternMatched(this.onVermietungsaktivitaetAnlegenExcelImport, this);
		},

        initializeEmptyModel: function(){

            var form = {
                modus: null, // show, new, edit

                vermietungsaktivitaet: null,

                alternativeNutzungsarten: null,
                vermietungsarten: null,
                statuswerte: null,
                anmerkungen: null,
                viewsettings: null
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            this.getView().setModel(formModel, "form");
        },

        initializeAlternativeNutzungsarten: function(){
            
            this.getView().getModel("form").setProperty("/alternativeNutzungsarten", [
                {key: "", text: ""},
                {key: "NutzartAlt 1", text: "NutzartAlt 1"}, // Fixe Werte passend zu Werten vom Mockserver
                {key: "NutzartAlt 2", text: "NutzartAlt 2"},
                {key: "NutzartAlt 3", text: "NutzartAlt 3"}
            ]);
        },

        initializeVermietungsarten: function(){

            this.getView().getModel("form").setProperty("/vermietungsarten", [
                {key: "Neuvermietung", text: "Neuvermietung"},
                {key: "Anschlussvermietung", text: "Anschlussvermietung"},
            ]);
        },

        initializeStatuswerte: function(){

            this.getView().getModel("form").setProperty("/statuswerte", [
                {key: "a", text: "Abgebrochen 0%"},
                {key: "b", text: "Ausbauplanung 50%"},
                {key: "c", text: "Mietvertragsentwurf erstellt - 70%"},
                {key: "d", text: "Mietvertrag abgeschlossen – 100%"}
            ]);
        },

        initializeAnmerkungen: function(){

            var anmerkungen = {
                "a": [
                    {key:"a0", text: "Abgebrochen"}
                ],
                "b": [
                    {key: "b0", text: "Abstimmung der Mieteraus-bauplanung mit dem Mietinteressenten"},
                    {key: "b1", text: "Wirtschaftliche Eckdaten in Verhandlung"},
                    {key: "b2", text: "Mietfläche in Auswahlpool mit Konkurrenzobjekten / Interessent prüft auch Alternativobjekte am Markt"}
                ],
                "c": [
                    {key: "c0", text: "Mietvertragsverhandlungen in Vorbereitung"},
                    {key: "c1", text: "Mietvertragsverhandlungen begonnen"},
                    {key: "c2", text: "Vertragsverhandlungen dauern an"},
                    {key: "c3", text: "Vertragsverhandlungen verzögern sich"},
                    {key: "c4", text: "Genehmigtes MV-Eck liegt vor (Planungswahrschein-lichkeit 90%)"},
                    {key: "c5", text: "Abschlusswahrscheinlichkeit binnen 8 Wochen erwartet (Planungswahrscheinlichkeit 90%)"}
                ],
                "d": [
                    {key: "d0", text: "Mietvertrag noch nicht in SAP erfasst"},
                    {key: "d1", text: "Mietvertrag in SAP erfasst"}
                ]
            };

            var statusKey = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/Status");
            this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen[statusKey]);
        },

        initializeViewsettingsAsync: function(vermietungsaktivitaet){

            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                var viewsettings = {
                    waehrungen: [],
                    zeitspannen: [
                        {key: "MONAT", text: "Monatsmiete"},
                        {key: "JAHR", text: "Jahresmiete"}
                    ],
                    flaecheneinheiten: [
                        {key: "M2", text: "m²"},
                        {key: "a", text: "a"}
                    ],
                    waehrungSelectedKey: "",
                    waehrungSelected: null,
                    zeitspanneSelectedKey: "",
                    zeitspanneSelected: null,
                    flaecheneinheitSelectedKey: "",
                    flaecheneinheitSelected: null
                };

                viewsettings.zeitspanneSelectedKey = viewsettings.zeitspannen[0].key;
                viewsettings.zeitspanneSelected = viewsettings.zeitspannen[0];

                viewsettings.flaecheneinheitSelectedKey = viewsettings.flaecheneinheiten[0].key;
                viewsettings.flaecheneinheitSelected = viewsettings.flaecheneinheiten[0];

                // Ausgangswährung ermitteln - TODO: welche Währung als Ausgangswährung?
                var ausgangsWaehrung = vermietungsaktivitaet.Currency;
                
                var oDataModel = sap.ui.getCore().getModel("odata");

                oDataModel.read("/ExchangeRateSet", {

                    urlParameters: {
                        "$filter": "Von eq '"+ausgangsWaehrung+"'"
                    },

                    success: function(oData){
                        console.log(oData);

                        oData.results.forEach(function(waehrung){
                            viewsettings.waehrungen.push( {key: waehrung.Nach, text: waehrung.Nach, umrechungskurs: waehrung.Multiplikator} );
                        });

                        if(viewsettings.waehrungen.length > 0){
                            viewsettings.waehrungSelectedKey = viewsettings.waehrungen[0].key;
                            viewsettings.waehrungSelected = viewsettings.waehrungen[0];
                        }

                        _this.getView().getModel("form").setProperty("/viewsettings", viewsettings);
                        resolve();
                    },

                    error: function(oError){
                        reject(oError);
                    }

                });

            });

        },

		onVermietungsaktivitaetAnzeigen: function(oEvent){
            var _this = this;

            var Bukrs = oEvent.getParameter("arguments").Bukrs;
            var VaId = oEvent.getParameter("arguments").VaId;

            this.initializeEmptyModel();

            DataProvider.readVermietungsaktivitaetAsync(Bukrs, VaId)
            .then(function(vermietungsaktivitaet){
                
                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);
                _this.getView().getModel("form").setProperty("/modus", "show");

                _this.initializeViewsettingsAsync(vermietungsaktivitaet)
                .then(function(){
                    _this.initializeAlternativeNutzungsarten();
                    _this.initializeVermietungsarten();
                    _this.initializeStatuswerte();
                    _this.initializeAnmerkungen();
                })
                .catch(function(oError){
                    console.log(oError);
                })
                .done();

            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

		},

        onVermietungsaktivitaetAnlegenRegelvermietung: function(oEvent){
            var _this = this;

            var konditioneneinigungenPayload = NavigationPayloadUtil.takePayload();

            if(!konditioneneinigungenPayload){
                this.onBack(null);
                return;
            }

            // Array für Promises der Konditioneneinigung-Requests
            var promises = [];

            // Einzelnen Konditioneneinigungen laden
            konditioneneinigungenPayload.forEach(function(konditioneneinigung){
                promises.push( DataProvider.readKonditioneneinigungAsync(konditioneneinigung.Bukrs, konditioneneinigung.KeId) );
            });

            // Wenn alle Konditioneneinigungen erfolgreich geladen wurden
            Q.all(promises).then(function(konditioneneinigungen){

                _this.initializeEmptyModel();

                var vermietungsaktivitaet = _this.newVermietungsaktivitaet();
                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);
                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet/WeId", konditioneneinigungen[0].WeId);

                // Objekte der Konditioneneinigungen zur Vermietungsaktivität hinzufügen
                var objekteAllerKEs = [];
                konditioneneinigungen.forEach(function(konditioneneinigung){
                    objekteAllerKEs.push.apply(objekteAllerKEs, konditioneneinigung.KeToOb);
                });

                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", objekteAllerKEs);
                _this.getView().getModel("form").setProperty("/modus", "new");

                // neues Promise der async Methode für den nächsten then Block
                return _this.initializeViewsettingsAsync(vermietungsaktivitaet);
            })
            .then(function(){
                _this.initializeAlternativeNutzungsarten();
                _this.initializeVermietungsarten();
                _this.initializeStatuswerte();
                _this.initializeAnmerkungen();
                _this.initializeValidationState();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();
        },

		onVermietungsaktivitaetAnlegenKleinvermietung: function(oEvent){
            var _this = this;

            var wirtschaftseinheit = NavigationPayloadUtil.takePayload();

            if(!wirtschaftseinheit){
                _this.onBack(null);
                return;
            }

            this.initializeEmptyModel();

            var vermietungsaktivitaet = _this.newVermietungsaktivitaet();
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);
            this.getView().getModel("form").setProperty("/modus", "new");

            this.initializeViewsettingsAsync(vermietungsaktivitaet)
            .then(function(){
                _this.initializeAlternativeNutzungsarten();
                _this.initializeVermietungsarten();
                _this.initializeStatuswerte();
                _this.initializeAnmerkungen();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

		},

        onVermietungsaktivitaetAnlegenExterneVermietung: function(oEvent){
            var _this = this;
            
            var wirtschaftseinheit = NavigationPayloadUtil.takePayload();

            if(!wirtschaftseinheit){
                _this.onBack(null);
                return;
            }

            this.initializeEmptyModel();

            var vermietungsaktivitaet = _this.newVermietungsaktivitaet();
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);
            this.getView().getModel("form").setProperty("/modus", "new");

            this.initializeViewsettingsAsync(vermietungsaktivitaet)
            .then(function(){
                _this.initializeAlternativeNutzungsarten();
                _this.initializeVermietungsarten();
                _this.initializeStatuswerte();
                _this.initializeAnmerkungen();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

        },

        onVermietungsaktivitaetAnlegenExcelImport: function(oEvent){
            var _this = this;

            var vermietungsaktivitaet = NavigationPayloadUtil.takePayload();
            vermietungsaktivitaet = _this.newVermietungsaktivitaet();

            if(!vermietungsaktivitaet){
                this.onBack(null);
                return;
            }

            this.initializeEmptyModel();

            this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);
            this.getView().getModel("form").setProperty("/modus", "new");

            this.initializeViewsettingsAsync(vermietungsaktivitaet)
            .then(function(){
                _this.initializeAlternativeNutzungsarten();
                _this.initializeVermietungsarten();
                _this.initializeStatuswerte();
                _this.initializeAnmerkungen();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();
        },

        readKonditioneneinigungSetAsync: function(){

            return Q.Promise(function(resolve, reject, notify) {

                var oDataModel = sap.ui.getCore().getModel("odata");

                oDataModel.read("/KonditioneneinigungSet", {

                    urlParameters:{
                        "$expand": "KeToOb"
                    },

                    success: function(oData){
                        console.log(oData);
                        resolve(oData.results);
                    },

                    error: function(oError){
                        reject(oError);
                    }
                });

            });
        },

        readDebitorenSetAsync: function(){

            return Q.Promise(function(resolve, reject, notify) {

                var oDataModel = sap.ui.getCore().getModel("odata");

                oDataModel.read("/DebitorSet", {

                    success: function(oData){
                        console.log(oData);
                        resolve(oData.results);
                    },

                    error: function(oError){
                        reject(oError);
                    }
                });

            });
        },

        readMietobjektSetAsync: function(Bukrs, WeId){

            return Q.Promise(function(resolve, reject, notify) {

                var oDataModel = sap.ui.getCore().getModel("odata");

                oDataModel.read("/MietobjektSet", {

                    urlParameters: {
                        "$filter": "Bukrs eq '"+Bukrs+"' and WeId eq '"+WeId+"'"
                    },

                    success: function(oData){
                        console.log(oData);
                        resolve(oData.results);
                    },

                    error: function(oError){
                        reject(oError);
                    }
                });

            });

        },

        onStatusSelektionChange: function(){
            this.initializeAnmerkungen();
        },
        
		onBearbeitenButtonPress: function(evt){
            
            // Alten Zustand sichern für eventuelle Wiederherstellung
            var formData = this.getView().getModel("form").getData();
            this._formDataBackup = jQuery.extend(true, {}, formData);

            this.getView().getModel("form").setProperty("/modus", "edit");
        },

        onBack: function(oEvent) {
            this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetSelektion", null, true);
        },

        handleTableSettingsButton: function(oEvent){

            // create popover
			if (! this._tableViewSettingsPopover) {
				this._tableViewSettingsPopover = sap.ui.xmlfragment("ag.bpc.Deka.view.MietflaechenViewSettingsPopover", this);
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

        onPopoverZeitspanneSelect: function(oEvent){

            var item = oEvent.getParameter("selectedItem");
            var zeitspanne = item.getBindingContext("form").getObject();

            this.getView().getModel("form").setProperty("/viewsettings/zeitspanneSelected", zeitspanne);
        },

        onPopoverFlaecheneinheitSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var flaecheneinheit = item.getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/viewsettings/flaecheneinheitSelected", flaecheneinheit);
        },

        onPopoverWaehrungSelect: function(oEvent){

            var item = oEvent.getParameter("selectedItem");
            var waehrung = item.getBindingContext("form").getObject();

            this.getView().getModel("form").setProperty("/viewsettings/waehrungSelected", waehrung);
        },
                
        onSpeichernButtonPress: function(evt){            
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
                        text: "Validierung fehlgeschlagen. Sie können die Vermietungsaktivität zunächst im Arbeitsvorrat speichern oder Ihre Eingaben überprüfen."
                    }),
                    beginButton: new sap.m.Button({
                        text: 'Im Arbeitsvorrat speichern',
                        press: function () {
                            // Backend aufrufen
                            // Im Arbeitsvorrat speichern
                            _this.getView().getModel("form").setProperty("/vermietungsaktivitaet/arbeitsvorrat", true);
                            _this.getView().getModel("form").setProperty("/modus", "show");
                            _this.initializeValidationState();                        
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
            this.initializeValidationState();
            
            if(this.getView().byId("dateMietbeginn").getDateValue() === null)
            {
                this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateMietbeginn").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("dateMietbeginn").getDateValue() < Date.now())
            {
                var modus = this.getView().getModel("form").getProperty("/modus");           
                
                if(modus === "new")
                {
                    this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.Error);
                    this.getView().byId("dateMietbeginn").setValueStateText("Das Datum des Mietbeginns muss in der Zukunft liegen.");
                    validationResult = false;
                }
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
			
			
            if(this.getView().byId("poenale").getValue() === "")
            {
                this.getView().byId("poenale").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("poenale").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if((this.getView().byId("poenale").getValue() < 0) || (this.getView().byId("poenale").getValue() > 100))
            {
                this.getView().byId("poenale").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("poenale").setValueStateText("Bitte geben Sie einen Wert zwischen 0 und 100 ein.");
                validationResult = false;
            }
			
			
            if(this.getView().byId("indexweitergabe").getValue() === "")
            {
                this.getView().byId("indexweitergabe").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("indexweitergabe").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("indexweitergabe").getValue() < 0)
            {
                this.getView().byId("indexweitergabe").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("indexweitergabe").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
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
                
				if(mietflaechenangabe.HnflAlt !== null && mietflaechenangabe.HnflAlt !== "")
				{					
					if(parseInt(mietflaechenangabe.HnflAlt) > (mietflaechenangabe.Hnfl * 1.1)){
						item.getCells()[5].setValueState(sap.ui.core.ValueState.Error);
						item.getCells()[5].setValueStateText("Die alternative Mietfläche darf maximal 10% größer sein als die Hauptnutzfläche.");
						validationResult = false;
					}
				}
				
                if(mietflaechenangabe.AnMiete < 0 || mietflaechenangabe.AnMiete === ""){
                    item.getCells()[8].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[8].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
                if(mietflaechenangabe.GaKosten < 0 || mietflaechenangabe.GaKosten === ""){
                    item.getCells()[9].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[9].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
                if(mietflaechenangabe.MaKosten < 0 || mietflaechenangabe.MaKosten === ""){
                    item.getCells()[10].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[10].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
            });        
            
            return validationResult;
        },
		
		initializeValidationState: function(){
            this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("laufzeitBis1stBreak").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("mietfreieZeitenInMonaten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("maklerkostenInMonatsmieten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("beratungskostenInMonatsmieten").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("poenale").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("indexweitergabe").setValueState(sap.ui.core.ValueState.None);
			
            this.getView().byId("mietflaechenangabenErrorBox").setVisible(false);
			
            var mietflaechenangabenItems = this.getView().byId("mietflaechenangabenTable").getItems();
            
            mietflaechenangabenItems.forEach(function(item){
                item.getCells()[5].setValueState(sap.ui.core.ValueState.None);
                item.getCells()[8].setValueState(sap.ui.core.ValueState.None);  
                item.getCells()[9].setValueState(sap.ui.core.ValueState.None);  
                item.getCells()[10].setValueState(sap.ui.core.ValueState.None);  
            });   
		},
		
        onAbbrechenButtonPress: function(evt){            
            this.initializeValidationState();
            
            var modus = this.getView().getModel("form").getProperty("/modus");           
            
            if(modus === "new")
            {
                // wenn modus == new
                // -> Änderungen Verwerfen und Navigation zurück
                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                
                MessageBox.confirm("Wollen Sie den Vorgang wirklich abbrechen ?", {
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
            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            
            // Objekte der ausgewählten Mietflächenangaben sammeln
            var selectedMietflaechenangaben = [];
            mietflaechenangabenTable.getSelectedItems().forEach(function(selectedItem){
                selectedMietflaechenangaben.push( selectedItem.getBindingContext("form").getObject() );
            });

            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");

			selectedMietflaechenangaben.forEach(function(mietflaechenangabe){
				var i = mietflaechenangaben.length;
				while (i--) {
					if(mietflaechenangaben[i].MoId === mietflaechenangabe.MoId){
						mietflaechenangaben.splice(i, 1);
					}
				}
			});
            
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", mietflaechenangaben);

            // Selektion aufheben nach dem Löschen
            mietflaechenangabenTable.removeSelections(true);
        },
		
        onMietflaechenAngabeHinzufuegenButtonPress: function(oEvent){
            var _this = this;
			
            if (! this._mietflaechenSelektionDialog) {
                this._mietflaechenSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.MietflaechenSelektion", this);
            }

            var WeId = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/WeId"); 
            var Bukrs = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/Bukrs");

            this.readMietobjektSetAsync(WeId, Bukrs)
            .then(function(mietobjekte){

                var mietflaechenangaben = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
                var vorhandeneMoIds = _.map(mietflaechenangaben, function(mietflaechenangaben){
                    return mietflaechenangaben.MoId;
                });

                var wirtschaftseinheitId = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/WeId");

                var jsonData = {
                    mietflaechen: []
                };

                jsonData.mietflaechen = _.filter(mietobjekte, function(mietobjekt){
                    return (_.indexOf(vorhandeneMoIds, mietobjekt.MoId) === -1) && (mietobjekt.WeId === wirtschaftseinheitId);
                });

                var jsonModel = new sap.ui.model.json.JSONModel(jsonData);

                _this._mietflaechenSelektionDialog.setModel(jsonModel);
                _this._mietflaechenSelektionDialog.open();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

            /*
            var oDataModel = sap.ui.getCore().getModel("odata");

            oDataModel.read("/MietobjektSet", {

                urlParameters: {
                    "$filter": "Bukrs eq '"+Bukrs+"' and WeId eq '"+WeId+"'"
                },

                success: function(oData){
                    console.log(oData);

                    var aVorhandeneMoIds = [];
                    var mietflaechenangaben = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
                    
                    mietflaechenangaben.forEach(function(mietflaechenangabe){
                        aVorhandeneMoIds.push( mietflaechenangabe.MoId );
                    });

                    var wirtschaftseinheitId = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/WeId");

                    var jsonData = {
                        mietflaechen: []
                    };

                    oData.results.forEach(function(objekt){

                        // nur Objekte Anzeigen, die noch nicht in der Liste sind
                        if(jQuery.inArray(objekt.MoId, aVorhandeneMoIds) === -1)
                        {
                            // nur Mietflächen der selben Wirtschaftseinheit anzeigen
                            if(objekt.WeId === wirtschaftseinheitId)
                            {
                                jsonData.mietflaechen.push( objekt );
                            }
                        }

                    });

                    var jsonModel = new sap.ui.model.json.JSONModel(jsonData);

                    _this._mietflaechenSelektionDialog.setModel(jsonModel);
                    _this._mietflaechenSelektionDialog.open();
                }
            });
            */
        },
		
        onMietflaechenSelektionDialogConfirm: function(oEvent){            
            var selectedItems = oEvent.getParameter("selectedItems");        

            if(selectedItems.length > 0)
            {
                var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");

                selectedItems.forEach(function(item){
                    var mietflaechenangabe = item.getBindingContext().getObject();
                    mietflaechenangaben.push(mietflaechenangabe);
                });
                
                this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", mietflaechenangaben);
            }
        },
        
        onMietflaechenSelektionDialogSearch: function(oEvent){
        },

        onKonditioneneinigungHinzufuegenButtonPress: function(oEvent){
            var _this = this;

            if (!this._konditioneneinigungHinzufuegenDialog) {
                this._konditioneneinigungHinzufuegenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetDetailsKonditioneneinigungDialog", this);
                this.getView().addDependent(this._konditioneneinigungHinzufuegenDialog);
            }

            this.readKonditioneneinigungSetAsync()
            .then(function(konditioneneinigungen){

                var mietflaechenangaben = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
                var vorhandeneMoIds = _.map(mietflaechenangaben, function(mietflaechenangaben){
                    return mietflaechenangaben.MoId;
                });

                var jsonData = {
                    konditioneneinigungen: []
                };

                var wirtschaftseinheitId = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/WeId");

                // Nur Konditioneneinigungen der selben Wirtschaftseinheit betrachten
                konditioneneinigungen = _.filter(konditioneneinigungen, function(konditioneneinigung){
                    return (konditioneneinigung.WeId === wirtschaftseinheitId);
                });

                konditioneneinigungen.forEach(function(konditioneneinigung){

                    var mietflaechenDerKonditioneneinigungBereitsVollstaendigVorhanden = true;

                    // Prüfen ob die Konditioneneinigung Mietflächen enthält, die noch nicht in der Liste sind
                    konditioneneinigung.KeToOb.results.forEach(function(objekt){
                        if(jQuery.inArray(objekt.MoId, vorhandeneMoIds) === -1){
                            mietflaechenDerKonditioneneinigungBereitsVollstaendigVorhanden = false;
                        }
                    });

                    // Konditioneneinigung nur dann anzeigen, wenn sie Mietflächen enthält, die noch nicht in der Liste sind
                    if(!mietflaechenDerKonditioneneinigungBereitsVollstaendigVorhanden){
                        jsonData.konditioneneinigungen.push( konditioneneinigung );
                    }
                    
                });

                var jsonModel = new sap.ui.model.json.JSONModel(jsonData);

                _this._konditioneneinigungHinzufuegenDialog.setModel(jsonModel);
                _this._konditioneneinigungHinzufuegenDialog.open();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

        },

        onKonditioneneinigungLoeschenButtonPress: function(oEvent){            
            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            
            // IDs der KEs der ausgewählten Mietflächen sammeln (einzigartige)
            var selectedItems = mietflaechenangabenTable.getSelectedItems();
            var konditioneneinigungenIds = _.unique(_.map(selectedItems, function(item){
                return item.getBindingContext("form").getObject().KeId;
            }));

            // Alle Mietflächen löschen, deren KEs ausgewählt wurde
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");

            mietflaechenangaben = _.filter(mietflaechenangaben, function(mietflaechenangabe){
                return (_.indexOf(konditioneneinigungenIds, mietflaechenangabe.KeId) === -1);
            });

            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", mietflaechenangaben);

            // Selektion aufheben nach dem Löschen
            mietflaechenangabenTable.removeSelections(true);
        },

        onKonditioneneinigungDialogSearch: function(oEvent){
        },

        onKonditioneneinigungDialogConfirm: function(oEvent){
            var selectedItems = oEvent.getParameter("selectedItems");

            if(selectedItems.length > 0)
            {
                var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
                var aVorhandeneMoIds = [];
                
                mietflaechenangaben.forEach(function(mietflaechenangabe){
                    aVorhandeneMoIds.push( mietflaechenangabe.MoId );
                });

                selectedItems.forEach(function(item){

                    var konditioneneinigung = item.getBindingContext().getObject();

                    konditioneneinigung.KeToOb.forEach(function(mietflaechenangabe){
                        
                        // Nur die Mietflächen hinzufügen, die noch nicht vorhanden sind
                        if(_.indexOf(aVorhandeneMoIds, mietflaechenangabe.MoId) === -1){
                            mietflaechenangaben.push( mietflaechenangabe );
                        }

                    });
                });
                
                this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", mietflaechenangaben);
            }

        },
		
        onAusbaukostenVerteilenButtonPress: function(oEvent){            
            if (!this._ausbaukostenVerteilenDialog) {
                this._ausbaukostenVerteilenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.AusbaukostenVerteilen", this);
                this.getView().addDependent(this._ausbaukostenVerteilenDialog);
            }
            
            // über Einträge iterieren und Nutzungsarten sammeln
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
            
			if(mietflaechenangaben.length === 0){
                // TODO: Fehlermeldung
				return;
			}
			
            var vorhandeneNutzungsarten = {};
            
            mietflaechenangaben.forEach(function(mietflaechenangabe){
                // key - value .. in dem Fall beides gleich
				
				if(mietflaechenangabe.NutzartAlt !== ""){
					vorhandeneNutzungsarten[mietflaechenangabe.NutzartAlt] = {key: mietflaechenangabe.NutzartAlt, text: mietflaechenangabe.NutzartAlt};
				}
				else{
					vorhandeneNutzungsarten[mietflaechenangabe.Nutzart] = {key: mietflaechenangabe.Nutzart, text: mietflaechenangabe.Nutzart};
				}
				
            });
            
            // Object-Properties to Array
            vorhandeneNutzungsarten = Object.keys(vorhandeneNutzungsarten).map(function (key) {
                return vorhandeneNutzungsarten[key];
            });
            
            var dialogModel = new sap.ui.model.json.JSONModel({
                nutzungsarten: vorhandeneNutzungsarten,
                nutzungsart: vorhandeneNutzungsarten[0].key, // Vorbelegung auf gültigen Wert notwendig - sonst Buggy
                grundausbaukosten: 100,
                mietausbaukosten: 100
            });
			
            this._ausbaukostenVerteilenDialog.setModel(dialogModel);
 
			this._ausbaukostenVerteilenDialog.open();
        },
		
        onAusbaukostenVerteilenFragmentAkzeptierenButtonPress: function(oEvent){            
            this._ausbaukostenVerteilenDialog.close();
            
            var dialogModel = this._ausbaukostenVerteilenDialog.getModel();
            
            var verteilung = {
                nutzungsart: dialogModel.getProperty("/nutzungsart"),
                grundausbaukosten: parseFloat(dialogModel.getProperty("/grundausbaukosten")),
                mietausbaukosten: parseFloat(dialogModel.getProperty("/mietausbaukosten"))
            };

            // Logik zur Verteilung der Ausbaukosten
        
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
            
            var sumNutzflaechen = 0;
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if((mietflaechenangabe.NutzartAlt === verteilung.nutzungsart) || (mietflaechenangabe.Nutzart === verteilung.nutzungsart))
                {				
					if(mietflaechenangabe.HnflAlt === null || mietflaechenangabe.HnflAlt === "")
					{
						sumNutzflaechen += parseFloat(mietflaechenangabe.Hnfl);
					}
					else
					{
						sumNutzflaechen += parseFloat(mietflaechenangabe.HnflAlt);
					}
                }
            });
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if((mietflaechenangabe.NutzartAlt === verteilung.nutzungsart) || (mietflaechenangabe.Nutzart === verteilung.nutzungsart))
                {
					if(mietflaechenangabe.HnflAlt === null || mietflaechenangabe.HnflAlt === "")
					{
						mietflaechenangabe.GaKosten = (parseFloat(mietflaechenangabe.Hnfl) / sumNutzflaechen) * verteilung.grundausbaukosten;
						mietflaechenangabe.MaKosten = (parseFloat(mietflaechenangabe.Hnfl) / sumNutzflaechen) * verteilung.mietausbaukosten;
					}
					else
					{
						mietflaechenangabe.GaKosten = (parseFloat(mietflaechenangabe.HnflAlt) / sumNutzflaechen) * verteilung.grundausbaukosten;
						mietflaechenangabe.MaKosten = (parseFloat(mietflaechenangabe.HnflAlt) / sumNutzflaechen) * verteilung.mietausbaukosten;
					}
                }
            });
            
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", mietflaechenangaben);
        },
		
		onAusbaukostenVerteilenFragmentAbbrechenButtonPress: function(oEvent){
            this._ausbaukostenVerteilenDialog.close();
        },
        
        onDruckenButtonPress: function(oEvent){
                        
            var vermietungsaktivitaet = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");
            var printableHtml = PrinterUtil.generatePrintableHtmlForVermietungsaktivitaet(vermietungsaktivitaet);

            var printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
            printWindow.document.write(printableHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        },
        
        onFavoritButtonPress: function(oEvent){
            
            var favorit = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/Favorit");

            if(favorit)
            {
                this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Favorit", false);
                
                MessageBox.information("Die Vermietungsaktivität wurde von den Favoriten entfernt.", {
                    title:"{i18n>HINWEIS}"
                });
            }
            else
            {
                this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Favorit", true);
                
                MessageBox.information("Die Vermietungsaktivität wurde zu den Favoriten hinzugefügt.", {
                    title:"{i18n>HINWEIS}"
                });
            }
        },
        
        onDebitorAuswahlButtonPress: function(oEvent){
            var _this = this;

            if (! this._debitorSelektionDialog) {
                this._debitorSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.DebitorSelektion", this);
            }

            this.readDebitorenSetAsync()
            .then(function(debitoren){

                var debitorSelektionDialogModel = new sap.ui.model.json.JSONModel({
                    debitoren: debitoren
                });
                
                _this._debitorSelektionDialog.setModel(debitorSelektionDialogModel);
                _this._debitorSelektionDialog.open();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

        },
        
        onDebitorSelektionConfirm: function(oEvent){
			var debitor = oEvent.getParameter("selectedItem").getBindingContext().getObject();
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Debitorname", debitor.Name);
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Debitor", debitor.KdNr);
        },
        
        newVermietungsaktivitaet: function(){

            return {
                Bukrs: "",
                LzFirstbreak: "",
                Debitorname: "",
                MzMonate: "",
                IdxWeitergabe: "",
                VaId: "",
                WeId: "",
                Status: "a",
                Anmerkung: "",
                Mietbeginn: null,
                Bemerkung: "",
                Vermietungsart: "",
                Aktiv: false,
                Debitor: "",
                PLRelevant: false,
                BkMonate: "",
                MkMonate: "",
                Poenale: "",
                Currency: "",
                Unit: "",
                AuthUser: "",
                Favorit: false,

                MzErsterMonat: null,
                MzAnzahlJ: "",
                AkErsterMonat: null,
                AkAnzahlM: "",
                VerteilungAusbaukostenAnzahlMonate: "",

                BkAbsolut: "",
                MkAbsolut: "",
                SonstK: "",
                ArtKosten: "00",
                SonstE: "",
                ArtErtrag: "00",

                Budgetstp: false,

                VaToOb: [],
                VaToMap: [],
                VaToWe: null,

                // keine OData Felder
                mieteGesamt: {vermietungsaktivitaet: "", konditioneneinigung: "", differenz: ""},
                kostenGesamt: {vermietungsaktivitaet: "", konditioneneinigung: "", differenz: ""},
                arbeitsvorrat: false
            };

        },

        onMappingPressed: function(oEvent){
			this.getOwnerComponent().getRouter().navTo("konditioneneinigungDetails", {
                KeId: oEvent.getSource().getBindingContext("form").getObject().KeId,
                Bukrs: this.getView().getModel("form").getProperty("/vermietungsaktivitaet/Bukrs")
            }, true);
        }


	});
});