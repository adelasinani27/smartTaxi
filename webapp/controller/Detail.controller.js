sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "taxi/manual/taxiui5/formatter/Formatter"

], function (Controller, JSONModel, MessageToast, Formatter) {
    "use strict";

    return Controller.extend("taxi.manual.taxiui5.controller.Detail", {

        formatter: Formatter,
        
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            //debugger
            var sRideID = oEvent.getParameter("arguments").rideId;
            var that = this;
            
            // Get the OData V2 model
            var oDataModel = this.getOwnerComponent().getModel();
            
            // Build the path for reading a single TaxiRide
            var sPath = "/TaxiRide(RideID='" + sRideID + "',IsActiveEntity=true)";
            
            // Read the specific taxi ride
            oDataModel.read(sPath, {
                success: function (oData) {
                    console.log("Ride details loaded:", oData);
                    
                    // Create JSON model with the data
                    var oDetailModel = new JSONModel(oData);
                    that.getView().setModel(oDetailModel, "detailModel");
                    
                    MessageToast.show("Ride details loaded");
                },
                error: function (oError) {
                    console.error("Error loading ride details:", oError);
                    MessageToast.show("Error loading ride details");
                }
            });
        },

        onNavBack: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTaxiRide");
        },

        onOpenRouteInMaps: function () {
            var oModel = this.getView().getModel("detailModel");
            var sPickup = oModel.getProperty("/PickupAddress");
            var sDropoff = oModel.getProperty("/DropoffAddress");

            if (!sPickup || !sDropoff) {
                MessageToast.show("Pickup or dropoff address is missing.");
                return;
            }

            var sUrl = "https://www.google.com/maps/dir/?api=1" +
                "&origin=" + encodeURIComponent(sPickup) +
                "&destination=" + encodeURIComponent(sDropoff);

            window.open(sUrl, "_blank");
            MessageToast.show("Opening route in Google Maps...");
        }
    });
});