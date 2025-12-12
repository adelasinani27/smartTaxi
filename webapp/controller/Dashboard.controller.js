sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("taxi.manual.taxiui5.controller.Dashboard", {

        onInit: function () {
            this._loadDashboardData();
        },

        _loadDashboardData: function () {
            var oDataModel = this.getOwnerComponent().getModel();
            var that = this;

            oDataModel.read("/TaxiRide", {
                success: function (oResponse) {
                    var aRides = oResponse.results;
                    that._calculateStatistics(aRides);
                },
                error: function (oError) {
                    console.error("Error loading rides:", oError);
                    MessageToast.show("Error loading dashboard data");
                }
            });
        },

        _calculateStatistics: function (aRides) {
            var totalRides = aRides.length;
            var totalRevenue = 0;
            var totalDistance = 0;
            var completedRides = 0;
            var cashCount = 0;
            var cardCount = 0;

            aRides.forEach(function(ride) {
                totalRevenue += parseFloat(ride.TotalPrice || 0);
                totalDistance += parseFloat(ride.DistanceKm || 0);
                
                if (ride.RideStatus === "COMPLETED") {
                    completedRides++;
                }
                
                if (ride.PaymentMethod === "Cash") {
                    cashCount++;
                } else if (ride.PaymentMethod === "Card") {
                    cardCount++;
                }
            });

            var avgDistance = totalRides > 0 ? (totalDistance / totalRides).toFixed(1) : 0;

            // Get 5 most recent rides
            var recentRides = aRides.slice(0, 5);

            var oDashboardModel = new JSONModel({
                totalRides: totalRides,
                totalRevenue: totalRevenue.toFixed(2),
                avgDistance: avgDistance,
                completedRides: completedRides,
                cashCount: cashCount,
                cardCount: cardCount,
                currency: aRides[0]?.Currency || "USD",
                recentRides: recentRides
            });

            this.getView().setModel(oDashboardModel, "dashboardModel");
        },

        onTilePress: function () {
            // Navigate to main taxi ride view
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteTaxiRide");
        }
    });
});