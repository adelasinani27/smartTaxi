sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {
        onOpenRouteInMaps: function (oBindingContext, aSelectedContexts) {
            // oBindingContext is the current TaxiRide object context
            if (!oBindingContext) {
                MessageToast.show("No ride context available.");
                return;
            }

            // Get the TaxiRide data from the context
            const oData = oBindingContext.getObject();
            
            // Get the pickup and dropoff addresses
            const sPickup = oData.PickupAddress;
            const sDropoff = oData.DropoffAddress;

            if (!sPickup || !sDropoff) {
                MessageToast.show("Pickup or dropoff address is missing.");
                return;
            }

            // Build Google Maps URL
            const sUrl = "https://www.google.com/maps/dir/?api=1" +
                "&origin=" + encodeURIComponent(sPickup) +
                "&destination=" + encodeURIComponent(sDropoff);

            // Open in new tab
            window.open(sUrl, "_blank");
            
            MessageToast.show("Opening route in Google Maps...");
        }
    };
});