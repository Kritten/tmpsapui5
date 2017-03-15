sap.ui.define([
    "sap/ui/core/mvc/Controller", 
    "sap/m/MessageBox", 
    "ag/bpc/Deka/util/PrinterUtil", 
    "sap/ui/model/Filter",
    "ag/bpc/Deka/util/NavigationPayloadUtil",
    "ag/bpc/Deka/util/DataProvider",
    "ag/bpc/Deka/util/ErrorMessageUtil",
    "ag/bpc/Deka/util/StaticData",
    "ag/bpc/Deka/util/TranslationUtil"], function (Controller, MessageBox, PrinterUtil, Filter, NavigationPayloadUtil, DataProvider, ErrorMessageUtil, StaticData, TranslationUtil) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungDetails", {

		onInit: function(oEvent){
            var _this = this;

            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            
            // View nach oben Scrollen, da die Scrollposition von vorherigen Anzeigen übernommen wird
            this.getView().addEventDelegate({
                onAfterShow: function(oEvent) {
                    _this.getView().byId("idKonditioneneinigungDetails").scrollTo(0, 0);
                }
            });
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("konditioneneinigungDetails").attachPatternMatched(this.onKonditioneneinigungAnzeigen, this);
            oRouter.getRoute("konditioneneinigungAnlegenWe").attachPatternMatched(this.onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit, this);
            oRouter.getRoute("konditioneneinigungAnlegenMv").attachPatternMatched(this.onKonditioneneinigungAnlegenAufBasisEinesMietvertrags, this);
            oRouter.getRoute("konditioneneinigungAnlegenKe").attachPatternMatched(this.onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung, this);
		},
        

        initializeEmptyModel: function(){

            var form = {
                modus: null, // show, new, edit

                konditioneneinigung: null,

                statuswerte: null,
                artkosten: null,
                artertraege: null,

                anmerkungen: null,
                viewsettings: null
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            this.getView().setModel(formModel, "form");
        },

        initializeAnmerkungen: function(anmerkungen){
            this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
        },

        initializeViewsettingsAsync: function(konditioneneinigung){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                var viewsettings = {
                    zeitspannen: StaticData.ZEITSPANNEN
                };

                viewsettings.zeitspanneSelectedKey = viewsettings.zeitspannen[0].key;
                viewsettings.zeitspanneSelected = viewsettings.zeitspannen[0];

                // Ausgangswährung ermitteln - TODO: welche Währung als Ausgangswährung?
                var ausgangsWaehrung = konditioneneinigung.Currency;
                var ausgangsFlaecheneinheit = konditioneneinigung.Unit;

                DataProvider.readExchangeRateSetAsync(ausgangsWaehrung).then(function(waehrungen){

                    viewsettings.waehrungen = waehrungen;

                    if(viewsettings.waehrungen.length > 0){
                        viewsettings.waehrungSelectedKey = viewsettings.waehrungen[0].key;
                        viewsettings.waehrungSelected = viewsettings.waehrungen[0];
                    }

                    return DataProvider.readFlaecheSetAsync(ausgangsFlaecheneinheit);
                })
                .then(function(flaecheneinheiten){

                    viewsettings.flaecheneinheiten = flaecheneinheiten;

                    if(viewsettings.flaecheneinheiten.length > 0){
                        viewsettings.flaecheneinheitSelectedKey = viewsettings.flaecheneinheiten[0].key;
                        viewsettings.flaecheneinheitSelected = viewsettings.flaecheneinheiten[0];
                    }

                    _this.getView().getModel("form").setProperty("/viewsettings", viewsettings);

                    resolve();
                })
                .catch(function(oError){
                    reject(oError);
                })
                .done();

            });

        },

        initializeValidationState: function(){
            this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("laufzeitBis1stBreak").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("mietfreieZeitenInMonaten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("maklerkostenInMonatsmieten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("beratungskostenInMonatsmieten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("mietflaechenangabenErrorBox").setVisible(false);

            // Verteilen Button normal stylen
            this.getView().byId("idButtonAusbaukostenVerteilen").setType(sap.m.ButtonType.Default);          

            var mietflaechenangabenItems = this.getView().byId("mietflaechenangabenTable").getItems();
            
            var cellIndexAnMiete = 7;
            var cellIndexGaKosten = 8;
            var cellIndexMaKosten = 9;

            mietflaechenangabenItems.forEach(function(item){
                item.getCells()[cellIndexAnMiete].setValueState(sap.ui.core.ValueState.None);
                item.getCells()[cellIndexGaKosten].setValueState(sap.ui.core.ValueState.None);  
                item.getCells()[cellIndexMaKosten].setValueState(sap.ui.core.ValueState.None);  
            });   
        },

        onKonditioneneinigungAnzeigen: function(oEvent){
            var KeId = oEvent.getParameter("arguments").KeId;
            var Bukrs = oEvent.getParameter("arguments").Bukrs;
            this.konditioneneinigungAnzeigen(KeId, Bukrs);
        },

        konditioneneinigungAnzeigen: function(KeId, Bukrs){
            var _this = this;

            _this.initializeValidationState();
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "show");

            DataProvider.readKonditioneneinigungAsync(Bukrs, KeId)
            .then(function(konditioneneinigung){
                _this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
                return _this.initializeViewsettingsAsync(konditioneneinigung);
            })
            .then(function(){
                return Q.when(StaticData.NUTZUNGSARTEN);
            })
            .then(function(nutzungsarten){

                var text = {
                    nutzungsart: {}
                };

                _.each(nutzungsarten, function(nutzungsart){
                    text.nutzungsart[nutzungsart.NaId] = nutzungsart.TextSh;
                });

                var textModel = new sap.ui.model.json.JSONModel(text);
                _this.getView().setModel(textModel, "text");

                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'KE';
                }));
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/artertraege", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/artkosten", kostenarten);
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                _this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();
        },

        onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
            var _this = this;

            var payload = NavigationPayloadUtil.takePayload();

            if(!payload){
                this.onBack(null);
                return;
            }

            var WeId = payload.WeId;
            var Bukrs = payload.Bukrs;

            _this.initializeValidationState();
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "new");
            
            DataProvider.readWirtschaftseinheitAsync(Bukrs, WeId)
            .then(function(wirtschaftseinheit){
                
                var konditioneneinigung = _this.newKonditioneneinigung();
                
                _this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/WeId", wirtschaftseinheit.WeId);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Bukrs", wirtschaftseinheit.Bukrs);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToWe", wirtschaftseinheit);

                return _this.initializeViewsettingsAsync(konditioneneinigung);
            })
            .then(function(){
                return Q.when(StaticData.NUTZUNGSARTEN);
            })
            .then(function(nutzungsarten){

                var text = {
                    nutzungsart: {}
                };

                _.each(nutzungsarten, function(nutzungsart){
                    text.nutzungsart[nutzungsart.NaId] = nutzungsart.TextSh;
                });

                var textModel = new sap.ui.model.json.JSONModel(text);
                _this.getView().setModel(textModel, "text");

                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'KE';
                }));
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/artertraege", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/artkosten", kostenarten);
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                _this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

        },

        onKonditioneneinigungAnlegenAufBasisEinesMietvertrags: function(oEvent){
            var _this = this;

            var payload = NavigationPayloadUtil.takePayload();

            if(!payload){
                this.onBack(null);
                return;
            }

            var WeId = payload.WeId;
            var Bukrs = payload.Bukrs;
            var MvId = payload.MvId;

            this.initializeEmptyModel();

            var konditioneneinigung = this.newKonditioneneinigung();
            this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
            this.getView().getModel("form").setProperty("/modus", "new");

            DataProvider.readMietvertragAsync(WeId, Bukrs, MvId)
            .then(function(mietvertrag){

                _this.getView().getModel("form").setProperty("/konditioneneinigung/MvId", mietvertrag.MvId);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/WeId", mietvertrag.MvToWe.WeId); 
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Bukrs", mietvertrag.MvToWe.Bukrs);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietvertrag.MvToMo);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToWe", mietvertrag.MvToWe);
                
                return _this.initializeViewsettingsAsync(konditioneneinigung);
            })
            .then(function(){
                return StaticData.ANMERKUNGEN;
            })
            .then(function(anmerkungen){
                _this.initializeAnmerkungen(anmerkungen);
                _this.initializeValidationState();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

        },

        onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung: function(oEvent){
            var _this = this;

            var payload = NavigationPayloadUtil.takePayload();

            if(!payload){
                this.onBack(null);
                return;
            }

            var KeId = payload.KeId;
            var Bukrs = payload.Bukrs;

            this.initializeEmptyModel();

            var konditioneneinigung = this.newKonditioneneinigung();
            this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
            this.getView().getModel("form").setProperty("/modus", "new");

            DataProvider.readKonditioneneinigungAsync(Bukrs, KeId)
            .then(function(basisKonditioneneinigung){

                _this.getView().getModel("form").setProperty("/konditioneneinigung/WeId", basisKonditioneneinigung.WeId); 
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Bukrs", basisKonditioneneinigung.Bukrs);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToWe", basisKonditioneneinigung.KeToWe);

                return _this.initializeViewsettingsAsync(konditioneneinigung);
            })
            .then(function(){
                return StaticData.ANMERKUNGEN;
            })
            .then(function(anmerkungen){
                _this.initializeAnmerkungen(anmerkungen);
                _this.initializeValidationState();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

        },

        newKonditioneneinigung: function(){

            var then = new Date();
            then.setFullYear(then.getFullYear() + 1 );

            return {
                KeId: "",
                Bukrs: "",
                MfSplit: false,
                AuthUser: "",
                Favorit: false,
                LzFirstbreak: "",
                WeId: "",
                MzMonate: "",
                Status: StaticData.STATUS.KE.KONDITIONENEINIGUNG,
                Anmerkung: StaticData.ANMERKUNG.KE.IN_ERSTELLUNG,
                Aktiv: true,
                Mietbeginn: null,
                Bemerkung: "",
                GnStufe: "",
                BkMonatsmieten: "",
                GnFm: "",
                GnFmDurch: "",
                GnGl: "",
                GnGlDurch: "",
                MkMonate: "",
                Currency: "USD",
                GnAl: "",
                GnAlDurch: "",
                Unit: "M2",
                GnGf: "",
                GnGfDurch: "",
                GueltigkKe: then,

                BkAbsolut: "",
                MkAbsolut: "",
                SonstK: "",
                ArtKosten: "ArtKosten 1",
                SonstE: "",
                ArtErtrag: "ArtErtrag 1",
                Budgetstp: false,
                Steuerschaden: "",
                MwstkErtrag: "",
                Einmalertrag: "",

                KeToOb: [],
                KeToMap: [],
                KeToWe: null,
                
                arbeitsvorrat: null
            };

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

        onPopoverFlaecheneinheitSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var flaecheneinheit = item.getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/viewsettings/flaecheneinheitSelected", flaecheneinheit);
        },

        onBack : function(oEvent) {
            this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
        },
        
        handleTableSettingsButton: function(oEvent){
            var _this = this;

            // create popover
			if (! this._tableViewSettingsPopover) {
				this._tableViewSettingsPopover = sap.ui.xmlfragment("ag.bpc.Deka.view.MietflaechenViewSettingsPopover", this);
				this.getView().addDependent(this._tableViewSettingsPopover);
			}

            this._tableViewSettingsPopover.setModel( this.getView().getModel("form"), "form" );

            // Wartet nicht auf vorausgehenden Request
            // Anders zur Zeit nicht möglich, da Popup ansonsten nicht geöffnet wird
            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._tableViewSettingsPopover.openBy(oButton);
            });

        },

        onBearbeitenButtonPress: function(oEvent){
            // Alten Zustand sichern für eventuelle Wiederherstellung
            var formData = this.getView().getModel("form").getData();
            this._formDataBackup = jQuery.extend(true, {}, formData);

            this.getView().getModel("form").setProperty("/modus", "edit");
        },

        onSpeichernButtonPress: function(oEvent){
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
                    title: TranslationUtil.translate("WARNUNG"), 
                    type: sap.m.DialogType.Message,
                    icon: "sap-icon://message-warning",
                    state: sap.ui.core.ValueState.Warning,
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

        // Create
        konditioneneinigungAnlegen: function(){
            var _this = this;

            this.asyncCreateKonditioneneinigung()
            .then(function(){
                _this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
            })
            .done();
        },


        /**
         * Q Promise Funktion
         * Führt ein CREATE Request für Konditioneneinigung aus
         */
        asyncCreateKonditioneneinigung: function(){
            var _this = this;
            
            var konditioneneinigung = this.getView().getModel("form").getProperty("/konditioneneinigung");

            return Q.Promise(function(resolve, reject, notify) {

                var oDataModel = sap.ui.getCore().getModel("odata");

                // Objekt bereinigen für Payload
                var konditioneneinigungPayload = {
                    //Confirmation: "",
                    //Ersteller: "",
                    //Editable: "",
                    GueltigkKe: konditioneneinigung.GueltigkKe,
                    //BtnFm: "",
                    //MfSplit: "",
                    //BtnAm: "",
                    Favorit: konditioneneinigung.Favorit,
                    LzFirstbreak: konditioneneinigung.LzFirstbreak,
                    MzMonate: konditioneneinigung.MzMonate,
                    WeId: konditioneneinigung.WeId,
                    Bukrs: konditioneneinigung.Bukrs,
                    Status: konditioneneinigung.Status,
                    Anmerkung: konditioneneinigung.Anmerkung,
                    //KeId: "",
                    //Aktiv: "",
                    Mietbeginn: konditioneneinigung.Mietbeginn,
                    Bemerkung: konditioneneinigung.Bemerkung,
                    //GnStufe: "",
                    BkMonatsmieten: konditioneneinigung.BkMonatsmieten,
                    BkAbsolut: konditioneneinigung.BkAbsolut,
                    //GnFm: "",
                    //GnFmDurch: "",
                    //GnGl: "",
                    //GnGlDurch: "",
                    MkMonate: konditioneneinigung.MkMonate,
                    MkAbsolut: konditioneneinigung.MkAbsolut,
                    //Currency: "",
                    //GnAl: "",
                    //GnAlDurch: "",
                    //Unit: "",
                    //GnGf: "",
                    //GnGfDurch: "",
                    KeToWe: konditioneneinigung.KeToWe,
                    KeToOb: konditioneneinigung.KeToOb
                };

                oDataModel.create("/KonditioneneinigungSet", konditioneneinigungPayload, {

					success: function(oData, reponse){
						console.log(oData);
                        resolve();
					},
					error: function(oError){
						console.log(oError);
                        reject();
					}

                });

            });
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
                                        _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb/" + objekt.objektIndex + "/Confirmation", true);
                                    });

                                    _this.speichern();
                                }
                                else
                                {
                                    var Bukrs = _this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs");
                                    var KeId = _this.getView().getModel("form").getProperty("/konditioneneinigung/KeId");

                                    DataProvider.readKonditioneneinigungAsync(Bukrs, KeId)
                                    .then(function(konditioneneinigung){

                                        _this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
                                        _this.getView().getModel("form").setProperty("/modus", "show");

                                        // Promise wird zurückgegeben - Ermöglicht nächsten then Zweig
                                        return _this.initializeViewsettingsAsync(konditioneneinigung);
                                    })
                                    .then(function(){
                                        return StaticData.ANMERKUNGEN;
                                    })
                                    .then(function(anmerkungen){
                                        _this.initializeAnmerkungen(anmerkungen);
                                        _this.initializeValidationState();
                                    })
                                    .catch(function(oError){
                                        console.log(oError);
                                    })
                                    .done();
                                }

                            }
                        });
                    }
                    else
                    {
                        var Bukrs = _this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs");
                        var KeId = _this.getView().getModel("form").getProperty("/konditioneneinigung/KeId");

                        DataProvider.readKonditioneneinigungAsync(Bukrs, KeId)
                        .then(function(konditioneneinigung){

                            _this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
                            _this.getView().getModel("form").setProperty("/modus", "show");

                            // Promise wird zurückgegeben - Ermöglicht nächsten then Zweig
                            return _this.initializeViewsettingsAsync(konditioneneinigung);
                        })
                        .then(function(){
                            return StaticData.ANMERKUNGEN;
                        })
                        .then(function(anmerkungen){
                            _this.initializeAnmerkungen(anmerkungen);
                            _this.initializeValidationState();
                        })
                        .catch(function(oError){
                            console.log(oError);
                        })
                        .done();
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
                        if(objekt.Confirmation){
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
            this.initializeValidationState();
            
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
                
                var cellIndexAnMiete = 7;
                var cellIndexGaKosten = 8;
                var cellIndexMaKosten = 9;

                var mietflaechenangabe = item.getBindingContext("form").getObject();
                
                // TODO: Validierungslogik klären

                if(mietflaechenangabe.AnMiete.match(/^\d+((\.|,)\d\d?)?$/) === null)
                {
                    item.getCells()[cellIndexAnMiete].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[cellIndexAnMiete].setValueStateText("Bitte geben Sie Wert mit maximal zwei Nachkommastellen ein.");
                    validationResult = false;
                }
                else
                {
                    var AnMiete = parseFloat( mietflaechenangabe.AnMiete.replace(",", ".") );
                    if(AnMiete <= 0){
                        item.getCells()[cellIndexAnMiete].setValueState(sap.ui.core.ValueState.Error);
                        item.getCells()[cellIndexAnMiete].setValueStateText("Bitte geben Sie einen Wert größer 0 ein.");
                        validationResult = false;
                    }
                }
                
                if(mietflaechenangabe.GaKosten.match(/^\d+((\.|,)\d\d?)?$/) === null)
                {
                    item.getCells()[cellIndexGaKosten].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[cellIndexGaKosten].setValueStateText("Bitte geben Sie Wert mit maximal zwei Nachkommastellen ein.");
                    validationResult = false;
                }
                else
                {
                    var GaKosten = parseFloat( mietflaechenangabe.GaKosten.replace(",", ".") );
                    if(GaKosten <= 0){
                        item.getCells()[cellIndexGaKosten].setValueState(sap.ui.core.ValueState.Error);
                        item.getCells()[cellIndexGaKosten].setValueStateText("Bitte geben Sie einen Wert größer 0 ein.");
                        validationResult = false;
                    }
                }

                if(mietflaechenangabe.MaKosten.match(/^\d+((\.|,)\d\d?)?$/) === null)
                {
                    item.getCells()[cellIndexMaKosten].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[cellIndexMaKosten].setValueStateText("Bitte geben Sie Wert mit maximal zwei Nachkommastellen ein.");
                    validationResult = false;
                }
                else
                {
                    var MaKosten = parseFloat( mietflaechenangabe.MaKosten.replace(",", ".") );
                    if(MaKosten <= 0){
                        item.getCells()[cellIndexMaKosten].setValueState(sap.ui.core.ValueState.Error);
                        item.getCells()[cellIndexMaKosten].setValueStateText("Bitte geben Sie einen Wert größer 0 ein.");
                        validationResult = false;
                    }
                }
                
            });        
            
            
            return validationResult;
        },

        onLoeschenButtonPress: function(oEvent){
            var _this = this;

            MessageBox.confirm("Wollen Sie die Konditioneneinigung wirklich löschen?", {
                title: TranslationUtil.translate("HINWEIS"),
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function(action){
                    if(action === sap.m.MessageBox.Action.YES){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Anmerkung", "GELÖSCHT");
                    }
                }
            });
        },

        onGueltigkeitVerlaengernButtonPress: function(oEvent){
            var _this = this;

			var dialog = new sap.m.Dialog({
				title: TranslationUtil.translate("HINWEIS"),
				type: sap.m.DialogType.Message,
                icon: "sap-icon://message-information",
				content: [
					new sap.m.Text({
                        text: "Bitte geben Sie das neue Gültigkeitsdatum der Konditioneneinigung an.",
                    }), //.addStyleClass("sapUiSmallMarginBottom")
                    new sap.m.DatePicker('idGueltigkeitsDatumDatePicker', {
                        placeholder: " ",
                        change: function(oEvent) {
							var validDate = oEvent.getParameter('valid');
                            var parent = oEvent.getSource().getParent(); 
							parent.getBeginButton().setEnabled(validDate);
						},
                    })
				],
				beginButton: new sap.m.Button({
                    text: TranslationUtil.translate("AKZEPTIEREN"),
                    enabled: false,
					press: function () {
                        var gueltigkeitsdatum = sap.ui.getCore().byId('idGueltigkeitsDatumDatePicker').getDateValue();
                        
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/GueltigkKe", gueltigkeitsdatum);
						
                        dialog.close();
					}
				}),
				endButton: new sap.m.Button({
                    text: TranslationUtil.translate("ABBRECHEN"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
 
			dialog.open();
        },

        onAbbrechenButtonPress: function(evt){
            var _this = this;

            this.initializeValidationState();
            
            var modus = this.getView().getModel("form").getProperty("/modus");           
            
            if(modus === "new")
            {
                // wenn modus == new
                // -> Änderungen Verwerfen und Navigation zurück
                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                
                MessageBox.confirm("Wollen Sie den Vorgang wirklich abbrechen?", {
                    title: TranslationUtil.translate("HINWEIS"),
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

                DataProvider.readKonditioneneinigungAsync(Bukrs, KeId)
                .then(function(konditioneneinigung){

                    _this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
                    _this.getView().getModel("form").setProperty("/modus", "show");

                    // Promise wird zurückgegeben - Ermöglicht nächsten then Zweig
                    return _this.initializeViewsettingsAsync(konditioneneinigung);
                })
                .then(function(){
                    return StaticData.ANMERKUNGEN;
                })
                .then(function(anmerkungen){
                    _this.initializeAnmerkungen(anmerkungen);
                    _this.initializeValidationState();
                })
                .catch(function(oError){
                    console.log(oError);
                })
                .done();

                //this.getView().getModel("form").setData(this._formDataBackup);
                //this.getView().getModel("form").setProperty("/modus", "show");
            }
        },


        onMietflaechenAngabenLoeschenButtonPress: function(oEvent){
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

            // Verteilen Button rot hervorheben
            this.getView().byId("idButtonAusbaukostenVerteilen").setType(sap.m.ButtonType.Reject);
        },

        onMietflaechenAngabeHinzufuegenButtonPress: function(oEvent){
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
                requestUrl = "/MietvertragSet(Bukrs='"+Bukrs+"',WeId='"+WeId+"',MvId='"+MvId+"')";
                expandValue = "MvToMo";
            }
            else
            {
                requestUrl = "/WirtschaftseinheitenSet(Bukrs='"+Bukrs+"',WeId='"+WeId+"')";
                expandValue = "WeToMo";
            }

            // TODO: Allgemeinere Lösung
            /*
            var promise = (MvId !== undefined) ? 
                DataProvider.readMietvertragSetAsync(Bukrs,MvId) : 
                DataProvider.readWirtschaftseinheitenSetAsync(Bukrs, WeId);
            */
            
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
                            objekt.HnflAlt = objekt.HnflAlt.toString();
                            objekt.AnMiete = objekt.AnMiete.toString();
                            objekt.GaKosten = objekt.GaKosten.toString();
                            objekt.MaKosten = objekt.MaKosten.toString();
                            
                            jsonData.mietflaechen.push(objekt);
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

                    // Verteilen Button rot hervorheben
                    this.getView().byId("idButtonAusbaukostenVerteilen").setType(sap.m.ButtonType.Reject);
                }
                else
                {
                    MessageBox.error("Es können nur Mietflächen der selben Wirtschaftseinheit hinzugefügt werden.");
                }
            }
        },
        
        onMietflaechenSelektionDialogSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");

            var combinedOrFilter = new Filter([
                new Filter("MoId", sap.ui.model.FilterOperator.Contains, sValue),
                new Filter("WeId", sap.ui.model.FilterOperator.Contains, sValue)
            ], false);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([combinedOrFilter]);
        },
        
        onAusbaukostenVerteilenButtonPress: function(oEvent){
            var _this = this;

            if (!this._ausbaukostenVerteilenDialog) {
                this._ausbaukostenVerteilenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.AusbaukostenVerteilen", this);
                this.getView().addDependent(this._ausbaukostenVerteilenDialog);
            }
            
            // über Einträge iterieren und Nutzungsarten sammeln
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            
			if(mietflaechenangaben.length === 0) {
                MessageBox.error("Eine Verteilung ohne Mietflächen ist nicht möglich.");
			} else {
                Q.when(StaticData.NUTZUNGSARTEN).then(function(nutzungsarten){
                    
                    var vorhandeneNutzungsarten = _.filter(nutzungsarten, function(nutzungsart){
                        return _.find(mietflaechenangaben, function(mietflaechenangabe){
                            return nutzungsart.NaId === mietflaechenangabe.Nutzart;
                        });
                    });

                    var dialogModel = new sap.ui.model.json.JSONModel({
                        nutzungsarten: vorhandeneNutzungsarten,
                        nutzungsart: vorhandeneNutzungsarten[0].NaId,
                        grundausbaukosten: 25,
                        mietausbaukosten: 50
                    });
                    
                    _this._ausbaukostenVerteilenDialog.setModel(dialogModel);
                    _this._ausbaukostenVerteilenDialog.open();
                })
                .catch(function(oError){
                    ErrorMessageUtil.showError(oError);
                })
                .done();
            }
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
        
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            
            var sumNutzflaechen = 0;
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if(mietflaechenangabe.Nutzart === verteilung.nutzungsart)
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
                if(mietflaechenangabe.Nutzart === verteilung.nutzungsart)
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
            
            this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);

            // Verteilen Button normal stylen
            this.getView().byId("idButtonAusbaukostenVerteilen").setType(sap.m.ButtonType.Default);
        },
        
        onAusbaukostenVerteilenFragmentAbbrechenButtonPress: function(oEvent){
            this._ausbaukostenVerteilenDialog.close();
        },


        onDruckenButtonPress: function(oEvent){
            var konditioneneinigung = this.getView().getModel("form").getProperty("/konditioneneinigung");
            PrinterUtil.printKonditioneneinigung(konditioneneinigung);
        },

        onFavoritButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");
            var favorit = !ke.Favorit;

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Favorit: favorit
            }).then(function(){

                MessageBox.information(
                    favorit ? TranslationUtil.translate("KE_ZU_FAVORITEN_HINZUGEFUEGT") : TranslationUtil.translate("KE_VON_FAVORITEN_ENTFERNT"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onZurGenehmigungVorlegenButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.ZUR_GEMEHMIGUNG_VORGELEGT
            }).then(function(){
                MessageBox.information(TranslationUtil.translate("KE_ZUR_GENEHMIGUNG_VORGELEGT"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onGenehmigungZurueckziehenButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

			var dialog = new sap.m.Dialog({
				title: TranslationUtil.translate("HINWEIS"),
				type: sap.m.DialogType.Message,
                icon: "sap-icon://message-warning",
                state: sap.ui.core.ValueState.Warning,
				content: [
					new sap.m.Text({
                        text: TranslationUtil.translate("KE_GENEHMIGUNG_ZURUECKZIEHEN_GRUND")
                    }),
					new sap.m.TextArea('idGenehmigungZurueckziehenBegruendungTextArea', {
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter('value');
							var parent = oEvent.getSource().getParent();
							parent.getBeginButton().setEnabled(sText.length > 0);
						},
						width: "100%",
						placeholder: TranslationUtil.translate("BEGRUENDUNG")
					})
				],
				beginButton: new sap.m.Button({
                    text: TranslationUtil.translate("AKZEPTIEREN"),
					enabled: false,
					press: function () {

                        var sText = sap.ui.getCore().byId('idGenehmigungZurueckziehenBegruendungTextArea').getValue();

                        DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                            KeId: ke.KeId, 
                            Bukrs: ke.Bukrs, 
                            Anmerkung: StaticData.ANMERKUNG.KE.AUS_WICHTIGEM_GRUND_ZURUECKGEZOGEN,
                            Bemerkung: sText
                        }).then(function(){
                            dialog.close();

                            MessageBox.information(TranslationUtil.translate("KE_GENEHMIGUNG_ZURUECKGEZOGEN"), {
                                title: TranslationUtil.translate("HINWEIS")
                            });

                            _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
                        })
                        .catch(function(oError){
                            ErrorMessageUtil.showError(oError);
                        })
                        .done();

					}
				}),
				endButton: new sap.m.Button({
                    text: TranslationUtil.translate("ABBRECHEN"),
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
 
			dialog.open();
        },

        onNichtGenehmigenButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.NICHT_GENEHMIGT
            }).then(function(){
                MessageBox.information(TranslationUtil.translate("KE_NICHT_GENEHMIGT"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onReeditButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.REEDIT
            }).then(function(){
                MessageBox.information(TranslationUtil.translate("KE_REEDIT_SUCCESS"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onMappingPressed: function(oEvent){
			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetDetails", {
                VaId: oEvent.getSource().getBindingContext("form").getObject().VaId,
                Bukrs: this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs")
            }, true);
        }

	});
});