sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	
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
			
            var form = {
                modus: "show", // show, new, edit
                
                vermietungsaktivitaet: {
                    id: "VA_123456",
                    buchungskreis: "9-30",
                    wirtschaftseinheit: "0599",
                    bezeichnung: "20006 Washington, 1999 K Street",
                    
                    mietflaechenangaben: [],
                    
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
                                        
                    mieteGesamt: {vermietungsaktivitaet: null, konditioneneinigung: null},
                    kostenGesamt: {vermietungsaktivitaet: null, konditioneneinigung: null},
                    
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
				]
            };
			
			// Dummy Objekt
			form.vermietungsaktivitaet.mietflaechenangaben.push({
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
			});
			form.vermietungsaktivitaet.mietflaechenangaben.push({
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
			});
			form.vermietungsaktivitaet.mietflaechenangaben.push({
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
			});
			
            var user = {
                rolle: "FM" // FM, AM 
            };
            
            var formModel = new sap.ui.model.json.JSONModel(form);
            var userModel = new sap.ui.model.json.JSONModel(userModel);
            
            this.getView().setModel(userModel, "user");
			this.getView().setModel(formModel, "form");
		},
		
		onVermietungsaktivitaetAnlegenAufBasisEinerWirtschaftseinheit: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinerWirtschaftseinheit");
            
			this.onVermietungsaktivitaetAnzeigen(oEvent);
            this.getView().getModel("form").setProperty("/modus", "new");
		},
		
		onVermietungsaktivitaetAnlegenAufBasisEinesMietvertrags: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinesMietvertrags");
			
			this.onVermietungsaktivitaetAnzeigen(oEvent);
            this.getView().getModel("form").setProperty("/modus", "new");
		},
		
		onVermietungsaktivitaetAnlegenAufBasisEinerKonditioneneinigung: function(oEvent){
			jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onVermietungsaktivitaetAnlegenAufBasisEinerKonditioneneinigung");
		
			this.onVermietungsaktivitaetAnzeigen(oEvent);
            this.getView().getModel("form").setProperty("/modus", "new");
		},
		
		onBearbeitenButtonPress: function(evt){
            jQuery.sap.log.info(".. ag.bpc.Deka.controller.VermietungsaktivitaetDetails .. onBearbeitenButtonPress");
            
            // Alten Zustand sichern für eventuelle Wiederherstellung
            this._oldFormDataJSON = this.getView().getModel("form").getJSON();
                        
            this.getView().getModel("form").setProperty("/modus", "edit");
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

// TODO: berechnung an Change Event hängen
            this.berechneMieteUndKosten();
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
        }
        
	});
});