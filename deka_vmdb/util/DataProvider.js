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

                        oData.KeToMap = oData.KeToMap.results;

                        oData.KeToOb = _.map(oData.KeToOb.results, function(objekt){

                            // Zahlen in Strings umwandeln, weil Input Felder die Eingaben sowieso als String speichern
                            objekt.HnflAlt = objekt.HnflAlt.toString();
                            objekt.HnflAlt = (objekt.HnflAlt === '0.000') ? '' : objekt.HnflAlt;

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
                        "$expand": "VaToOb,VaToWe,VaToMap"
                    },

                    success: function(oData){
                        console.log(oData);

                        oData.VaToMap = oData.VaToMap.results;

                        oData.VaToOb = _.map(oData.VaToOb.results, function(objekt){

                            // Zahlen in Strings umwandeln, weil Input Felder die Eingaben sowieso als String speichern
                            objekt.HnflAlt = objekt.HnflAlt.toString();
                            objekt.HnflAlt = (objekt.HnflAlt === '0.000') ? '' : objekt.HnflAlt;
                            
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
        },

        readFlaecheSetAsync: function(ausgangseinheit){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                
                _this.oDataModel.read("/FlaecheSet", {

                    urlParameters: {
                        "$filter": "Von eq '" + ausgangseinheit + "'"
                    },
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

        readExchangeRateSetAsync: function(ausgangseinheit){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                
                _this.oDataModel.read("/ExchangeRateSet", {

                    urlParameters: {
                        "$filter": "Von eq '" + ausgangseinheit + "'"
                    },
                    success: function(oData){
                        console.log(oData.results);
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