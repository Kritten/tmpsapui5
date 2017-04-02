sap.ui.define(["ag/bpc/Deka/util/DataProvider"], function(DataProvider) {

    "use strict";
    return {

        NUTZUNGSARTEN: null,
        ANMERKUNGEN: null,
        STATUSWERTE: null,
        KATEGORIEN: null,
        STOCKWERKE: null,
        VERTRAGSARTEN: null,
        DIENSTLEISTER: null,
        USER: null,

        VERMIETUNGSARTEN: [
            {key: "01", text: "Anschlussvermietung"},
            {key: "02", text: "Neuvermietung"}
        ],

        ANMERKUNG: {
            KE: {
                IN_ERSTELLUNG: '01',
                ZUR_GEMEHMIGUNG_VORGELEGT: '02',
                GENEHMIGT: '03',
                AUS_WICHTIGEM_GRUND_ZURUECKGEZOGEN: '04',
                NICHT_MEHR_GUELTIG: '05',
                ABGESCHLOSSEN: '06',
                NICHT_GENEHMIGT: '07',
                REAKTIVIERT: '08',
                GELOESCHT: '09',
                VERLAENGERT: '10',
                HNFL_IM_ERP_CHG: '11',
                REEDIT: '12',
                BUDGETSTOPP: '13'
            },
            VA: {
                ABGEBROCHEN: '50',
                ABSTIMMUG_DER_MIETERAUSBAUPLANUNG: '60',
                WIRTSCHAFTLICHE_ECKDATEN_IN_VERHANDLUNG: '61',
                MIETFLAECHE_IN_AUSWAHLPOOL_MIT_KONK_OBJ: '62',
                MIETVERTRAGSVERHANDLUNG_IN_VORBEREITUNG: '70',
                MIETVERTRAGSVERHANDLUNG_BEGONNEN: '71',
                VERTRAGSVERHANDLUNGEN_DAUERN_AN: '72',
                VERTRAGSVERHANDLUNGEN_VERZOEGERN_SICH: '73',
                GENEHMIGTES_MV_ECK_LIEGT_VOR: '74',
                ABSCHLUSS_BINNEN_8_WOCHEN_ERWARTET: '75',
                MIETVERTRAG_NOCH_NICHT_IN_SAP_ERFASST: '80',
                MIETVERTRAG_IN_SAP_ERFASST: '81'
            }
        },

        STATUS: {
            KE: {
                KONDITIONENEINIGUNG: '01'
            },
            VA: {
                ABGEBROCHEN: '10',
                AUSBAUPLANUNG: '20',
                MIETVERTRAGSENTWURF_ERSTELLT: '30',
                MIETVERTRAG_ABGESCHLOSSEN: '90',
                MIETVERTRAG_ANGELEGT: '99'
            }
        },

        KATEGORIE: {
            VA: {
                REGELVERMIETUNG: '01',
                KLEINVERMIETUNG: '02',
                EXTERNE_VERMIETUNG: '03'
            }
        },

        KOSTENARTEN: [
            {Id: '01', Text: 'Sonstige Kostenart 1'},
            {Id: '02', Text: 'Sonstige Kostenart 2'},
            {Id: '03', Text: 'Sonstige Kostenart 3'}
        ],

        ERTRAGSARTEN: [
            {Id: '01', Text: 'Sonstige Ertragsart 1'},
            {Id: '02', Text: 'Sonstige Ertragsart 2'},
            {Id: '03', Text: 'Sonstige Ertragsart 3'}
        ],

        ZEITSPANNEN: [
            {Id: 'M', Text: 'Monatsmiete'},
            {Id: 'J', Text: 'Jahresmiete'}
        ],

        init: function(){
            this.USER = DataProvider.readUserAsync();
            this.ANMERKUNGEN = DataProvider.readAnmerkungSetAsync();
            this.STATUSWERTE = DataProvider.readStatusSetAsync();
            this.NUTZUNGSARTEN = DataProvider.readNutzungsartSetAsync();
            this.KATEGORIEN = DataProvider.readKategorieSetAsync();
            this.STOCKWERKE = DataProvider.readStockwerkSetAsync();
            this.VERTRAGSARTEN = DataProvider.readVertragsArtSetAsync();
            this.DIENSTLEISTER = DataProvider.readDienstleisterSetAsync();
        }

    };
});