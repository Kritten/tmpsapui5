/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:45:16 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:45:16 
 */
sap.ui.define(["ag/bpc/Deka/util/PrinterUtil",
"ag/bpc/Deka/util/DataProvider"], function (PrinterUtil, DataProvider) {
	
	"use strict";
	return {
		
        druckvorlageVermietungsaktivitaet: "/deka_vmdb/util/DruckvorlageVermietungsaktivitaet.html",

        druckvorlageKonditioneneinigung: "/deka_vmdb/util/DruckvorlageKonditioneneinigung.html",

        generatePrintableHtmlForVermietungsaktivitaet: function(vermietungsaktivitaet, kostenarten, ertragsarten){
            this.ladeDruckVorlagen();

            jQuery.ajaxSetup({async:false});
            var res;
            var textModel = sap.ui.getCore().getModel("text");
            console.log(sap.ui.getCore().getModel("text"));

            var anmerkungen = textModel.oData.anmerkung;
            var nutzarten = textModel.oData.nutzungsart;
            var kategorien = textModel.oData.kategorie;
            var vermietungsarten = textModel.oData.vermietungsart;
            var stati = textModel.oData.status;

            jQuery.get(this.druckvorlageVermietungsaktivitaet, function(result){   
                var bezeichnung = vermietungsaktivitaet.VaToWe.Plz + "/" + vermietungsaktivitaet.VaToWe.Ort + "/" + vermietungsaktivitaet.VaToWe.StrHnum;
                result = result.replace("@@VaBezeichnung@@", bezeichnung);

                var mietbeginn = vermietungsaktivitaet.Mietbeginn;
                result = result.replace("@@Mietbeginn@@", mietbeginn.toLocaleDateString());

                var mzErsterMonat = vermietungsaktivitaet.MzErsterMonat;
                result = result.replace("@@MzErsterMonat@@", mzErsterMonat.toLocaleDateString());

                var akErsterMonat = vermietungsaktivitaet.AkErsterMonat;
                result = result.replace("@@AkErsterMonat@@", akErsterMonat.toLocaleDateString());

                var bdgstp = vermietungsaktivitaet.Budgetstp;
                result = result.replace("@@Budgetstp@@", bdgstp ? "Ja" : "Nein");

                var plr = vermietungsaktivitaet.PLRelevant;
                result = result.replace("@@PLRelevant@@", plr ? "Ja" : "Nein");

                var druckDatum = new Date();
                result = result.replace("@@Druckdatum@@", druckDatum.toLocaleDateString());
                
                var tmp = vermietungsaktivitaet.Anmerkung;
                var where = _.findWhere(anmerkungen, {"Id": tmp});
                var text;
                if(where){
                    text = where.Txtlg;
                    result = result.replace("@@AnmerkungText@@", text);
                }

                tmp = vermietungsaktivitaet.Kategorie;
                where = kategorien[tmp];
                if(where){
                    result = result.replace("@@VaTyp@@", where);
                }

                tmp = vermietungsaktivitaet.Vermietungsart;
                where = vermietungsarten[tmp];
                if(where){                    
                    result = result.replace("@@VaArt@@", where);
                }

                tmp = vermietungsaktivitaet.Status;
                where = stati[tmp];
                if(where){
                    result = result.replace("@@Status@@", where);
                }

                tmp = vermietungsaktivitaet.ArtErtrag;
                where = _.findWhere(ertragsarten, {"ErId": tmp});
                if(where){
                    text = where.Txtmd;
                    result = result.replace("@@ArtErtrag@@", text);
                }

                tmp = vermietungsaktivitaet.ArtKosten;
                where = _.findWhere(kostenarten, {"KoId": tmp});
                if(where){
                    text = where.Txtmd;
                    result = result.replace("@@ArtKosten@@", text);
                }

                jQuery.sap.require("sap.ui.core.format.NumberFormat");
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    maxFractionDigits: 2,
                    groupingEnabled: true,
                    groupingSeparator: ".",
                    decimalSeparator: ","
                });
                var gesamtDifferenz = parseFloat(vermietungsaktivitaet.GesErtrag) - parseFloat(vermietungsaktivitaet.GesKosten);
                result = result.replace("@@GesDiff@@", oNumberFormat.format(gesamtDifferenz));

                // Restliche Keys ersetzen
                Object.keys(vermietungsaktivitaet).forEach(function(key, index) {
                    var value = vermietungsaktivitaet[key];

                    // Nur floats formattieren
                    if (value && !isNaN(value) && value.toString().indexOf('.') != -1){
                        result = result.replace("@@"+key+"@@", "<span style=\"text-align: right\">" + oNumberFormat.format(value) + "</span>");
                    }else{
                        result = result.replace("@@"+key+"@@", value);
                    }
                });

                var mietflaechenangabeHtml = "<table class=\"cellSpacedTable\">";

                mietflaechenangabeHtml += "<thead><tr>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Lfd Nr</span></td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">MO<br /> Bezeichnung</span></td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Nutzungsart <br /> NA alternativ</span></td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Hauptnutzfläche</span> <br /> <span style=\"font-weight:bold\">HNFZF alternativ</span> <br /> FE</td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Marktübliche Miete</span> <br /> <span style=\"font-weight:bold\">Angebotsmiete</span> <br /> WHG/FE</td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Grundausbaukosten</span> <br /> <span style=\"font-weight:bold\">Mieterausbaukosten</span> <br /> WHG/FE</td>";
                mietflaechenangabeHtml += "</tr></thead>";

                vermietungsaktivitaet.VaToOb.forEach(function(mietflaechenangabe, i){
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

                    mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:center\">" + index + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\">" + mietflaechenangabe.Bezei + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\">" + nutzart + "<br />" + nutzartAlt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right\">" + hnfl + "<br />" + hnflalt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right\">" + nhMiete + "<br />" + anMiete + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align:right\">" + gaKosten + "<br />" + maKosten + "</td>";
                    mietflaechenangabeHtml += "</tr>";
                });
                mietflaechenangabeHtml += "</table>";

                result = result.replace("@@Mietflaechenangaben@@", mietflaechenangabeHtml);

                // Restliche Platzhalter entfernen
                result = result.replace(/@@\w*@@/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

                res = result;  
            });      
            jQuery.ajaxSetup({async:true});

            return res;           
        },
        
        generatePrintableHtmlForKonditioneneinigung: function(konditioneneinigung, kostenarten, ertragsarten){
            this.ladeDruckVorlagen();

            jQuery.ajaxSetup({async:false});
            var res;
            var textModel = sap.ui.getCore().getModel("text");
            console.log(sap.ui.getCore().getModel("text"));

            var anmerkungen = textModel.oData.anmerkung;
            var nutzarten = textModel.oData.nutzungsart;
            
            jQuery.get(this.druckvorlageKonditioneneinigung, function(result){
                var bezeichnung = konditioneneinigung.KeToWe.Plz + "/" + konditioneneinigung.KeToWe.Ort + "/" + konditioneneinigung.KeToWe.StrHnum;
                result = result.replace("@@KeBezeichnung@@", bezeichnung);

                var mietbeginn = konditioneneinigung.Mietbeginn;
                result = result.replace("@@Mietbeginn@@", mietbeginn.toLocaleDateString());

                var bdgstp = konditioneneinigung.Budgetstp;
                result = result.replace("@@Budgetstp@@", bdgstp ? "Ja" : "Nein");

                var druckDatum = new Date();
                result = result.replace("@@Druckdatum@@", druckDatum.toLocaleDateString());
                
                var tmp = konditioneneinigung.Anmerkung;
                var where = _.findWhere(anmerkungen, {"Id": tmp});
                var text;
                if(where){
                    text = where.Txtlg;
                    result = result.replace("@@AnmerkungText@@", text);
                }

                tmp = konditioneneinigung.ArtErtrag;
                where = _.findWhere(ertragsarten, {"ErId": tmp});
                if(where){
                    text = where.Txtmd;
                    result = result.replace("@@ArtE@@", text);
                }

                tmp = konditioneneinigung.ArtKosten;
                where = _.findWhere(kostenarten, {"KoId": tmp});
                if(where){
                    text = where.Txtmd;
                    result = result.replace("@@ArtK@@", text);
                }

                jQuery.sap.require("sap.ui.core.format.NumberFormat");
                var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                    maxFractionDigits: 2,
                    groupingEnabled: true,
                    groupingSeparator: ".",
                    decimalSeparator: ","
                });
                var gesamtDifferenz = parseFloat(konditioneneinigung.GesErtrag) - parseFloat(konditioneneinigung.GesKosten);
                result = result.replace("@@GesDiff@@", oNumberFormat.format(gesamtDifferenz));

                // Restliche Keys ersetzen
                Object.keys(konditioneneinigung).forEach(function(key, index) {
                    var value = konditioneneinigung[key];

                    if (value && !isNaN(value) && value.toString().indexOf('.') != -1){
                        result = result.replace("@@"+key+"@@", oNumberFormat.format(value));
                    }else{
                        result = result.replace("@@"+key+"@@", value);
                    }
                });

                var mietflaechenangabeHtml = "<table class=\"cellSpacedTable\">";

                mietflaechenangabeHtml += "<thead><tr>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Lfd Nr</span></td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">MO<br /> Bezeichnung</span></td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Nutzungsart</span></td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Hauptnutzfläche</span> <br /> <span style=\"font-weight:bold\">HNFZF alternativ</span> <br /> FE</td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Marktübliche Miete</span> <br /> <span style=\"font-weight:bold\">Angebotsmiete</span> <br /> WHG/FE</td>";
                    mietflaechenangabeHtml += "<td><span style=\"font-weight:bold; font-size:16\">Grundausbaukosten</span> <br /> <span style=\"font-weight:bold\">Mieterausbaukosten</span> <br /> WHG/FE</td>";
                mietflaechenangabeHtml += "</tr></thead>";

                konditioneneinigung.KeToOb.forEach(function(mietflaechenangabe, i){
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

                    mietflaechenangabeHtml += "<tr>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\" style=\"text-align: center\">" + index + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\">" + mietflaechenangabe.Bezei + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\">" + nutzart + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\">" + hnfl + "<br />" + hnflalt + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\">" + nhMiete + "<br />" + anMiete + "</td>";
                        mietflaechenangabeHtml += "<td class=\"greyBGPad\">" + gaKosten + "<br />" + maKosten + "</td>";
                    mietflaechenangabeHtml += "</tr>";
                });
                mietflaechenangabeHtml += "</table>";

                result = result.replace("@@Mietflaechenangaben@@", mietflaechenangabeHtml);

                // Restliche Platzhalter entfernen
                result = result.replace(/@@\w*@@/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

                res = result;  
            });      
            jQuery.ajaxSetup({async:true});

            return res;         
        },
        
        printKonditioneneinigung: function(konditioneneinigung, kostenarten, ertragsarten){
            console.log(konditioneneinigung, "keToPrint");  

            var printableHtml = this.generatePrintableHtmlForKonditioneneinigung(konditioneneinigung, kostenarten, ertragsarten);
            var printWindow = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=1,status=0');
            printWindow.document.write(printableHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();                    
        },

        ladeDruckVorlagen: function(dateiPfad){
            var utilPath = $.sap.getModulePath("ag.bpc.Deka", "/util");

            this.druckvorlageKonditioneneinigung = utilPath + "/DruckvorlageKonditioneneinigung.html";
            this.druckvorlageVermietungsaktivitaet = utilPath + "/DruckvorlageVermietungsaktivitaet.html";
        }
	};
});