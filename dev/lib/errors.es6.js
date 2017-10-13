;
(function () {
    const _global = typeof global === "object" && global && global.Object === Object && global,
        _self = typeof self === "object" && self && self.Object === Object && self,
        ctx = _global || _self || Function("return this")(),
        Err = function (error) {
            this.error = error;
            this.code = error.code || "";
            this.message = error.message || error;
            this.date = new Date();
        },
        Errors = function () {
            this.errors = []
        };

    Err.prototype.show = function () {
        console.error(this.date, this.code, this.message);
    };

    Errors.prototype.add = function (msg) {
        this.errors.push(new Err(msg));
    };

    Errors.prototype.show = function () {
        _.forEach(this.errors, (error) => error.show());
    };

    ctx.err = new Errors();
}).call(this);
