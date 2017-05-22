/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:43:47 
 * @Last Modified by: Christian Hoff (best practice consulting AG)
 * @Last Modified time: 2017-04-10 21:56:24
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller", 
    "sap/m/MessageBox", 
    "ag/bpc/Deka/util/PrinterUtil",
    "sap/ui/model/Filter",
    "ag/bpc/Deka/util/NavigationPayloadUtil",
    "ag/bpc/Deka/util/DataProvider",
    "ag/bpc/Deka/util/StaticData",
    "ag/bpc/Deka/util/ErrorMessageUtil",
    "ag/bpc/Deka/util/TranslationUtil",
    "ag/bpc/Deka/model/CustomNumberType"], function (Controller, MessageBox, PrinterUtil, Filter, NavigationPayloadUtil, DataProvider, StaticData, ErrorMessageUtil, TranslationUtil) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.VermietungsaktivitaetDetails", {        
		onInit: function(evt){            
            var _this = this;
            
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
            this.getView().setModel(sap.ui.getCore().getModel("text"), "text");
			
            // View nach oben Scrollen, da die Scrollposition von vorherigen Anzeigen übernommen wird
            this.getView().addEventDelegate({
                onAfterShow: function(oEvent) {
                    _this.getView().byId("idVermietungsaktivitaetDetails").scrollTo(0, 0);
                }
            });

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

                statuswerte: null,
                anmerkungen: null,
                nutzungsarten: null,
                vermietungsarten: null,
                kostenarten: null,
                ertragsarten: null,

                viewsettings: null
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            this.getView().setModel(formModel, "form");
        },

        initializeViewsettingsAsync: function(vermietungsaktivitaet){

            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                var viewsettings = {};

                var ausgangsZeitspanneKey = vermietungsaktivitaet.MonatJahr;
                var ausgangsWaehrungKey = vermietungsaktivitaet.Currency;
                var ausgangsFlaecheneinheitKey = vermietungsaktivitaet.Unit;

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

		onVermietungsaktivitaetAnzeigen: function(oEvent){
            var Bukrs = oEvent.getParameter("arguments").Bukrs;
            var VaId = oEvent.getParameter("arguments").VaId;
            this.vermietungsaktivitaetAnzeigen(VaId, Bukrs);
		},

        vermietungsaktivitaetAnzeigen: function(VaId, Bukrs){
            var _this = this;

            _this.initializeValidationState();
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "show");

            DataProvider.readVermietungsaktivitaetAsync(Bukrs, VaId)
            .then(function(vermietungsaktivitaet){
                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);
                return _this.initializeViewsettingsAsync(vermietungsaktivitaet);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'VA';
                }));
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                var va = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

                var filteredAnmerkungen = _.filter(anmerkungen, function(anmerkung){
                    return anmerkung.Stid === va.Status;
                });

                _this.getView().getModel("form").setProperty("/anmerkungen", filteredAnmerkungen);
                return Q.when(StaticData.NUTZUNGSARTEN);
            })
            .then(function(nutzungsarten){
                var nutzungsartenNew = _.clone(nutzungsarten);
                nutzungsartenNew.unshift({NaId: '', TextSh: ''});
                _this.getView().getModel("form").setProperty("/nutzungsarten", nutzungsartenNew);
                return Q.when(StaticData.VERMIETUNGSARTEN);
            })
            .then(function(vermietungsarten){
                _this.getView().getModel("form").setProperty("/vermietungsarten", vermietungsarten);
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onVermietungsaktivitaetAnlegenRegelvermietung: function(oEvent){
            var _this = this;

            var keKeys = NavigationPayloadUtil.takePayload();

            if(!keKeys){
                this.onBack(null);
                return;
            }

            _this.initializeValidationState();
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "new");

            // Einzelnen Konditioneneinigungen laden
            var promises = _.map(keKeys, function(keKey){
                return DataProvider.readKonditioneneinigungAsync(keKey.Bukrs, keKey.KeId);
            });

            // Wenn alle Konditioneneinigungen erfolgreich geladen wurden
            Q.all(promises).then(function(konditioneneinigungen){

                var vermietungsaktivitaet = _this.newVermietungsaktivitaet();
                
                vermietungsaktivitaet.VaToWe = konditioneneinigungen[0].KeToWe;
                vermietungsaktivitaet.WeId = vermietungsaktivitaet.VaToWe.WeId;
                vermietungsaktivitaet.Bukrs = vermietungsaktivitaet.VaToWe.Bukrs;
                vermietungsaktivitaet.Unit = vermietungsaktivitaet.VaToWe.Unit;
                vermietungsaktivitaet.Currency = vermietungsaktivitaet.VaToWe.Currency;

                vermietungsaktivitaet.Kategorie = StaticData.KATEGORIE.VA.REGELVERMIETUNG;

                // Objekte aller selektierten KEs zur VA hinzufügen. Metadaten bereinigen
                vermietungsaktivitaet.VaToOb = _.flatten(_.map(konditioneneinigungen, function(konditioneneinigung){
                    return _.map(konditioneneinigung.KeToOb, function(objekt){
                        delete objekt.__metadata;
                        objekt.NutzartAlt = '';
                        return objekt;
                    });
                }), true);
                
                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);

                return _this.initializeViewsettingsAsync(vermietungsaktivitaet);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'VA';
                }));
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                var va = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

                var filteredAnmerkungen = _.filter(anmerkungen, function(anmerkung){
                    return anmerkung.Stid === va.Status;
                });

                _this.getView().getModel("form").setProperty("/anmerkungen", filteredAnmerkungen);
                return Q.when(StaticData.NUTZUNGSARTEN);
            })
            .then(function(nutzungsarten){
                var nutzungsartenNew = _.clone(nutzungsarten);
                nutzungsartenNew.unshift({NaId: '', TextSh: ''});
                _this.getView().getModel("form").setProperty("/nutzungsarten", nutzungsartenNew);
                return Q.when(StaticData.VERMIETUNGSARTEN);
            })
            .then(function(vermietungsarten){
                _this.getView().getModel("form").setProperty("/vermietungsarten", vermietungsarten);
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

		onVermietungsaktivitaetAnlegenKleinvermietung: function(oEvent){
            var _this = this;

            var weKey = NavigationPayloadUtil.takePayload();

            if(!weKey){
                _this.onBack(null);
                return;
            }

            _this.initializeValidationState();
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "new");

            DataProvider.readWirtschaftseinheitAsync(weKey.Bukrs, weKey.WeId)
            .then(function(wirtschaftseinheit){

                var vermietungsaktivitaet = _this.newVermietungsaktivitaet();
                
                vermietungsaktivitaet.VaToWe = wirtschaftseinheit;
                vermietungsaktivitaet.WeId = vermietungsaktivitaet.VaToWe.WeId;
                vermietungsaktivitaet.Bukrs = vermietungsaktivitaet.VaToWe.Bukrs;
                vermietungsaktivitaet.Unit = vermietungsaktivitaet.VaToWe.Unit;
                vermietungsaktivitaet.Currency = vermietungsaktivitaet.VaToWe.Currency;

                vermietungsaktivitaet.Kategorie = StaticData.KATEGORIE.VA.KLEINVERMIETUNG;

                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);

                return _this.initializeViewsettingsAsync(vermietungsaktivitaet);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'VA';
                }));
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                var va = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

                var filteredAnmerkungen = _.filter(anmerkungen, function(anmerkung){
                    return anmerkung.Stid === va.Status;
                });

                _this.getView().getModel("form").setProperty("/anmerkungen", filteredAnmerkungen);
                return Q.when(StaticData.NUTZUNGSARTEN);
            })
            .then(function(nutzungsarten){
                var nutzungsartenNew = _.clone(nutzungsarten);
                nutzungsartenNew.unshift({NaId: '', TextSh: ''});
                _this.getView().getModel("form").setProperty("/nutzungsarten", nutzungsartenNew);
                return Q.when(StaticData.VERMIETUNGSARTEN);
            })
            .then(function(vermietungsarten){
                _this.getView().getModel("form").setProperty("/vermietungsarten", vermietungsarten);
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();
		},

        onVermietungsaktivitaetAnlegenExterneVermietung: function(oEvent){
            var _this = this;

            var weKey = NavigationPayloadUtil.takePayload();

            if(!weKey){
                _this.onBack(null);
                return;
            }

            _this.initializeValidationState();
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "new");

            DataProvider.readWirtschaftseinheitAsync(weKey.Bukrs, weKey.WeId)
            .then(function(wirtschaftseinheit){

                var vermietungsaktivitaet = _this.newVermietungsaktivitaet();
                
                vermietungsaktivitaet.VaToWe = wirtschaftseinheit;
                vermietungsaktivitaet.WeId = vermietungsaktivitaet.VaToWe.WeId;
                vermietungsaktivitaet.Bukrs = vermietungsaktivitaet.VaToWe.Bukrs;
                vermietungsaktivitaet.Unit = vermietungsaktivitaet.VaToWe.Unit;
                vermietungsaktivitaet.Currency = vermietungsaktivitaet.VaToWe.Currency;

                vermietungsaktivitaet.Kategorie = StaticData.KATEGORIE.VA.EXTERNE_VERMIETUNG;

                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);

                return _this.initializeViewsettingsAsync(vermietungsaktivitaet);
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'VA';
                }));
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                var va = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

                var filteredAnmerkungen = _.filter(anmerkungen, function(anmerkung){
                    return anmerkung.Stid === va.Status;
                });

                _this.getView().getModel("form").setProperty("/anmerkungen", filteredAnmerkungen);
                return Q.when(StaticData.NUTZUNGSARTEN);
            })
            .then(function(nutzungsarten){
                var nutzungsartenNew = _.clone(nutzungsarten);
                nutzungsartenNew.unshift({NaId: '', TextSh: ''});
                _this.getView().getModel("form").setProperty("/nutzungsarten", nutzungsartenNew);
                return Q.when(StaticData.VERMIETUNGSARTEN);
            })
            .then(function(vermietungsarten){
                _this.getView().getModel("form").setProperty("/vermietungsarten", vermietungsarten);
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();
        },

        onVermietungsaktivitaetAnlegenExcelImport: function(oEvent){
            var _this = this;

            var vermietungsaktivitaet = NavigationPayloadUtil.takePayload();
            
            if(!vermietungsaktivitaet){
                this.onBack(null);
                return;
            }
            
            _this.initializeEmptyModel();
            _this.getView().getModel("form").setProperty("/modus", "new"); 
            _this.getView().getModel("form").setProperty("/vermietungsaktivitaet", vermietungsaktivitaet);            
         
            DataProvider.readWirtschaftseinheitAsync(vermietungsaktivitaet.Bukrs, vermietungsaktivitaet.WeId)
            .then(function(wirtschaftseinheit){                
                vermietungsaktivitaet.VaToWe = wirtschaftseinheit;
                vermietungsaktivitaet.Unit = vermietungsaktivitaet.VaToWe.Unit;
                vermietungsaktivitaet.Currency = vermietungsaktivitaet.VaToWe.Currency; 

                return _this.initializeViewsettingsAsync(vermietungsaktivitaet);             
            })
            .then(function(){
                return Q.when(StaticData.STATUSWERTE);
            })
            .then(function(statuswerte){
                _this.getView().getModel("form").setProperty("/statuswerte", _.filter(statuswerte, function(statuswert){
                    return statuswert.FlgKeVa === 'VA';
                }));
                return Q.when(StaticData.ANMERKUNGEN);
            })
            .then(function(anmerkungen){
                var va = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

                var filteredAnmerkungen = _.filter(anmerkungen, function(anmerkung){
                    return anmerkung.Stid === va.Status;
                });

                _this.getView().getModel("form").setProperty("/anmerkungen", filteredAnmerkungen);
                return Q.when(StaticData.NUTZUNGSARTEN);
            })
            .then(function(nutzungsarten){
                var nutzungsartenNew = _.clone(nutzungsarten);
                nutzungsartenNew.unshift({NaId: '', TextSh: ''});
                _this.getView().getModel("form").setProperty("/nutzungsarten", nutzungsartenNew);
                return Q.when(StaticData.VERMIETUNGSARTEN);
            })
            .then(function(vermietungsarten){
                _this.getView().getModel("form").setProperty("/vermietungsarten", vermietungsarten);
                return Q.when(StaticData.ERTRAGSARTEN);
            })
            .then(function(ertragsarten){
                _this.getView().getModel("form").setProperty("/ertragsarten", ertragsarten);
                return Q.when(StaticData.KOSTENARTEN);
            })
            .then(function(kostenarten){
                _this.getView().getModel("form").setProperty("/kostenarten", kostenarten);
            })
            .catch(function(oError){
                console.log(oError);
                ErrorMessageUtil.showError(oError);
            })
            .done();
            
            // Vermietungsobjekte auslesen und mit importierten Daten ergänzen          
            var bukr = vermietungsaktivitaet.Bukrs;
            var weId = vermietungsaktivitaet.WeId;
           
            this.readMietobjektSetAsync(bukr,weId)
            .then(function(mietobjekte) {
                var mietflaechenangaben = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");

                _.map(mietflaechenangaben, function(mietflaechenangabe){
                    _.map(mietobjekte, function(mietobjekt){
                        if(mietobjekt.MoId === mietflaechenangabe.MoId){
                            mietflaechenangabe.Bukrs = mietobjekt.Bukrs;
                            mietflaechenangabe.WeId = mietobjekt.WeId;
                            mietflaechenangabe.Nutzart = mietobjekt.Nutzart;
                            mietflaechenangabe.NhMiete = mietobjekt.NhMiete;
                            mietflaechenangabe.Bezei = mietobjekt.Bezei;
                            mietflaechenangabe.Hnfl = mietobjekt.Hnfl;
                            mietflaechenangabe.HnflUnit = mietobjekt.HnflUnit;
                        }
                    });
                });

                var va = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet");
                var objekte = [];
                // Umwandlung Mietobjekt -> Objekt
                mietflaechenangaben.forEach(function(mietobjekt){
                    objekte.push({
                        WeId: mietobjekt.WeId,
                        MoId: mietobjekt.MoId,
                        KeId: "",
                        Bukrs: mietobjekt.Bukrs,
                        Bezei: mietobjekt.Bezei ? mietobjekt.Bezei : null,
                        Nutzart: mietobjekt.Nutzart,
                        NutzartAlt: mietobjekt.NutzartAlt ? mietobjekt.NutzartAlt : null,
                        Hnfl: mietobjekt.Hnfl,
                        HnflAlt: mietobjekt.HnflAlt ? mietobjekt.HnflAlt : null,
                        HnflUnit: mietobjekt.HnflUnit,
                        NhMiete: mietobjekt.NhMiete,
                        AnMiete: mietobjekt.AnMiete,
                        GaKosten: mietobjekt.GaKosten,
                        MaKosten: mietobjekt.MaKosten,
                        Whrung: mietobjekt.Whrung,
                        MfSplit: (mietobjekt.MfSplit === "X") ? true : false,
                        VaId: va.VaId,
                        MonatJahr: va.MonatJahr
                    });
                });

                _this.getView().getModel("form").setProperty("vermietungsaktivitaet/VaToOb", objekte);
            })
            .done();            
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

        onStatusSelektionChange: function(oEvent){
            var _this = this;

            var va = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet");
            
            Q.when(StaticData.ANMERKUNGEN).then(function(anmerkungen){
                var filteredAnmerkungen = _.filter(anmerkungen, function(anmerkung){
                    return anmerkung.Stid === va.Status;
                });
                _this.getView().getModel("form").setProperty("/anmerkungen", filteredAnmerkungen);
                _this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Anmerkung", filteredAnmerkungen[0].Id);
            });
        },
        
		onBearbeitenButtonPress: function(oEvent){
            var _this = this;

            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

            DataProvider.createSperreAsync({VaId: va.VaId})
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

        onBack: function(oEvent) {
            var modus = this.getView().getModel("form").getProperty("/modus"); 
            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

            if(modus === "edit") {
                DataProvider.deleteSperreAsync('', va.VaId);
            }

            this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetSelektion", null, true);
        },

        handleTableSettingsButton: function(oEvent){

            // create popover
			if (! this._tableViewSettingsPopover) {
				this._tableViewSettingsPopover = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetUnitsPopover", this);
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

            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");
            var VaToOb = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
            _.map(VaToOb, function(object){
                if(zeitspanne.Id === "J"){
                    object.NhMiete = object.NhMiete * 12;
                }
                if(zeitspanne.Id === "M"){
                    object.NhMiete = object.NhMiete / 12;
                }
            });

            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", VaToOb);
        },

        onPopoverFlaecheneinheitSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var flaecheneinheit = item.getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/viewsettings/flaecheneinheitSelected", flaecheneinheit);

            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");
            var VaToOb = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
            _.map(VaToOb, function(object){
                var neueFlaeche = (Math.round(object.Hnfl * flaecheneinheit.Multiplikator * 100) / 100);
                object.Hnfl = neueFlaeche;
                object.HnflUnit = flaecheneinheit.Nach;
            });
        },

        onPopoverWaehrungSelect: function(oEvent){
            var item = oEvent.getParameter("selectedItem");
            var waehrung = item.getBindingContext("form").getObject();

            this.getView().getModel("form").setProperty("/viewsettings/waehrungSelected", waehrung);

            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");
            var VaToOb = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
            _.map(VaToOb, function(object){
                var neueMiete = Math.round(object.NhMiete * waehrung.Multiplikator * 100) / 100;
                object.NhMiete = neueMiete;
                object.Whrung = waehrung.Nach;
            });
        },

        // Deprecated
        ___onSpeichernButtonPress: function(evt){            
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

        onNutzartAltChange: function(oEvent){
            var source = oEvent.getSource();
            var selKey = source.getSelectedKey();

            // Bei Parken die entsprechenden felder leeren
            if(selKey === "0700" || selKey === "0750") {
                var parent = source.getParent();
                var cells = parent.getCells();

                var GaKostenFeld = cells[9];
                var MaKostenFeld = cells[10];

                // Beide Felder leeren
                GaKostenFeld.setValue("");
                MaKostenFeld.setValue("");
            }
        },

        onSpeichernButtonPress: function(oEvent){                      
            var validationSuccess = this.validateForm();
        
            if(validationSuccess){
                this.speichern();
            }
            else {
                MessageBox.error(TranslationUtil.translate("VALIDATION_FAILED"));
            }
        },
		
        speichern: function(){

            var modus = this.getView().getModel("form").getProperty("/modus");   

            switch(modus)
            {
                case "new":
                    this.vermietungsaktivitaetAnlegen();
                break;

                case "edit":
                    this.vermietungsaktivitaetAktualisieren();
                break;

                default:
                break;
            }
        },

        vermietungsaktivitaetAnlegen: function(){
            var _this = this;

            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");
            
            var payload = {
                Action: 'CRE',

                Bukrs: va.Bukrs,
                WeId: va.WeId,

                Kategorie: va.Kategorie,

                Vermietungsart: va.Vermietungsart,

                Dienstleister: va.Dienstleister ? va.Dienstleister : null,
                
                Debitor: va.Debitor ? va.Debitor : null,
                Debitorname: va.Debitorname,

                Mietbeginn: va.Mietbeginn,
                LzFirstbreak: va.LzFirstbreak.toString(),
                
                MzMonate: va.MzMonate ? va.MzMonate.toString() : null,
                MzErsterMonat: va.MzErsterMonat,
                MzAnzahlJ: va.MzAnzahlJ ? va.MzAnzahlJ.toString() : null,

                MkMonate: va.MkMonate ? va.MkMonate.toString() : null,
                MkAbsolut: va.MkAbsolut ? va.MkAbsolut.toString() : null,

                BkMonate: va.BkMonate ? va.BkMonate.toString() : null,
                BkAbsolut: va.BkAbsolu ? va.BkAbsolut.toString() : null,

                ArtKosten: va.ArtKosten,
                SonstK: va.SonstK ? va.SonstK.toString() : null,
                ArtErtrag: va.ArtErtrag,
                SonstE: va.SonstE ? va.SonstE.toString() : null,

                AkErsterMonat: va.AkErsterMonat,
                AkAnzahlM: va.AkAnzahlM ? va.AkAnzahlM.toString() : null,

                Poenale: va.Poenale ? va.Poenale.toString() : null,
                IdxWeitergabe: va.IdxWeitergabe ? va.IdxWeitergabe.toString() : null,
                PLRelevant: va.PLRelevant ? true : false,

                Status: va.Status,
                Anmerkung: va.Anmerkung,
                Bemerkung: va.Bemerkung,
                
                MonatJahr: va.MonatJahr,
                Currency: va.Currency,
                Unit: va.Unit,

                VaToOb: _.map(va.VaToOb, function(objekt){
                    delete objekt.__metadata;
                    objekt.HnflAlt = objekt.HnflAlt ? objekt.HnflAlt.toString() : null;
                    objekt.NutzartAlt = objekt.NutzartAlt ? objekt.NutzartAlt.toString() : null;
                    objekt.AnMiete = objekt.AnMiete ? objekt.AnMiete.toString() : "0.00";
                    objekt.GaKosten = objekt.GaKosten ? objekt.GaKosten.toString() : "0.00";
                    objekt.MaKosten = objekt.MaKosten ? objekt.MaKosten.toString() : "0.00";
                    objekt.NhMiete = objekt.NhMiete ?  objekt.NhMiete.toString() : "0.00";
                    return objekt;
                }),

                Confirmation: va.Confirmation ? va.Confirmation : false
            };

            DataProvider.createVermietungsaktivitaetAsync(payload).then(function(oData){
                // _this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetSelektion", null, true);
                _this.vermietungsaktivitaetAnzeigen(oData.VaId, oData.Bukrs);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Confirmation", true);
                        _this.speichern();
                    });
                }
                else {
                    ErrorMessageUtil.show(error);
                }
            })
            .done();
        },

        vermietungsaktivitaetAktualisieren: function(){
            var _this = this;

            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

            var payload = {
                Action: 'UPD',

                VaId: va.VaId,
                Bukrs: va.Bukrs,
                WeId: va.WeId,

                Kategorie: va.Kategorie,

                Vermietungsart: va.Vermietungsart,

                Dienstleister: va.Dienstleister ? va.Dienstleister : null,
                
                Debitor: va.Debitor ? va.Debitor : null,
                Debitorname: va.Debitorname,

                Mietbeginn: va.Mietbeginn,
                LzFirstbreak: va.LzFirstbreak.toString(),
                
                MzMonate: va.MzMonate ? va.MzMonate.toString() : null,
                MzErsterMonat: va.MzErsterMonat,
                MzAnzahlJ: va.MzAnzahlJ ? va.MzAnzahlJ.toString() : null,

                MkMonate: va.MkMonate ? va.MkMonate.toString() : null,
                MkAbsolut: va.MkAbsolut ? va.MkAbsolut.toString() : null,

                BkMonate: va.BkMonate ? va.BkMonate.toString() : null,
                BkAbsolut: va.BkAbsolut ? va.BkAbsolut.toString() : null,

                ArtKosten: va.ArtKosten,
                SonstK: va.SonstK ? va.SonstK.toString() : null,
                ArtErtrag: va.ArtErtrag,
                SonstE: va.SonstE ? va.SonstE.toString() : null,

                AkErsterMonat: va.AkErsterMonat,
                AkAnzahlM: va.AkAnzahlM ? va.AkAnzahlM.toString() : null,

                Poenale: va.Poenale ? va.Poenale.toString() : null,
                IdxWeitergabe: va.IdxWeitergabe ? va.IdxWeitergabe.toString() : null,
                PLRelevant: va.PLRelevant,

                Status: va.Status,
                Anmerkung: va.Anmerkung,
                Bemerkung: va.Bemerkung,
                
                MonatJahr: va.MonatJahr,
                Currency: va.Currency,
                Unit: va.Unit,

                VaToOb: _.map(va.VaToOb, function(objekt){
                    delete objekt.__metadata;
                    objekt.HnflAlt = objekt.HnflAlt ? objekt.HnflAlt.toString() : null;
                    objekt.NutzartAlt = objekt.NutzartAlt ? objekt.NutzartAlt.toString() : null;
                    objekt.AnMiete = objekt.AnMiete ? objekt.AnMiete.toString() : "0.00";
                    objekt.GaKosten = objekt.GaKosten ? objekt.GaKosten.toString() : "0.00";
                    objekt.MaKosten = objekt.MaKosten ? objekt.MaKosten.toString() : "0.00";
                    objekt.NhMiete = objekt.NhMiete ?  objekt.NhMiete.toString() : "0.00";
                    return objekt;
                }),

                Confirmation: va.Confirmation
            };

            DataProvider.createVermietungsaktivitaetAsync(payload).then(function(){
                return DataProvider.deleteSperreAsync('', va.VaId);
            }).then(function(){
                _this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetSelektion", null, true);
            })
            .catch(function(oError){
                var error = ErrorMessageUtil.parseErrorMessage(oError);

                if(error.type === 'WARNING'){
                    _this.showConfirmationDialog(error, function(){
                        _this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Confirmation", true);
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

        validateForm: function(){
            var that = this;
            this.initializeValidationState();

            var validationResult = true;

            var idMietername = this.getView().byId("idMietername");
            if(idMietername.getValue() === ""){
                idMietername.setValueState(sap.ui.core.ValueState.Error);
                idMietername.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT")); 
                validationResult = false;
            }

            var idMzMonate = this.getView().byId("idMzMonate");
            if(parseFloat(idMzMonate.getValue()) < 0){
                idMzMonate.setValueState(sap.ui.core.ValueState.Error);
                idMzMonate.setValueStateText(TranslationUtil.translate("ERR_WERT_IST_NEGATIV"));
                validationResult = false;
            }
            
            var idMietbeginn = this.getView().byId("idMietbeginn");
            if(idMietbeginn.getDateValue() === null){
                idMietbeginn.setValueState(sap.ui.core.ValueState.Error);
                idMietbeginn.setValueStateText(TranslationUtil.translate("ERR_FEHLENDES_DATUM"));
                validationResult = false;
            }
            // else if(idMietbeginn.getDateValue() < Date.now())
            // {
            //     idMietbeginn.setValueState(sap.ui.core.ValueState.Error);
            //     idMietbeginn.setValueStateText(TranslationUtil.translate("ERR_UNGUELTIGES_DATUM")); 
            //     validationResult = false;
            // }

            // Bei externer Vermietung muss ein Dienstleister angegeben werden
            var idDienstleister = this.getView().byId("idDienstleister");
            var vermietungsart = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/Vermietungsart");
            var extVermietung = "03";
            if(vermietungsart === extVermietung && idDienstleister.getValue() === "") {
                idDienstleister.setValueState(sap.ui.core.ValueState.Error);
                idDienstleister.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            }

            var vatoob = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            var rows = mietflaechenangabenTable.getItems();
            var i;
            for(i = 0; i < rows.length; i = i+1){
                var row = rows[i];
                var cells = row.getAggregation("cells");

                // TODO: dynamisch machen (spaltenindex aus "Columns" aggregation der table berechnen)
                var mfAltCell = cells[5];                
                // var mfAltValue = mfAltCell.getProperty("value");
                var mfAltValue = vatoob[i].HnflAlt;
                var hnflValue = vatoob[i].Hnfl;
               
                if(!isNaN(mfAltValue) && !isNaN(hnflValue) && (mfAltValue > (hnflValue*1.2))) {
                    mfAltCell.setValueState(sap.ui.core.ValueState.Error);
                    var errText = TranslationUtil.translate("ERR_MFALT_MAX");
                    mfAltCell.setValueStateText(errText);

                    validationResult = false;
                }
            }

            _.map(mietflaechenangabenTable.getItems(), function(item){
                var cells = item.getCells();
                var anMieteCell = cells[8];

                if(anMieteCell.getValue() === ""){
                    anMieteCell.setValueState(sap.ui.core.ValueState.Error);
                    anMieteCell.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                    validationResult = false;
                }
                if(parseFloat(anMieteCell.getValue()) === 0){
                    anMieteCell.setValueState(sap.ui.core.ValueState.Error);
                    anMieteCell.setValueStateText(TranslationUtil.translate("ERR_WERT_GROESSER_NULL"));
                    validationResult = false;
                }

                var hnflAltCell = cells[5];
                validationResult = that.checkNotNegative(hnflAltCell) && validationResult;

                var nhMieteCell = cells[7];
                validationResult = that.checkNotNegative(nhMieteCell) && validationResult;

                validationResult = that.checkNotNegative(anMieteCell) && validationResult;

                var gaKostenCell = cells[9];
                validationResult = that.checkNotNegative(gaKostenCell) && validationResult;

                var maKostenCell = cells[10];
                validationResult = that.checkNotNegative(maKostenCell) && validationResult;
            });

            var idLzFirstbreak = this.getView().byId("idLzFirstbreak");
            if(idLzFirstbreak.getValue() === ""){
                idLzFirstbreak.setValueState(sap.ui.core.ValueState.Error);
                idLzFirstbreak.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            }
            else{
                validationResult = this.checkNotNegative(idLzFirstbreak) && validationResult;
            }

            var idIdxWeitergabe = this.getView().byId("idIdxWeitergabe");
            if(idIdxWeitergabe.getValue() === ""){
                idIdxWeitergabe.setValueState(sap.ui.core.ValueState.Error);
                idIdxWeitergabe.setValueStateText(TranslationUtil.translate("ERR_FEHLENDER_WERT"));
                validationResult = false;
            }
            else{
                validationResult = this.checkNotNegative(idIdxWeitergabe) && validationResult;
            }
            
            var idMzAnzahlJ = this.getView().byId("idMzAnzahlJ");
            validationResult = this.checkNotNegative(idMzAnzahlJ) && validationResult;

            var idMkMonate = this.getView().byId("idMkMonate");
            validationResult = this.checkNotNegative(idMkMonate) && validationResult;

            var idMkAbsolut = this.getView().byId("idMkAbsolut");
            validationResult = this.checkNotNegative(idMkAbsolut) && validationResult;

            var idBkMonate = this.getView().byId("idBkMonate");
            validationResult = this.checkNotNegative(idBkMonate) && validationResult;

            var idBkAbsolut = this.getView().byId("idBkAbsolut");
            validationResult = this.checkNotNegative(idBkAbsolut) && validationResult;

            var idSonstK = this.getView().byId("idSonstK");
            validationResult = this.checkNotNegative(idSonstK) && validationResult;

            var idSonstE = this.getView().byId("idSonstE");
            validationResult = this.checkNotNegative(idSonstE) && validationResult;

            var idAkAnzahlM = this.getView().byId("idAkAnzahlM");
            validationResult = this.checkNotNegative(idAkAnzahlM) && validationResult;

            var idPoenale = this.getView().byId("idPoenale");
            validationResult = this.checkNotNegative(idPoenale) && validationResult;

            return validationResult;
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
		
		initializeValidationState: function(){
            this.getView().byId("idMietername").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMietbeginn").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idLzFirstbreak").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idIdxWeitergabe").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMzMonate").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMzAnzahlJ").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMkAbsolut").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idMkMonate").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idBkMonate").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idBkAbsolut").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idSonstK").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idSonstE").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idAkAnzahlM").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("idPoenale").setValueState(sap.ui.core.ValueState.None);

            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            _.map(mietflaechenangabenTable.getItems(), function(item){
                var cells = item.getCells();

                var anMieteCell = cells[8];
                anMieteCell.setValueState(sap.ui.core.ValueState.None);  

                var hnflAltCell = cells[5];
                hnflAltCell.setValueState(sap.ui.core.ValueState.None);

                var nhMieteCell = cells[7];
                nhMieteCell.setValueState(sap.ui.core.ValueState.None);

                var gaKostenCell = cells[9];
                gaKostenCell.setValueState(sap.ui.core.ValueState.None);

                var maKostenCell = cells[10];
                maKostenCell.setValueState(sap.ui.core.ValueState.None);   
            });
        },

        onAbbrechenButtonPress: function(oEvent){            
            
            var _this = this;
            this.initializeValidationState();
            
            var modus = this.getView().getModel("form").getProperty("/modus");  
            var va =  this.getView().getModel("form").getProperty("/vermietungsaktivitaet");  
            var vaid = va.VaId;     
            console.log(vaid, "VaId");
            
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
                DataProvider.deleteSperreAsync('',vaid).then(function(){
                    _this.getView().getModel("form").setData(_this._formDataBackup);
                    _this.getView().getModel("form").setProperty("/modus", "show");
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

            var Bukrs = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/Bukrs");
            var WeId = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/WeId"); 

            DataProvider.readWirtschaftseinheitAsync(Bukrs, WeId)
            .then(function(wirtschaftseinheit){

                var mietobjekte = wirtschaftseinheit.WeToMo;
                var objekte = _this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");

                var jsonData = {
                    mietflaechen: _.reject(mietobjekte, function(mietobjekt){
                        return _.some(objekte, function(objekt){
                            return mietobjekt.MoId === objekt.MoId;
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
            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

            var selectedItems = oEvent.getParameter("selectedItems");        

            if(selectedItems.length > 0)
            {
                var objekte = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");

                selectedItems.forEach(function(item){
                    var mietobjekt = item.getBindingContext().getObject();

                    // Umwandlung Mietobjekt -> Objekt
                    objekte.push({
                        WeId: mietobjekt.WeId,
                        MoId: mietobjekt.MoId,
                        Bukrs: mietobjekt.Bukrs,
                        Bezei: mietobjekt.Bezei,
                        Nutzart: mietobjekt.Nutzart,
                        NutzartAlt: mietobjekt.NutzartAlt,
                        Hnfl: mietobjekt.Hnfl,
                        HnflAlt: mietobjekt.HnflAlt,
                        HnflUnit: mietobjekt.HnflUnit,
                        NhMiete: mietobjekt.NhMiete,
                        AnMiete: mietobjekt.AnMiete,
                        GaKosten: mietobjekt.GaKosten,
                        MaKosten: mietobjekt.MaKosten,
                        Whrung: mietobjekt.Whrung,
                        MfSplit: false,
                        VaId: va.VaId,
                        MonatJahr: va.MonatJahr
                    });

                });
                
                this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", objekte);
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

        onKonditioneneinigungHinzufuegenButtonPress: function(oEvent){
            var _this = this;

            if (!this._konditioneneinigungHinzufuegenDialog) {
                this._konditioneneinigungHinzufuegenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.VermietungsaktivitaetDetailsKonditioneneinigungDialog", this);
                this.getView().addDependent(this._konditioneneinigungHinzufuegenDialog);
            }

            DataProvider.readKonditioneneinigungSetAsync("KeToOb")
            .then(function(konditioneneinigungen){
                
                konditioneneinigungen = _.map(konditioneneinigungen, function(ke){
                    ke.KeToOb = ke.KeToOb.results;
                    return ke;
                });

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
                    konditioneneinigung.KeToOb.forEach(function(objekt){
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
            var _this = this;

            if (!this._ausbaukostenVerteilenDialog) {
                this._ausbaukostenVerteilenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.AusbaukostenVerteilen", this);
                this.getView().addDependent(this._ausbaukostenVerteilenDialog);
            }
            
            // über Einträge iterieren und Nutzungsarten sammeln
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
            
			if(mietflaechenangaben.length === 0) {
                MessageBox.error("Eine Verteilung ohne Mietflächen ist nicht möglich.");
			} else {
                Q.when(StaticData.NUTZUNGSARTEN).then(function(nutzungsarten){
                    var vorhandeneNutzungsarten = _.filter(nutzungsarten, function(nutzungsart){
                        return _.find(mietflaechenangaben, function(mietflaechenangabe){
                            if(mietflaechenangabe.NutzartAlt !== "" && mietflaechenangabe.NutzartAlt !== "0700" && mietflaechenangabe.NutzartAlt !== "0750"){
                                return nutzungsart.NaId === mietflaechenangabe.NutzartAlt;
                            } else {
                                if(mietflaechenangabe.Nutzart !== "0700" && mietflaechenangabe.Nutzart !== "0750"){
                                    return nutzungsart.NaId === mietflaechenangabe.Nutzart;
                                }
                            }
                        });
                    });
                    console.log(vorhandeneNutzungsarten, "vhNutzarten");
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
        
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/VaToOb");
            
            var sumNutzflaechen = 0;
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if((mietflaechenangabe.Nutzart === verteilung.nutzungsart) || (mietflaechenangabe.NutzartAlt === verteilung.nutzungsart))
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
                if((mietflaechenangabe.Nutzart === verteilung.nutzungsart) || (mietflaechenangabe.NutzartAlt === verteilung.nutzungsart))
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
            
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/VaToOb", mietflaechenangaben);
        },
		
		onAusbaukostenVerteilenFragmentAbbrechenButtonPress: function(oEvent){
            this._ausbaukostenVerteilenDialog.close();
        },
        
        onDruckenButtonPress: function(oEvent){                        
            var vermietungsaktivitaet = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");
            console.log(vermietungsaktivitaet, "va");
            var kostenarten = this.getView().getModel("form").getProperty("/kostenarten");
            var ertragsarten = this.getView().getModel("form").getProperty("/ertragsarten");
            
            var printableHtml = PrinterUtil.generatePrintableHtmlForVermietungsaktivitaet(vermietungsaktivitaet, kostenarten, ertragsarten);

            var printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0');
            printWindow.document.write(printableHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        },
        
        onFavoritButtonPress: function(oEvent){
            var _this = this;
            var va = this.getView().getModel("form").getProperty("/vermietungsaktivitaet");

            var promise = va.Favorit ? DataProvider.deleteFavoritAsync('', va.VaId) : DataProvider.createFavoritAsync({VaId: va.VaId});

            promise.then(function(){
                var message = va.Favorit ? TranslationUtil.translate("VA_VON_FAVORITEN_ENTFERNT") : TranslationUtil.translate("VA_ZU_FAVORITEN_HINZUGEFUEGT");
                MessageBox.information(message, {
                    title: TranslationUtil.translate("HINWEIS")
                });
            })
            .catch(function(oError){
                ErrorMessageUtil.showError(oError);
            })
            .fin(function(){
                _this.vermietungsaktivitaetAnzeigen(va.VaId, va.Bukrs);
            })
            .done();
        },
        
        onDebitorAuswahlButtonPress: function(oEvent){
            var _this = this;

            if (! this._debitorSelektionDialog) {
                this._debitorSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.DebitorSelektion", this);
            }

            DataProvider.readDebitorenSetAsync()
            .then(function(debitoren){

                var formModel = new sap.ui.model.json.JSONModel({
                    debitoren: debitoren
                });
                
                _this._debitorSelektionDialog.setModel(formModel, "form");
                _this._debitorSelektionDialog.open();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();

        },
        
        onDienstleisterAuswahlButtonPress: function(oEvent){
            var _this = this;

            if (!_this._dienstleisterSelektionDialog){
                _this._dienstleisterSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.DienstleisterSelektion", _this);
            }

            DataProvider.readDienstleisterSetAsync()
            .then(function(dienstleister){

                var formModel = new sap.ui.model.json.JSONModel({
                    dienstleister: dienstleister
                });
                
                _this._dienstleisterSelektionDialog.setModel(formModel, "form");
                _this._dienstleisterSelektionDialog.open();
            })
            .catch(function(oError){
                console.log(oError);
            })
            .done();
        },

        onDienstleisterSelektionConfirm: function(oEvent){
            var dienstleister = oEvent.getParameter("selectedItem").getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Dienstleister", dienstleister.Name);
        },

        onDienstleisterSelektionSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sValue)]);
        },

        onDebitorSelektionConfirm: function(oEvent){
			var debitor = oEvent.getParameter("selectedItem").getBindingContext("form").getObject();
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Debitorname", debitor.Name);
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/Debitor", debitor.KdNr);
        },

        onDebitorSelektionSearch: function(oEvent){
			var sValue = oEvent.getParameter("value");

			var combinedOrFilter = new sap.ui.model.Filter([
				new sap.ui.model.Filter("KdNr", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sValue),
			], false);

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([combinedOrFilter]);
        },
        
        newVermietungsaktivitaet: function(){

            return {
                VaId: "",
                Bukrs: "",
                WeId: "",
                
                Vermietungsart: "",
                Dienstleister: "",
                Debitor: "",
                Debitorname: "",
                Mietbeginn: null,
                LzFirstbreak: "",
                
                MzMonate: "",
                MzErsterMonat: null,
                MzAnzahlJ: "",

                MkMonate: "",
                MkAbsolut: "",

                BkMonate: "",
                BkAbsolut: "",

                
                ArtKosten: "00",
                SonstK: "",
                ArtErtrag: "00",
                SonstE: "",

                AkErsterMonat: null,
                AkAnzahlM: "",

                Poenale: "",
                IdxWeitergabe: "",
                PLRelevant: false,

                Status: StaticData.STATUS.VA.AUSBAUPLANUNG,
                Anmerkung: StaticData.ANMERKUNG.VA.ABSTIMMUG_DER_MIETERAUSBAUPLANUNG,
                Bemerkung: "",
                
                MonatJahr: "M",
                Currency: "",
                Unit: "",

                VaToOb: [],
                VaToMap: [],
                VaToWe: null,
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