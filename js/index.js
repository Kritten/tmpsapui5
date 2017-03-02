$(function() {
    
    sap.ui.getCore().attachInit(function () {
        new sap.m.Shell({
            appWidthLimited: true,
            backgroundImage: './img/shell_bg.jpg',
            backgroundOpacity: 0.2,
            app: new sap.ui.core.ComponentContainer({
                name : "ag.bpc.Deka",
                height : "100%"
            })
        }).placeAt("content");
    });
    
});