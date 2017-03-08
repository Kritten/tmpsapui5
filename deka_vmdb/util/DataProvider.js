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
                        "$expand": "KeToOb,KeToMap"
                    },

                    success: function(oData){
                        console.log(oData);

                        // Struktur aufbereiten für UI5 Binding                    
                        oData.Favorit = (Math.random() > 0.5); // Feld ist zur Zeit noch ein String
                        oData.Editable = (Math.random() > 0.5);
                        oData.Status = "Konditioneneinigung";
                        oData.Anmerkung = "";

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

                        oData.KeToMap = _.map(oData.KeToMap.results, function(mapping){
                            mapping.Aktiv = (Math.random() > 0.5);
                            return mapping;
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

        }

    };
});