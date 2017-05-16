/*
 * @Author: Christian Hoff (best practice consulting AG) 
 * @Date: 2017-04-05 21:45:06 
 * @Last Modified by:   Christian Hoff (best practice consulting AG) 
 * @Last Modified time: 2017-04-05 21:45:06 
 */
sap.ui.define(["ag/bpc/Deka/util/ExcelImportUtil"], function (ExcelImportUtil) {

    "use strict";
	return {
        
        /*  
        oParams = {
            file: ..
            success: ..
            error: ..
        }
        */
        importVermietungsaktivitaetFromFile: function(file){

            return Q.Promise(function(resolve, reject, notify) {

                var reader = new FileReader();

                reader.onload = function(e) {

                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    var length = bytes.byteLength;

                    for (var i = 0; i < length; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }

                    // Chrome/Firefox
                    // var data = e.target.result;
                    var workbook = XLSX.read(data, {type: 'binary'});

                    // Vermietungsaktivitäten
                    var vaSheetName = workbook.SheetNames[0];
                    // Mietflächen
                    var mfSheetName = workbook.SheetNames[1];

                    var vaWorksheet = workbook.Sheets[vaSheetName];

                    var vermietungsaktivitaet = {
                        VaToOb: []
                    };

                    var row, col;
                    var keyCellAddress;
                    var valCellAddress;

                    // Vermietungsaktivität erstellen
                    for(row=0; row<100; row++){

                        keyCellAddress = XLSX.utils.encode_cell({c:0, r:row});
                        valCellAddress = XLSX.utils.encode_cell({c:2, r:row});

                        if(vaWorksheet[keyCellAddress] === undefined){
                            break;
                        }                        
                        
                        if(vaWorksheet[valCellAddress] === undefined){
                            vermietungsaktivitaet[vaWorksheet[keyCellAddress].v] = "";
                        }else{
                            vermietungsaktivitaet[vaWorksheet[keyCellAddress].v] = vaWorksheet[valCellAddress].v;
                        }
                    }                    

                    var mfWorksheet = workbook.Sheets[mfSheetName];

                    // Mietflächenobjekte erstellen
                    for(row=2; row<100; row++)
                    {
                        var mietflaeche = {};

                        for(col=0; col<100; col++)
                        {
                            keyCellAddress = XLSX.utils.encode_cell({c:col, r:0});
                            valCellAddress = XLSX.utils.encode_cell({c:col, r:row});
                            
                            // Wenn KeyCell leer ist, dann ist die Schleife am Ende der Spalten angelangt
                            // Die Mietfläche wird hierbei der VA hinzugefügt und die Schleife unterbrochen
                            if(mfWorksheet[keyCellAddress] === undefined){
                                vermietungsaktivitaet.VaToOb.push(mietflaeche);
                                break;
                            }
                            
                            // Wenn die ValCell leer ist, wird angenommen, dass keine weiteren Reihen befüllt sind
                            // Die Schleife wird unterbrochen
                            if(mfWorksheet[valCellAddress] === undefined)
                            {
                                break;
                            }

                            //console.log( mfWorksheet[keyCellAddress].v + " = " + mfWorksheet[valCellAddress].v );
                            mietflaeche[mfWorksheet[keyCellAddress].v] = mfWorksheet[valCellAddress].v;
                        }
                    }                    

                    // Datum-Strings übersetzen

                    // Mietbeginn
                    var dateString = vermietungsaktivitaet.Mietbeginn;
                    var splitString = dateString.split(".");
                    vermietungsaktivitaet.Mietbeginn = new Date(splitString[2],splitString[1]-1,splitString[0]);

                    // Erster Monat mietfrei
                    dateString = vermietungsaktivitaet.MzErsterMonat;
                    splitString = dateString.split(".");
                    if(splitString.length > 2){
                        vermietungsaktivitaet.MzErsterMonat = new Date(splitString[2],splitString[1]-1,splitString[0]);
                    }else{
                        vermietungsaktivitaet.MzErsterMonat = new Date(splitString[1]-1,splitString[0]);
                    }

                    // 1. Monat der Verteilung der Ausbaukosten
                    dateString = vermietungsaktivitaet.AkErsterMonat;
                    splitString = dateString.split(".");
                    if(splitString.length > 2){
                        vermietungsaktivitaet.AkErsterMonat = new Date(splitString[2],splitString[1]-1,splitString[0]);
                    }else{
                        vermietungsaktivitaet.AkErsterMonat = new Date(splitString[1]-1,splitString[0]);
                    }
                    
                    resolve(vermietungsaktivitaet);
                };

                reader.readAsArrayBuffer(file);

            });

        }
    };

});