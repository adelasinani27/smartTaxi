sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'taxi',
            componentId: 'TaxiEventObjectPage',
            contextPath: '/TaxiRide/_TaxiEvent'
        },
        CustomPageDefinitions
    );
});