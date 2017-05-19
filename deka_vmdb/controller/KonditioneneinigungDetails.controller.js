/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:39:31 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:39:31 
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller", 
    "sap/m/MessageBox", 
    "ag/bpc/Deka/util/PrinterUtil", 
    "sap/ui/model/Filter",
    "ag/bpc/Deka/util/NavigationPayloadUtil",
    "ag/bpc/Deka/util/DataProvider",
    "ag/bpc/Deka/util/ErrorMessageUtil",
    "ag/bpc/Deka/util/StaticData",
    "ag/bpc/Deka/util/TranslationUtil",
    "ag/bpc/Deka/model/CustomNumberType"], function (Controller, MessageBox, PrinterUtil, Filter, NavigationPayloadUtil, DataProvider, ErrorMessageUtil, StaticData, TranslationUtil) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungDetails", {        
		onInit: function(oEvent){
            var _this = this;

            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            this.getView().setModel(sap.ui.getCore().getModel("text"), "text");
            
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
                kostenarten: null,
                ertragsarten: null,

                anmerkungen: null,
                viewsettings: null
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            this.getView().setModel(formModel, "form");
        },

        initializeViewsettingsAsync: function(konditioneneinigung){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                var viewsettings = {};

                var ausgangsZeitspanneKey = konditioneneinigung.MonatJahr;
                var ausgangsWaehrungKey = konditioneneinigung.Currency;
                var ausgangsFlaecheneinheitKey = konditioneneinigung.Unit;

                Q.when(StaticData.ZEITSPANNEN)
                .then(function(zeitspannen){

                    viewsettings.zeitspannen = zeitspannen;

                    if(viewsettings.zeitspannen.length > 0){
                        var ausgangsZeitspanne = _.find(viewsettings.zeitspannen, function(zeitspanne){
                            return zeitspanne.Id === ausgangsZeitspanneKey;
                        });

                        if(!ausgangsZeitspanne){
                            ausgangsZeitspanne = viewsettings.zeitspannen[0];
                        }

                        viewsettings.zeitspanneSelected = ausgangsZeitspanne;
                    }

                    return DataProvider.readExchangeRateSetAsync(ausgangsWaehrungKey);
                })
                .then(function(waehrungen){

                    viewsettings.waehrungen = waehrungen;

                    if(viewsettings.waehrungen.length > 0){
                        var ausgangsWaehrung = _.find(viewsettings.waehrungen, function(waehrung){
                            return waehrung.Nach === ausgangsWaehrungKey;
                        });

                        if(!ausgangsWaehrung){
                            ausgangsWaehrung = viewsettings.waehrungen[0];
                        }

                        viewsettings.waehrungSelected = ausgangsWaehrung;
                    }

                    return DataProvider.readFlaecheSetAsync(ausgangsFlaecheneinheitKey);
                })
                .then(function(flaecheneinheiten){

                    viewsettings.flaecheneinheiten = flaecheneinheiten;

                    if(viewsettings.flaecheneinheiten.length > 0){
                        var ausgangsFlaecheneinheit = _.find(viewsettings.flaecheneinheiten, function(flaecheneinheit){
                            return flaecheneinheit.Nach === ausgangsFlaecheneinheitKey;
                        });

                        if(!ausgangsFlaecheneinheit){
                            ausgangsFlaecheneinheit = viewsettings.flaecheneinheiten[0];
                        }

                        viewsettings.flaecheneinheitSelected = ausgangsFlaecheneinheit;
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
            this.getView().byId("idGueltigkKe").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMietbeginn").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idLzFirstbreak").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMzMonate").setValueState(sap.ui.core.ValueState.None);
            var mkMonate = this.getView().byId("maklerkostenInMonatsmieten");
            mkMonate.setValueState(sap.ui.core.ValueState.None);

            var mkAbsolut = this.getView().byId("maklerkostenAbsolut");
            mkAbsolut.setValueState(sap.ui.core.ValueState.None);

            var bkMonate = this.getView().byId("beratungskostenInMonatsmieten");
            bkMonate.setValueState(sap.ui.core.ValueState.None);

            var bkAbsolut = this.getView().byId("beratungskostenAbsolut");
            bkAbsolut.setValueState(sap.ui.core.ValueState.None);

            var sonstK = this.getView().byId("idSonstK");
            sonstK.setValueState(sap.ui.core.ValueState.None);

            var sonstE = this.getView().byId("idSonstE");
            sonstE.setValueState(sap.ui.core.ValueState.None);

            var steuerschaden = this.getView().byId("idSteuerschaden");
            steuerschaden.setValueState(sap.ui.core.ValueState.None);

            var mwstkErtrag = this.getView().byId("idMwstkErtrag");
            mwstkErtrag.setValueState(sap.ui.core.ValueState.None);

            var einmalertrag = this.getView().byId("einmalertrag");
            einmalertrag.setValueState(sap.ui.core.ValueState.None);


            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            _.map(mietflaechenangabenTable.getItems(), function(item){
                var cells = item.getCells();
                var anMieteCell = cells[7];

                anMieteCell.setValueState(sap.ui.core.ValueState.None);  
                cells[8].setValueState(sap.ui.core.ValueState.None);  
                cells[9].setValueState(sap.ui.core.ValueState.None);  
                cells[6].setValueState(sap.ui.core.ValueState.None);  
                cells[4].setValueState(sap.ui.core.ValueState.None);      
            });

            this.getView().byId("idMietflaechenangabenErrorBox").setVisible(false);

            // Verteilen Button normal stylen
            this.getView().byId("idButtonAusbaukostenVerteilen").setType(sap.m.ButtonType.Default);          
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
               // DataProvider.deleteSperreAsync(KeId, '');
               console.log("DeleteSperre");
                return _this.initializeViewsettingsAsync(konditioneneinigung);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'KE';
                }));
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                _this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
            var _this = this;

            var payload = NavigationPayloadUtil.takePayload();

            if(!payload){
                _this.onBack(null);
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
                _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToWe", wirtschaftseinheit);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/WeId", wirtschaftseinheit.WeId);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Bukrs", wirtschaftseinheit.Bukrs);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Currency", wirtschaftseinheit.Currency);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Unit", wirtschaftseinheit.Unit);
                
                return _this.initializeViewsettingsAsync(konditioneneinigung);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'KE';
                }));
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                _this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();

        },

        onKonditioneneinigungAnlegenAufBasisEinesMietvertrags: function(oEvent){
            var _this = this;

            var payload = NavigationPayloadUtil.takePayload();

            if(!payload){
                _this.onBack(null);
                return;
            }

            var WeId = payload.WeId;
            var Bukrs = payload.Bukrs;
            var MvId = payload.MvId;

            _this.initializeValidationState();
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "new");
           
            DataProvider.readMietvertragAsync(WeId, Bukrs, MvId)
            .then(function(mietvertrag){

                var konditioneneinigung = _this.newKonditioneneinigung();
                _this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/MvId", mietvertrag.MvId);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", _.map(mietvertrag.MvToMo, function(mietobjekt){

                    // Mietobjekt in Objekt umformen
                    var objekt = {
                        WeId: mietobjekt.WeId,
                        MoId: mietobjekt.MoId,
                        Bukrs: mietobjekt.Bukrs,
                        Bezei: mietobjekt.Bezei,
                        Nutzart: mietobjekt.Nutzart,
                        Hnfl: mietobjekt.Hnfl,
                        HnflAlt: mietobjekt.HnflAlt,
                        HnflUnit: mietobjekt.HnflUnit,
                        NhMiete: mietobjekt.NhMiete,
                        AnMiete: mietobjekt.AnMiete,
                        GaKosten: mietobjekt.GaKosten,
                        MaKosten: mietobjekt.MaKosten,
                        Whrung: mietobjekt.Whrung,

                        MfSplit: false,
                        KeId: konditioneneinigung.KeId,
                        MonatJahr: konditioneneinigung.MonatJahr
                    };

                    return objekt;
                }));
                
                _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToWe", mietvertrag.MvToWe);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/WeId", mietvertrag.MvToWe.WeId); 
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Bukrs", mietvertrag.MvToWe.Bukrs);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Currency", mietvertrag.MvToWe.Currency);
                _this.getView().getModel("form").setProperty("/konditioneneinigung/Unit", mietvertrag.MvToWe.Unit);

                return _this.initializeViewsettingsAsync(konditioneneinigung);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'KE';
                }));
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                _this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();

        },

        onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung: function(oEvent){
            var _this = this;

            var payload = NavigationPayloadUtil.takePayload();

            if(!payload){
                _this.onBack(null);
                return;
            }

            var KeId = payload.KeId;
            var Bukrs = payload.Bukrs;

            _this.initializeValidationState();
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "new");

            DataProvider.readKonditioneneinigungAsync(Bukrs, KeId)
            .then(function(basisKe){

                var ke = _this.newKonditioneneinigung();

                ke.WeId = basisKe.WeId;
                ke.Bukrs = basisKe.Bukrs;

                ke.GueltigkKe = basisKe.GueltigkKe;
                ke.Mietbeginn = basisKe.Mietbeginn;
                ke.LzFirstbreak = basisKe.LzFirstbreak;
                ke.MzMonate = basisKe.MzMonate;
                
                ke.MkMonate = basisKe.MkMonate;
                ke.MkAbsolut = basisKe.MkAbsolut;

                ke.BkMonatsmieten = basisKe.BkMonatsmieten;
                ke.BkAbsolut = basisKe.BkAbsolut;

                ke.ArtKosten = basisKe.ArtKosten;
                ke.SonstK = basisKe.SonstK;

                ke.ArtErtrag = basisKe.ArtErtrag;
                ke.SonstE = basisKe.SonstE;

                ke.Steuerschaden = basisKe.Steuerschaden;
                ke.MwstkErtrag = basisKe.MwstkErtrag;
                ke.Einmalertrag = basisKe.Einmalertrag;

                ke.KeToWe = basisKe.KeToWe;
                ke.KeToOb = _.map(basisKe.KeToOb, function(objekt){
                    delete objekt.__metadata;
                    objekt.KeId = "";
                    return objekt;
                });

                ke.Currency = basisKe.Currency;
                ke.Unit = basisKe.Unit;
                ke.MonatJahr = basisKe.MonatJahr;

                ke.Confirmation = false;

                _this.getView().getModel("form").setProperty("/konditioneneinigung", ke);
                
                return _this.initializeViewsettingsAsync(ke);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'KE';
                }));
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                _this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();

        },

        newKonditioneneinigung: function(){

            var then = new Date();
            then.setFullYear(then.getFullYear() + 1 );

            return {
                KeId: "",
                Bukrs: "",
                WeId: "",
                
                GueltigkKe: then,
                Mietbeginn: null,
                LzFirstbreak: "",
                MzMonate: "",
                
                MkMonate: "",
                MkAbsolut: "",

                BkMonatsmieten: "",
                BkAbsolut: "",

                ArtKosten: "01",
                SonstK: "",

                ArtErtrag: "01",
                SonstE: "",

                Steuerschaden: "",
                MwstkErtrag: "",
                Einmalertrag: "",


                Status: StaticData.STATUS.KE.KONDITIONENEINIGUNG,
                Anmerkung: StaticData.ANMERKUNG.KE.IN_ERSTELLUNG,
                Bemerkung: "",
                Budgetstp: false,

                MonatJahr: "M",
                Currency: "",
                Unit: "",

                KeToOb: [],
                KeToMap: [],
                KeToWe: null
            };

        },

        onPopoverZeitspanneSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var zeitspanne = item.getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/viewsettings/zeitspanneSelected", zeitspanne);

            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");
            var KeToOb = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            _.map(KeToOb, function(object){
                if(zeitspanne.Id === "J"){
                    object.AnMiete = object.AnMiete / 12;
                }
                if(zeitspanne.Id === "M"){
                    object.AnMiete = object.AnMiete * 12;
                }
            });

            this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", KeToOb);
        },

        onPopoverWaehrungSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var waehrung = item.getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/viewsettings/waehrungSelected", waehrung);

            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");
            var KeToOb = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");

            _.map(KeToOb, function(object){
                var neueMiete = Math.round(object.NhMiete * waehrung.Multiplikator * 100) / 100;
                object.NhMiete = neueMiete;
                object.Whrung = waehrung.Nach;
            });
        },

        onPopoverFlaecheneinheitSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var flaecheneinheit = item.getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/viewsettings/flaecheneinheitSelected", flaecheneinheit);

            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");
            var KeToOb = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            _.map(KeToOb, function(object){
                var neueFlaeche = (Math.round(object.Hnfl * flaecheneinheit.Multiplikator * 100) / 100);
                object.Hnfl = neueFlaeche;
                object.HnflUnit = flaecheneinheit.Nach;
            });

        },

        onBack: function(oEvent) {
            var modus = this.getView().getModel("form").getProperty("/modus"); 
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

            if(modus === "edit") {
                DataProvider.deleteSperreAsync(ke.KeId, '');
            }

            this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
        },
        
        handleTableSettingsButton: function(oEvent){
            var _this = this;

            // create popover
			if (! this._tableViewSettingsPopover) {
				this._tableViewSettingsPopover = sap.ui.xmlfragment("ag.bpc.Deka.view.KonditioneneinigungUnitsPopover", this);
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
            var _this = this;

            var konditioneneinigung = _this.getView().getModel("form").getProperty("/konditioneneinigung");

            DataProvider.createSperreAsync({KeId: konditioneneinigung.KeId})
            .then(function(){
                // Alten Zustand sichern für eventuelle Wiederherstellung
                var formData = _this.getView().getModel("form").getData();
                _this._formDataBackup = jQuery.extend(true, {}, formData);
                _this.getView().getModel("form").setProperty("/modus", "edit");
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onSpeichernButtonPress: function(oEvent){
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");
            console.log(ke, "ke");

            var validationSuccess = this.validateForm();
            
            if(validationSuccess){
                this.speichern();
            }else {
                 MessageBox.error("Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.");
            }
        },

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

        konditioneneinigungAnlegen: function(){
            var _this = this;

            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

            var payload = {
                Action: 'CRE',

                Bukrs: ke.Bukrs,
                WeId: ke.WeId,

                GueltigkKe: ke.GueltigkKe,
                Mietbeginn: ke.Mietbeginn,
                LzFirstbreak:  ke.LzFirstbreak.toString(),
                MzMonate:  ke.MzMonate.toString(),
                
                MkMonate: ke.MkMonate ?  ke.MkMonate.toString() : null,
                MkAbsolut: ke.MkAbsolut ?  ke.MkAbsolut.toString() : null,

                BkMonatsmieten: ke.BkMonatsmieten ?  ke.BkMonatsmieten.toString() : null,
                BkAbsolut: ke.BkAbsolut ?  ke.BkAbsolut.toString() : null,

                ArtKosten: ke.ArtKosten,
                SonstK: ke.SonstK ?  ke.SonstK.toString() : null,
                ArtErtrag: ke.ArtErtrag,
                SonstE: ke.SonstE ?  ke.SonstE.toString() : null,

                Steuerschaden: ke.Steuerschaden ?  ke.Steuerschaden.toString() : null,
                MwstkErtrag: ke.MwstkErtrag ?  ke.MwstkErtrag.toString() : null,
                Einmalertrag: ke.Einmalertrag ?  ke.Einmalertrag.toString() : null,

                Status: ke.Status,
                Anmerkung: ke.Anmerkung,
                Bemerkung: ke.Bemerkung ? ke.Bemerkung : null,

                MonatJahr: ke.MonatJahr,
                Currency: ke.Currency,
                Unit: ke.Unit,

                KeToOb: _.map(ke.KeToOb, function(object){
                    delete object.__metadata;
                    object.HnflAlt = object.HnflAlt ?  object.HnflAlt.toString() : null;
                    object.AnMiete = object.AnMiete ?  object.AnMiete.toString() : "0.00";
                    object.NutzartAlt = null;
                    object.GaKosten = object.GaKosten ?  object.GaKosten.toString() : "0.00";
                    object.MaKosten = object.MaKosten ?  object.MaKosten.toString() : "0.00";
                    return object;
                }),

                Confirmation: ke.Confirmation ? ke.Confirmation : false
            };
            console.log(payload, "payload");

            DataProvider.createKonditioneneinigungAsync(payload).then(function(oData){
               // _this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
               _this.konditioneneinigungAnzeigen(oData.KeId, oData.Bukrs);

            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                        _this.speichern();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
            })
            .done();
        },

        konditioneneinigungAktualisieren: function(){
            var _this = this;

            var ke = _this.getView().getModel("form").getProperty("/konditioneneinigung");
            
            var payload = {
                Action: 'UPD',

                KeId: ke.KeId,
                Bukrs: ke.Bukrs,
                WeId: ke.WeId,

                GueltigkKe: ke.GueltigkKe,
                Mietbeginn: ke.Mietbeginn,
                LzFirstbreak: ke.LzFirstbreak.toString(),
                MzMonate: ke.MzMonate.toString(),
                
                MkMonate: ke.MkMonate ? ke.MkMonate.toString() : null,
                MkAbsolut: ke.MkAbsolut ? ke.MkAbsolut.toString() : null,

                BkMonatsmieten: ke.BkMonatsmieten ? ke.BkMonatsmieten.toString() : null,
                BkAbsolut: ke.BkAbsolut ? ke.BkAbsolut.toString() : null,

                ArtKosten: ke.ArtKosten,
                SonstK: ke.SonstK ? ke.SonstK.toString() : null,
                ArtErtrag: ke.ArtErtrag,
                SonstE: ke.SonstE ? ke.SonstE.toString() : null,

                Steuerschaden: ke.Steuerschaden ? ke.Steuerschaden.toString() : null,
                MwstkErtrag: ke.MwstkErtrag ? ke.MwstkErtrag.toString() : null,
                Einmalertrag: ke.Einmalertrag ? ke.Einmalertrag.toString() : null,

                Status: ke.Status,
                Anmerkung: ke.Anmerkung,
                Bemerkung: ke.Bemerkung ? ke.Bemerkung : null,
                Budgetstp: ke.Budgetstp,

                MonatJahr: ke.MonatJahr,
                Currency: ke.Currency,
                Unit: ke.Unit,

                Aktiv: ke.Aktiv,
                Ersteller: ke.Ersteller,
                
                KeToOb: _.map(ke.KeToOb, function(object){
                    delete object.__metadata;
                    object.HnflAlt = object.HnflAlt ? object.HnflAlt.toString() : null;
                    object.AnMiete = object.AnMiete ? object.AnMiete.toString() : "0.00";
                    object.NutzartAlt = null;
                    object.GaKosten = object.GaKosten ? object.GaKosten.toString() : "0.00";
                    object.MaKosten = object.MaKosten ? object.MaKosten.toString() : "0.00";
                    return object;
                }),

                Confirmation: ke.Confirmation
            };
            console.log(payload, "payload");
            DataProvider.createKonditioneneinigungAsync(payload).then(function(){
                return DataProvider.deleteSperreAsync(ke.KeId, '');
            })
            .then(function(){
                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                        _this.speichern();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
            })
            .done();
        },

        showConfirmationDialog: function(oError, onProceed, onAbort){
            var _this = this;

            var dialog = new sap.m.Dialog({
				title: TranslationUtil.translate("WARNUNG"),
				type: sap.m.DialogType.Message,
                state: sap.ui.core.ValueState.Warning,
                content: new sap.m.Text({
                    text: oError.text
                }),
                beginButton: new sap.m.Button({
                    text: TranslationUtil.translate("FORTFAHREN"),
                    press: function () {
                        dialog.close();
                        if(typeof onProceed === 'function'){
                            onProceed();
                        }
                    }
                }),
				endButton: new sap.m.Button({
                    text: TranslationUtil.translate("ABBRECHEN"),
					press: function () {
						dialog.close();
                        if(typeof onAbort === 'function'){
                            onAbort();
                        }
					}
				}),
                afterClose: function() {
                    dialog.destroy();
                }
            });

            dialog.open();
        },

        checkNotNegative: function(view) {
            if(this.checkIsNumber(view)){
                var value = view.getValue();
                var result = true;

                if(value){
                    if(parseFloat(value) < 0){
                        view.setValueState(sap.ui.core.ValueState.Error);
                        view.setValueStateText(TranslationUtil.translate("ERR_WERT_IST_NEGATIV"));
                        result = false;
                    }
                }
                return result;
            }else{
                return false;
            }              
        },

        checkIsNumber: function(view) {
            var value = view.getValue();
            var result = true;

            if(value){
                if(isNaN(parseFloat(value))){
                    view.setValueState(sap.ui.core.ValueState.Error);
                    view.setValueStateText(TranslationUtil.translate("ERR_NAN"));
                    result = false;
                }
            }

            return result;
        },

        validateForm: function(){
            var that = this;
            this.initializeValidationState();

            var validationResult = true;
                        
            var idGueltigkKe = this.getView().byId("idGueltigkKe");
            if(idGueltigkKe.getDateValue() === null){
                idGueltigkKe.setValueState(sap.ui.core.ValueState.Error);
                idGueltigkKe.setValueStateText(TranslationUtil.translate("ERR_FEHLENDES_DATUM"));
                validationResult = false;
            }
            else if(idGueltigkKe.getDateValue() < Date.now())
            {
                idGueltigkKe.setValueState(sap.ui.core.ValueState.Error);
                idGueltigkKe.setValueStateText(TranslationUtil.translate("ERR_UNGUELTIGES_DATUM"));
                validationResult = false;
            }


            var idMietbeginn = this.getView().byId("idMietbeginn");
            if(idMietbeginn.getDateValue() === null){
                idMietbeginn.setValueState(sap.ui.core.ValueState.Error);
                idMietbeginn.setValueStateText(TranslationUtil.translate("ERR_FEHLENDES_DATUM"));
                validationResult = false;
            }


            var idLzFirstbreak = this.getView().byId("idLzFirstbreak");
            if(idLzFirstbreak.getValue() === ""){
                idLzFirstbreak.setValueState(sap.ui.core.ValueState.Error);
                idLzFirstbreak.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            }
            else{
                validationResult = this.checkNotNegative(idLzFirstbreak) && validationResult;
            }        

            var idMzMonate = this.getView().byId("idMzMonate");
            if(idMzMonate.getValue() === ""){
                idMzMonate.setValueState(sap.ui.core.ValueState.Error);
                idMzMonate.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            }
            else{
                validationResult = this.checkNotNegative(idMzMonate) && validationResult;
            }
            
            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            var idMietflaechenangabenErrorBox = this.getView().byId("idMietflaechenangabenErrorBox");
            if(mietflaechenangabenTable.getItems().length < 1){
                idMietflaechenangabenErrorBox.setText("Bitte fügen Sie mindestens eine Mietfläche hinzu");
                idMietflaechenangabenErrorBox.setVisible(true);
            }
            
            _.map(mietflaechenangabenTable.getItems(), function(item){
                var cells = item.getCells();
                var anMieteCell = cells[7];

                if(anMieteCell.getValue() === ""){
                    anMieteCell.setValueState(sap.ui.core.ValueState.Error);
                    anMieteCell.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                    validationResult = false;
                }

                validationResult = that.checkNotNegative(anMieteCell) && validationResult;
                validationResult = that.checkNotNegative(cells[8]) && validationResult; // gaKosten
                validationResult = that.checkNotNegative(cells[9]) && validationResult; // maKosten
                validationResult = that.checkNotNegative(cells[6]) && validationResult; // nhMiete
                validationResult = that.checkNotNegative(cells[4]) && validationResult; // hnflAlt

                if(parseFloat(anMieteCell.getValue()) === 0){
                    anMieteCell.setValueState(sap.ui.core.ValueState.Error);
                    anMieteCell.setValueStateText(TranslationUtil.translate("ERR_WERT_GROESSER_NULL"));
                    validationResult = false;
                }                                
            });

            var ketoob = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");           
            var rows = mietflaechenangabenTable.getItems();
            var i;
            for(i = 0; i < rows.length; i = i+1){
                var row = rows[i];
                var cells = row.getAggregation("cells");

                // TODO: dynamisch machen (spaltenindex aus "Columns" aggregation der table berechnen)
                var mfAltCell = cells[4];                 
                //var mfAltValue = mfAltCell.getProperty("value");
                var mfAltValue = ketoob[i].HnflAlt;
                var hnflValue = ketoob[i].Hnfl;

                if(!isNaN(mfAltValue) && !isNaN(hnflValue) && (mfAltValue > (hnflValue*1.2))) {
                    mfAltCell.setValueState(sap.ui.core.ValueState.Error);
                    var errText = TranslationUtil.translate("ERR_MFALT_MAX");
                    mfAltCell.setValueStateText(errText);

                    validationResult = false;
                }
            }
            
            var mkMonate = this.getView().byId("maklerkostenInMonatsmieten");
            validationResult = this.checkNotNegative(mkMonate) && validationResult;

            var mkAbsolut = this.getView().byId("maklerkostenAbsolut");
            validationResult = this.checkNotNegative(mkAbsolut) && validationResult;

            var bkMonate = this.getView().byId("beratungskostenInMonatsmieten");
            validationResult = this.checkNotNegative(bkMonate) && validationResult;

            var bkAbsolut = this.getView().byId("beratungskostenAbsolut");
            validationResult = this.checkNotNegative(bkAbsolut) && validationResult;

            var sonstK = this.getView().byId("idSonstK");
            validationResult = this.checkNotNegative(sonstK) && validationResult;

            var sonstE = this.getView().byId("idSonstE");
            validationResult = this.checkNotNegative(sonstE) && validationResult;

            var steuerschaden = this.getView().byId("idSteuerschaden");
            validationResult = this.checkNotNegative(steuerschaden) && validationResult;

            var mwstkErtrag = this.getView().byId("idMwstkErtrag");
            validationResult = this.checkNotNegative(mwstkErtrag) && validationResult;

            var einmalertrag = this.getView().byId("einmalertrag");
            validationResult = this.checkNotNegative(einmalertrag) && validationResult;

            return validationResult;
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
            
            var modus = this.getView().getModel("form").getProperty("/modus");   
            var konditioneneinigung = _this.getView().getModel("form").getProperty("/konditioneneinigung");    
            var keid = konditioneneinigung.KeId;    
            
            if(modus === "new")
            {                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(_this);
                
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
                DataProvider.deleteSperreAsync(keid, '')
                .then(function(){
                    var formDataBackup = _this._formDataBackup;
                    _this.getView().getModel("form").setData(formDataBackup);
                    _this.getView().getModel("form").setProperty("/modus", "show");
                    /*
                var Bukrs = this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs");
                var KeId = this.getView().getModel("form").getProperty("/konditioneneinigung/KeId");
                _this.konditioneneinigungAnzeigen(KeId, Bukrs);*/
                })
                .catch(function(oError){
                     ErrorMessageUtil.showError(oError);
                })
                .done();            
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

            var Bukrs = _this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs");
            var WeId = _this.getView().getModel("form").getProperty("/konditioneneinigung/WeId");
            var MvId = _this.getView().getModel("form").getProperty("/konditioneneinigung/MvId");

            var expand = (MvId !== undefined) ? 'MvToMo' : 'WeToMo';
            var promise = (MvId !== undefined) ? DataProvider.readMietvertragAsync(WeId, Bukrs, MvId) : DataProvider.readWirtschaftseinheitAsync(Bukrs, WeId);

            promise.then(function(oData){
                var mietflaechenangaben = oData[expand];

                var vorhandeneMietflaechenangaben = _this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");

                var jsonData = {
                    mietflaechen: _.reject(mietflaechenangaben, function(mietflaechenangabe){
                        return _.some(vorhandeneMietflaechenangaben, function(vorhandeneMietflaechenangabe){
                            return mietflaechenangabe.MoId === vorhandeneMietflaechenangabe.MoId;
                        });
                    })
                };

                var jsonModel = new sap.ui.model.json.JSONModel(jsonData);
                _this._mietflaechenSelektionDialog.setModel(jsonModel);
                _this._mietflaechenSelektionDialog.open();
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },
        
        onMietflaechenSelektionDialogConfirm: function(oEvent){
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

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
                        mietflaechenangaben.push({
                            WeId: mietflaechenangabe.WeId,
                            MoId: mietflaechenangabe.MoId,
                            Bukrs: mietflaechenangabe.Bukrs,
                            Bezei: mietflaechenangabe.Bezei,
                            Nutzart: mietflaechenangabe.Nutzart,
                            Hnfl: mietflaechenangabe.Hnfl,
                            HnflAlt: mietflaechenangabe.HnflAlt,
                            HnflUnit: mietflaechenangabe.HnflUnit,
                            NhMiete: mietflaechenangabe.NhMiete,
                            AnMiete: mietflaechenangabe.AnMiete,
                            GaKosten: mietflaechenangabe.GaKosten,
                            MaKosten: mietflaechenangabe.MaKosten,
                            Whrung: mietflaechenangabe.Whrung,

                            MfSplit: false,
                            KeId: ke.KeId,
                            MonatJahr: ke.MonatJahr
                        });

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
                            if(mietflaechenangabe.Nutzart !== "0700" && mietflaechenangabe.Nutzart !== "0750"){
                                return nutzungsart.NaId === mietflaechenangabe.Nutzart;
                            }                            
                        });
                    });

                    if(vorhandeneNutzungsarten.length === 0){
                        MessageBox.information(TranslationUtil.translate("ERR_KEINE_GUELTIGEN_NUTZUNGSARTEN"));
                    }else{
                        var dialogModel = new sap.ui.model.json.JSONModel({
                            nutzungsarten: vorhandeneNutzungsarten,
                            nutzungsart: vorhandeneNutzungsarten[0].NaId,
                            grundausbaukosten: 100,
                            mietausbaukosten: 50
                        });

                        _this._ausbaukostenVerteilenDialog.setModel(dialogModel);
                        _this._ausbaukostenVerteilenDialog.open();
                    }
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
                        mietflaechenangabe.GaKosten = ((Math.round(parseFloat(mietflaechenangabe.Hnfl) / sumNutzflaechen * verteilung.grundausbaukosten * 100)) / 100 / parseFloat(mietflaechenangabe.Hnfl)).toString();
                        mietflaechenangabe.MaKosten = ((Math.round(parseFloat(mietflaechenangabe.Hnfl) / sumNutzflaechen * verteilung.mietausbaukosten * 100)) / 100 / parseFloat(mietflaechenangabe.Hnfl)).toString();
                    }
                    else
                    {
                        mietflaechenangabe.GaKosten = ((Math.round(parseFloat(mietflaechenangabe.HnflAlt) / sumNutzflaechen * verteilung.grundausbaukosten * 100)) / 100 / parseFloat(mietflaechenangabe.HnflAlt)).toString();
                        mietflaechenangabe.MaKosten = ((Math.round(parseFloat(mietflaechenangabe.HnflAlt) / sumNutzflaechen * verteilung.mietausbaukosten * 100)) / 100 / parseFloat(mietflaechenangabe.HnflAlt)).toString();
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
            var kostenarten = this.getView().getModel("form").getProperty("/kostenarten");
            var ertragsarten = this.getView().getModel("form").getProperty("/ertragsarten");
            
            PrinterUtil.printKonditioneneinigung(konditioneneinigung, kostenarten, ertragsarten);
        },

        onFavoritButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

            var promise = ke.Favorit ? DataProvider.deleteFavoritAsync(ke.KeId, '') : DataProvider.createFavoritAsync({KeId: ke.KeId});

            promise.then(function(){
                var message = ke.Favorit ? TranslationUtil.translate("KE_VON_FAVORITEN_ENTFERNT") : TranslationUtil.translate("KE_ZU_FAVORITEN_HINZUGEFUEGT");
                MessageBox.information(message, {
                    title: TranslationUtil.translate("HINWEIS")
                });
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .fin(function(){
                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .done();
        },

        onZurGenehmigungVorlegenButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            
            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.ZUR_GEMEHMIGUNG_VORGELEGT,
                Bemerkung: ke.Bemerkung,
                Confirmation: ke.Confirmation
            })
            .then(function(){
                MessageBox.information(TranslationUtil.translate("KE_ZUR_GENEHMIGUNG_VORGELEGT"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                        _this.onZurGenehmigungVorlegenButtonPress();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
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
                            Bemerkung: sText,
                            Confirmation: ke.Confirmation
                        })
                        .then(function(){
                            dialog.close();

                            MessageBox.information(TranslationUtil.translate("KE_GENEHMIGUNG_ZURUECKGEZOGEN"), {
                                title: TranslationUtil.translate("HINWEIS")
                            });

                            _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
                        })
                        .catch(function(oError){
                            var error = ErrorMessageUtil.parseErrorMessage(oError);

                            if(error.type === 'WARNING'){
                                _this.showConfirmationDialog(error, function(){
                                    _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                                    _this.onGenehmigungZurueckziehenButtonPress();
                                });
                            }
                            else {
                                ErrorMessageUtil.show(error);
                            }
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

        onGenehmigungsprozessButtonPress: function(oEvent){

            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

			this.getOwnerComponent().getRouter().navTo("konditioneneinigungGenehmigung", {
                KeId: ke.KeId,
                Bukrs: ke.Bukrs
            }, true);
        },

        onNichtGenehmigenButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.NICHT_GENEHMIGT,
                Bemerkung: ke.Bemerkung,
                Confirmation: ke.Confirmation
            })
            .then(function(){
                MessageBox.information(TranslationUtil.translate("KE_NICHT_GENEHMIGT_SUCCESS"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                        _this.onNichtGenehmigenButtonPress();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
            })
            .done();
        },

        onGenehmigenButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.GENEHMIGT,
                Bemerkung: ke.Bemerkung,
                Confirmation: ke.Confirmation
            })
            .then(function(){
                MessageBox.information(TranslationUtil.translate("KE_GENEHMIGT_SUCCESS"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                        _this.onGenehmigenButtonPress();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
            })
            .done();
        },

        onReeditButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.REEDIT,
                Bemerkung: ke.Bemerkung,
                Confirmation: ke.Confirmation
            })
            .then(function(){
                MessageBox.information(TranslationUtil.translate("KE_REEDIT_SUCCESS"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                        _this.onReeditButtonPress();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
            })
            .done();
        },

        onReaktivierenButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.REAKTIVIERT,
                Bemerkung: ke.Bemerkung,
                Confirmation: ke.Confirmation
            })
            .then(function(){
                MessageBox.information(TranslationUtil.translate("KE_REACTIVATION_SUCCESS"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                        _this.onReaktivierenButtonPress();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
            })
            .done();
        },

        onLoeschenButtonPress: function(oEvent){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung"); 

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId, 
                Bukrs: ke.Bukrs, 
                Anmerkung: StaticData.ANMERKUNG.KE.GELOESCHT,
                Bemerkung: ke.Bemerkung,
                Confirmation: ke.Confirmation
            })
            .then(function(){
                MessageBox.information(TranslationUtil.translate("KE_DELETE_SUCCESS"), {
                    title: TranslationUtil.translate("HINWEIS")
                });

                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/konditioneneinigung/Confirmation", true);
                        _this.onLoeschenButtonPress();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
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