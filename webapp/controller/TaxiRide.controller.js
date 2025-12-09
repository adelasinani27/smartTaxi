sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Sorter, MessageToast, Filter, FilterOperator) {
    "use strict";

return Controller.extend("taxi.manual.taxiui5.controller.TaxiRide", {
        
        onInit: function () {
            // Create a JSON model to hold the taxi ride data
            var oTaxiJSONModel = new JSONModel();
            var that = this;

            // Get the OData V2 model from the component
            var oDataModel = this.getOwnerComponent().getModel();
            
            // Path to TaxiRide entity set
            var sPath = "/TaxiRide";

            // Read data from OData V2 service
            oDataModel.read(sPath, {
                sorters: [new Sorter("RideID", false)],
                success: function (oResponse) {
                    var aRides = oResponse.results;
                    oTaxiJSONModel.setData({ rides: aRides });   // wrap into property 'rides'
                    that.getView().setModel(oTaxiJSONModel, "taxiModel");
                    MessageToast.show("Loaded " + aRides.length + " taxi rides");
                },
                error: function (oError) {
                    console.error("Error loading taxi rides:", oError);
                    MessageToast.show("Error loading taxi rides");
                }
            });
        },

        onRidePress: function (oEvent) {
            // Get the selected ride
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("taxiModel");
            var oRide = oContext.getObject();
            
            console.log("Selected ride:", oRide);
            
            // Navigate to detail page
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetail", {
                rideId: oRide.RideID
            });
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oTable = this.byId("taxiRideTable");
            var oBinding = oTable.getBinding("items");
            
            if (sQuery) {
                var aFilters = [
                    new Filter({
                        filters: [
                            new Filter("RideID", FilterOperator.Contains, sQuery),
                            new Filter("CustomerName", FilterOperator.Contains, sQuery),
                            new Filter("PickupAddress", FilterOperator.Contains, sQuery),
                            new Filter("DropoffAddress", FilterOperator.Contains, sQuery)
                        ],
                        and: false
                    })
                ];
                oBinding.filter(aFilters);
            } else {
                oBinding.filter([]);
            }
        }
    });
});