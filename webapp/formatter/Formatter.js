sap.ui.define([], function () {
    "use strict";

    return {
        timeFromMs: function (oTimeObject) {
            if (!oTimeObject || typeof oTimeObject.ms !== "number") {
                return "";
            }
            var ms = oTimeObject.ms;
            var totalSeconds = Math.floor(ms / 1000);
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);

            var pad = function (n) {
                return n < 10 ? "0" + n : "" + n;
            };
            return pad(hours) + ":" + pad(minutes);
        }
    };
});
