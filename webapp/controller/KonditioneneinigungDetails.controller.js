var formatter = sap.ui.core.format.NumberFormat.getFloatInstance({
    style: "Standard",
    decimals: 2
});

var myFormatter = {
    formatDifferenz: function (a, b, unit) {
        var oNumber = (a * 100 - b * 100) / 100;

        var res = formatter.format(oNumber);
        if (unit) {
            res = res + " " + unit;
        }

        return res;
    },

    formatHnfl: function (hnfl, hnflUnit, flMultiplikator, flSelected) {
        var res;
        if (hnflUnit === "ST") {
            res = formatter.format(hnfl) + " " + hnflUnit;
        } else {
            var hnflConv = (hnfl * flMultiplikator * 100) / 100;

            res = formatter.format(hnflConv) + " " + flSelected;
        }

        return res;
    },

    formatBetrag: function (betrag, waehrungsMultiplikator) {
        var res;
        res = (betrag * waehrungsMultiplikator * 100) / 100;
        res = formatter.format(res);
        return res;
    }
};

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
    "ag/bpc/Deka/model/CustomNumberType"
], function (Controller, MessageBox, PrinterUtil, Filter, NavigationPayloadUtil, DataProvider, ErrorMessageUtil, StaticData, TranslationUtil) {

	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.KonditioneneinigungDetails", {

        onInit: function(){
            var _this = this;

            this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            this.getView().setModel(sap.ui.getCore().getModel("text"), "text");

            // View nach oben Scrollen, da die Scrollposition von vorherigen Anzeigen übernommen wird
            this.getView().addEventDelegate({
                onAfterShow: function() {
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

                konditioneneinigung: {
                    BtnVorlegen: false,
                    BtnGpAr: false,
                    BtnReaktiv: false,
                    BtnZurueck: false,
                    BtnGp: false,
                    BtnReedit: false,
                    BtnLoeschen: false,

                },

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

            return Q.Promise(function(resolve, reject) {

                var viewsettings = {};

                var ausgangsZeitspanneKey = konditioneneinigung.MonatJahr;
                var ausgangsWaehrungKey = konditioneneinigung.Currency;
                var ausgangsFlaecheneinheitKey = konditioneneinigung.Unit;

                Q.when(StaticData.ZEITSPANNEN).then(function(zeitspannen){

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

                        viewsettings.waehrungSelectedKey = ausgangsWaehrung.Nach;
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
                        viewsettings.flaecheneinheitSelectedKey = ausgangsFlaecheneinheit.Nach;
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
            this.getView().byId("idVtrLfz").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idVerlOpt").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idVerlOptWdh").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMaxLaufzeitInMonaten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idUeblicheIndizierung").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idUeblicheMietsicherheit").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMietsicherheitAbsolut").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idSonstKNewEdit").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("InputCashIntensives").setValueState(sap.ui.core.ValueState.None);
            var mkMonate = this.getView().byId("maklerkostenInMonatsmieten");
            mkMonate.setValueState(sap.ui.core.ValueState.None);

            var mkAbsolut = this.getView().byId("maklerkostenAbsolut");
            mkAbsolut.setValueState(sap.ui.core.ValueState.None);

            var bkMonate = this.getView().byId("beratungskostenInMonatsmieten");
            bkMonate.setValueState(sap.ui.core.ValueState.None);

            var bkAbsolut = this.getView().byId("beratungskostenAbsolut");
            bkAbsolut.setValueState(sap.ui.core.ValueState.None);

            var sonstE = this.getView().byId("idSonstKNewEdit");
            sonstE.setValueState(sap.ui.core.ValueState.None);

            var sonstE = this.getView().byId("idSonstENewEdit");
            sonstE.setValueState(sap.ui.core.ValueState.None);

            var steuerschaden = this.getView().byId("idSteuerschaden");
            steuerschaden.setValueState(sap.ui.core.ValueState.None);

            var mwstkErtrag = this.getView().byId("idMwstkErtrag");
            mwstkErtrag.setValueState(sap.ui.core.ValueState.None);

            var einmalertrag = this.getView().byId("einmalertrag");
            einmalertrag.setValueState(sap.ui.core.ValueState.None);


            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");

            var HnflAlt_cellindex = mietflaechenangabenTable.indexOfColumn(this.getView().byId("idColHnflAlt"));
            var AnMiete_cellindex = mietflaechenangabenTable.indexOfColumn(this.getView().byId("idColAnMiete"));
            var GaKosten_cellindex = mietflaechenangabenTable.indexOfColumn(this.getView().byId("idColGaKosten"));
            var MaKosten_cellindex = mietflaechenangabenTable.indexOfColumn(this.getView().byId("idColMaKosten"));

            _.map(mietflaechenangabenTable.getItems(), function(item){
                var cells = item.getCells();
                cells[HnflAlt_cellindex].setValueState(sap.ui.core.ValueState.None);
                cells[AnMiete_cellindex].setValueState(sap.ui.core.ValueState.None);
                cells[GaKosten_cellindex].setValueState(sap.ui.core.ValueState.None);
                cells[MaKosten_cellindex].setValueState(sap.ui.core.ValueState.None);
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

            sap.ui.core.BusyIndicator.show();

            DataProvider.readKonditioneneinigungAsync(Bukrs, KeId).then(function(konditioneneinigung){
                _this.getView().getModel("form").setProperty("/konditioneneinigung", konditioneneinigung);
                return _this.initializeViewsettingsAsync(konditioneneinigung);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === "KE";
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
                sap.ui.core.BusyIndicator.hide();
                _this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
            })
            .catch(function(oError){
                sap.ui.core.BusyIndicator.hide();
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onKonditioneneinigungAnlegenAufBasisEinerWirtschaftseinheit: function(){
            var _this = this;

            _this.initializeEmptyModel();
            var payload = NavigationPayloadUtil.takePayload();

            if(!payload){
                _this.onBack(null);
                return;
            }

            var WeId = payload.WeId;
            var Bukrs = payload.Bukrs;

            _this.initializeValidationState();
            _this.getView().getModel("form").setProperty("/modus", "new");
			
            DataProvider.readWirtschaftseinheitAsync(Bukrs, WeId).then(function(wirtschaftseinheit){

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
                    return statuswert.FlgKeVa === "KE";
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
                ErrorMessageUtil.showError(oError);
            })
            .done();

        },

        onKonditioneneinigungAnlegenAufBasisEinesMietvertrags: function(){
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

            DataProvider.readMietvertragAsync(WeId, Bukrs, MvId).then(function(mietvertrag){

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
                    return statuswert.FlgKeVa === "KE";
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
                ErrorMessageUtil.showError(oError);
            })
            .done();

        },

        onKonditioneneinigungAnlegenAufBasisEinerKonditioneneinigung: function(){
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

            DataProvider.readKonditioneneinigungAsync(Bukrs, KeId).then(function(basisKe){

                var ke = _this.newKonditioneneinigung();

                ke.WeId = basisKe.WeId;
                ke.Bukrs = basisKe.Bukrs;

                ke.GueltigkKe = basisKe.GueltigkKe;
                ke.Mietbeginn = basisKe.Mietbeginn;
                ke.LzFirstbreak = basisKe.LzFirstbreak;
                ke.MzMonate = basisKe.MzMonate;
                
                ke.VtrLfzM = basisKe.VtrLfzM;
                ke.VerlOptM = basisKe.VerlOptM;
                ke.VerlOptWdh = basisKe.VerlOptWdh;

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
                    return statuswert.FlgKeVa === "KE";
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
                
                VtrLfzM: "",
                VerlOptM: "",
                VerlOptWdh: "",

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

            var KeToOb = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            _.map(KeToOb, function(object){
                if(zeitspanne.Id === "J"){
                    object.NhMiete = object.NhMiete * 12;
                }
                if(zeitspanne.Id === "M"){
                    object.NhMiete = object.NhMiete / 12;
                }
            });

            this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", KeToOb);
        },

        onPopoverWaehrungSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var waehrung = item.getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/viewsettings/waehrungSelected", waehrung);
            var _this = this;
            var viewsettings = this.getView().getModel("form").getProperty("/viewsettings");

            var KeToOb = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            _.map(KeToOb, function(object){
                var neueMiete = object.NhMiete * waehrung.Multiplikator;
                object.NhMiete = neueMiete;
                object.Whrung = waehrung.Nach;
            });
            var ausgangsWaehrungKey = waehrung.Nach;
            DataProvider.readExchangeRateSetAsync(ausgangsWaehrungKey).then(function(waehrungen){
                viewsettings.waehrungen = waehrungen;

                if(viewsettings.waehrungen.length > 0){
                    var ausgangsWaehrung = _.find(viewsettings.waehrungen, function(waehrung){
                        return waehrung.Nach === ausgangsWaehrungKey;
                    });

                    if(!ausgangsWaehrung){
                        ausgangsWaehrung = viewsettings.waehrungen[0];
                    }

                    viewsettings.waehrungSelectedKey = ausgangsWaehrung.Nach;
                    viewsettings.waehrungSelected = ausgangsWaehrung;
                }
                _this.getView().getModel("form").setProperty("/viewsettings", viewsettings);

            })
            .catch(function(){
            })
            .done();
        },

        onPopoverFlaecheneinheitSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var flaecheneinheit = item.getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/viewsettings/flaecheneinheitSelected", flaecheneinheit);
            var viewsettings = this.getView().getModel("form").getProperty("/viewsettings");
            var _this = this;

            var KeToOb = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");
            _.map(KeToOb, function(object){
                if(object.HnflUnit !== StaticData.UNIT.STUECK){
                    var neueFlaeche = object.Hnfl * flaecheneinheit.Multiplikator;
                    var neueMiete = object.NhMiete *  1 / flaecheneinheit.Multiplikator;
                    object.Hnfl = neueFlaeche;
                    object.HnflUnit = flaecheneinheit.Nach;
                    object.NhMiete = neueMiete;
                }
            });

            var ausgangsFlaecheneinheitKey = flaecheneinheit.Nach;

             DataProvider.readFlaecheSetAsync(ausgangsFlaecheneinheitKey).then(function(flaecheneinheiten){

                    viewsettings.flaecheneinheiten = flaecheneinheiten;

                    if(viewsettings.flaecheneinheiten.length > 0){
                        var ausgangsFlaecheneinheit = _.find(viewsettings.flaecheneinheiten, function(flaecheneinheit){
                            return flaecheneinheit.Nach === ausgangsFlaecheneinheitKey;
                        });

                        if(!ausgangsFlaecheneinheit){
                            ausgangsFlaecheneinheit = viewsettings.flaecheneinheiten[0];
                        }

                        viewsettings.flaecheneinheitSelectedKey = ausgangsFlaecheneinheit.Nach;
                        viewsettings.flaecheneinheitSelected = ausgangsFlaecheneinheit;
                    }

                    _this.getView().getModel("form").setProperty("/viewsettings", viewsettings);
                })
                .catch(function(){
                })
                .done();

        },

        onBack: function() {
            var modus = this.getView().getModel("form").getProperty("/modus");
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

            if(modus === "edit") {
                DataProvider.deleteSperreAsync(ke.KeId, "");
            }

            this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
        },

        handleTableSettingsButton: function(oEvent){
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

        onBearbeitenButtonPress: function(){
            var _this = this;

            var konditioneneinigung = _this.getView().getModel("form").getProperty("/konditioneneinigung");

            DataProvider.createSperreAsync({KeId: konditioneneinigung.KeId}).then(function(){
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

        onSpeichernButtonPress: function(){
            var validationSuccess = this.validateForm();

            if(validationSuccess) {
                this.speichern();
            } else {
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

            if( ke.GueltigkKe && Object.prototype.toString.call(ke.GueltigkKe) === "[object Date]" ){
                ke.GueltigkKe.setHours(12);
                ke.GueltigkKe.setMinutes(0);
            }
            else{
                ke.GueltigkKe = null;
            }

            if( ke.Mietbeginn && Object.prototype.toString.call(ke.Mietbeginn) === "[object Date]" ){
                ke.Mietbeginn.setHours(12);
                ke.Mietbeginn.setMinutes(0);
            }
            else{
                ke.Mietbeginn = null;
            }

            var payload = {
                Action: "CRE",

                Bukrs: ke.Bukrs,
                WeId: ke.WeId,

                IndBez: ke.IndBez,
                GueltigkKe: ke.GueltigkKe,
                Mietbeginn: ke.Mietbeginn,
                LzFirstbreak:  ke.LzFirstbreak.toString(),
                MzMonate:  ke.MzMonate.toString(),
                
                VtrLfzM: ke.VtrLfzM.toString(),
                VerlOptM: ke.VerlOptM.toString(),
                VerlOptWdh: ke.VerlOptWdh.toString(),

                MkMonate: ke.MkMonate ?  ke.MkMonate.toString() : null,
                MkAbsolut: ke.MkAbsolut ?  ke.MkAbsolut.toString() : null,

                BkMonatsmieten: ke.BkMonatsmieten ?  ke.BkMonatsmieten.toString() : null,
                BkAbsolut: ke.BkAbsolut ?  ke.BkAbsolut.toString() : null,

                ArtKosten: ke.ArtKosten,
                SonstK: ke.SonstK ?  ke.SonstK.toString() : null,
                Cashinc: ke.Cashinc ?  ke.Cashinc.toString() : null,
                ArtErtrag: ke.ArtErtrag,
                SonstE: ke.SonstE ?  ke.SonstE.toString() : null,
                
                MauebIndex: ke.MauebIndex ? true: false,
                MaxLfz: ke.MaxLfz ? ke.MaxLfz.toString() : null,
                MauebMietsich: ke.MauebMietsich ? true: false,
                MietsichAbs: ke.MietsichAbs ? ke.MietsichAbs.toString() : null,

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
                    object.Hnfl = object.Hnfl ?  object.Hnfl.toString() : "0.00";
                    object.AnMiete = object.AnMiete ?  object.AnMiete.toString() : "0.00";
                    object.NutzartAlt = null;
                    object.GaKosten = object.GaKosten ?  object.GaKosten.toString() : "0.00";
                    object.MaKosten = object.MaKosten ?  object.MaKosten.toString() : "0.00";
                    object.NhMiete = object.NhMiete ?  object.NhMiete.toString() : "0.00";
                    return object;
                }),

                Confirmation: ke.Confirmation ? ke.Confirmation : false
            };

            sap.ui.core.BusyIndicator.show();

            DataProvider.createKonditioneneinigungAsync(payload).then(function(oData){
                sap.ui.core.BusyIndicator.hide();
               _this.konditioneneinigungAnzeigen(oData.KeId, oData.Bukrs);
            })
            .catch(function(oError){
                sap.ui.core.BusyIndicator.hide();

                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === "WARNING"){
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

            if( ke.GueltigkKe && Object.prototype.toString.call(ke.GueltigkKe) === "[object Date]" ){
                ke.GueltigkKe.setHours(12);
                ke.GueltigkKe.setMinutes(0);
            }
            else{
                ke.GueltigkKe = null;
            }

            if( ke.Mietbeginn && Object.prototype.toString.call(ke.Mietbeginn) === "[object Date]" ){
                ke.Mietbeginn.setHours(12);
                ke.Mietbeginn.setMinutes(0);
            }
            else{
                ke.Mietbeginn = null;
            }

            var payload = {
                Action: "UPD",

                KeId: ke.KeId,
                Bukrs: ke.Bukrs,
                WeId: ke.WeId,

                IndBez: ke.IndBez,
                GueltigkKe: ke.GueltigkKe,
                Mietbeginn: ke.Mietbeginn,
                LzFirstbreak: ke.LzFirstbreak.toString(),
                MzMonate: ke.MzMonate.toString(),
                
                VtrLfzM: ke.VtrLfzM.toString(),
                VerlOptM: ke.VerlOptM.toString(),
                VerlOptWdh: ke.VerlOptWdh.toString(),

                MkMonate: ke.MkMonate ? ke.MkMonate.toString() : null,
                MkAbsolut: ke.MkAbsolut ? ke.MkAbsolut.toString() : null,

                BkMonatsmieten: ke.BkMonatsmieten ? ke.BkMonatsmieten.toString() : null,
                BkAbsolut: ke.BkAbsolut ? ke.BkAbsolut.toString() : null,

                ArtKosten: ke.ArtKosten,
                SonstK: ke.SonstK ? ke.SonstK.toString() : null,
                Cashinc: ke.Cashinc ?  ke.Cashinc.toString() : null,
                ArtErtrag: ke.ArtErtrag,
                SonstE: ke.SonstE ? ke.SonstE.toString() : null,
                
                MauebIndex: ke.MauebIndex ? true: false,
                MaxLfz: ke.MaxLfz ? ke.MaxLfz.toString() : null,
                MauebMietsich: ke.MauebMietsich ? true: false,
                MietsichAbs: ke.MietsichAbs ? ke.MietsichAbs.toString() : null,

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
                    object.Hnfl = object.Hnfl ?  object.Hnfl.toString() : "0.00";
                    object.AnMiete = object.AnMiete ? object.AnMiete.toString() : "0.00";
                    object.NutzartAlt = null;
                    object.GaKosten = object.GaKosten ? object.GaKosten.toString() : "0.00";
                    object.MaKosten = object.MaKosten ? object.MaKosten.toString() : "0.00";
                    object.NhMiete = object.NhMiete ?  object.NhMiete.toString() : "0.00";
                    return object;
                }),

                Confirmation: ke.Confirmation
            };

            sap.ui.core.BusyIndicator.show();

            DataProvider.createKonditioneneinigungAsync(payload).then(function(){
                return DataProvider.deleteSperreAsync(ke.KeId, "");
            })
            .then(function(){
                sap.ui.core.BusyIndicator.hide();
                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                sap.ui.core.BusyIndicator.hide();

                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === "WARNING"){
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
                        if(typeof onProceed === "function"){
                            onProceed();
                        }
                    }
                }),
				endButton: new sap.m.Button({
                    text: TranslationUtil.translate("ABBRECHEN"),
					press: function () {
						dialog.close();
                        if(typeof onAbort === "function"){
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

        showDeleteConfirmationDialog: function(onProceed, onAbort){

            var dialog = new sap.m.Dialog({
				title: TranslationUtil.translate("HINWEIS"),
				type: sap.m.DialogType.Message,
                state: sap.ui.core.ValueState.Warning,
                content: new sap.m.Text({
                    text: TranslationUtil.translate("LOESCHEN_HINWEIS")
                }),
                beginButton: new sap.m.Button({
                    text: TranslationUtil.translate("JA"),
                    press: function () {
                        dialog.close();
                        if(typeof onProceed === "function"){
                            onProceed();
                        }
                    }
                }),
				endButton: new sap.m.Button({
                    text: TranslationUtil.translate("NEIN"),
					press: function () {
						dialog.close();
                        if(typeof onAbort === "function"){
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

        showReeditConfirmationDialog: function(onProceed, onAbort){

            var dialog = new sap.m.Dialog({
				title: TranslationUtil.translate("HINWEIS"),
				type: sap.m.DialogType.Message,
                state: sap.ui.core.ValueState.Warning,
                content: new sap.m.Text({
                    text: TranslationUtil.translate("REEDIT_HINWEIS")
                }),
                beginButton: new sap.m.Button({
                    text: TranslationUtil.translate("JA"),
                    press: function () {
                        dialog.close();
                        if(typeof onProceed === "function"){
                            onProceed();
                        }
                    }
                }),
				endButton: new sap.m.Button({
                    text: TranslationUtil.translate("NEIN"),
					press: function () {
						dialog.close();
                        if(typeof onAbort === "function"){
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
            } else {
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

        checkLzFirstbreakLimit: function(viewRef) {
            var lzFirstbreak = this.getView().getModel("form").getProperty("/konditioneneinigung/LzFirstbreak");
            var result = true;

            if(lzFirstbreak && lzFirstbreak > 500) {
                viewRef.setValueState(sap.ui.core.ValueState.Error);
                viewRef.setValueStateText(TranslationUtil.translate("ERR_WERT_IST_ZU_GROSS"));
                result = false;
            }

            return result;
        },

        checkMzMonateLimit: function(viewRef) {
            var mzMonate = this.getView().getModel("form").getProperty("/konditioneneinigung/MzMonate");
            var result = true;

            if(mzMonate && mzMonate > 1000) {
                viewRef.setValueState(sap.ui.core.ValueState.Error);
                viewRef.setValueStateText(TranslationUtil.translate("ERR_WERT_IST_ZU_GROSS"));
                result = false;
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

            var idUeblicheIndizierung = this.getView().byId("idUeblicheIndizierung");
            if(idUeblicheIndizierung.getSelected() === false){
            	var idMaxLaufzeitInMonaten = this.getView().byId("idMaxLaufzeitInMonaten");
            	console.warn(idMaxLaufzeitInMonaten.getValue());
            	if(idMaxLaufzeitInMonaten.getValue() === "" || idMaxLaufzeitInMonaten.getValue() === "0,00"){
	                idMaxLaufzeitInMonaten.setValueState(sap.ui.core.ValueState.Error);
	                idMaxLaufzeitInMonaten.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
	                validationResult = false;
            	}
            }
            
            var idUeblicheMietsicherheit = this.getView().byId("idUeblicheMietsicherheit");
            if(idUeblicheMietsicherheit.getSelected() === false){
            	var idMietsicherheitAbsolut = this.getView().byId("idMietsicherheitAbsolut");
            	if(idMietsicherheitAbsolut.getValue() === ""){
	                idMietsicherheitAbsolut.setValueState(sap.ui.core.ValueState.Error);
	                idMietsicherheitAbsolut.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
	                validationResult = false;
            	}
            }
            
            /**
             * Cash-Intensives
             */
            var idSonstKNewEdit = this.getView().byId("idSonstKNewEdit");
            var InputCashIntensives = this.getView().byId("InputCashIntensives");
            var nSonstK = TranslationUtil.parseFloatLocale(idSonstKNewEdit.getValue());
            var nCashinc = TranslationUtil.parseFloatLocale(InputCashIntensives.getValue());
            if(isNaN(nCashinc) === false){
            	if(isNaN(nSonstK) === true) {
	                idSonstKNewEdit.setValueState(sap.ui.core.ValueState.Error);
	                idSonstKNewEdit.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
	                validationResult = false;
            	} else if(nSonstK < nCashinc) {
	                InputCashIntensives.setValueState(sap.ui.core.ValueState.Error);
	                InputCashIntensives.setValueStateText(TranslationUtil.translate("ERR_WERT_IST_ZU_GROSS"));
	                validationResult = false;
            	}
            } else {
            	if (isNaN(nSonstK) === false) {
	                InputCashIntensives.setValueState(sap.ui.core.ValueState.Error);
	                InputCashIntensives.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
	                validationResult = false;
            	}
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
            } else {
                validationResult = this.checkNotNegative(idLzFirstbreak) && this.checkLzFirstbreakLimit(idLzFirstbreak) && validationResult;
            }

            var idMzMonate = this.getView().byId("idMzMonate");
            if(idMzMonate.getValue() === "") {
                idMzMonate.setValueState(sap.ui.core.ValueState.Error);
                idMzMonate.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            } else {
                validationResult = this.checkNotNegative(idMzMonate) && this.checkMzMonateLimit(idMzMonate) && validationResult;
            }

            var inputVtrLfz = this.getView().byId("idVtrLfz");
            if(inputVtrLfz.getValue() === "") {
                inputVtrLfz.setValueState(sap.ui.core.ValueState.Error);
                inputVtrLfz.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            } else {
                validationResult = this.checkNotNegative(inputVtrLfz) && this.checkMzMonateLimit(inputVtrLfz) && validationResult;
            }

            var inputVerlOpt = this.getView().byId("idVerlOpt");
            if(inputVerlOpt.getValue() === "") {
                inputVerlOpt.setValueState(sap.ui.core.ValueState.Error);
                inputVerlOpt.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            } else {
                validationResult = this.checkNotNegative(inputVerlOpt) && this.checkMzMonateLimit(inputVerlOpt) && validationResult;
            }

            var inputVerlOptWdh = this.getView().byId("idVerlOptWdh");
            if(inputVerlOptWdh.getValue() === "") {
                inputVerlOptWdh.setValueState(sap.ui.core.ValueState.Error);
                inputVerlOptWdh.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            } else {
                validationResult = this.checkNotNegative(inputVerlOptWdh) && this.checkMzMonateLimit(inputVerlOptWdh) && validationResult;
            }

            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");

            var idMietflaechenangabenErrorBox = this.getView().byId("idMietflaechenangabenErrorBox");
            if(mietflaechenangabenTable.getItems().length < 1){
                idMietflaechenangabenErrorBox.setText("Bitte fügen Sie mindestens eine Mietfläche hinzu");
                idMietflaechenangabenErrorBox.setVisible(true);
                validationResult = false;
            }

            var HnflAlt_cellindex = mietflaechenangabenTable.indexOfColumn(this.getView().byId("idColHnflAlt"));
            var AnMiete_cellindex = mietflaechenangabenTable.indexOfColumn(this.getView().byId("idColAnMiete"));
            var GaKosten_cellindex = mietflaechenangabenTable.indexOfColumn(this.getView().byId("idColGaKosten"));
            var MaKosten_cellindex = mietflaechenangabenTable.indexOfColumn(this.getView().byId("idColMaKosten"));

            _.each(mietflaechenangabenTable.getItems(), function(item){

                var cells = item.getCells();
                var HnflAlt_cell = cells[HnflAlt_cellindex];
                var AnMiete_cell = cells[AnMiete_cellindex];
                var GaKosten_cell = cells[GaKosten_cellindex];
                var MaKosten_cell = cells[MaKosten_cellindex];

                if(AnMiete_cell.getValue() === ""){
                    AnMiete_cell.setValueState(sap.ui.core.ValueState.Error);
                    AnMiete_cell.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                    validationResult = false;
                }

                validationResult = that.checkNotNegative(HnflAlt_cell) && validationResult;
                validationResult = that.checkNotNegative(AnMiete_cell) && validationResult;
                validationResult = that.checkNotNegative(GaKosten_cell) && validationResult;
                validationResult = that.checkNotNegative(MaKosten_cell) && validationResult;

                if(parseFloat(AnMiete_cell.getValue()) < 0){
                    AnMiete_cell.setValueState(sap.ui.core.ValueState.Error);
                    AnMiete_cell.setValueStateText(TranslationUtil.translate("ERR_WERT_IST_NEGATIV"));
                    validationResult = false;
                }

                var mietflaechenangabe = item.getBindingContext("form").getObject();

                if(!isNaN(mietflaechenangabe.HnflAlt) && !isNaN(mietflaechenangabe.Hnfl) && (mietflaechenangabe.HnflAlt > (mietflaechenangabe.Hnfl * 1.2))) {
                    HnflAlt_cell.setValueState(sap.ui.core.ValueState.Error);
                    var errText = TranslationUtil.translate("ERR_MFALT_MAX");
                    HnflAlt_cell.setValueStateText(errText);
                    validationResult = false;
                }

            });

            var mkMonate = this.getView().byId("maklerkostenInMonatsmieten");
            validationResult = this.checkNotNegative(mkMonate) && validationResult;

            var mkAbsolut = this.getView().byId("maklerkostenAbsolut");
            validationResult = this.checkNotNegative(mkAbsolut) && validationResult;

            var bkMonate = this.getView().byId("beratungskostenInMonatsmieten");
            validationResult = this.checkNotNegative(bkMonate) && validationResult;

            var bkAbsolut = this.getView().byId("beratungskostenAbsolut");
            validationResult = this.checkNotNegative(bkAbsolut) && validationResult;
            
            var sonstK = this.getView().byId("idSonstKNewEdit");
            validationResult = this.checkNotNegative(sonstK) && validationResult;

            var sonstE = this.getView().byId("idSonstENewEdit");
            validationResult = this.checkNotNegative(sonstE) && validationResult;

            var steuerschaden = this.getView().byId("idSteuerschaden");
            validationResult = this.checkNotNegative(steuerschaden) && validationResult;

            var mwstkErtrag = this.getView().byId("idMwstkErtrag");
            validationResult = this.checkNotNegative(mwstkErtrag) && validationResult;

            var einmalertrag = this.getView().byId("einmalertrag");
            validationResult = this.checkNotNegative(einmalertrag) && validationResult;

            return validationResult;
        },

        onGueltigkeitVerlaengernButtonPress: function(){
            var _this = this;

			var dialog = new sap.m.Dialog({
				title: TranslationUtil.translate("HINWEIS"),
				type: sap.m.DialogType.Message,
                icon: "sap-icon://message-information",
				content: [
					new sap.m.Text({
                        text: "Bitte geben Sie das neue Gültigkeitsdatum der Konditioneneinigung an.",
                    }), //.addStyleClass("sapUiSmallMarginBottom")
                    new sap.m.DatePicker("idGueltigkeitsDatumDatePicker", {
                        placeholder: " ",
                        change: function(oEvent) {
							var validDate = oEvent.getParameter("valid");
                            var parent = oEvent.getSource().getParent();
							parent.getBeginButton().setEnabled(validDate);
						},
                    })
				],
				beginButton: new sap.m.Button({
                    text: TranslationUtil.translate("AKZEPTIEREN"),
                    enabled: false,
					press: function () {
                        var gueltigkeitsdatum = sap.ui.getCore().byId("idGueltigkeitsDatumDatePicker").getDateValue();

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

        onAbbrechenButtonPress: function(){
            var _this = this;

            var modus =_this.getView().getModel("form").getProperty("/modus");
            var ke = _this.getView().getModel("form").getProperty("/konditioneneinigung");

            MessageBox.confirm(TranslationUtil.translate("ABBRUCH_HINWEIS"), {
                title: TranslationUtil.translate("HINWEIS"),
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function(action){
                    if(action === sap.m.MessageBox.Action.YES){

                        // wenn modus == new    Navigation zurück
                        // wenn modus == edit   Ausgangszustand wiederherstellen, Sperre aufheben, modus = show

                        if(modus === "new") {
                            window.history.go(-1);
                        } else if(modus === "edit") {
                            DataProvider.deleteSperreAsync(ke.KeId, "").then(function(){
                                _this.getView().getModel("form").setData(_this._formDataBackup);
                                _this.getView().getModel("form").setProperty("/modus", "show");
                            })
                            .catch(function(oError){
                                 ErrorMessageUtil.showError(oError);
                            })
                            .done();
                        }

                    }
                }
            });
        },

        onMietflaechenAngabenLoeschenButtonPress: function(oEvent){

            var mietflaechenangabenToDelete = oEvent.getParameter("listItem").getBindingContext("form").getObject();
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");

            mietflaechenangaben = _.reject(mietflaechenangaben, function(mietflaechenangabe){
                return mietflaechenangabe.MoId === mietflaechenangabenToDelete.MoId;
            });

            this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);

            // Verteilen Button rot hervorheben
            this.getView().byId("idButtonAusbaukostenVerteilen").setType(sap.m.ButtonType.Reject);
        },

        onMietflaechenAngabeHinzufuegenButtonPress: function(){
            var _this = this;

            if (! this._mietflaechenSelektionDialog) {
                this._mietflaechenSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.MietflaechenSelektion", this);
                this.getView().addDependent(this._mietflaechenSelektionDialog);
            }

            var Bukrs = _this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs");
            var WeId = _this.getView().getModel("form").getProperty("/konditioneneinigung/WeId");

            DataProvider.readWirtschaftseinheitAsync(Bukrs, WeId).then(function(oData){
                var mietflaechenangaben = oData.WeToMo;

                var vorhandeneMietflaechenangaben = _this.getView().getModel("form").getProperty("/konditioneneinigung/KeToOb");

                var jsonData = {
                    mietflaechen: _.reject(mietflaechenangaben, function(mietflaechenangabe){
                        return _.some(vorhandeneMietflaechenangaben, function(vorhandeneMietflaechenangabe){
                            return mietflaechenangabe.MoId === vorhandeneMietflaechenangabe.MoId;
                        });
                    }),
                    WeCurrency: oData.Currency,
                    WeUnit: oData.Unit
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

                    var zeitMultiplikator = 1;
                    var zeitspannenId = this.getView().getModel("form").getProperty("/viewsettings/zeitspanneSelected/Id");
                    if(zeitspannenId === "J") {
                        zeitMultiplikator = 12;
                    }
                    var KeWaehrung = this.getView().getModel("form").getProperty("/viewsettings/waehrungSelectedKey");
                    var KeUnit = this.getView().getModel("form").getProperty("/viewsettings/flaecheneinheitSelectedKey");
                    var dialogModel = this._mietflaechenSelektionDialog.getModel();
                    var WeCurrency = dialogModel.getProperty("/WeCurrency");
                    var WeUnit = dialogModel.getProperty("/WeUnit");

                    if( WeCurrency !== KeWaehrung || WeUnit !== KeUnit) {
                        var _this = this;

                        var currenyMultiplicator = 1;
                        var unitMultiplicator    = 1;

                        var resolveFunction = function() {
                            selectedItems.forEach(function(item){
                                var mietflaechenangabe = item.getBindingContext().getObject();

                                var neueMiete = mietflaechenangabe.NhMiete *  currenyMultiplicator * zeitMultiplikator;
                                var neueFlaeche = mietflaechenangabe.Hnfl;
                                var neueEinheit = mietflaechenangabe.HnflUnit;

                                if( mietflaechenangabe.HnflUnit !== StaticData.UNIT.STUECK )
                                {
                                    neueEinheit = KeUnit;
                                    neueMiete   = neueMiete * 1 / unitMultiplicator;
                                    neueFlaeche = neueFlaeche * unitMultiplicator;
                                }

                                mietflaechenangaben.push({
                                    WeId: mietflaechenangabe.WeId,
                                    MoId: mietflaechenangabe.MoId,
                                    Bukrs: mietflaechenangabe.Bukrs,
                                    Bezei: mietflaechenangabe.Bezei,
                                    Nutzart: mietflaechenangabe.Nutzart,
                                    Hnfl: neueFlaeche,
                                    HnflAlt: mietflaechenangabe.HnflAlt,
                                    HnflUnit: neueEinheit,
                                    NhMiete: neueMiete,
                                    AnMiete: mietflaechenangabe.AnMiete,
                                    GaKosten: mietflaechenangabe.GaKosten,
                                    MaKosten: mietflaechenangabe.MaKosten,
                                    Whrung: mietflaechenangabe.Whrung,

                                    MfSplit: false,
                                    KeId: ke.KeId,
                                    MonatJahr: ke.MonatJahr
                                });
                            });

                            _this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);

                            // Verteilen Button rot hervorheben
                            _this.getView().byId("idButtonAusbaukostenVerteilen").setType(sap.m.ButtonType.Reject);
                        }

                        if( WeCurrency !== KeWaehrung && WeUnit !== KeUnit ) { // beides umrechnen
                            DataProvider.readExchangeRateSetAsync(WeCurrency).then(function(waehrungen){
                                if(waehrungen.length > 0){
                                    var ausgangsWaehrung = _.find(waehrungen, function(waehrung){
                                        return waehrung.Nach === KeWaehrung;
                                    });

                                    if(ausgangsWaehrung){
                                        currenyMultiplicator = ausgangsWaehrung.Multiplikator;
                                    }
                                }
                                return DataProvider.readFlaecheSetAsync(WeUnit);
                            })
                            .then(function(flaecheneinheiten){
                                if(flaecheneinheiten.length > 0){
                                    var ausgangsFlaecheneinheit = _.find(flaecheneinheiten, function(flaecheneinheit){
                                        return flaecheneinheit.Nach === KeUnit;
                                    });

                                    if(ausgangsFlaecheneinheit){
                                        unitMultiplicator = ausgangsFlaecheneinheit.Multiplikator;
                                    }
                                }
                                resolveFunction();
                            })
                            .catch(function(){
                            })
                            .done();
                        }
                        else if( WeCurrency !== KeWaehrung ) { // Waehrung umrechnen
                            DataProvider.readExchangeRateSetAsync(WeCurrency).then(function(waehrungen){
                                if(waehrungen.length > 0){
                                    var ausgangsWaehrung = _.find(waehrungen, function(waehrung){
                                        return waehrung.Nach === KeWaehrung;
                                    });

                                    if(ausgangsWaehrung){
                                        currenyMultiplicator = ausgangsWaehrung.Multiplikator;
                                    }
                                }
                                resolveFunction();
                            })
                            .catch(function(){
                            })
                            .done();
                        }
                        else { // fläche umrechnen
                            DataProvider.readFlaecheSetAsync(WeUnit).then(function(flaecheneinheiten){
                                if(flaecheneinheiten.length > 0){
                                    var ausgangsFlaecheneinheit = _.find(flaecheneinheiten, function(flaecheneinheit){
                                        return flaecheneinheit.Nach === KeUnit;
                                    });

                                    if(ausgangsFlaecheneinheit){
                                        unitMultiplicator = ausgangsFlaecheneinheit.Multiplikator;
                                    }
                                }
                                resolveFunction();
                            })
                            .catch(function(){
                            })
                            .done();
                        }
                    }
                    else
                    {
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
                                NhMiete: mietflaechenangabe.NhMiete * zeitMultiplikator,
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

        onAusbaukostenVerteilenButtonPress: function(){
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

        onAusbaukostenVerteilenFragmentAkzeptierenButtonPress: function(){

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
                        mietflaechenangabe.GaKosten = (parseFloat(mietflaechenangabe.Hnfl) / sumNutzflaechen * verteilung.grundausbaukosten / parseFloat(mietflaechenangabe.Hnfl)).toString();
                        mietflaechenangabe.MaKosten = (parseFloat(mietflaechenangabe.Hnfl) / sumNutzflaechen * verteilung.mietausbaukosten  / parseFloat(mietflaechenangabe.Hnfl)).toString();
                    }
                    else
                    {
                        mietflaechenangabe.GaKosten = (parseFloat(mietflaechenangabe.HnflAlt) / sumNutzflaechen * verteilung.grundausbaukosten  / parseFloat(mietflaechenangabe.HnflAlt)).toString();
                        mietflaechenangabe.MaKosten = (parseFloat(mietflaechenangabe.HnflAlt) / sumNutzflaechen * verteilung.mietausbaukosten   / parseFloat(mietflaechenangabe.HnflAlt)).toString();
                    }
                }
            });

            // Runden
            mietflaechenangaben.forEach(function(mietflaechenangabe) {
                mietflaechenangabe.GaKosten = (Math.floor(mietflaechenangabe.GaKosten * 100) / 100).toFixed(2);
                mietflaechenangabe.MaKosten = (Math.floor(mietflaechenangabe.MaKosten * 100) / 100).toFixed(2);
            });

            this.getView().getModel("form").setProperty("/konditioneneinigung/KeToOb", mietflaechenangaben);

            // Verteilen Button normal stylen
            this.getView().byId("idButtonAusbaukostenVerteilen").setType(sap.m.ButtonType.Default);
        },

        onAusbaukostenVerteilenFragmentAbbrechenButtonPress: function(){
            this._ausbaukostenVerteilenDialog.close();
        },

        onDruckenButtonPress: function(){
            var konditioneneinigung = this.getView().getModel("form").getProperty("/konditioneneinigung");
            var kostenarten = this.getView().getModel("form").getProperty("/kostenarten");
            var ertragsarten = this.getView().getModel("form").getProperty("/ertragsarten");

            PrinterUtil.printKonditioneneinigung(konditioneneinigung, kostenarten, ertragsarten);
        },

        onBeschlussantragButtonPress: function(){
            var konditioneneinigung = this.getView().getModel("form").getProperty("/konditioneneinigung");
            PrinterUtil.printBeschlussantrag(konditioneneinigung);
        },

        onUebernehmenButtonPress: function(){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

            DataProvider.updateKonditioneneinigungAsync(ke.KeId, ke.Bukrs, {
                KeId: ke.KeId,
                Bukrs: ke.Bukrs,
                Anmerkung: "15",
                Bemerkung: ke.Bemerkung,
                Confirmation: ke.Confirmation
            })
            .then(function(){
                _this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === "WARNING"){
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

        onFavoritButtonPress: function(){
            var _this = this;
            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

            var promise = ke.Favorit ? DataProvider.deleteFavoritAsync(ke.KeId, "") : DataProvider.createFavoritAsync({KeId: ke.KeId});

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

        onZurGenehmigungVorlegenButtonPress: function(){
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

                if(error.type === "WARNING"){
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

        onGenehmigungZurueckziehenButtonPress: function(){
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
					new sap.m.TextArea("idGenehmigungZurueckziehenBegruendungTextArea", {
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter("value");
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

                        var sText = sap.ui.getCore().byId("idGenehmigungZurueckziehenBegruendungTextArea").getValue();

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

                            if(error.type === "WARNING"){
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

        onGenehmigungsprozessButtonPress: function(){

            var ke = this.getView().getModel("form").getProperty("/konditioneneinigung");

			this.getOwnerComponent().getRouter().navTo("konditioneneinigungGenehmigung", {
                KeId: ke.KeId,
                Bukrs: ke.Bukrs
            }, true);
        },

        onNichtGenehmigenButtonPress: function(){
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
                    title: TranslationUtil.translate("HINWEIS"),
                    onClose: function(){
                        _this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
                    }
                });

                //_this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === "WARNING"){
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

        onGenehmigenButtonPress: function(){
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
                    title: TranslationUtil.translate("HINWEIS"),
                    onClose: function(){
                        _this.getOwnerComponent().getRouter().navTo("konditioneneinigungSelektion", null, true);
                    }
                });

                //_this.konditioneneinigungAnzeigen(ke.KeId, ke.Bukrs);

            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === "WARNING"){
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

        onReeditButtonPress: function(){
            var _this = this;
            this.showReeditConfirmationDialog(function(){
                var ke = _this.getView().getModel("form").getProperty("/konditioneneinigung");

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

                    if(error.type === "WARNING"){
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
            });
        },

        onReaktivierenButtonPress: function(){
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

                if(error.type === "WARNING"){
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


        onLoeschenButtonPress: function(){
            var _this = this;
            this.showDeleteConfirmationDialog(function(){
                var ke = _this.getView().getModel("form").getProperty("/konditioneneinigung");

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

                    if(error.type === "WARNING"){
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
            });
        },

        onMappingPressed: function(oEvent){
			this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetDetails", {
                VaId: oEvent.getSource().getBindingContext("form").getObject().VaId,
                Bukrs: this.getView().getModel("form").getProperty("/konditioneneinigung/Bukrs")
            }, true);
        },

        onBemerkungLiveChange: function(oEvent){
            var textArea = oEvent.getSource();
            var text = textArea.getValue();
            if(text && text.length > 2800) {
                textArea.setValueState(sap.ui.core.ValueState.Warning);
                textArea.setValueStateText(TranslationUtil.translate("ERR_BERMERKUNG_ZU_LANG"));
            } else {
                textArea.setValueState(sap.ui.core.ValueState.None);
            }
        },
        
        onSelectMauebIndex: function(oEvent) {
        	if (oEvent.getParameter('selected') === true) {
            	var ke = this.getView().getModel("form").setProperty("/konditioneneinigung/MaxLfz", null);
        	}
        }

	});
});