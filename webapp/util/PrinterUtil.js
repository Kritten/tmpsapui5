sap.ui.define([
    "ag/bpc/Deka/util/PrinterUtil",
    "ag/bpc/Deka/util/DataProvider",
    "ag/bpc/Deka/util/ErrorMessageUtil"
], function (PrinterUtil, DataProvider, ErrorMessageUtil) {

        "use strict";
        return {

            getBasePath: function () {
                return jQuery.sap.getModulePath("ag.bpc.Deka");
            },

            // Mehrsprachigkeit (beschränkt auf DE und EN)
			getLocale: function() {
                return sap.ui.getCore().getConfiguration().getLanguage(); // Anmeldesprache ermitteln
            },

            druckvorlageVermietungsaktivitaet: "/util/DruckvorlageVermietungsaktivitaet.html", // entweder DE oder EN

            druckvorlageKonditioneneinigung: "/util/DruckvorlageKonditioneneinigung.html", // entweder DE oder EN

            druckvorlageBeschlussantrag: "/util/DruckvorlageBeschlussantrag.html", // immer DE

            generatePrintableHtmlForVermietungsaktivitaet: function (vermietungsaktivitaet, kostenarten, ertragsarten) {
                var _this = this;

                jQuery.ajaxSetup({
                    async: false,
                    cache: false
                });

                var locale = _this.getLocale().toLowerCase();
                console.log(locale, "= Anmeldesprache");

                if(locale.indexOf("de") !== -1){
                   // standardsprache
                }else{
                    _this.druckvorlageVermietungsaktivitaet = "/util/DruckvorlageVermietungsaktivitaet_en.html";
                }

                var res;
                var textModel = sap.ui.getCore().getModel("text");
                console.log(sap.ui.getCore().getModel("text"));

                var anmerkungen = textModel.oData.anmerkung;
                var nutzarten = textModel.oData.nutzungsart;
                var kategorien = textModel.oData.kategorie;
                var vermietungsarten = textModel.oData.vermietungsart;
                var stati = textModel.oData.status;

                jQuery.get(_this.getBasePath() + _this.druckvorlageVermietungsaktivitaet, function (result) {
                    jQuery.sap.require("sap.ui.core.format.NumberFormat");
                    var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                        maxFractionDigits: 2,
                        minFractionDigits: 2,
                        groupingEnabled: true,
                        groupingSeparator: ".",
                        decimalSeparator: ","
                    });

                    var bezeichnung = vermietungsaktivitaet.VaToWe.Plz + "/" + vermietungsaktivitaet.VaToWe.Ort + "/" + vermietungsaktivitaet.VaToWe.StrHnum;
                    if (bezeichnung) {
                        result = result.replace("@@VaBezeichnung@@", bezeichnung);
                    }

                    if(vermietungsaktivitaet.Bemerkung){
                        var bemerkung = vermietungsaktivitaet.Bemerkung.replace(/\n/g, "<br>");
                        result = result.replace("@@Bemerkung@@", bemerkung);
                    }

                    var embargo = vermietungsaktivitaet.EmbargoNr;
                    if (embargo) {
                        result = result.replace("@@Embargo@@", embargo);
                    }

                    var vtrLfz = vermietungsaktivitaet.VtrLfz;
                    if (vtrLfz) {
                        result = result.replace("@@VtrLfz@@", vtrLfz);
                    }

                    var verlOpt = vermietungsaktivitaet.VerlOpt;
                    if (verlOpt) {
                        result = result.replace("@@VerlOpt@@", verlOpt);
                    }

                    var verlOptWdh = vermietungsaktivitaet.VerlOptWdh;
                    if (verlOptWdh) {
                        result = result.replace("@@VerlOptWdh@@", verlOptWdh);
                    }

                    var maklerName = vermietungsaktivitaet.MaklerName;
                    if (maklerName) {
                        result = result.replace("@@MaklerName@@", maklerName);
                    }

                    var vaid = vermietungsaktivitaet.VaId;
                    if (vaid) {
                        result = result.replace("@@VaId2@@", vaid);
                    }

                    var fondsbez = vermietungsaktivitaet.Fondsbez;
                    if (fondsbez) {
                        result = result.replace("@@Fonds@@", fondsbez);
                    }

                    var mietbeginn = vermietungsaktivitaet.Mietbeginn;
                    if (mietbeginn) {
                        result = result.replace("@@Mietbeginn@@", mietbeginn.toLocaleDateString());
                    }

                    var lzFb = vermietungsaktivitaet.LzFirstbreak;
                    if(lzFb){
                        result = result.replace("@@LzFirstbreak2@@", oNumberFormat.format(lzFb));
                    }

                    var mzErsterMonat = vermietungsaktivitaet.MzErsterMonat;
                    if (mzErsterMonat) {
                        result = result.replace("@@MzErsterMonat@@", mzErsterMonat.toLocaleDateString());
                    }

                    var akErsterMonat = vermietungsaktivitaet.AkErsterMonat;
                    if (akErsterMonat) {
                        result = result.replace("@@AkErsterMonat@@", akErsterMonat.toLocaleDateString());
                    }

                    var freigabeDatum = vermietungsaktivitaet.FreigabeDatum;
                    if (freigabeDatum) {
                        result = result.replace("@@FreigabeDatum@@", freigabeDatum.toLocaleDateString());
                    }

                    var bdgstp = vermietungsaktivitaet.Budgetstp;
                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        result = result.replace("@@Budgetstp@@", bdgstp ? "Ja" : "Nein");
                     }else{
                        result = result.replace("@@Budgetstp@@", bdgstp ? "Yes" : "No");
                     }

                    var monatJahr = vermietungsaktivitaet.MonatJahr;
                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        result = result.replace("@@MonatJahr@@", monatJahr === "M" ? "Monat" : "Jahr");
                     }else{
                        result = result.replace("@@MonatJahr@@", monatJahr === "M" ? "Month" : "Year");
                     }

                    var plr = vermietungsaktivitaet.PLRelevant;
                    var plrString;
                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        plrString = plr ? "Ja" : "Nein";
                        result = result.replace("@@PLRelevant@@", plrString);
                     }else{
                        plrString = plr ? "Yes" : "No";
                        result = result.replace("@@PLRelevant@@", plrString);
                     }

                    var VmlRel = vermietungsaktivitaet.VmlRel;
                    var VmlRelString;
                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        VmlRelString = VmlRel ? "Ja" : "Nein";
                        result = result.replace("@@VmlRel@@", VmlRelString);
                     }else{
                        VmlRelString = VmlRel ? "Yes" : "No";
                        result = result.replace("@@VmlRel@@", VmlRelString);
                     }

                    var stsl = vermietungsaktivitaet.Steuerschlg;
                    var stslString;
                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        stslString = stsl ? "Ja" : "Nein";
                        result = result.replace("@@Steuerschlg@@", stslString);
                     }else{
                        stslString = stsl ? "Yes" : "No";
                        result = result.replace("@@Steuerschlg@@", stslString);
                     }

                    var druckDatum = new Date();
                    if (druckDatum) {
                        result = result.replace("@@Druckdatum@@", druckDatum.toLocaleDateString());
                    }

                    var tmp = vermietungsaktivitaet.Anmerkung;
                    var where = anmerkungen[tmp];
                    var text;
                    if (where) {
                        text = where;
                        result = result.replace("@@AnmerkungText@@", text);
                    }

                    tmp = vermietungsaktivitaet.Kategorie;
                    where = kategorien[tmp];
                    if (where) {
                        result = result.replace("@@VaTyp@@", where);
                    }

                    tmp = vermietungsaktivitaet.Vermietungsart;
                    where = vermietungsarten[tmp];
                    if (where) {
                        result = result.replace("@@VaArt@@", where);
                    }

                    tmp = vermietungsaktivitaet.Status;
                    where = stati[tmp];
                    if (where) {
                        result = result.replace("@@Status@@", where);
                    }

                    var sonstE = vermietungsaktivitaet.SonstE;
                    if (sonstE && sonstE > 0) {
                        tmp = vermietungsaktivitaet.ArtErtrag;
                        where = _.findWhere(ertragsarten, { "ErId": tmp });
                        if (where) {
                            text = where.Txtmd;
                            result = result.replace("@@ArtE@@", text);
                        }
                    }

                    var sonstK = vermietungsaktivitaet.SonstK;
                    if (sonstK && sonstK > 0) {
                        tmp = vermietungsaktivitaet.ArtKosten;
                        where = _.findWhere(kostenarten, { "KoId": tmp });
                        if (where) {
                            text = where.Txtmd;
                            result = result.replace("@@ArtK@@", text);
                        }
                    }

                    var mMiete;
                    if (vermietungsaktivitaet.MMiete && vermietungsaktivitaet.MkMonate) {
                        mMiete = parseFloat(vermietungsaktivitaet.MMiete) || 0;
                        var mkMonate = parseFloat(vermietungsaktivitaet.MkMonate) || 0;

                        var mkMAbs = mMiete * mkMonate;
                        result = result.replace("@@MkMAbs@@", oNumberFormat.format(mkMAbs));

                        if (vermietungsaktivitaet.MkAbsolut) {
                            var mkGesamt = mkMAbs + (parseFloat(vermietungsaktivitaet.MkAbsolut) || 0);
                            result = result.replace("@@MkGesamt@@", oNumberFormat.format(mkGesamt));
                        }
                    }

                    if (vermietungsaktivitaet.MMiete && vermietungsaktivitaet.BkMonate) {
                        mMiete = parseFloat(vermietungsaktivitaet.MMiete) || 0;
                        var bkMonate = parseFloat(vermietungsaktivitaet.BkMonate) || 0;

                        var bkMAbs = mMiete * bkMonate;
                        result = result.replace("@@BkMAbs@@", oNumberFormat.format(bkMAbs));

                        if (vermietungsaktivitaet.BkAbsolut) {
                            var bkGesamt = bkMAbs + (parseFloat(vermietungsaktivitaet.BkAbsolut) || 0);
                            result = result.replace("@@BkGesamt@@", oNumberFormat.format(bkGesamt));
                        }
                    }

                    var diff1 = (parseFloat(vermietungsaktivitaet.GesErtragPa) || 0) - (parseFloat(vermietungsaktivitaet.GesKeErtrag) || 0);
                    result = result.replace("@@Diff1@@", oNumberFormat.format(diff1));

                    var diff2 = (parseFloat(vermietungsaktivitaet.GesKosten) || 0) - (parseFloat(vermietungsaktivitaet.GesKeKosten) || 0);
                    result = result.replace("@@Diff2@@", oNumberFormat.format(diff2));

                    var diff3 = (parseFloat(vermietungsaktivitaet.GesVaErtragLz) || 0) - (parseFloat(vermietungsaktivitaet.GesKeErtragLz) || 0);
                    result = result.replace("@@Diff3@@", oNumberFormat.format(diff3));

                    // Restliche Keys ersetzen
                    Object.keys(vermietungsaktivitaet).forEach(function (key) {
                        var value = vermietungsaktivitaet[key];

                        if (value instanceof Date) {
                            result = result.replace("@@" + key + "@@", value.toLocaleDateString());
                        } else {
                            if (value) {
                                // Nur floats formattieren
                                if (!isNaN(value) && value.toString().indexOf(".") != -1) {
                                    result = result.replace("@@" + key + "@@", "<span style=\"text-align: right\">" + oNumberFormat.format(value) + "</span>");
                                } else {
                                    result = result.replace("@@" + key + "@@", value);
                                }
                            }
                        }
                    });

                    var mietflaechenangabeHtml = "<table class=\"cellSpacedTable\">";

                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Lfd Nr<br>Split</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>MO<br>Bezeichnung</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Nutzungsart<br>NA alternativ</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Hauptnutzfläche<br>HNF alternativ</b><br>FE</td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Marktübliche Miete<br>Angebotsmiete</b><br>WHG/FE</td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Grundausbaukosten<br>Mieterausbaukosten</b><br>WHG/FE</td>";
                        mietflaechenangabeHtml += "</tr>";
                     }else{
                        mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>No.<br>Split</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>RO<br>Identification</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Type of use<br>(alternative)</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>MLA<br>(MLA alternative)</b><br>Meas. Amt.</td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Sustainable rent<br>Asking rent</b><br>Currency/Meas. Amt.</td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Basic fit out<br>Tenant fit out</b><br>Currency/Meas. Amt.</td>";
                        mietflaechenangabeHtml += "</tr>";
                     }



                    vermietungsaktivitaet.VaToOb.forEach(function (mietflaechenangabe, i) {
                        var index = i + 1;
                        tmp = mietflaechenangabe.Nutzart;
                        var nutzart = nutzarten[tmp];
                        nutzart = nutzart ? nutzart : mietflaechenangabe.Nutzart;
                        tmp = mietflaechenangabe.NutzartAlt;
                        var nutzartAlt = nutzarten[tmp];
                        nutzartAlt = nutzartAlt ? nutzartAlt : mietflaechenangabe.NutzartAlt;

                        var hnfl = mietflaechenangabe.Hnfl ? oNumberFormat.format(mietflaechenangabe.Hnfl) : mietflaechenangabe.Hnfl;
                        var hnflalt = mietflaechenangabe.HnflAlt ? oNumberFormat.format(mietflaechenangabe.HnflAlt) : mietflaechenangabe.HnflAlt;
                        var nhMiete = mietflaechenangabe.NhMiete ? oNumberFormat.format(mietflaechenangabe.NhMiete) : mietflaechenangabe.NhMiete;
                        var anMiete = mietflaechenangabe.AnMiete ? oNumberFormat.format(mietflaechenangabe.AnMiete) : mietflaechenangabe.AnMiete;
                        var gaKosten = mietflaechenangabe.GaKosten ? oNumberFormat.format(mietflaechenangabe.GaKosten) : mietflaechenangabe.GaKosten;
                        var maKosten = mietflaechenangabe.MaKosten ? oNumberFormat.format(mietflaechenangabe.MaKosten) : mietflaechenangabe.MaKosten;

                        var mfsplit;

                        if(locale.indexOf("de") !== -1){
                            // standardsprache
                            mfsplit = mietflaechenangabe.MfSplit ? "Ja" : "Nein";
                        }else{
                            mfsplit = mietflaechenangabe.MfSplit ? "Yes" : "No";
                        }

                        mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:center;\">" + index + "<br>" + mfsplit + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:left;width: 160px !important;\">" + mietflaechenangabe.MoId + "<br>" + mietflaechenangabe.Bezei + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:left;width: 65px !important;\">" + nutzart + "<br>" + nutzartAlt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + hnfl + "<br>" + hnflalt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + nhMiete + "<br>" + anMiete + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + gaKosten + "<br>" + maKosten + "</td>";
                        mietflaechenangabeHtml += "</tr>";
                    });
                    mietflaechenangabeHtml += "</table>";
                    result = result.replace("@@Mietflaechenangaben@@", mietflaechenangabeHtml);

                    var keMappingHtml;

                    if (vermietungsaktivitaet.Kategorie === "01") {
                        if(locale.indexOf("de") !== -1){
                            // standardsprache
                            keMappingHtml = "<td class=\"auto-style7\" style=\"width: 35%;\">Zugrundeliegende KE:</td>";
                        }else{
                            keMappingHtml = "<td class=\"auto-style7\" style=\"width: 35%;\">Underlying TaC:</td>";
                        }

                        keMappingHtml += "<td class=\"auto-style6\">";

                        keMappingHtml += _.map(_.filter(vermietungsaktivitaet.VaToMap, function(ke){return ke.Aktiv;}), function(ke){return ke.KeId;}).join(", ");

                        keMappingHtml += "</td>";
                        result = result.replace("@@KEMapping@@", keMappingHtml);
                    } else {
                        result = result.replace("@@KEMapping@@", "<br>");
                    }

                    // Restliche Platzhalter entfernen
                    result = result.replace(/@@\w*@@/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

                    res = result;
                });

                jQuery.ajaxSetup({
                    async: true,
                    cache: true
                });

                return res;
            },

            generatePrintableHtmlForKonditioneneinigung: function (konditioneneinigung, kostenarten, ertragsarten) {
                var _this = this;

                jQuery.ajaxSetup({
                    async: false,
                    cache: false
                });

                var locale = _this.getLocale().toLowerCase();
                console.log(locale, "= Anmeldesprache");

                if(locale.indexOf("de") !== -1){
                   // standardsprache
                }else{
                    _this.druckvorlageKonditioneneinigung = "/util/DruckvorlageKonditioneneinigung_en.html";
                }

                var res;
                var textModel = sap.ui.getCore().getModel("text");
                console.log(sap.ui.getCore().getModel("text"));

                var anmerkungen = textModel.oData.anmerkung;
                var nutzarten = textModel.oData.nutzungsart;

                jQuery.get(_this.getBasePath() + _this.druckvorlageKonditioneneinigung, function (result) {
                    var keId = konditioneneinigung.KeId;
                    if (keId) {
                        result = result.replace("@@KeId@@", keId);
                        result = result.replace("@@KeId2@@", keId);
                    }

                    var fondsbez = konditioneneinigung.Fondsbez;
                    if (fondsbez) {
                        result = result.replace("@@Fonds@@", fondsbez);
                    }

                    if(konditioneneinigung.Bemerkung){
                        var bemerkung = konditioneneinigung.Bemerkung.replace(/\n/g, "<br>");
                        result = result.replace("@@Bemerkung@@", bemerkung);
                    }

                    var bezeichnung = konditioneneinigung.KeToWe.Plz + "/" + konditioneneinigung.KeToWe.Ort + "/" + konditioneneinigung.KeToWe.StrHnum;
                    if (bezeichnung) {
                        result = result.replace("@@KeBezeichnung@@", bezeichnung);
                    }

                    var indBez = konditioneneinigung.IndBez;
                    if (indBez) {
                        result = result.replace("@@IndBez@@", indBez);
                    }

                    var vtrLfz = konditioneneinigung.VtrLfz;
                    if (vtrLfz) {
                        result = result.replace("@@VtrLfz@@", vtrLfz);
                    }

                    var verlOpt = konditioneneinigung.VerlOpt;
                    if (verlOpt) {
                        result = result.replace("@@VerlOpt@@", verlOpt);
                    }

                    var verlOptWdh = konditioneneinigung.VerlOptWdh;
                    if (verlOptWdh) {
                        result = result.replace("@@VerlOptWdh@@", verlOptWdh);
                    }

                    var mietbeginn = konditioneneinigung.Mietbeginn;
                    if (mietbeginn) {
                        result = result.replace("@@Mietbeginn@@", mietbeginn.toLocaleDateString());
                    }

                    var freigabeDatum = konditioneneinigung.FreigabeDatum;
                    if (freigabeDatum) {
                        result = result.replace("@@FreigabeDatum@@", freigabeDatum.toLocaleDateString());
                    }

                    var bdgstp = konditioneneinigung.Budgetstp;
                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        result = result.replace("@@Budgetstp@@", bdgstp ? "Ja" : "Nein");
                    }else{
                        result = result.replace("@@Budgetstp@@", bdgstp ? "Yes" : "No");
                    }

                    var monatJahr = konditioneneinigung.MonatJahr;
                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        result = result.replace("@@MonatJahr@@", monatJahr === "M" ? "Monat" : "Jahr");
                    }else{
                        result = result.replace("@@MonatJahr@@", monatJahr === "M" ? "Month" : "Year");
                    }

                    var druckDatum = new Date();
                    if (druckDatum) {
                        result = result.replace("@@Druckdatum@@", druckDatum.toLocaleDateString());
                    }

                    var tmp = konditioneneinigung.Anmerkung;
                    var where = anmerkungen[tmp];
                    var text;
                    if (where) {
                        text = where;
                        result = result.replace("@@AnmerkungText@@", text);
                    }

                    var sonstE = konditioneneinigung.SonstE;
                    if (sonstE && sonstE > 0) {
                        tmp = konditioneneinigung.ArtErtrag;
                        where = _.findWhere(ertragsarten, { "ErId": tmp });
                        if (where) {
                            text = where.Txtmd;
                            result = result.replace("@@ArtE@@", text);
                        }
                    }

                    var sonstK = konditioneneinigung.SonstK;
                    if (sonstK && sonstK > 0) {
                        tmp = konditioneneinigung.ArtKosten;
                        where = _.findWhere(kostenarten, { "KoId": tmp });
                        if (where) {
                            text = where.Txtmd;
                            result = result.replace("@@ArtK@@", text);
                        }
                    }

                    jQuery.sap.require("sap.ui.core.format.NumberFormat");
                    var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                        maxFractionDigits: 2,
                        minFractionDigits: 2,
                        groupingEnabled: true,
                        groupingSeparator: ".",
                        decimalSeparator: ","
                    });

                    var mMiete;
                    if (konditioneneinigung.MMiete && konditioneneinigung.MkMonate) {
                        mMiete = parseFloat(konditioneneinigung.MMiete) || 0;
                        var mkMonate = parseFloat(konditioneneinigung.MkMonate) || 0;

                        var mkMonateGesamt = mMiete * mkMonate;
                        result = result.replace("@@MkMonateGesamt@@", oNumberFormat.format(mkMonateGesamt));

                        if (konditioneneinigung.MkAbsolut) {
                            var mkGesamt = mkMonateGesamt + (parseFloat(konditioneneinigung.MkAbsolut) || 0);
                            result = result.replace("@@MkGesamt@@", oNumberFormat.format(mkGesamt));
                        }
                    }

                    if (konditioneneinigung.MMiete && konditioneneinigung.BkMonatsmieten) {
                        mMiete = parseFloat(konditioneneinigung.MMiete) || 0;
                        var bkMonate = parseFloat(konditioneneinigung.BkMonatsmieten) || 0;

                        var bkMonateGesamt = mMiete * bkMonate;
                        result = result.replace("@@BkMonateGesamt@@", oNumberFormat.format(bkMonateGesamt));

                        if (konditioneneinigung.BkAbsolut) {
                            var bkGesamt = bkMonateGesamt + (parseFloat(konditioneneinigung.BkAbsolut) || 0);
                            result = result.replace("@@BkGesamt@@", oNumberFormat.format(bkGesamt));
                        }
                    }

                    var gesamtDifferenz = (parseFloat(konditioneneinigung.GesErtrag) || 0) - (parseFloat(konditioneneinigung.GesKosten) || 0);
                    result = result.replace("@@GesDiff@@", oNumberFormat.format(gesamtDifferenz));

                    // Restliche Keys ersetzen
                    Object.keys(konditioneneinigung).forEach(function (key) {
                        var value = konditioneneinigung[key];

                        if (value instanceof Date) {
                            result = result.replace("@@" + key + "@@", value.toLocaleDateString());
                        } else {
                            if (value) {
                                if (!isNaN(value) && value.toString().indexOf(".") != -1) {
                                    result = result.replace("@@" + key + "@@", oNumberFormat.format(value));
                                } else {
                                    result = result.replace("@@" + key + "@@", value);
                                }
                            }
                        }
                    });

                    var mietflaechenangabeHtml = "<table class=\"cellSpacedTable\">";

                    if(locale.indexOf("de") !== -1){
                        // standardsprache
                        mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Lfd Nr<br>Split</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>MO<br>Bezeichnung</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Nutzungsart</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Hauptnutzfläche<br>HNF alternativ</b><br>FE</td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Marktübliche Miete<br>Angebotsmiete</b><br>WHG/FE</td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Grundausbaukosten<br>Mieterausbaukosten</b><br>WHG/FE</td>";
                        mietflaechenangabeHtml += "</tr>";
                     }else{
                        mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>No.<br>Split</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>RO<br>Identification</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Type of use</b></td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>MLA<br>(MLA alternative)</b><br>Meas. Amt.</td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Sustainable rent<br>Asking rent</b><br>Currency/Meas. Amt.</td>";
                        mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Basic fit out<br>Tenant fit out</b><br>Currency/Meas. Amt.</td>";
                        mietflaechenangabeHtml += "</tr>";
                     }

                    konditioneneinigung.KeToOb.forEach(function (mietflaechenangabe, i) {
                        var index = i + 1;
                        tmp = mietflaechenangabe.Nutzart;
                        var nutzart = nutzarten[tmp];
                        nutzart = nutzart ? nutzart : mietflaechenangabe.Nutzart;

                        var hnfl = mietflaechenangabe.Hnfl ? oNumberFormat.format(mietflaechenangabe.Hnfl) : mietflaechenangabe.Hnfl;
                        var hnflalt = mietflaechenangabe.HnflAlt ? oNumberFormat.format(mietflaechenangabe.HnflAlt) : mietflaechenangabe.HnflAlt;
                        var nhMiete = mietflaechenangabe.NhMiete ? oNumberFormat.format(mietflaechenangabe.NhMiete) : mietflaechenangabe.NhMiete;
                        var anMiete = mietflaechenangabe.AnMiete ? oNumberFormat.format(mietflaechenangabe.AnMiete) : mietflaechenangabe.AnMiete;
                        var gaKosten = mietflaechenangabe.GaKosten ? oNumberFormat.format(mietflaechenangabe.GaKosten) : mietflaechenangabe.GaKosten;
                        var maKosten = mietflaechenangabe.MaKosten ? oNumberFormat.format(mietflaechenangabe.MaKosten) : mietflaechenangabe.MaKosten;


                        var mfsplit;

                        if(locale.indexOf("de") !== -1){
                            // standardsprache
                            mfsplit = mietflaechenangabe.MfSplit ? "Ja" : "Nein";
                        }else{
                            mfsplit = mietflaechenangabe.MfSplit ? "Yes" : "No";
                        }

                        mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: center;\">" + index + "<br>" + mfsplit + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:left; width: 160px !important;\">" + mietflaechenangabe.MoId + "<br>" + mietflaechenangabe.Bezei + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:left; width: 60px !important;\">" + nutzart + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + hnfl + "<br>" + hnflalt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + nhMiete + "<br>" + anMiete + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + gaKosten + "<br>" + maKosten + "</td>";
                        mietflaechenangabeHtml += "</tr>";
                    });
                    mietflaechenangabeHtml += "</table>";

                    result = result.replace("@@Mietflaechenangaben@@", mietflaechenangabeHtml);

                    // Restliche Platzhalter entfernen
                    result = result.replace(/@@\w*@@/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

                    res = result;
                });

                jQuery.ajaxSetup({
                    async: true,
                    cache: true
                });

                return res;
            },

            generatePrintableHtmlForBeschlussantrag: function (konditioneneinigung, kostenarten, ertragsarten, stufen) {
                var _this = this;

                jQuery.ajaxSetup({
                    async: false,
                    cache: false
                });

                var res;
                var textModel = sap.ui.getCore().getModel("text");
                console.log(sap.ui.getCore().getModel("text"));

                var anmerkungen = textModel.oData.anmerkung;
                var nutzarten = textModel.oData.nutzungsart;

                jQuery.get(_this.getBasePath() + _this.druckvorlageBeschlussantrag, function (result) {
                    var keId = konditioneneinigung.KeId;
                    if (keId) {
                        result = result.replace("@@KeId@@", keId);
                        result = result.replace("@@KeId2@@", keId);
                    }

                    var fondsbez = konditioneneinigung.Fondsbez;
                    if (fondsbez) {
                        result = result.replace("@@Fonds@@", fondsbez);
                    }

                    var bezeichnung = konditioneneinigung.KeToWe.Plz + "/" + konditioneneinigung.KeToWe.Ort + "/" + konditioneneinigung.KeToWe.StrHnum;
                    if (bezeichnung) {
                        result = result.replace("@@KeBezeichnung@@", bezeichnung);
                    }

                    if(konditioneneinigung.Bemerkung){
                        var bemerkung = konditioneneinigung.Bemerkung.replace(/\n/g, "<br>");
                        result = result.replace("@@Bemerkung@@", bemerkung);
                    }

                    var mietbeginn = konditioneneinigung.Mietbeginn;
                    if (mietbeginn) {
                        result = result.replace("@@Mietbeginn@@", mietbeginn.toLocaleDateString());
                    }

                    var bdgstp = konditioneneinigung.Budgetstp;
                    result = result.replace("@@Budgetstp@@", bdgstp ? "Ja" : "Nein");

                    var monatJahr = konditioneneinigung.MonatJahr;
                    result = result.replace("@@MonatJahr@@", monatJahr === "M" ? "Monat" : "Jahr");

                    var druckDatum = new Date();
                    if (druckDatum) {
                        result = result.replace("@@Druckdatum@@", druckDatum.toLocaleDateString());
                    }

                    var tmp = konditioneneinigung.Anmerkung;
                    var where = anmerkungen[tmp];
                    var text;
                    if (where) {
                        text = where;
                        result = result.replace("@@AnmerkungText@@", text);
                    }

                    var sonstE = konditioneneinigung.SonstE;
                    if (sonstE && sonstE > 0) {
                        tmp = konditioneneinigung.ArtErtrag;
                        where = _.findWhere(ertragsarten, { "ErId": tmp });
                        if (where) {
                            text = where.Txtmd;
                            result = result.replace("@@ArtE@@", text);
                        }
                    }

                    var sonstK = konditioneneinigung.SonstK;
                    if (sonstK && sonstK > 0) {
                        tmp = konditioneneinigung.ArtKosten;
                        where = _.findWhere(kostenarten, { "KoId": tmp });
                        if (where) {
                            text = where.Txtmd;
                            result = result.replace("@@ArtK@@", text);
                        }
                    }

                    jQuery.sap.require("sap.ui.core.format.NumberFormat");
                    var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                        maxFractionDigits: 2,
                        minFractionDigits: 2,
                        groupingEnabled: true,
                        groupingSeparator: ".",
                        decimalSeparator: ","
                    });

                    var mMiete;
                    if (konditioneneinigung.MMiete && konditioneneinigung.MkMonate) {
                        mMiete = parseFloat(konditioneneinigung.MMiete) || 0;
                        var mkMonate = parseFloat(konditioneneinigung.MkMonate) || 0;

                        var mkMonateGesamt = mMiete * mkMonate;
                        result = result.replace("@@MkMonateGesamt@@", oNumberFormat.format(mkMonateGesamt));

                        if (konditioneneinigung.MkAbsolut) {
                            var mkGesamt = mkMonateGesamt + (parseFloat(konditioneneinigung.MkAbsolut) || 0);
                            result = result.replace("@@MkGesamt@@", oNumberFormat.format(mkGesamt));
                        }
                    }

                    if (konditioneneinigung.MMiete && konditioneneinigung.BkMonatsmieten) {
                        mMiete = parseFloat(konditioneneinigung.MMiete) || 0;
                        var bkMonate = parseFloat(konditioneneinigung.BkMonatsmieten) || 0;

                        var bkMonateGesamt = mMiete * bkMonate;
                        result = result.replace("@@BkMonateGesamt@@", oNumberFormat.format(bkMonateGesamt));

                        if (konditioneneinigung.BkAbsolut) {
                            var bkGesamt = bkMonateGesamt + (parseFloat(konditioneneinigung.BkAbsolut) || 0);
                            result = result.replace("@@BkGesamt@@", oNumberFormat.format(bkGesamt));
                        }
                    }

                    var gesamtDifferenz = (parseFloat(konditioneneinigung.GesErtrag) || 0) - (parseFloat(konditioneneinigung.GesKosten) || 0);
                    result = result.replace("@@GesDiff@@", oNumberFormat.format(gesamtDifferenz));


                    // Restliche Keys ersetzen
                    Object.keys(konditioneneinigung).forEach(function (key) {
                        var value = konditioneneinigung[key];

                        if (value instanceof Date) {
                            result = result.replace("@@" + key + "@@", value.toLocaleDateString());
                        } else {
                            if (value) {
                                if (!isNaN(value) && value.toString().indexOf(".") != -1) {
                                    result = result.replace("@@" + key + "@@", oNumberFormat.format(value));
                                } else {
                                    result = result.replace("@@" + key + "@@", value);
                                }
                            }
                        }
                    });

                    var mietflaechenangabeHtml = "<table class=\"cellSpacedTable\">";

                    mietflaechenangabeHtml += "<tr>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Lfd Nr<br>Split</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>MO<br>Bezeichnung</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Nutzungsart</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Hauptnutzfläche<br>HNF alternativ</b><br>FE</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Marktübliche Miete<br>Angebotsmiete</b><br>WHG/FE</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Grundausbaukosten<br>Mieterausbaukosten</b><br>WHG/FE</td>";
                    mietflaechenangabeHtml += "</tr>";

                    konditioneneinigung.KeToOb.forEach(function (mietflaechenangabe, i) {
                        var index = i + 1;
                        tmp = mietflaechenangabe.Nutzart;
                        var nutzart = nutzarten[tmp];
                        nutzart = nutzart ? nutzart : mietflaechenangabe.Nutzart;

                        var hnfl = mietflaechenangabe.Hnfl ? oNumberFormat.format(mietflaechenangabe.Hnfl) : mietflaechenangabe.Hnfl;
                        var hnflalt = mietflaechenangabe.HnflAlt ? oNumberFormat.format(mietflaechenangabe.HnflAlt) : mietflaechenangabe.HnflAlt;
                        var nhMiete = mietflaechenangabe.NhMiete ? oNumberFormat.format(mietflaechenangabe.NhMiete) : mietflaechenangabe.NhMiete;
                        var anMiete = mietflaechenangabe.AnMiete ? oNumberFormat.format(mietflaechenangabe.AnMiete) : mietflaechenangabe.AnMiete;
                        var gaKosten = mietflaechenangabe.GaKosten ? oNumberFormat.format(mietflaechenangabe.GaKosten) : mietflaechenangabe.GaKosten;
                        var maKosten = mietflaechenangabe.MaKosten ? oNumberFormat.format(mietflaechenangabe.MaKosten) : mietflaechenangabe.MaKosten;

                        var mfsplit = mietflaechenangabe.MfSplit ? "Ja" : "Nein";
                        mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: center \">" + index + "<br>" + mfsplit + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: left; width: 160px !important;\">" + mietflaechenangabe.MoId + "<br>" + mietflaechenangabe.Bezei + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: left; width: 65px !important; \">" + nutzart + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: right \">" + hnfl + "<br>" + hnflalt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: right \">" + nhMiete + "<br>" + anMiete + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: right \">" + gaKosten + "<br>" + maKosten + "</td>";
                        mietflaechenangabeHtml += "</tr>";
                    });
                    mietflaechenangabeHtml += "</table>";
                    result = result.replace("@@Mietflaechenangaben@@", mietflaechenangabeHtml);


                    var genehmigerHtml = "<table class=\"cellSpacedTable\">";
                    genehmigerHtml += "<tr>";
                    genehmigerHtml += "<td class=\"auto-style7\">Stufe</span></td>";
                    genehmigerHtml += "<td class=\"auto-style7\">Name</span></td>";
                    genehmigerHtml += "<td class=\"auto-style7\">Status</span></td>";
                    genehmigerHtml += "</tr>";

                    var textModel = sap.ui.getCore().getModel("text");
                    var stati = textModel.oData.status;
                    _.map(stufen, function (genehmigung) {
                        var genehmiger = genehmigung.Name;
                        var stufenId = genehmigung.Stufe;
                        var statusId = genehmigung.Status;
                        var statusTrl = stati[statusId] ? stati[statusId] : "unbekannt";
                        var stufe;
                        switch(stufenId){
                            case "SB":
                                stufe = "Sachbearbeiter";
                                break;
                            case "GL":
                                stufe = "Gruppenleiter";
                                break;
                            case "AL":
                                stufe = "Abteilungsleiter";
                                break;
                            case "GS":
                                stufe = "Geschäftsführung";
                                break;
                            case "GF":
                                stufe = "Geschäftsführung";
                                break;
                            case "BL":
                                stufe = "Bereichsleiter";
                                break;
                            default:
                                stufe = "";
                        }

                        genehmigerHtml += "<tr>";
                        genehmigerHtml += "<td class=\"greyBGPad\" style=\"text-align: left; \">" + stufe + "</td>";
                        genehmigerHtml += "<td class=\"greyBGPad\" style=\"text-align: left; \">" + genehmiger + "</td>";
                        genehmigerHtml += "<td class=\"greyBGPad\" style=\"text-align: left; \">" + statusTrl + "</td>";
                        genehmigerHtml += "</tr>";
                    });

                    genehmigerHtml += "</table>";
                    result = result.replace("@@MoeglicheGenehmiger@@", genehmigerHtml);

                    // Restliche Platzhalter entfernen
                    result = result.replace(/@@\w*@@/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

                    res = result;
                });

                jQuery.ajaxSetup({
                    async: true,
                    cache: true
                });

                return res;
            },

            printKonditioneneinigung: function (konditioneneinigung, kostenarten, ertragsarten) {
                console.log(konditioneneinigung, "keToPrint");

                var printableHtml = this.generatePrintableHtmlForKonditioneneinigung(konditioneneinigung, kostenarten, ertragsarten);
                var printWindow = window.open("", "", "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0");
                printWindow.document.write(printableHtml);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            },

            printBeschlussantrag: function (konditioneneinigung, kostenarten, ertragsarten) {
                var _this = this;
                var keId = konditioneneinigung.KeId;
                var stufenListe;

                DataProvider.readGenehmigungsprozessSetAsync(keId, null).then(function (genehmigungen) {
                        var genehmigungenGruppiert = _.groupBy(genehmigungen, function (genehmigung) {
                            return genehmigung.Stufe;
                        });

                        var stufen = _.map(_.pairs(genehmigungenGruppiert), function (pair) {
                            return {
                                Stufe: pair[0],
                                genehmigungen: _.sortBy(pair[1], function (genehmigung) {
                                    return genehmigung.Index;
                                })
                            };
                        });

                        // Lade moegliche Genehmiger
                        var promises = [];
                        _.map(stufen, function (stufe) {
                            _.map(stufe.genehmigungen, function (genehmigung) {
                                var genehmiger = genehmigung.Genehmiger;
                                var stufenId = stufe.Stufe;

                                var promise = DataProvider.readGenehmigerSetAsync(genehmiger, stufenId);
                                promise.then(function (genehmigerSet) {
                                    genehmigung.available = genehmigerSet;
                                });
                                promises.push(promise);
                            });
                        });

                        Q.all(promises).then(function () {
                            stufenListe = genehmigungen;

                            var printableHtml = _this.generatePrintableHtmlForBeschlussantrag(konditioneneinigung, kostenarten, ertragsarten, stufenListe);
                            var printWindow = window.open("", "", "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0");
                            printWindow.document.write(printableHtml);
                            printWindow.document.close();
                            printWindow.focus();
                            printWindow.print();
                            printWindow.close();
                        });
                    })
                    .catch(function (oError) {
                        ErrorMessageUtil.showError(oError);
                    })
                    .done();
            }
        };
    });