sap.ui.define(["ag/bpc/Deka/util/PrinterUtil"], function (PrinterUtil) {
	
	"use strict";
	return {
		
        druckvorlageVermietungsaktivitaet: "<!DOCTYPE html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'/><style>table {border-collapse: collapse; width: 100%;}table, th, td {border: 1px solid black;}</style></head><html><body><h1>Vermietungsaktivität @@VaId@@</h1>Buchungskreis: @@Bukrs@@ <br/>Wirtschaftseinheit: @@Wirtschaftseinheit@@ <br/>Bezeichnung: @@Bezeichnung@@<h2>Mietflächenangaben</h2>@@Mietflaechenangaben@@<h2>Gemeinsame Angaben</h2>Mietbeginn: @@Mietbeginn@@ <br/>Laufzeit bis 1st break option in Monaten: @@LzFirstbreak@@ <br/>Gültigkeit Konditioneneinigung: @@Mietbeginn@@ <br/>Vermietungsart: @@Vermietungsart@@ <br/>Pönale in Währung: @@Poenale@@ <br/>Indexweitergabe in %: @@IdxWeitergabe@@ <br/>Planungsrelevanz: @@PLRelevant@@ <br/>Mietfreie Zeiten in Monaten: @@MzMonate@@ <br/>Maklerkosten in Monatsmieten: @@MkMonate@@ <br/>Beratungskosten in Monatsmieten: @@BkMonate@@<h2>Sonstige Angaben</h2>Debitorennummer: @@Debitor@@ <br/>Mietername: @@Debitorname@@ <br/>Bonität: @@Bonitaet@@ <br/>Status: @@Status@@ <br/>Anmerkung: @@Anmerkung@@ <br/>Bemerkung: @@Bemerkung@@<h2>Miete und Kosten</h2></body></html>",

        druckvorlageKonditioneneinigung: "<!DOCTYPE html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'/><style>table {border-collapse: collapse; width: 100%;}table, th, td {border: 1px solid black;}</style></head><html><body><h1>Konditioneneinigung @@KeId@@</h1>Buchungskreis: @@Bukrs@@ <br/>Wirtschaftseinheit: @@Wirtschaftseinheit@@ <br/>Bezeichnung: @@Bezeichnung@@<h2>Mietflächenangaben</h2>@@Mietflaechenangaben@@<h2>Gemeinsame Angaben</h2>Mietbeginn: @@Mietbeginn@@ <br/>Laufzeit bis 1st break option in Monaten: @@LzFirstbreak@@ <br/>Gültigkeit Konditioneneinigung: @@Mietbeginn@@ <br/>Vermietungsart: @@Vermietungsart@@ <br/>Pönale in Währung: @@Poenale@@ <br/>Indexweitergabe in %: @@IdxWeitergabe@@ <br/>Planungsrelevanz: @@PLRelevant@@ <br/>Mietfreie Zeiten in Monaten: @@MzMonate@@ <br/>Maklerkosten in Monatsmieten: @@MkMonate@@ <br/>Beratungskosten in Monatsmieten: @@BkMonate@@<h2>Sonstige Angaben</h2>Debitorennummer: @@Debitor@@ <br/>Mietername: @@Debitorname@@ <br/>Bonität: @@Bonitaet@@ <br/>Status: @@Status@@ <br/>Anmerkung: @@Anmerkung@@ <br/>Bemerkung: @@Bemerkung@@<h2>Miete und Kosten</h2></body></html>",

        generatePrintableHtmlForVermietungsaktivitaet: function(vermietungsaktivitaet){

            var result = this.druckvorlageVermietungsaktivitaet;
            
            Object.keys(vermietungsaktivitaet).forEach(function(key, index) {

                result = result.replace("@@"+key+"@@", vermietungsaktivitaet[key]);
            });

            var mietflaechenangabeHtml = "<table>";

            mietflaechenangabeHtml += "<tr>";
                mietflaechenangabeHtml += "<td>AnMiete</td>";
                mietflaechenangabeHtml += "<td>GaKosten</td>";
                mietflaechenangabeHtml += "<td>Hnfl</td>";
                mietflaechenangabeHtml += "<td>HnflAlt</td>";
                mietflaechenangabeHtml += "<td>MaKosten</td>";
                mietflaechenangabeHtml += "<td>NhMiete</td>";
            mietflaechenangabeHtml += "</tr>";

            vermietungsaktivitaet.VaToOb.forEach(function(mietflaechenangabe){

                mietflaechenangabeHtml += "<tr>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.AnMiete + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.GaKosten + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.Hnfl + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.HnflAlt + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.MaKosten + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.NhMiete + "</td>";
                mietflaechenangabeHtml += "</tr>";
            });
            mietflaechenangabeHtml += "</table>";

            result = result.replace("@@Mietflaechenangaben@@", mietflaechenangabeHtml);


            // Restliche Platzhalter entfernen
            result = result.replace(/@@\w*@@/g, "");

            return result;
        },
        
        generatePrintableHtmlForKonditioneneinigung: function(konditioneneinigung){

            var result = this.druckvorlageKonditioneneinigung;
            
            Object.keys(konditioneneinigung).forEach(function(key, index) {

                result = result.replace("@@"+key+"@@", konditioneneinigung[key]);
            });

            var mietflaechenangabeHtml = "<table>";

            mietflaechenangabeHtml += "<tr>";
                mietflaechenangabeHtml += "<td>AnMiete</td>";
                mietflaechenangabeHtml += "<td>GaKosten</td>";
                mietflaechenangabeHtml += "<td>Hnfl</td>";
                mietflaechenangabeHtml += "<td>HnflAlt</td>";
                mietflaechenangabeHtml += "<td>MaKosten</td>";
                mietflaechenangabeHtml += "<td>NhMiete</td>";
            mietflaechenangabeHtml += "</tr>";

            konditioneneinigung.KeToOb.forEach(function(mietflaechenangabe){

                mietflaechenangabeHtml += "<tr>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.AnMiete + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.GaKosten + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.Hnfl + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.HnflAlt + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.MaKosten + "</td>";
                    mietflaechenangabeHtml += "<td>" + mietflaechenangabe.NhMiete + "</td>";
                mietflaechenangabeHtml += "</tr>";
            });
            mietflaechenangabeHtml += "</table>";

            result = result.replace("@@Mietflaechenangaben@@", mietflaechenangabeHtml);


            // Restliche Platzhalter entfernen
            result = result.replace(/@@\w*@@/g, "");

            return result;
        }
        
	};
});