sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/export/Spreadsheet"

], function (Controller, JSONModel, Sorter, MessageToast, MessageBox, Filter, FilterOperator, Fragment, Spreadsheet) {
    "use strict";

    return Controller.extend("taxi.manual.taxiui5.controller.TaxiRide", {

        oDialog: null,
        
        onInit: function () {
            this._reloadRides();
        },

        _reloadRides: function () {
            var oTaxiJSONModel = new JSONModel();
            var oDataModel = this.getOwnerComponent().getModel();
            var that = this;

            oDataModel.read("/TaxiRide", {
                sorters: [new Sorter("RideID", false)],
                success: function (oResponse) {
                    var aRides = oResponse.results;
                    oTaxiJSONModel.setData({ rides: aRides });
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
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("taxiModel");
            var oRide = oContext.getObject();
            
            console.log("Selected ride:", oRide);
            
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
        },
         onNameChange: function(oEvent) {
        var sValue = oEvent.getParameter("value");
        var oModel = this.getView().getModel("createModel");
        var nameRegex = /^[A-Za-z\s]+$/;
        
        if (sValue.length < 3) {
            oModel.setProperty("/nameState", "Error");
            oModel.setProperty("/nameStateText", "Name must be at least 3 characters");
        } else if (!nameRegex.test(sValue)) {
            oModel.setProperty("/nameState", "Error");
            oModel.setProperty("/nameStateText", "Name can only contain letters");
        } else {
            oModel.setProperty("/nameState", "Success");
            oModel.setProperty("/nameStateText", "");
        }
    },
    onNameChangeUpdate: function(oEvent) {
    var sValue = oEvent.getParameter("value");
    var oModel = this.getView().getModel("updateModel");
    var nameRegex = /^[A-Za-z\s]+$/;
    
    if (sValue.length < 3) {
        oModel.setProperty("/nameState", "Error");
        oModel.setProperty("/nameStateText", "Name must be at least 3 characters");
    } else if (!nameRegex.test(sValue)) {
        oModel.setProperty("/nameState", "Error");
        oModel.setProperty("/nameStateText", "Name can only contain letters");
    } else {
        oModel.setProperty("/nameState", "Success");
        oModel.setProperty("/nameStateText", "");
    }
},

        onCreateRide: function () {
            var oView = this.getView();

            // Generate a unique RideID
            var sNewRideID = "R" + Date.now().toString().slice(-8);

            var oCreateModel = new JSONModel({
                RideID: sNewRideID,
                CustomerName: "",
                PickupAddress: "",
                DropoffAddress: "",
                DistanceKm: "",
                PaymentMethod: ""
            });
            oView.setModel(oCreateModel, "createModel");

            if (!this.oDialog) {
                this.loadFragment({
                    name: "taxi.manual.taxiui5.fragments.CreateRide"
                }).then(function (oDialog) {
                    this.oDialog = oDialog;
                    this.oDialog.open();
                }.bind(this));
            } else {
                this.oDialog.open();
            }
        },

        onCancelCreate: function () {
            if (this.oDialog) {
                this.oDialog.close();
            }
        },

        onSaveRide: function () {
            var oView = this.getView();
            var oCreateModel = oView.getModel("createModel");
            var oData = oCreateModel.getData();

            // Validation
            if (!oData.CustomerName || !oData.PickupAddress || !oData.DropoffAddress) {
                MessageToast.show("Please fill all mandatory fields.");
                return;
            }

            if (oData.CustomerName.length < 3) {
                MessageToast.show("Customer name must be at least 3 characters.");
                return;
            }

            var nameRegex = /^[A-Za-z\s]+$/;
            if (!nameRegex.test(oData.CustomerName)) {
                MessageToast.show("Customer name can only contain letters.");
                return;
            }


            if (oData.PickupAddress.trim().toLowerCase() === oData.DropoffAddress.trim().toLowerCase()) {
                MessageToast.show("Pickup and Dropoff addresses cannot be the same.");
                return;
            }



            if (!oData.DistanceKm || parseFloat(oData.DistanceKm) <= 0) {
                MessageToast.show("Please enter a valid distance.");
                return;
            }

            var oODataModel = this.getOwnerComponent().getModel();
            var that = this;

            
            var mParams = {
                RideID: oData.RideID,
                IsActiveEntity: "X",  // Required if parameter entity has this field
                CustomerName: oData.CustomerName,
                PickupAddress: oData.PickupAddress,
                DropoffAddress: oData.DropoffAddress,
                DistanceKm: oData.DistanceKm.toString(),
                PaymentMethod: oData.PaymentMethod
            };

            if (this.oDialog) {
                this.oDialog.setBusy(true);
            }

            console.log("Calling createNewEntry with params:", mParams);

            oODataModel.callFunction("/createNewEntry", {
                method: "POST",
                urlParameters: mParams,
                success: function (oResponse) {
                    console.log("Create success:", oResponse);
                    MessageToast.show("Ride created successfully.");
                    if (that.oDialog) {
                        that.oDialog.setBusy(false);
                        that.oDialog.close();
                    }
                    // Wait a bit before reloading to ensure backend is updated
                    setTimeout(function() {
                        that._reloadRides();
                    }, 500);
                },
                error: function (oError) {
                    console.error("Error creating ride:", oError);
                    var sErrorMsg = "Error creating ride.";
                    
                    // Try to parse error message
                    if (oError.responseText) {
                        try {
                            var oErrorResponse = JSON.parse(oError.responseText);
                            if (oErrorResponse.error && oErrorResponse.error.message) {
                                sErrorMsg = oErrorResponse.error.message.value || sErrorMsg;
                            }
                        } catch (e) {
                            console.error("Could not parse error response");
                        }
                    }
                    
                    MessageToast.show(sErrorMsg);
                    if (that.oDialog) {
                        that.oDialog.setBusy(false);
                    }
                }
            });
        },
        // ==================== SELECTION HANDLING ====================
onSelectionChange: function (oEvent) {
    var oSelectedItem = oEvent.getParameter("listItem");
    var oContext = oSelectedItem.getBindingContext("taxiModel");
    var oRide = oContext.getObject();
    
    // Store selected ride in model
    var oTaxiModel = this.getView().getModel("taxiModel");
    oTaxiModel.setProperty("/selectedRide", oRide);
},
// ==================== UPDATE ====================

onUpdateRide: function () {
    var oView = this.getView();
    var oTaxiModel = oView.getModel("taxiModel");
    var oSelectedRide = oTaxiModel.getProperty("/selectedRide");
    
    if (!oSelectedRide) {
        MessageToast.show("Please select a ride to update.");
        return;
    }
    // Create model with selected ride data
    var oUpdateModel = new JSONModel({
        RideID: oSelectedRide.RideID,
        CustomerName: oSelectedRide.CustomerName,
        PickupAddress: oSelectedRide.PickupAddress,
        DropoffAddress: oSelectedRide.DropoffAddress,
        DistanceKm: oSelectedRide.DistanceKm,
        PaymentMethod: oSelectedRide.PaymentMethod
    });
    oView.setModel(oUpdateModel, "updateModel");
    
    // Open dialog
    if (!this.oUpdateDialog) {
        this.loadFragment({
            name: "taxi.manual.taxiui5.fragments.UpdateRide"
        }).then(function (oDialog) {
            this.oUpdateDialog = oDialog;
            this.oUpdateDialog.open();
        }.bind(this));
    } else {
        this.oUpdateDialog.open();
    }
},
onCancelUpdate: function () {
    if (this.oUpdateDialog) {
        this.oUpdateDialog.close();
    }
},
onSaveUpdate: function () {
    var oView = this.getView();
    var oUpdateModel = oView.getModel("updateModel");
    var oData = oUpdateModel.getData();
    
    // Validation
    if (!oData.CustomerName || !oData.PickupAddress || !oData.DropoffAddress) {
        MessageToast.show("Please fill all mandatory fields.");
        return;
    }

    if (oData.CustomerName.length < 3) {
        MessageToast.show("Customer name must be at least 3 characters.");
        return;
    }

    
    var nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(oData.CustomerName)) {
        MessageToast.show("Customer name can only contain letters.");
        return;
    }

    
    if (oData.PickupAddress.trim().toLowerCase() === oData.DropoffAddress.trim().toLowerCase()) {
        MessageToast.show("Pickup and Dropoff addresses cannot be the same.");
        return;
    }
    
    if (!oData.DistanceKm || parseFloat(oData.DistanceKm) <= 0) {
        MessageToast.show("Please enter a valid distance.");
        return;
    }
    
    if (!oData.PaymentMethod) {
        MessageToast.show("Please select a payment method.");
        return;
    }
    
    var oODataModel = this.getOwnerComponent().getModel();
    var that = this;
    
    // Prepare parameters
    var mParams = {
        RideID: oData.RideID,
        IsActiveEntity: "X",
        CustomerName: oData.CustomerName,
        PickupAddress: oData.PickupAddress,
        DropoffAddress: oData.DropoffAddress,
        DistanceKm: oData.DistanceKm.toString(),
        PaymentMethod: oData.PaymentMethod
    };
    
    if (this.oUpdateDialog) {
        this.oUpdateDialog.setBusy(true);
    }
    
    console.log("Calling updateRide with params:", mParams);
    
    oODataModel.callFunction("/updateRide", {
        method: "POST",
        urlParameters: mParams,
        success: function (oResponse) {
            console.log("Update success:", oResponse);
            MessageToast.show("Ride updated successfully!");
            if (that.oUpdateDialog) {
                that.oUpdateDialog.setBusy(false);
                that.oUpdateDialog.close();
            }
            setTimeout(function() {
                that._reloadRides();
            }, 500);
        },
        error: function (oError) {
            console.error("Error updating ride:", oError);
            var sErrorMsg = "Error updating ride.";
            
            if (oError.responseText) {
                try {
                    var oErrorResponse = JSON.parse(oError.responseText);
                    if (oErrorResponse.error && oErrorResponse.error.message) {
                        sErrorMsg = oErrorResponse.error.message.value || sErrorMsg;
                    }
                } catch (e) {
                    console.error("Could not parse error response");
                }
            }
            
            MessageToast.show(sErrorMsg);
            if (that.oUpdateDialog) {
                that.oUpdateDialog.setBusy(false);
            }
        }
    });
},
// ==================== DELETE ====================
onDeleteRide: function (oEvent) {
    var oButton = oEvent.getSource();
    var oContext = oButton.getBindingContext("taxiModel");
    var oRide = oContext.getObject();
    var that = this;
    
    // Confirmation dialog
    sap.m.MessageBox.confirm(
        "Are you sure you want to delete ride " + oRide.RideID + "?",
        {
            title: "Confirm Deletion",
            onClose: function (oAction) {
                if (oAction === sap.m.MessageBox.Action.OK) {
                    that._performDelete(oRide.RideID);
                }
            }
        }
    );
},

_performDelete: function (sRideID) {
    var oODataModel = this.getOwnerComponent().getModel();
    var that = this;
    
    var mParams = {
        RideID: sRideID,
        IsActiveEntity: "X"
    };
    
    console.log("Calling deleteRide with params:", mParams);
    
    oODataModel.callFunction("/deleteRide", {
        method: "POST",
        urlParameters: mParams,
        success: function (oResponse) {
            console.log("Delete success:", oResponse);
            MessageToast.show("Ride deleted successfully!");
            setTimeout(function() {
                that._reloadRides();
            }, 500);
        },
        error: function (oError) {
            console.error("Error deleting ride:", oError);
            var sErrorMsg = "Error deleting ride.";
            
            if (oError.responseText) {
                try {
                    var oErrorResponse = JSON.parse(oError.responseText);
                    if (oErrorResponse.error && oErrorResponse.error.message) {
                        sErrorMsg = oErrorResponse.error.message.value || sErrorMsg;
                    }
                } catch (e) {
                    console.error("Could not parse error response");
                }
            }
            
            MessageToast.show(sErrorMsg);
        }
    });
},

onExportToExcel: function () {
    var oTable = this.byId("taxiRideTable");
    var oBinding = oTable.getBinding("items");

    if (!oBinding) {
        MessageToast.show("No data available to export");
        return;
    }

    // Get all current contexts (respects filters)
    var aContexts = oBinding.getCurrentContexts();
    var aData = aContexts.map(function(oContext) {
        return oContext.getObject();
    });

    if (!aData || aData.length === 0) {
        MessageToast.show("No rides to export");
        return;
    }

    // Define columns for Excel
    var aCols = [
        { label: "Ride ID", property: "RideID" },
        { label: "Customer Name", property: "CustomerName" },
        { label: "Pickup Address", property: "PickupAddress" },
        { label: "Dropoff Address", property: "DropoffAddress" },
        { label: "Distance (km)", property: "DistanceKm", type: "Number" },
        { label: "Total Price", property: "TotalPrice", type: "Number" },
        { label: "Currency", property: "Currency" },
        { label: "Payment Method", property: "PaymentMethod" },
        { label: "Status", property: "RideStatus" }
    ];

    // Configure spreadsheet settings
    var oSettings = {
        workbook: {
            columns: aCols,
            hierarchyLevel: 'Level'
        },
        dataSource: aData,
        fileName: "TaxiRides_" + new Date().toISOString().split('T')[0] + ".xlsx",
        worker: false
    };

    // Create and build spreadsheet - THIS IS THE FIX
    var oSpreadsheet = new Spreadsheet(oSettings);
    oSpreadsheet.build()
        .then(function () {
            MessageToast.show("Excel file downloaded successfully!");
        })
        .catch(function (error) {
            console.error("Export error:", error);
            MessageToast.show("Error exporting to Excel");
        })
        .finally(function () {
            oSpreadsheet.destroy();
        });
},


onNavigateToDashboard: function () {
    var oRouter = this.getOwnerComponent().getRouter();
    oRouter.navTo("RouteDashboard");
}

    });
});