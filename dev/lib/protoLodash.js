define("lodash", ["../lib/lodash.min"], function () {
    _.diff = function (a, b) {
        return _.reduce(a, function (result, value, key) {
            if (!_.isEqual(value, b[key])) {
                result[key] = a[key];
            }
            return result;
        }, {});
    };
    return _;
});
