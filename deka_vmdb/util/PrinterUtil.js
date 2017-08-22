/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:45:16 
 * @Last Modified by: Christian Hoff (best practice consulting AG)
 * @Last Modified time: 2017-06-22 10:59:02
 */
sap.ui.define(["ag/bpc/Deka/util/PrinterUtil",
    "ag/bpc/Deka/util/DataProvider",
    "ag/bpc/Deka/util/StaticData"], function (PrinterUtil, DataProvider, StaticData) {

        "use strict";
        return {

            getBasePath: function () {
                return jQuery.sap.getModulePath("ag.bpc.Deka");
            },

            druckvorlageVermietungsaktivitaet: "/util/DruckvorlageVermietungsaktivitaet.html",

            druckvorlageKonditioneneinigung: "/util/DruckvorlageKonditioneneinigung.html",

            druckvorlageBeschlussantrag: "/util/DruckvorlageBeschlussantrag.html",

            generatePrintableHtmlForVermietungsaktivitaet: function (vermietungsaktivitaet, kostenarten, ertragsarten) {
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
                var kategorien = textModel.oData.kategorie;
                var vermietungsarten = textModel.oData.vermietungsart;
                var stati = textModel.oData.status;

                jQuery.get(_this.getBasePath() + _this.druckvorlageVermietungsaktivitaet, function (result) {
                    var bezeichnung = vermietungsaktivitaet.VaToWe.Plz + "/" + vermietungsaktivitaet.VaToWe.Ort + "/" + vermietungsaktivitaet.VaToWe.StrHnum;
                    if (bezeichnung) {
                        result = result.replace("@@VaBezeichnung@@", bezeichnung);
                    }

                    var vaid = vermietungsaktivitaet.VaId;
                    if (vaid) {
                        result = result.replace("@@VaId2@@", vaid);
                    }

                    var mietbeginn = vermietungsaktivitaet.Mietbeginn;
                    if (mietbeginn) {
                        result = result.replace("@@Mietbeginn@@", mietbeginn.toLocaleDateString());
                    }

                    var lzFb = vermietungsaktivitaet.LzFirstbreak;
                    if(lzFb){
                        result = result.replace("@@LzFirstbreak2@@", lzFb);
                    }

                    var mzErsterMonat = vermietungsaktivitaet.MzErsterMonat;
                    if (mzErsterMonat) {
                        result = result.replace("@@MzErsterMonat@@", mzErsterMonat.toLocaleDateString());
                    }

                    var akErsterMonat = vermietungsaktivitaet.AkErsterMonat;
                    if (akErsterMonat) {
                        result = result.replace("@@AkErsterMonat@@", akErsterMonat.toLocaleDateString());
                    }

                    var bdgstp = vermietungsaktivitaet.Budgetstp;
                    result = result.replace("@@Budgetstp@@", bdgstp ? "Ja" : "Nein");

                    var monatJahr = vermietungsaktivitaet.MonatJahr;
                    result = result.replace("@@MonatJahr@@", monatJahr === "M" ? "Monat" : "Jahr");

                    var plr = vermietungsaktivitaet.PLRelevant;
                    var plrString = plr ? "Ja" : "Nein";
                    result = result.replace("@@PLRelevant@@", plrString);

                    var stsl = vermietungsaktivitaet.Steuerschlg;
                    var stslString = stsl ? "Ja" : "Nein";
                    result = result.replace("@@Steuerschlg@@", stslString);

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

                    jQuery.sap.require("sap.ui.core.format.NumberFormat");
                    var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                        maxFractionDigits: 2,
                        minFractionDigits: 2,
                        groupingEnabled: true,
                        groupingSeparator: ".",
                        decimalSeparator: ","
                    });

                    var mMiete;
                    if (vermietungsaktivitaet.MMiete && vermietungsaktivitaet.MkMonate) {
                        mMiete = parseFloat(vermietungsaktivitaet.MMiete);
                        var mkMonate = parseFloat(vermietungsaktivitaet.MkMonate);

                        var mkMAbs = mMiete * mkMonate;
                        result = result.replace("@@MkMAbs@@", oNumberFormat.format(mkMAbs));

                        if (vermietungsaktivitaet.MkAbsolut) {
                            var mkGesamt = mkMAbs + parseFloat(vermietungsaktivitaet.MkAbsolut);
                            result = result.replace("@@MkGesamt@@", oNumberFormat.format(mkGesamt));
                        }
                    }

                    if (vermietungsaktivitaet.MMiete && vermietungsaktivitaet.BkMonate) {
                        mMiete = parseFloat(vermietungsaktivitaet.MMiete);
                        var bkMonate = parseFloat(vermietungsaktivitaet.BkMonate);

                        var bkMAbs = mMiete * bkMonate;
                        result = result.replace("@@BkMAbs@@", oNumberFormat.format(bkMAbs));

                        if (vermietungsaktivitaet.BkAbsolut) {
                            var bkGesamt = bkMAbs + parseFloat(vermietungsaktivitaet.BkAbsolut);
                            result = result.replace("@@BkGesamt@@", oNumberFormat.format(bkGesamt));
                        }
                    }

                    var diff1 = parseFloat(vermietungsaktivitaet.GesErtragPa) - parseFloat(vermietungsaktivitaet.GesKeErtrag);
                    if (diff1) {
                        result = result.replace("@@Diff1@@", oNumberFormat.format(diff1));
                    }

                    var diff2 = parseFloat(vermietungsaktivitaet.GesKosten) - parseFloat(vermietungsaktivitaet.GesKeKosten);
                    if (diff2) {
                        result = result.replace("@@Diff2@@", oNumberFormat.format(diff2));
                    }

                    var diff3 = parseFloat(vermietungsaktivitaet.GesVaErtragLz) - parseFloat(vermietungsaktivitaet.GesKeErtragLz);
                    if(diff3) {
                        result = result.replace("@@Diff3@@", oNumberFormat.format(diff3));
                    }

                    // Restliche Keys ersetzen
                    Object.keys(vermietungsaktivitaet).forEach(function (key, index) {
                        var value = vermietungsaktivitaet[key];

                        if (value instanceof Date) {
                            result = result.replace("@@" + key + "@@", value.toLocaleDateString());
                        } else {
                            if (value) {
                                // Nur floats formattieren
                                if (!isNaN(value) && value.toString().indexOf('.') != -1) {
                                    result = result.replace("@@" + key + "@@", "<span style=\"text-align: right\">" + oNumberFormat.format(value) + "</span>");
                                } else {
                                    result = result.replace("@@" + key + "@@", value);
                                }
                            }
                        }
                    });

                    var mietflaechenangabeHtml = "<table class=\"cellSpacedTable\">";

                    mietflaechenangabeHtml += "<tr>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Lfd Nr <br /> Split</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>MO<br /> Bezeichnung</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Nutzungsart <br /> NA alternativ</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Hauptnutzfläche <br /> HNF alternativ</b> <br /> FE</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Marktübliche Miete<br /> Angebotsmiete</b> <br /> WHG/FE</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Grundausbaukosten <br /> Mieterausbaukosten</b> <br /> WHG/FE</td>";
                    mietflaechenangabeHtml += "</tr>";

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

                        var mfsplit = mietflaechenangabe.MfSplit ? "Ja" : "Nein";
                        mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:center;\">" + index + "<br />" + mfsplit + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;width: 160px !important;\">" + mietflaechenangabe.MoId + "<br />" + mietflaechenangabe.Bezei + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + nutzart + "<br />" + nutzartAlt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + hnfl + "<br />" + hnflalt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + nhMiete + "<br />" + anMiete + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + gaKosten + "<br />" + maKosten + "</td>";
                        mietflaechenangabeHtml += "</tr>";
                    });
                    mietflaechenangabeHtml += "</table>";
                    result = result.replace("@@Mietflaechenangaben@@", mietflaechenangabeHtml);

                    if (vermietungsaktivitaet.Kategorie === "01") {
                        var keMappingHtml = "<td class=\"auto-style7\" style=\"width: 25%;\">Zugrundeliegende Konditioneneinigungen:</td>";

                        keMappingHtml += "<td class=\"greyBGPad\">";
                        vermietungsaktivitaet.VaToMap.forEach(function (ke, i) {
                            if (ke.Aktiv) {
                                keMappingHtml += ke.KeId;

                                if (i < vermietungsaktivitaet.VaToMap.length - 1) {
                                    keMappingHtml += ", ";
                                }
                            }
                        });
                        keMappingHtml += "</td>";
                        result = result.replace("@@KEMapping@@", keMappingHtml);
                    } else {
                        result = result.replace("@@KEMapping@@", "<br />");
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

                var res;
                var textModel = sap.ui.getCore().getModel("text");
                console.log(sap.ui.getCore().getModel("text"));

                var anmerkungen = textModel.oData.anmerkung;
                var nutzarten = textModel.oData.nutzungsart;

                jQuery.get(_this.getBasePath() + _this.druckvorlageKonditioneneinigung, function (result) {
                    var keId = konditioneneinigung.KeId;
                    if (keId) {
                        var cont = result.indexOf("@@KeId@@");
                        result = result.replace("@@KeId@@", keId);
                        result = result.replace("@@KeId2@@", keId);
                    }


                    var bezeichnung = konditioneneinigung.KeToWe.Plz + "/" + konditioneneinigung.KeToWe.Ort + "/" + konditioneneinigung.KeToWe.StrHnum;
                    if (bezeichnung) {
                        result = result.replace("@@KeBezeichnung@@", bezeichnung);
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
                        mMiete = parseFloat(konditioneneinigung.MMiete);
                        var mkMonate = parseFloat(konditioneneinigung.MkMonate);

                        var mkMonateGesamt = mMiete * mkMonate;
                        result = result.replace("@@MkMonateGesamt@@", oNumberFormat.format(mkMonateGesamt));

                        if (konditioneneinigung.MkAbsolut) {
                            var mkGesamt = mkMonateGesamt + parseFloat(konditioneneinigung.MkAbsolut);
                            result = result.replace("@@MkGesamt@@", oNumberFormat.format(mkGesamt));
                        }
                    }

                    if (konditioneneinigung.MMiete && konditioneneinigung.BkMonatsmieten) {
                        mMiete = parseFloat(konditioneneinigung.MMiete);
                        var bkMonate = parseFloat(konditioneneinigung.BkMonatsmieten);

                        var bkMonateGesamt = mMiete * bkMonate;
                        result = result.replace("@@BkMonateGesamt@@", oNumberFormat.format(bkMonateGesamt));

                        if (konditioneneinigung.BkAbsolut) {
                            var bkGesamt = bkMonateGesamt + parseFloat(konditioneneinigung.BkAbsolut);
                            result = result.replace("@@BkGesamt@@", oNumberFormat.format(bkGesamt));
                        }
                    }

                    var gesamtDifferenz = parseFloat(konditioneneinigung.GesErtrag) - parseFloat(konditioneneinigung.GesKosten);
                    if (gesamtDifferenz) {
                        result = result.replace("@@GesDiff@@", oNumberFormat.format(gesamtDifferenz));
                    }

                    // Restliche Keys ersetzen
                    Object.keys(konditioneneinigung).forEach(function (key, index) {
                        var value = konditioneneinigung[key];

                        if (value instanceof Date) {
                            result = result.replace("@@" + key + "@@", value.toLocaleDateString());
                        } else {
                            if (value) {
                                if (!isNaN(value) && value.toString().indexOf('.') != -1) {
                                    result = result.replace("@@" + key + "@@", oNumberFormat.format(value));
                                } else {
                                    result = result.replace("@@" + key + "@@", value);
                                }
                            }
                        }
                    });

                    var mietflaechenangabeHtml = "<table class=\"cellSpacedTable\">";

                    mietflaechenangabeHtml += "<tr>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Lfd Nr <br /> Split</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>MO<br /> Bezeichnung</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Nutzungsart</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Hauptnutzfläche <br /> HNF alternativ</b> <br /> FE</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Marktübliche Miete <br /> Angebotsmiete</b> <br /> WHG/FE</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Grundausbaukosten <br /> Mieterausbaukosten</b> <br /> WHG/FE</td>";
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
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: center;\">" + index + "<br />" + mfsplit + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:left; width: 160px !important;\">" + mietflaechenangabe.MoId + "<br />" + mietflaechenangabe.Bezei + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + nutzart + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + hnfl + "<br />" + hnflalt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + nhMiete + "<br />" + anMiete + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right;\">" + gaKosten + "<br />" + maKosten + "</td>";
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
                        var cont = result.indexOf("@@KeId@@");
                        result = result.replace("@@KeId@@", keId);
                        result = result.replace("@@KeId2@@", keId);
                    }

                    var bezeichnung = konditioneneinigung.KeToWe.Plz + "/" + konditioneneinigung.KeToWe.Ort + "/" + konditioneneinigung.KeToWe.StrHnum;
                    if (bezeichnung) {
                        result = result.replace("@@KeBezeichnung@@", bezeichnung);
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
                        mMiete = parseFloat(konditioneneinigung.MMiete);
                        var mkMonate = parseFloat(konditioneneinigung.MkMonate);

                        var mkMonateGesamt = mMiete * mkMonate;
                        result = result.replace("@@MkMonateGesamt@@", oNumberFormat.format(mkMonateGesamt));

                        if (konditioneneinigung.MkAbsolut) {
                            var mkGesamt = mkMonateGesamt + parseFloat(konditioneneinigung.MkAbsolut);
                            result = result.replace("@@MkGesamt@@", oNumberFormat.format(mkGesamt));
                        }
                    }

                    if (konditioneneinigung.MMiete && konditioneneinigung.BkMonatsmieten) {
                        mMiete = parseFloat(konditioneneinigung.MMiete);
                        var bkMonate = parseFloat(konditioneneinigung.BkMonatsmieten);

                        var bkMonateGesamt = mMiete * bkMonate;
                        result = result.replace("@@BkMonateGesamt@@", oNumberFormat.format(bkMonateGesamt));

                        if (konditioneneinigung.BkAbsolut) {
                            var bkGesamt = bkMonateGesamt + parseFloat(konditioneneinigung.BkAbsolut);
                            result = result.replace("@@BkGesamt@@", oNumberFormat.format(bkGesamt));
                        }
                    }

                    var gesamtDifferenz = parseFloat(konditioneneinigung.GesErtrag) - parseFloat(konditioneneinigung.GesKosten);
                    if (gesamtDifferenz) {
                        result = result.replace("@@GesDiff@@", oNumberFormat.format(gesamtDifferenz));
                    }

                    // Restliche Keys ersetzen
                    Object.keys(konditioneneinigung).forEach(function (key, index) {
                        var value = konditioneneinigung[key];

                        if (value instanceof Date) {
                            result = result.replace("@@" + key + "@@", value.toLocaleDateString());
                        } else {
                            if (value) {
                                if (!isNaN(value) && value.toString().indexOf('.') != -1) {
                                    result = result.replace("@@" + key + "@@", oNumberFormat.format(value));
                                } else {
                                    result = result.replace("@@" + key + "@@", value);
                                }
                            }
                        }
                    });

                    var mietflaechenangabeHtml = "<table class=\"cellSpacedTable\">";

                    mietflaechenangabeHtml += "<tr>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Lfd Nr <br /> Split</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>MO<br /> Bezeichnung</b</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Nutzungsart</b></td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Hauptnutzfläche<br /> HNF alternativ</b> <br /> FE</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Marktübliche Miete <br /> Angebotsmiete</b> <br /> WHG/FE</td>";
                    mietflaechenangabeHtml += "<td class=\"auto-style7\"><b>Grundausbaukosten<br /> Mieterausbaukosten</b> <br /> WHG/FE</td>";
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
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: center \">" + index + "<br />" + mfsplit + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:left; width: 160px !important;\">" + mietflaechenangabe.MoId + "<br />" + mietflaechenangabe.Bezei + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: right \">" + nutzart + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: right \">" + hnfl + "<br />" + hnflalt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: right \">" + nhMiete + "<br />" + anMiete + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: right \">" + gaKosten + "<br />" + maKosten + "</td>";
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
                var printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0');
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
                            var printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0');
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
                    .done(function(){
                        
                    });                
            }
        };
    });