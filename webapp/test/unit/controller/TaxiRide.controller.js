/*global QUnit*/

sap.ui.define([
	"taxi/manual/taxiui5/controller/TaxiRide.controller"
], function (Controller) {
	"use strict";

	QUnit.module("TaxiRide Controller");

	QUnit.test("I should test the TaxiRide controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
