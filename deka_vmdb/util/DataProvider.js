/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:44:44 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:44:44 
 */
sap.ui.define([], function() {

    "use strict";
    return {

        oDataModel: undefined,

		setModel: function(oDataModel){
            oDataModel.setSizeLimit(1000);
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
                
                // Warnmeldung Test
                // reject({"responseText":"{\"error\":{\"code\":\"ZCL_ZIP_VMDB_MESSAGE/002\",\"message\":{\"lang\":\"de\",\"value\":\"MO: 01010002 bereits in KE_000000002 verwendet.//MO: 01010003 bereits in KE_000000002 verwendet.\"},\"innererror\":{\"application\":{\"component_id\":\"\",\"service_namespace\":\"/SAP/\",\"service_id\":\"ZIP_VMDB_SRV\",\"service_version\":\"0001\"},\"transactionid\":\"58C4C7E9E53A0FFDE10000000A44582D\",\"timestamp\":\"\",\"Error_Resolution\":{\"SAP_Transaction\":\"\",\"SAP_Note\":\"See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)\"},\"errordetails\":[{\"code\":\"/IWBEP/CX_MGW_BUSI_EXCEPTION\",\"message\":\"MO: 01010002 bereits in KE_000000002 verwendet.//MO: 01010003 bereits in KE_000000002 verwendet.\",\"propertyref\":\"\",\"severity\":\"error\",\"target\":\"\"}]}}}"});

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

        createVermietungsaktivitaetAsync: function(vermietungsaktivitaetPayload){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.create("/VermietungsaktivitaetSet", vermietungsaktivitaetPayload, {
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

        readGenehmigerSetAsync: function(moeglicheGenehmiger, stufe){
            var _this = this;

            var urlParamters = {};

            urlParamters.$filter = "Moegliche_Genehmiger eq '" + moeglicheGenehmiger + "' and Stufe eq '" + stufe + "'";
            
            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.read("/GenehmigerSet", {
                    urlParameters: urlParamters,
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
        },

        updateGenehmigungsprozessSetAsync: function(index, KeId, VaId, stufe, payload){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.update("/GenehmigungsprozessSet(Index='"+index+"',KeId='"+KeId+"',VaId='" + VaId + "',Stufe='"+stufe+"')", payload, {
                    success: function(){
                        resolve();
                    },
                    error: function(oError){
                        reject(oError);
                    }

                });
            });
        },

        readKategorieSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify){
                _this.oDataModel.read("/KategorieSet", {
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

        readDebitorenSetAsync: function(){
            var _this = this;
            
            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/DebitorSet", {
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

        readUserAsync: function(){
            var _this = this;
            
            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/UserSet", {
                    success: function(oData){
                        console.log(oData.results[0]);
                        resolve(oData.results[0]);
                    },
                    error: function(oError){
                        reject(oError);
                    }
                });
            });
        },

        readStockwerkSetAsync: function(){
            var _this = this;
            
            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/StockwerkSet", {
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

        readVertragsArtSetAsync: function(){
            var _this = this;
            
            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/VertragsartSet", {
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

        readDienstleisterSetAsync: function(){
            var _this = this;
            
            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/DienstleisterSet", {
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

        readWirtschaftseinheitenSetAsync: function(expand, filter){
            var _this = this;
            
            var urlParameters = _.omit({$expand: expand, $filter: filter}, function(val){
                return _.isUndefined(val) || _.isNull(val);
            });

            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/WirtschaftseinheitenSet", {
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
        },

        readMietvertragSetAsync: function(expand, filter){
            var _this = this;
            
            var urlParameters = _.omit({$expand: expand, $filter: filter}, function(val){
                return _.isUndefined(val) || _.isNull(val);
            });

            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/MietvertragSet", {
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
        },

        readKonditioneneinigungSetAsync: function(expand, filter){
            var _this = this;
            
            var urlParameters = _.omit({$expand: expand, $filter: filter}, function(val){
                return _.isUndefined(val) || _.isNull(val);
            });

            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/KonditioneneinigungSet", {
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
        },

        readErtragsartSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/ErtragsartSet", {
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

        readKostenartSetAsync: function(){
            var _this = this;

            return Q.Promise(function(resolve, reject, notify) {
                _this.oDataModel.read("/KostenartSet", {
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