sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"taxi/test/integration/pages/TaxiRideList",
	"taxi/test/integration/pages/TaxiRideObjectPage",
	"taxi/test/integration/pages/TaxiEventObjectPage"
], function (JourneyRunner, TaxiRideList, TaxiRideObjectPage, TaxiEventObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('taxi') + '/test/flp.html#app-preview',
        pages: {
			onTheTaxiRideList: TaxiRideList,
			onTheTaxiRideObjectPage: TaxiRideObjectPage,
			onTheTaxiEventObjectPage: TaxiEventObjectPage
        },
        async: true
    });

    return runner;
});

