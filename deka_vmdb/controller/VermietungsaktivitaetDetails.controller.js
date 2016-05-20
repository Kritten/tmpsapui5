sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox"], function (Controller, MessageBox) {
	
	"use strict";
	return Controller.extend("ag.bpc.Deka.controller.VermietungsaktivitaetDetails", {
		
		onInit: function(evt){
            jQuery.sap.log.setLevel(jQuery.sap.log.Level.INFO);
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.KonditioneneinigungDetails .. onInit");
            
			this.getView().setModel(sap.ui.getCore().getModel("i18n"), "i18n");
			
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("vermietungsaktivitaetDetails").attachPatternMatched(this.onVermietungsaktivitaetAnzeigen, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenWe").attachPatternMatched(this.onVermietungsaktivitaetAnlegenAufBasisEinerWirtschaftseinheit, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenMv").attachPatternMatched(this.onVermietungsaktivitaetAnlegenAufBasisEinesMietvertrags, this);
            oRouter.getRoute("vermietungsaktivitaetAnlegenKe").attachPatternMatched(this.onVermietungsaktivitaetAnlegenAufBasisEinerKonditioneneinigung, this);
		},
        
		onVermietungsaktivitaetAnzeigen: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnzeigen");
			
            //sap.ui.core.BusyIndicator.show(0);
            
            //jQuery.sap.delayedCall(2000, this, function(){
            //    sap.ui.core.BusyIndicator.hide();
            //});
            
            var form = {
                modus: "show", // show, new, edit
                
                vermietungsaktivitaet: {
                    id: "VA_123456",
                    buchungskreis: "9-30",
                    wirtschaftseinheit: "0599",
                    bezeichnung: "20006 Washington, 1999 K Street",
                    favorit: true,
                    
                    mietflaechenangaben: [{
                        mietflaeche: "9-30/599/01010002",
                        bezeichnung: "MF Handel/Gastronomie 1.OG",
                        nutzungsart: "Handel, Gastronomie",
                        nutzungsartAlternativ: "",
                        hauptnutzflaeche: 90.00,
                        mietflaecheAlternativ: "",
                        nachhaltigeMiete: 9.140833,
                        angebotsmiete: 12.00,
                        grundbaukosten: 20.00,
                        mieterausbaukosten: 30.00
                    }, {
                        mietflaeche: "9-30/599/01010002",
                        bezeichnung: "MF Handel/Gastronomie 1.OG",
                        nutzungsart: "Handel, Werkstatt",
                        nutzungsartAlternativ: "",
                        hauptnutzflaeche: 50.00,
                        mietflaecheAlternativ: "",
                        nachhaltigeMiete: 9.140833,
                        angebotsmiete: 12.00,
                        grundbaukosten: 20.00,
                        mieterausbaukosten: 30.00
                    }, {
                        mietflaeche: "9-30/599/01010002",
                        bezeichnung: "MF Handel/Gastronomie 1.OG",
                        nutzungsart: "Handel, Gastronomie",
                        nutzungsartAlternativ: "",
                        hauptnutzflaeche: 10.00,
                        mietflaecheAlternativ: "",
                        nachhaltigeMiete: 9.140833,
                        angebotsmiete: 12.00,
                        grundbaukosten: 20.00,
                        mieterausbaukosten: 30.00
                    }],
                    
                    gemeinsameAngaben: {
                        mietbeginn: null,
                        laufzeit1stBreak: null,
                        gueltigkeitKonditioneneinigung: null,
						
						vermietungsart: null,
						poenale: null,
						indexweitergabe: null,
						planungsrelevanz: null,						
						
                        mietfreieZeit: null,
                        maklerkosten: null,
                        beratungskosten: null
                    },
					
					sonstigeAngaben: {
                        debitorennummer: "00000001",
						mietername: "Hans Müller",
                        bonitaet: "5",
                        status: "a",
                        anmerkung: "a0",
                        bemerkung: "Interessent kann sich noch nicht entscheiden"
					},
					
                    mieteGesamt: {vermietungsaktivitaet: 1250.5, konditioneneinigung: 1150.5, differenz: 100},
                    kostenGesamt: {vermietungsaktivitaet: 880.95, konditioneneinigung: 815.50, differenz: 65.45},
                    
                    arbeitsvorrat: null
                },
				
				alternativeNutzungsarten: [
					{key: "", text: ""},
					{key: "Lager", text: "Lager"},
					{key: "Wohnraum", text: "Wohnraum"}
				],
				
				vermietungsarten: [
					{key: "Neuvermietung", text: "Neuvermietung"},
					{key: "Anschlussvermietung", text: "Anschlussvermietung"},
				],
                
                statuswerte: [
                    {key: "a", text: "Abgebrochen 0%"},
                    {key: "b", text: "Ausbauplanung 50%"},
                    {key: "c", text: "Mietvertragsentwurf erstellt - 70%"},
                    {key: "d", text: "Mietvertrag abgeschlossen – 100%"}
                ],
                
                anmerkungen: []
            };
                        
            var user = {
                rolle: "FM" // FM, AM 
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            var userModel = new sap.ui.model.json.JSONModel(userModel);
            
            this.getView().setModel(userModel, "user");
			this.getView().setModel(formModel, "form");
                        
            this.clearValidationState();
            this.anmerkungSelektionInitialisieren();
		},
		
        onVermietungsaktivitaetAnlegen: function(oEvent){
            
            var form = {
                modus: "new", // show, new, edit
                
                vermietungsaktivitaet: {
                    id: null,
                    buchungskreis: "9-30",
                    wirtschaftseinheit: "0599",
                    bezeichnung: "20006 Washington, 1999 K Street",
                    favorit: false,
                    
                    mietflaechenangaben: [],
                    
                    gemeinsameAngaben: {
                        mietbeginn: null,
                        laufzeit1stBreak: null,
                        gueltigkeitKonditioneneinigung: null,
						
						vermietungsart: null,
						poenale: null,
						indexweitergabe: null,
						planungsrelevanz: true,						
						
                        mietfreieZeit: null,
                        maklerkosten: null,
                        beratungskosten: null
                    },
					
					sonstigeAngaben: {
                        debitorennummer: null,
						mietername: null,
                        bonitaet: null,
                        status: "a", // Vorbelegung Notwendig wegen Abhängiger Selektbox
                        anmerkung: null,
                        bemerkung: null
					},
					
                    mieteGesamt: {vermietungsaktivitaet: null, konditioneneinigung: null, differenz: null},
                    kostenGesamt: {vermietungsaktivitaet: null, konditioneneinigung: null, differenz: null},
                    
                    arbeitsvorrat: null
                },
				
				alternativeNutzungsarten: [
					{key: "", text: ""},
					{key: "Lager", text: "Lager"},
					{key: "Wohnraum", text: "Wohnraum"}
				],
				
				vermietungsarten: [
					{key: "Neuvermietung", text: "Neuvermietung"},
					{key: "Anschlussvermietung", text: "Anschlussvermietung"},
				],
                
                statuswerte: [
                    {key: "a", text: "Abgebrochen 0%"},
                    {key: "b", text: "Ausbauplanung 50%"},
                    {key: "c", text: "Mietvertragsentwurf erstellt - 70%"},
                    {key: "d", text: "Mietvertrag abgeschlossen – 100%"}
                ],
                
                anmerkungen: []
            };
            
            var user = {
                rolle: "FM" // FM, AM 
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            var userModel = new sap.ui.model.json.JSONModel(userModel);
            
            this.getView().setModel(userModel, "user");
			this.getView().setModel(formModel, "form");
            
            this.clearValidationState();
            this.anmerkungSelektionInitialisieren();
        },
        
        onStatusSelektionChange: function(oEvent){
            this.anmerkungSelektionInitialisieren();
        },
        
        anmerkungSelektionInitialisieren: function(){

            var statusKey = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/sonstigeAngaben/status");
            console.log( statusKey );

            var anmerkungen = null;

            switch(statusKey)
            {
                case "a":
                    anmerkungen = [
                        {key:"a0", text: "Abgebrochen"}
                    ];
                break;
                
                case "b":
                    anmerkungen = [
                        {key: "b0", text: "Abstimmung der Mieteraus-bauplanung mit dem Mietinteressenten"},
                        {key: "b1", text: "Wirtschaftliche Eckdaten in Verhandlung"},
                        {key: "b2", text: "Mietfläche in Auswahlpool mit Konkurrenzobjekten / Interessent prüft auch Alternativobjekte am Markt"}
                    ];
                break
                
                case "c":
                    anmerkungen = [
                        {key: "c0", text: "Mietvertragsverhandlungen in Vorbereitung"},
                        {key: "c1", text: "Mietvertragsverhandlungen begonnen"},
                        {key: "c2", text: "Vertragsverhandlungen dauern an"},
                        {key: "c3", text: "Vertragsverhandlungen verzögern sich"},
                        {key: "c4", text: "Genehmigtes MV-Eck liegt vor (Planungswahrschein-lichkeit 90%)"},
                        {key: "c5", text: "Abschlusswahrscheinlichkeit binnen 8 Wochen erwartet (Planungswahrscheinlichkeit 90%)"}
                    ];
                break;
                
                case "d":
                    anmerkungen = [
                        {key: "d0", text: "Mietvertrag noch nicht in SAP erfasst"},
                        {key: "d1", text: "Mietvertrag in SAP erfasst"}
                    ];
                break;
            }
            
            this.getView().getModel("form").setProperty("/anmerkungen", anmerkungen);
            //this.getView().getModel("form").setProperty("/vermietungsaktivitaet/sonstigeAngaben/anmerkung", anmerkungen[0].key);
        },
        
		onVermietungsaktivitaetAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinerWirtschaftseinheit");
			this.onVermietungsaktivitaetAnlegen(oEvent);
		},
		
		onVermietungsaktivitaetAnlegenAufBasisEinesMietvertrags: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinesMietvertrags");
			this.onVermietungsaktivitaetAnlegen(oEvent);
		},
		
		onVermietungsaktivitaetAnlegenAufBasisEinerKonditioneneinigung: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinerKonditioneneinigung");
		    this.onVermietungsaktivitaetAnlegen(oEvent);
		},
		
		onBearbeitenButtonPress: function(evt){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onBearbeitenButtonPress");
            
            // Alten Zustand sichern für eventuelle Wiederherstellung
            this._oldFormDataJSON = this.getView().getModel("form").getJSON();
                        
            this.getView().getModel("form").setProperty("/modus", "edit");
        },
		
        onBack : function(oEvent) {
            this.getOwnerComponent().getRouter().navTo("vermietungsaktivitaetSelektion", null, true);
        },
                
        onSpeichernButtonPress: function(evt){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onSpeichernButtonPress");
            
            // Eingaben validieren
            // Daten ins Backend schicken
            // Neues Modell auf Basis der Backenddaten anbinden

            var validationSuccess = this.validateForm();
            
            if(validationSuccess)
            {
                this.getView().getModel("form").setProperty("/modus", "show");
            }
            else
            {              
                var _this = this;
                
                var dialog = new sap.m.Dialog({
                    title: "Warnung",
                    type: "Message",
                    state: "Warning",
                    content: new sap.m.Text({
                        text: "Validierung fehlgeschlagen. Sie können die Vermietungsaktivität zunächst im Arbeitsvorrat speichern oder Ihre Eingaben überprüfen."
                    }),
                    beginButton: new sap.m.Button({
                        text: 'Im Arbeitsvorrat speichern',
                        press: function () {
                            // Backend aufrufen
                            // Im Arbeitsvorrat speichern
                            _this.getView().getModel("form").setProperty("/vermietungsaktivitaet/arbeitsvorrat", true);
                            _this.getView().getModel("form").setProperty("/modus", "show");
                            _this.clearValidationState();                        
                            dialog.close();
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: 'Abbrechen',
                        press: function () {
                            dialog.close();
                        }
                    }),
                    afterClose: function() {
                        dialog.destroy();
                    }
                });
                
                dialog.open();
            }
        },
		
        validateForm: function(){
            
            var validationResult = true;
            
            // vorhandene States zurücksetzen
            this.clearValidationState();
            
            if(this.getView().byId("dateMietbeginn").getDateValue() === null)
            {
                this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateMietbeginn").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("dateMietbeginn").getDateValue() < Date.now())
            {
                this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateMietbeginn").setValueStateText("Das Datum des Mietbeginns muss in der Zukunft liegen.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("laufzeitBis1stBreak").getValue() === "")
            {
                this.getView().byId("laufzeitBis1stBreak").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("laufzeitBis1stBreak").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("laufzeitBis1stBreak").getValue() < 0)
            {
                this.getView().byId("laufzeitBis1stBreak").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("laufzeitBis1stBreak").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("dateGueltigkeitKonditioneneinigung").getDateValue() === null)
            {
                this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("dateGueltigkeitKonditioneneinigung").getDateValue() < Date.now())
            {
                this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueStateText("Das Datum der Gültigkeit muss in der Zukunft liegen.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("mietfreieZeitenInMonaten").getValue() === "")
            {
                this.getView().byId("mietfreieZeitenInMonaten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("mietfreieZeitenInMonaten").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("mietfreieZeitenInMonaten").getValue() < 0)
            {
                this.getView().byId("mietfreieZeitenInMonaten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("mietfreieZeitenInMonaten").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("maklerkostenInMonatsmieten").getValue() === "")
            {
                this.getView().byId("maklerkostenInMonatsmieten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("maklerkostenInMonatsmieten").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("maklerkostenInMonatsmieten").getValue() < 0)
            {
                this.getView().byId("maklerkostenInMonatsmieten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("maklerkostenInMonatsmieten").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
            
            
            if(this.getView().byId("beratungskostenInMonatsmieten").getValue() === "")
            {
                this.getView().byId("beratungskostenInMonatsmieten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("beratungskostenInMonatsmieten").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("beratungskostenInMonatsmieten").getValue() < 0)
            {
                this.getView().byId("beratungskostenInMonatsmieten").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("beratungskostenInMonatsmieten").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
			
			
            if(this.getView().byId("poenale").getValue() === "")
            {
                this.getView().byId("poenale").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("poenale").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if((this.getView().byId("poenale").getValue() < 0) || (this.getView().byId("poenale").getValue() > 100))
            {
                this.getView().byId("poenale").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("poenale").setValueStateText("Bitte geben Sie einen Wert zwischen 0 und 100 ein.");
                validationResult = false;
            }
			
			
            if(this.getView().byId("indexweitergabe").getValue() === "")
            {
                this.getView().byId("indexweitergabe").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("indexweitergabe").setValueStateText("Bitte geben Sie einen Wert ein.");
                validationResult = false;
            }
            else if(this.getView().byId("indexweitergabe").getValue() < 0)
            {
                this.getView().byId("indexweitergabe").setValueState(sap.ui.core.ValueState.Error);
                this.getView().byId("indexweitergabe").setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                validationResult = false;
            }
			
            
            var mietflaechenangabenItems = this.getView().byId("mietflaechenangabenTable").getItems();
            
            if(mietflaechenangabenItems.length === 0)
            {
                this.getView().byId("mietflaechenangabenErrorBox").setVisible(true);
                this.getView().byId("mietflaechenangabenErrorBox").setText("Es muss mindestens eine Mietflächenangabe hinzugefügt werden.");
                validationResult = false;
            }
            
            mietflaechenangabenItems.forEach(function(item){
                
                var mietflaechenangabe = item.getBindingContext("form").getObject();
                
				if(mietflaechenangabe.mietflaecheAlternativ !== null && mietflaechenangabe.mietflaecheAlternativ !== "")
				{					
					if(parseInt(mietflaechenangabe.mietflaecheAlternativ) > (mietflaechenangabe.hauptnutzflaeche * 1.1)){
						item.getCells()[5].setValueState(sap.ui.core.ValueState.Error);
						item.getCells()[5].setValueStateText("Die alternative Mietfläche darf maximal 10% größer sein als die Hauptnutzfläche.");
						validationResult = false;
					}
				}
				
                if(mietflaechenangabe.angebotsmiete < 0 || mietflaechenangabe.angebotsmiete === ""){
                    item.getCells()[7].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[7].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
                if(mietflaechenangabe.grundbaukosten < 0 || mietflaechenangabe.grundbaukosten === ""){
                    item.getCells()[8].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[8].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
                if(mietflaechenangabe.mieterausbaukosten < 0 || mietflaechenangabe.mieterausbaukosten === ""){
                    item.getCells()[9].setValueState(sap.ui.core.ValueState.Error);
                    item.getCells()[9].setValueStateText("Bitte geben Sie einen positiven Wert ein.");
                    validationResult = false;
                }
                
            });        
            
            
            return validationResult;
        },
		
		
		clearValidationState: function(){
            this.getView().byId("dateMietbeginn").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("laufzeitBis1stBreak").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("dateGueltigkeitKonditioneneinigung").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("mietfreieZeitenInMonaten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("maklerkostenInMonatsmieten").setValueState(sap.ui.core.ValueState.None);
            this.getView().byId("beratungskostenInMonatsmieten").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("poenale").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("indexweitergabe").setValueState(sap.ui.core.ValueState.None);
			
            this.getView().byId("mietflaechenangabenErrorBox").setVisible(false);
			
            var mietflaechenangabenItems = this.getView().byId("mietflaechenangabenTable").getItems();
            
            mietflaechenangabenItems.forEach(function(item){
                item.getCells()[5].setValueState(sap.ui.core.ValueState.None);
                item.getCells()[7].setValueState(sap.ui.core.ValueState.None);  
                item.getCells()[8].setValueState(sap.ui.core.ValueState.None);  
                item.getCells()[9].setValueState(sap.ui.core.ValueState.None);  
            });   
		},
		
        onAbbrechenButtonPress: function(evt){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onAbbrechenButtonPress");          
            
            this.clearValidationState();
            
            var modus = this.getView().getModel("form").getProperty("/modus");           
            
            if(modus === "new")
            {
                // wenn modus == new
                // -> Änderungen Verwerfen und Navigation zurück
                
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                
                MessageBox.confirm("Wollen Sie den Vorgang wirklich abbrechen ?", {
                    title:"{i18n>HINWEIS}",
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function(action){
                        if(action === sap.m.MessageBox.Action.YES){
                            window.history.go(-1);
                        }
                    }
                });
                
            }
            else if(modus === "edit")
            {
                // wenn modus == edit
                // -> Änderungen Verwerfen
                // -> modus = show
                
                var oldFormData = JSON.parse(this._oldFormDataJSON);
                var formModel = new sap.ui.model.json.JSONModel(oldFormData);
                this.getView().setModel(formModel, "form");
                this.getView().getModel("form").setProperty("/modus", "show");
            }

        },
		
        onMietflaechenAngabenLoeschenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onMietflaechenAngabenLoeschenButtonPress");
            
            var mietflaechenangabenTable = this.getView().byId("mietflaechenangabenTable");
            var selectedItems = mietflaechenangabenTable.getSelectedItems();
                                    
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/mietflaechenangaben");

            // ES6 Zukunftstechnologie - eventuell überarbeiten
            var objectsToRemove = selectedItems.map(item => item.getBindingContext("form").getObject() );
            mietflaechenangaben = mietflaechenangaben.filter(ma => objectsToRemove.indexOf(ma) === -1  );
                        
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/mietflaechenangaben", mietflaechenangaben);

            // Selektion aufheben nach dem Löschen
            mietflaechenangabenTable.removeSelections(true);
        },
		
        onMietflaechenAngabeHinzufuegenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onMietflaechenAngabeHinzufuegenButtonPress");
            
            // Dialog öffnen
			
            if (! this._mietflaechenSelektionDialog) {
                this._mietflaechenSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.MietflaechenSelektion", this);
            }
            
            var mietflaechenSelektionDialogModel = new sap.ui.model.json.JSONModel({
                mietflaechen: [{
					mietflaeche: "9-30/599/01010002",
					bezeichnung: "MF Handel/Gastronomie 1.OG",
					nutzungsart: "Handel, Gastronomie",
					nutzungsartAlternativ: "",
					hauptnutzflaeche: 90.00,
					mietflaecheAlternativ: "",
					nachhaltigeMiete: 9.140833,
					angebotsmiete: 12.00,
					grundbaukosten: 20.00,
					mieterausbaukosten: 30.00
				}, {
					mietflaeche: "9-30/599/01010002",
					bezeichnung: "MF Handel/Gastronomie 1.OG",
					nutzungsart: "Handel, Gastronomie",
					nutzungsartAlternativ: "",
					hauptnutzflaeche: 10.00,
					mietflaecheAlternativ: "",
					nachhaltigeMiete: 9.140833,
					angebotsmiete: 12.00,
					grundbaukosten: 20.00,
					mieterausbaukosten: 30.00
				}, {
					mietflaeche: "9-30/599/01010002",
					bezeichnung: "MF Handel/Gastronomie 1.OG",
					nutzungsart: "Handel, Werkstatt",
					nutzungsartAlternativ: "",
					hauptnutzflaeche: 50.00,
					mietflaecheAlternativ: "",
					nachhaltigeMiete: 9.140833,
					angebotsmiete: 12.00,
					grundbaukosten: 20.00,
					mieterausbaukosten: 30.00
				}]
            });
            
            this._mietflaechenSelektionDialog.setModel(mietflaechenSelektionDialogModel);
            
            this._mietflaechenSelektionDialog.open();
        },
		
        onMietflaechenSelektionDialogConfirm: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onMietflaechenSelektionDialogConfirm");
            
            var selectedItems = oEvent.getParameter("selectedItems");
            
            if(selectedItems.length > 0)
            {
                var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/mietflaechenangaben");
                
                selectedItems.forEach(function(item){
                    var mietflaechenangabe = item.getBindingContext().getObject();
                    mietflaechenangaben.push(mietflaechenangabe);
                });
                
                this.getView().getModel("form").setProperty("/vermietungsaktivitaet/mietflaechenangaben", mietflaechenangaben);
            }
        },
        
        onMietflaechenSelektionDialogSearch: function(oEvent){
            jQuery.sap.log.info(".. onMietflaechenSelektionDialogSearch");
            
        },
		
		
        onAusbaukostenVerteilenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onAusbaukostenVerteilenButtonPress");
            
            if (!this._ausbaukostenVerteilenDialog) {
                this._ausbaukostenVerteilenDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.AusbaukostenVerteilen", this);
                this.getView().addDependent(this._ausbaukostenVerteilenDialog);
            }
            
            // über Einträge iterieren und Nutzungsarten sammeln
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/mietflaechenangaben");
            
			if(mietflaechenangaben.length === 0){
// TODO: Fehlermeldung
				return;
			}
			
            var vorhandeneNutzungsarten = {};
            
            mietflaechenangaben.forEach(function(mietflaechenangabe){
                // key - value .. in dem Fall beides gleich
				
				if(mietflaechenangabe.nutzungsartAlternativ !== ""){
					vorhandeneNutzungsarten[mietflaechenangabe.nutzungsartAlternativ] = {key: mietflaechenangabe.nutzungsartAlternativ, text: mietflaechenangabe.nutzungsartAlternativ};
				}
				else{
					vorhandeneNutzungsarten[mietflaechenangabe.nutzungsart] = {key: mietflaechenangabe.nutzungsart, text: mietflaechenangabe.nutzungsart};
				}
				
            });
            
            // Object-Properties to Array
            var vorhandeneNutzungsarten = Object.keys(vorhandeneNutzungsarten).map(function (key) {
                return vorhandeneNutzungsarten[key]
            });
            
            var dialogModel = new sap.ui.model.json.JSONModel({
                nutzungsarten: vorhandeneNutzungsarten,
                nutzungsart: vorhandeneNutzungsarten[0].key, // Vorbelegung auf gültigen Wert notwendig - sonst Buggy
                grundausbaukosten: 100,
                mietausbaukosten: 100
            });
			
            this._ausbaukostenVerteilenDialog.setModel(dialogModel);
 
			this._ausbaukostenVerteilenDialog.open();
        },
		
        onAusbaukostenVerteilenFragmentAkzeptierenButtonPress: function(oEvent){
            jQuery.sap.log.info(".. onAusbaukostenVerteilenFragmentAkzeptierenButtonPress");
            
            this._ausbaukostenVerteilenDialog.close();
            
            var dialogModel = this._ausbaukostenVerteilenDialog.getModel();
            
            var verteilung = {
                nutzungsart: dialogModel.getProperty("/nutzungsart"),
                grundausbaukosten: dialogModel.getProperty("/grundausbaukosten"),
                mietausbaukosten: dialogModel.getProperty("/mietausbaukosten")
            }

            // Logik zur Verteilung der Ausbaukosten
        
            var mietflaechenangaben = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/mietflaechenangaben");
            
            var sumNutzflaechen = 0;
            
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {				
                if((mietflaechenangabe.nutzungsartAlternativ === verteilung.nutzungsart) || (mietflaechenangabe.nutzungsart === verteilung.nutzungsart))
                {				
					if(mietflaechenangabe.mietflaecheAlternativ === null || mietflaechenangabe.mietflaecheAlternativ === "")
					{
						sumNutzflaechen += mietflaechenangabe.hauptnutzflaeche;
					}
					else
					{
						sumNutzflaechen += parseInt(mietflaechenangabe.mietflaecheAlternativ);
					}
                }
            });
            			
            mietflaechenangaben.forEach(function(mietflaechenangabe)
            {
                if((mietflaechenangabe.nutzungsartAlternativ === verteilung.nutzungsart) || (mietflaechenangabe.nutzungsart === verteilung.nutzungsart))
                {
					if(mietflaechenangabe.mietflaecheAlternativ === null || mietflaechenangabe.mietflaecheAlternativ === "")
					{
						mietflaechenangabe.grundbaukosten = (mietflaechenangabe.hauptnutzflaeche / sumNutzflaechen) * verteilung.grundausbaukosten;
						mietflaechenangabe.mieterausbaukosten = (mietflaechenangabe.hauptnutzflaeche / sumNutzflaechen) * verteilung.mietausbaukosten;
					}
					else
					{
						mietflaechenangabe.grundbaukosten = (parseInt(mietflaechenangabe.mietflaecheAlternativ) / sumNutzflaechen) * verteilung.grundausbaukosten;
						mietflaechenangabe.mieterausbaukosten = (parseInt(mietflaechenangabe.mietflaecheAlternativ) / sumNutzflaechen) * verteilung.mietausbaukosten;
					}
                }
            });
            
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/mietflaechenangaben", mietflaechenangaben);
        },
		
		onAusbaukostenVerteilenFragmentAbbrechenButtonPress: function(oEvent){
            this._ausbaukostenVerteilenDialog.close();
        },
        
        onDruckenButtonPress: function(oEvent){
            //window.print();
        },
        
        onFavoritButtonPress: function(oEvent){
            
            var favorit = this.getView().getModel("form").getProperty("/vermietungsaktivitaet/favorit");

            if(favorit)
            {
                this.getView().getModel("form").setProperty("/vermietungsaktivitaet/favorit", false);
                
                MessageBox.information("Die Vermietungsaktivität wurde von den Favoriten entfernt.", {
                    title:"{i18n>HINWEIS}"
                });
            }
            else
            {
                this.getView().getModel("form").setProperty("/vermietungsaktivitaet/favorit", true);
                
                MessageBox.information("Die Vermietungsaktivität wurde zu den Favoriten hinzugefügt.", {
                    title:"{i18n>HINWEIS}"
                });
            }
        },
        
        onDebitorAuswahlButtonPress: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onMietflaechenAngabeHinzufuegenButtonPress");
            
            // Dialog öffnen
			
            if (! this._debitorSelektionDialog) {
                this._debitorSelektionDialog = sap.ui.xmlfragment("ag.bpc.Deka.view.DebitorSelektion", this);
            }
            
            var debitorSelektionDialogModel = new sap.ui.model.json.JSONModel({
                debitoren: [{
                    debitorennummer: "00000001",
                    mietername: "Hans Müller", 
                    bonitaet: "5"
                }, {
                    debitorennummer: "00000002",
                    mietername: "Peter Schmidt", 
                    bonitaet: "1"
                }]
            });
            
            this._debitorSelektionDialog.setModel(debitorSelektionDialogModel);
            this._debitorSelektionDialog.open();
        },
        
        onDebitorSelektionConfirm: function(oEvent){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onDebitorSelektion");

			var debitor = oEvent.getParameter("selectedItem").getBindingContext().getObject();
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/sonstigeAngaben/mietername", debitor.mietername);
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/sonstigeAngaben/debitorennummer", debitor.debitorennummer);
            this.getView().getModel("form").setProperty("/vermietungsaktivitaet/sonstigeAngaben/bonitaet", debitor.bonitaet);            
        }
        
	});
});