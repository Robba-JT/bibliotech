define("profile", ["lodash", "dom", "Request", "handlebars", "text!../templates/profile"], function (_, µ, request, handlebars, template) {
    const render = handlebars.compile(template),
        Profile = function () {
            _.noop();
        },
        Window = function (user, parent) {
            const window = µ.one("profile").set("innerHTML", render(user));

            window.one(".closeWindow")
                .observe("click", () => window.toggleClass("notdisplayed").many("[type=password]").set("value", ""));
        };

    Profile.prototype.init = function () {
        request("/profile").send().then((user) => {
            this.user = user;
            this.window = Window(user, this);
        });
    };

    Profile.prototype.open = function () {
        this.window = render(this.user);
        this.window.toggleClass("notdisplayed", false);
    };

    return new Profile();
});
