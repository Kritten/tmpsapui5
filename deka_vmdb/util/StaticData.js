sap.ui.define(["ag/bpc/Deka/util/DataProvider"], function(DataProvider) {

    "use strict";
    return {

        NUTZUNGSARTEN: [],

        KOSTENARTEN: [
            {Id: 'ArtKosten 1', Text: 'Sonstige Kostenart 1'},
            {Id: 'ArtKosten 2', Text: 'Sonstige Kostenart 2'},
            {Id: 'ArtKosten 3', Text: 'Sonstige Kostenart 3'}
        ],

        ERTRAGSARTEN: [
            {Id: 'ArtErtrag 1', Text: 'Sonstige Ertragsart 1'},
            {Id: 'ArtErtrag 2', Text: 'Sonstige Ertragsart 2'},
            {Id: 'ArtErtrag 3', Text: 'Sonstige Ertragsart 3'}
        ],


        ZEITSPANNEN: [
            {Id: 'M', Text: 'Monatsmiete'},
            {Id: 'J', Text: 'Jahresmiete'}
        ],

        ANMERKUNGEN: [],

        KE: {
            STATUSWERTE: [{Id: '01', Text: 'Konditioneneinigung'}]
        },

        init: function(){
            this.ANMERKUNGEN = DataProvider.readAnmerkungSetAsync();
            this.NUTZUNGSARTEN = DataProvider.readNutzungsartSetAsync();
        }

    };
});