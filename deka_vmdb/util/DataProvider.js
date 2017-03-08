sap.ui.define([], function() {

    "use strict";
    return {

        oDataModel: undefined,

		setModel: function(oDataModel){
			this.oDataModel = oDataModel;
		},

        readKonditioneneinigungAsync: function(Bukrs, KeId){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                _this.oDataModel.read("/KonditioneneinigungSet(Bukrs='"+Bukrs+"',KeId='"+KeId+"')", {

                    urlParameters: {
                        "$expand": "KeToOb,KeToWe,KeToMap"
                    },

                    success: function(oData){
                        console.log(oData);

                        oData.KeToOb = _.map(oData.KeToOb.results, function(objekt){

                            // Zahlen in Strings umwandeln, weil Input Felder die Eingaben sowieso als String speichern
                            objekt.HnflAlt = objekt.HnflAlt.toString();
                            objekt.NhMiete = objekt.NhMiete.toString();
                            objekt.AnMiete = objekt.AnMiete.toString();
                            objekt.GaKosten = objekt.GaKosten.toString();
                            objekt.MaKosten = objekt.MaKosten.toString();

                            // Manuelles zurücksetzen des Confirmation Flag
                            // Wichtig, weil der Mockserver die Werte speichert
                            // Backend würde kein X bei Confirmation liefern
                            objekt.Confirmation = "";
                            return objekt;
                        });

                        // Zusätzliche Felder
                        oData.mieteGesamt = {konditioneneinigung: null};
                        oData.kostenGesamt = {konditioneneinigung: null};
                        oData.arbeitsvorrat = null;

                        resolve(oData);
                    },

                    error: function(oError){
                        reject(oError);
                    }

                });

            });

        },

        readVermietungsaktivitaetAsync: function(Bukrs, VaId){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                _this.oDataModel.read("/VermietungsaktivitaetSet(Bukrs='" + Bukrs + "',VaId='" + VaId + "')", {

                    urlParameters: {
                        "$expand": "VaToOb,VaToMap"
                    },

                    success: function(oData){
                        console.log(oData);

                        oData.VaToOb = _.map(oData.VaToOb.results, function(objekt){

                            // Zahlen in Strings umwandeln, weil Input Felder die Eingaben sowieso als String speichern
                            objekt.HnflAlt = objekt.HnflAlt.toString();
                            objekt.NhMiete = objekt.NhMiete.toString();
                            objekt.AnMiete = objekt.AnMiete.toString();
                            objekt.GaKosten = objekt.GaKosten.toString();
                            objekt.MaKosten = objekt.MaKosten.toString();

                            return objekt;
                        });

                        // Zusätzliche Felder
                        oData.mieteGesamt = {vermietungsaktivitaet: null, konditioneneinigung: null, differenz: null};
                        oData.kostenGesamt = {vermietungsaktivitaet: null, konditioneneinigung: null, differenz: null};
                        oData.arbeitsvorrat = null;

                        resolve(oData);
                    },

                    error: function(oError){
                        reject(oError);
                    }

                });

            });
        },

        readKondSelSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){

                _this.oDataModel.read("/KondSelSet", {
                    success: function(oData){
                        resolve(oData.results);
                    },
                    error: function(oError){
                        reject(oError);
                    } 
                });

            });

        },

        readVermSelSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.read("/VermSelSet", {
                    success: function(oData){
                        resolve(oData.results);
                    },
                    error: function(oError){
                        reject(oError);
                    } 
                });
            });
        },

        readWirtschaftseinheitAsync: function(Bukrs, WeId){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                _this.oDataModel.read("/WirtschaftseinheitenSet(Bukrs='" + Bukrs + "',WeId='" + WeId + "')", {

                    success: function(oData){                       
                        console.log(oData);
                        resolve(oData);
                    },

                    error: function(oError){
                        reject(oError);
                    }
                });

            });

        },

        readMietvertragAsync: function(Bukrs, MvId){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                _this.oDataModel.read("/MietvertragSet(Bukrs='" + Bukrs + "',MvId='" + MvId + "')", {

                    urlParameters: {
                        "$expand": "MvToWe"
                    },

                    success: function(oData){
                        console.log(oData);
                        resolve(oData);
                    },

                    error: function(oError){
                        reject(oError);
                    }

                });

            });

        },

        readSperrenAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){

                _this.oDataModel.read("/SperreSet", {
                    success: function(oData){
                        console.log(oData.results);
                        resolve(oData.results);
                    },
                    error: function(oError){
                        reject(oError);
                    }
                });

            });
        },

        readAnmerkungSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){

                _this.oDataModel.read("/AnmerkungSet", {
                    success: function(oData){
                        resolve(oData.results);
                    },
                    error: function(oError){
                        reject(oError);
                    }
                });

            });
        }

    };
});