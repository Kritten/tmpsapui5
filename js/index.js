$(function() {
    
    sap.ui.getCore().attachInit(function () {
        new sap.m.Shell({
            appWidthLimited: true,
            app: new sap.ui.core.ComponentContainer({
                name : "ag.bpc.Deka",
                height : "100%"
            })
        }).placeAt("content");
    });
    
});