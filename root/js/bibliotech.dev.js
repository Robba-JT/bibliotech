$(document).ready(function () {
    "use strict";
    $.event.props.push("dataTransfer");
    var socket = io(),
        iconsPath = "images/",
        User = {},
        Books = [],
        nbCols = Math.round($(window).width() / 256),
        logout = function () { User = {}; socket.close(); return window.location.assign("/logout"); },
        setPicture = function () {
            if (!User.picture || !User.link) { return !1; }
            $(".picture").html($("<img>").prop("id", "plusLink").attr("src", User.picture).css({ "width": 32, "height": 32, "cursor": "pointer" })).attr("alt", "Google+").click(function () { window.open(User.link); }).removeClass("notdisplayed");
        },
        setDetail = function () { alert($(this).data("book").title); },
        loadCover = function () {
            if ($(window).height() + $(window).scrollTop() > $(this).offset().top && !!$(this).data("src")) {
                $(this).removeAttr("torotate").attr("src", $(this).data("src")).data("src", "");
                $(this).closest(".bookcell").css("visibility", "visible").animateRotate("X", -90, 0, 250);
            }
        },
        getDock = function () {
            var dock = (!!$("#dock").length) ? $("#dock") : $("<div>").prop("id", "dock").appendTo($("body"));
            if ($(".col", dock).length !== nbCols) {
                $(".col", dock).remove();
                var cols = [];
                for (var i = 0; i < nbCols; i++) { cols.push($("<div>").addClass("col").attr("colid", i).css({ "width": Math.round(99 / nbCols) + "%", "max-width": Math.round(99 / nbCols) + "%" })); }
                dock.css("padding-top", $("#navbar").is(":visible") ? $("#navbar").height() : 0).append(cols);
                $(".col").on({
                    dragenter: function(event) { event.preventDefault(); },
                    dragover: function(event) { event.preventDefault(); },
                    drop: function (event) {
                        event.preventDefault();
                        var cellId = event.dataTransfer.getData("cellId"), target = event.target;
                        if (!!$(target).closest(".bookcell").length) {
                            $("#" + cellId).insertBefore($(target).closest(".bookcell"));
                        } else {
                            $("#" + cellId).appendTo($(this));
                        }
                        return !1;
                    }
                });
            }
            return dock;
        },
        setCollection = function (books) {
            var collection = ($(this).attr("id") === "collection");
            if (!!collection) { books = Books; }
            var dock = getDock(), bookcell, position;
            for (var book in books) {
                var cell = $("#tempCell").clone().attr("id", books[book].id).data("book", books[book]).addClass("bookcell").appendTo($("[colid="+($(".bookcell").length % nbCols)+"]")).css("visibility", "hidden"),
                    cover = new Image();
                $(".title", cell).html(books[book].title);
                $(".authors", cell).html((!!books[book].authors) ? books[book].authors.join(", ") : "");
                $(".cover", cell).append($(cover));
                $(cover).data("src", books[book].alternative || books[book].cover).attr("torotate", true);
                $(".infos", cell).attr("description", books[book].description || "");
                if (!!collection) { $(".ajouter", cell).hide(); } else { $(".supprimer", cell).hide(); }
                cover.src = iconsPath + "iconmonstr-book-4-icon-white.png";
            }
            $("img", dock).on("load", loadCover);
            $(".cover").not(".bouton").click(setDetail);
            $(".bookcell").on({
                dragstart: function(event) {
                    bookcell = $(this);
                    bookcell.addClass("isDrag");
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.dropEffect = "move";
                    event.dataTransfer.setData("cellId", bookcell.prop("id"));
                },
                dragend: function(event) { bookcell.removeClass("isDrag"); }
            });
        },
        imgHover = function () {
            if (!!$(this).hasClass("active")) { return !1; }
            $("img", this).attr("src", iconsPath + $("img", this).attr("hover"));
        },
        imgBlur = function () {
            if (!!$(this).hasClass("active")) { return !1; }
            $("img", this).attr("src", iconsPath + $("img", this).attr("blur"));
        },
        imgActive = function () {
            $(".active").removeClass("active").each(imgBlur);
            $(this).addClass("active");
            $("img", this).attr("src", iconsPath + $("img", this).attr("active"));
        };

    $.fn.animateRotate = function (effect, start, end, duration) {
        var that = $(this), defRotate = $.Deferred();
        $(this).show();
        $({ deg: start }).animate({ deg: end }, {
            duration: duration,
            step: function (now) { that.css({ transform: "rotate" + effect + "(" + now + "deg)" });},
            complete: function () { defRotate.resolve(); }
        });
        return defRotate.promise();
    };


    socket.on("user", function (ret) {
        User = ret;
        setPicture();
        $("#navbar > div").not(".picture").hover(imgHover, imgBlur);
        $("[blur]").closest("div").each(imgBlur);
        $("#recherche, #collection").click(imgActive);
        $("img").attr("draggable", !1);
        $("#waitingAnim").addClass("notdisplayed");
        $("#navbar").removeClass("notdisplayed");
        $("#collection").click(setCollection);
        getDock();
    });
    socket.on("collection", function (ret) {
        if (ret.books) { Books = ret.books; }
        $("#collection").click();
        $("#waiting").slideUp("slow");
        socket.emit("searchBooks", { q: "gemmell" });
    });
    socket.on("books", function (ret) {
        setCollection(ret);
    });
    socket.on("logout", logout);

    $(document).scroll(function () { $("[torotate]").each(loadCover); });
    $("#logout").click(logout);
    //$(window).on("contextmenu", function (event) { return !1; });
});
