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

                    var vaSheetName = workbook.SheetNames[0];
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
                        valCellAddress = XLSX.utils.encode_cell({c:1, r:row});

                        if((vaWorksheet[keyCellAddress] === undefined) || (vaWorksheet[valCellAddress] === undefined)){
                            break;
                        }

                        vermietungsaktivitaet[vaWorksheet[keyCellAddress].v] = vaWorksheet[valCellAddress].v;
                    }


                    var mfWorksheet = workbook.Sheets[mfSheetName];

                    // Mietflächenobjekte erstellen
                    for(row=1; row<100; row++)
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
                            // Wenn die ValCell leer ist, wird angenommen, dass man keine weiteren Reihen befüllt sind
                            // Die Schleife wird unterbrochen
                            if(mfWorksheet[valCellAddress] === undefined)
                            {
                                break;
                            }

                            //console.log( mfWorksheet[keyCellAddress].v + " = " + mfWorksheet[valCellAddress].v );
                            mietflaeche[mfWorksheet[keyCellAddress].v] = mfWorksheet[valCellAddress].v;
                        }
                    }
                    
                    vermietungsaktivitaet.Mietbeginn = new Date(vermietungsaktivitaet.Mietbeginn);
                    resolve(vermietungsaktivitaet);
                };

                reader.readAsArrayBuffer(file);

            });

        }
    };

});