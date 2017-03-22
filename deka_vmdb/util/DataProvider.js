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
                        
                        oData.KeToMap = oData.KeToMap.results;

                        oData.KeToOb = _.map(oData.KeToOb.results, function(objekt){

                            // Zahlen in Strings umwandeln, weil Input Felder die Eingaben sowieso als String speichern
                            objekt.Hnfl = objekt.Hnfl.toString();

                            objekt.HnflAlt = objekt.HnflAlt.toString();
                            objekt.HnflAlt = (objekt.HnflAlt === '0.000') ? '' : objekt.HnflAlt;

                            objekt.AnMiete = objekt.AnMiete.toString();
                            objekt.GaKosten = objekt.GaKosten.toString();
                            objekt.MaKosten = objekt.MaKosten.toString();

                            return objekt;
                        });

                        // Zusätzliche Felder
                        oData.mieteGesamt = {konditioneneinigung: null};
                        oData.kostenGesamt = {konditioneneinigung: null};
                        oData.arbeitsvorrat = null;

                        console.log(oData);
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
                    urlParameters: {
                        "$filter": "Aktiv eq true"
                    },
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

                    urlParameters: {
                        "$expand": "WeToMo"
                    },

                    success: function(oData){

                        oData.WeToMo = _.map(oData.WeToMo.results, function(objekt){

                            // Zahlen in Strings umwandeln, weil Input Felder die Eingaben sowieso als String speichern
                            objekt.Hnfl = objekt.Hnfl.toString();

                            objekt.HnflAlt = objekt.HnflAlt.toString();
                            objekt.HnflAlt = (objekt.HnflAlt === '0.000') ? '' : objekt.HnflAlt;

                            objekt.AnMiete = objekt.AnMiete.toString();
                            objekt.GaKosten = objekt.GaKosten.toString();
                            objekt.MaKosten = objekt.MaKosten.toString();

                            return objekt;
                        });

                        console.log(oData);
                        resolve(oData);
                    },

                    error: function(oError){
                        reject(oError);
                    }
                });

            });

        },

        readMietvertragAsync: function(WeId, Bukrs, MvId){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {

                _this.oDataModel.read("/MietvertragSet(WeId='"+WeId+"',Bukrs='" + Bukrs + "',MvId='" + MvId + "')", {

                    urlParameters: {
                        "$expand": "MvToWe,MvToMo"
                    },

                    success: function(oData){

                        oData.MvToMo = _.map(oData.MvToMo.results, function(objekt){

                            // Zahlen in Strings umwandeln, weil Input Felder die Eingaben sowieso als String speichern
                            objekt.Hnfl = objekt.Hnfl.toString();

                            objekt.HnflAlt = objekt.HnflAlt.toString();
                            objekt.HnflAlt = (objekt.HnflAlt === '0.000') ? '' : objekt.HnflAlt;

                            objekt.AnMiete = objekt.AnMiete.toString();
                            objekt.GaKosten = objekt.GaKosten.toString();
                            objekt.MaKosten = objekt.MaKosten.toString();

                            return objekt;
                        });

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
                        console.log(oData.results);
                        resolve(oData.results);
                    },
                    error: function(oError){
                        reject(oError);
                    }
                });

            });
        },

        readNutzungsartSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){

                _this.oDataModel.read("/NutzungsartSet", {
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
        },

        updateKonditioneneinigungAsync: function(KeId, Bukrs, payload){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                
                _this.oDataModel.update("/KonditioneneinigungSet(Bukrs='"+Bukrs+"',KeId='"+KeId+"')", payload, {
                    success: function(){
                        resolve();
                    },
                    error: function(oError){
                        reject(oError);
                    }

                });

            });
        },

        readFondsSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.read("/FondsSet", {
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

        readFondAsync: function(Dmfonds){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.read("/FondsSet('" + Dmfonds + "')", {
                    urlParameters: {
                        "$expand": "FoToKo"
                    },
                    success: function(oData){
                        oData.FoToKo = oData.FoToKo.results;
                        console.log(oData);
                        resolve(oData);
                    },
                    error: function(oError){
                        reject(oError);
                    }
                });
            });
        },

        readStatusSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.read("/StatusSet", {
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

        createSperreAsync: function(sperrePayload){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.create("/SperreSet", sperrePayload, {
                    success: function(oData){
                        console.log(oData);
                        resolve(oData);
                    },
                    error: function(oError){
                        console.log(oError);
                        reject(oError);
                    }
                });
            });
        },

        deleteSperreAsync: function(KeId, VaId){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.remove("/SperreSet(KeId='" + KeId + "',VaId='" + VaId + "')", {
                    success: function(oData){
                        resolve(oData);
                    },
                    error: function(oError){
                        reject(oError);
                    }
                });
            });
        },

        createKonditioneneinigungAsync: function(konditioneneinigungPayload){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.create("/KonditioneneinigungSet", konditioneneinigungPayload, {
                    success: function(oData){
                        console.log(oData);
                        resolve(oData);
                    },
                    error: function(oError){
                        console.log(oError);
                        reject(oError);
                    }
                });
            });
        },

        createFavoritAsync: function(favoritPayload){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.create("/FavoritSet", favoritPayload, {
                    success: function(oData){
                        console.log(oData);
                        resolve(oData);
                    },
                    error: function(oError){
                        console.log(oError);
                        reject(oError);
                    }
                });
            });

        },

        deleteFavoritAsync: function(KeId, VaId){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.remove("/FavoritSet(KeId='" + KeId + "',VaId='" + VaId + "')", {
                    success: function(oData){
                        resolve(oData);
                    },
                    error: function(oError){
                        reject(oError);
                    }
                });
            });
        },

        readGenehmigungsprozessSetAsync: function(KeId, VaId){
            var _this = this;
            
            var urlParameters = {};

            if(KeId) {
                urlParameters.$filter = "KeId eq '" + KeId + "'";
            } else if(VaId) {
                urlParameters.$filter = "VaId eq '" + VaId + "'";
            }

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.read("/GenehmigungsprozessSet", {
                    urlParameters: urlParameters,
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