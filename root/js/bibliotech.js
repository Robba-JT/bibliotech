window.FileReader&&"formNoValidate"in document.createElement("input")?$(document).ready(function(){"use strict";console.debug("start",new Date),$.event.props.push("dataTransfer");var a,b=io({reconnection:!0}),c=new ColorThief,d="images/",e=function(){var b;switch(this.setCustomValidity(""),this.name){case"searchinput":b=this.value.length<3;break;case"filtre":b=!!this.value.length&&this.value.length<3;break;case"name":b=this.value.length<4;break;case"pwd":b=this.value.length<4||this.value.length>12;break;case"newPwd":b=this.value.length<4||this.value.length>12;break;case"confirmPwd":b=this.value!==$("[name=newPwd]").val();break;case"recommand":b=this.value.toLowerCase()===a.id,console.debug(this.value.toLowerCase(),$("[name=mail]").val(),a.id,b)}b&&this.setCustomValidity($(this).attr("error"))},f=function(b){if(!b.id)return h();for(var c in b)this[c]=b[c];this.picture&&this.link&&($(".picture").html($("<img>").attr("src",this.picture).css({width:32,height:32,cursor:"pointer"})).attr("alt","Google+").click(function(){window.open(a.link)}),$(".gSignIn").toggleClass("notdisplayed")),this.first&&$("#profileWindow").trigger("click")},g=~~($(window).innerWidth()/256),h=function(){return a={},b.close(),window.location.assign("/logout")},i=function(){s.call($("#sort img").first()),$("#tags").toggle(!!a.tags),$("#notifications").toggle(!!a.notifs)},j=function(){$(".navbar").slideToggle(function(){$("#dock").animate({"padding-top":$("#navbar").is(":visible")?$("#navbar").height():0})})},k=function(){return{get:function(){var a=$("#dock").length?$("#dock"):$("<section>").prop("id","dock").attr("role","main").appendTo($("body")).append($("<section>").addClass("notdisplayed")),b=a.width()/g;if($(".col",a).length!==g){$(".col",a).remove();for(var c=[],d=0;g>d;d++)c.push($("<div>").addClass("col").attr("colid",d).css({width:b,"max-width":b}));a.css("padding-top",$("#navbar").is(":visible")?$("#navbar").height():0).append(c),$(".col").on({dragenter:function(){event.preventDefault()},dragover:function(){event.preventDefault()},drop:function(a){a.preventDefault();var b=a.dataTransfer.getData("cellId"),c=a.target;return $(c).closest(".bookcell").length?$("#"+b).insertBefore($(c).closest(".bookcell")):$("#"+b).appendTo($(this)),!1}})}return a},remove:function(){return $("#dock").remove()}}}(),l=function(a){a=a||_.sortBy($(".bookcell").appendTo($("<div>")),function(a){return[$(a).attr("row"),$(a).attr("col")]});var b=k.get(),c=0;$(a).each(function(a){var d=a%g,e=a/g;return $(this).attr("col",d).attr("row",e),$(this).hasClass("tohide")?$(this).removeClass("torotate tohide").appendTo($(".notdisplayed",b)):($(this).appendTo($("[colid="+c%g+"]",b)).css("visibility","hidden"),$("img",this).addClass("torotate"),void c++)}),$(".torotate").loadCovers().done(function(){M()})},m=function(a){if($(a.relatedTarget).hasClass("description")||$(".description").remove(),"mouseenter"===a.type&&$(a.relatedTarget).attr("bookid")!==$(this).data("book").id&&$(this).data("book").description){var b=$(this).data("book").description.indexOf(" ",500),c=function(){$(this).remove()},d={"max-height":$(window).height(),left:Math.min($(this).position().left+$(this).innerWidth()/3,$(window).innerWidth()-1.333*$(this).innerWidth())},e=$(this).position().top+$(this).innerHeight()/3,f=$("<div>").hide().width($(this).width()).appendTo($("body")).addClass("description").html($(this).data("book").description.substr(0,Math.max(b,500))+(-1!==b?"...":"")).prepend($("<span>").html($(this).data("book").title+"<BR>")).click(c).attr("bookid",$(this).data("book").id);e+f.outerHeight()>$(document).innerHeight()?d.bottom=.333*$(this).innerHeight():d.top=e,f.css(d),setTimeout(function(){f.show().mouseleave(c)},1e3)}},n=function(b){var c=[];for(var d in b){var e=a.bookIndex(b[d].id),f=-1!==e?a.books[e]:b[d],g=$("#tempCell").clone().prop("id",f.id).data("book",f).addClass("bookcell").css("visibility","hidden");$("header",g).html(f.title),$("figcaption",g).html(f.authors?f.authors.join(", "):""),$("img",g).data("src",f.alternative||f.cover),$("article",g).attr("description",f.description||""),-1!==e?$(".add",g).hide():$(".remove",g).hide(),c.push(g)}l(c),console.debug("showBooks",new Date,b.length)},o=function(){$("[name=filtre]").val(""),$("[name=filtre]").data("prec",""),$("#tags").show(),$("#collection").hasClass("active")&&$(".bookcell").length===a.books.length?(l(),Y(a.books.length)):(u.call("#collection"),k.remove(),n(a.books))},p=function(a){var b=function(){q(),r($(this).html())};if(a){var c=[];for(var d in a)c.push({text:d,weight:a[d],html:{"class":"tag",weight:a[d]},handlers:{click:b}});$("#cloud").jQCloud(c)}},q=function(){$("html").toggleClass("overflown",!$("#cloud").is(":visible")),$("#cloud").slideToggle(function(){a.tags&&!$("span",$(this)).length&&p(a.tags)})},r=function(b){for(var c in a.books)$("#"+a.books[c].id).toggleClass("tohide",-1===$.inArray(b,a.books[c].tags));l()},s=function(){var a=$(this).is("img")?$(this):$("img",this);return $(this).hasClass("active")||$(this).hasClass("sortBy")?!1:void a.attr("src",d+a.attr("hover"))},t=function(){var a=$(this).is("img")?$(this):$("img",this);return $(this).hasClass("active")||$(this).hasClass("sortBy")?!1:void a.attr("src",d+a.attr("blur"))},u=function(){$(".active").removeClass("active").each(t),$(this).addClass("active"),$("img",this).attr("src",d+$("img",this).attr("active"))},v=function(){var c=$(this).closest(".bookcell"),d=c.data("book").id,e=$(this).prop("class"),f={add:function(){w(d)},remove:function(){$("button","#"+d).toggle("slow"),$("#collection").hasClass("active")&&c.hide("slow",function(){$(this).remove(),$(".torotate").loadCovers()}),b.emit("removeBook",d),$("#nbBooks").html(a.removeBook(d))}};f[e].call()},w=function(a){$("button","#"+a).toggle("slow"),b.emit("addBook",a)},x=function(b){$("#nbBooks").html(a.addBook(b)),$("#collection").hasClass("active")},y=function(){event.preventDefault();var a=$(this).formToJSON();return k.remove(),$("#tags").hide(),u.call("#recherche"),$("[name=filtre]").val("").data("prec",""),b.emit("searchBooks",{q:a.searchby+a.searchinput,langRestrict:a.langage}),E(),$("#navbar").addClass("inactive"),$("#waitingAnim").show(),!1},z=function(){return event.preventDefault(),$("#errPwd").hide("slow"),b.emit("updateUser",$(this).formToJSON()),!1},A=function(b){return b?(a.name=b.name,a.googleSync=b.googleSync,E()):void $("#errPwd").show("slow")},B=function(){$("#formProfil [name=mail]").val(a.id),$("#formProfil [name=name]").val(a.name),a.googleSignIn?($("[name=googleSignIn]").prop("checked",!0),a.googleSync&&$("#formProfil [name=googleSync]").prop("checked",!0)):$("#formProfil [name=pwd]").attr("required",!0)},C=function(){return $("#errPwd").hide("slow"),document.getElementById("pwd").checkValidity()?(confirm("Cette opération est irréversible. Etes-vous de vouloir supprimer votre compte?")&&b.emit("deleteUser",$("[name=pwd]").val()),!1):$("#errPwd").show("slow")},D=function(){var a=$.Deferred(),b=$(this).attr("window")||$(this);return"#profileWindow"===b&&(B(),$(".changePwd input").attr("required")&&N()),$(".errMsg").hide(),M(1).then(function(){$(b).css("top",$(window).scrollTop()+10).show(),$(document).keyup(function(){27===event.keyCode&&E()}),$("[autofocus]",b).focus(),a.resolve()}),a.promise()},E=function(){$(document).unbind("keyup"),$(".window").slideUp("fast",function(){M()}),$("[note]").each(t),$("form").trigger("reset")},F=function(){var c=$(this).closest(".bookcell").data("book").id,d=_.find(a.books,{id:c});M(1,1),d?G(d,!0):b.emit("searchDetail",c)},G=function(a,b){O(!1),$("#upload","#detailWindow").toggle(!a.cover&&!!b),$("[type=file]","#detailWindow").val(""),$("#comments").children().remove(),$("#detailContent").css("background","whitesmoke"),$("#userNote").val(a.note),I(),$("#detailCover").unbind("load"),a.mainColor?$("#detailContent").css("background","radial-gradient(whitesmoke 40%, "+a.mainColor+")"):$("#detailCover").on("load",function(){(a.alternative||a.cover)&&(a.mainColor=S(this).hex,$("#detailContent").css("background","radial-gradient(whitesmoke 40%, "+a.mainColor+")"))}),$("#detailCover").prop("src",a.alternative||a.cover||d+"iconmonstr-book-4-icon-grey.png"),$(".direct").text(""),$("#userTags > div").remove(),$("#bookid").val(a.id),$(".windowheader span").text(a.title),$("[actclick=add]").toggle(!b),$("[actclick=update], [actclick=recommand]").toggle(!!b),$("[actclick=preview]").toggle("NONE"!==a.access),$("[actclick=google]").attr("link",a.link).toggle(!!a.link),$(".comments").toggle(!!a.comments&&!!a.comments.length);for(var c in a){var e=a[c];if($("#"+c).closest(".volumeInfo").toggle(!!e),"authors"===c&&a[c].length){var f=[];for(var g in a[c])f.push($("<span>").addClass("link").attr("searchby",3).text(a[c][g]));$("#authors").append(f)}else if("tags"===c&&a[c].length){for(var h=a[c],i=[],j=0,k=h.length;k>j;j++)i.push(U(h[j]));$("#userTags").append(i)}else if("userNote"!==c)if("comments"===c&&a[c].length){var l=[];for(var m in a[c]){var n=$("#tempComment").clone().removeAttr("id");$("#commentAuthor",n).text(a[c][m].name),$("#commentDate",n).text(a[c][m].date.formatDate()),$("#commentNote",n).text(a[c][m].note),$("#commentComment",n).text(a[c][m].comment),l.push(n)}$("span#comments").append(l)}else $("#"+c).hasClass("date")&&(e=e.formatDate()),$.isArray(e)&&(e=e.join(", ")),$("#"+c,"#detailWindow").html(e);else K.call($("[note="+a[c]+"]"))}$(".link").unbind("click").click(H),D.call("#detailWindow")},H=function(){$(this).attr("searchby")&&$(this).text()&&($("[type=search]","#formSearch").val($(this).text()),$("[name=searchby]","#formSearch")[$(this).attr("searchby")].checked=!0,$("#formSearch").submit())},I=function(){for(var a=$("[note]").toArray(),b=$("#userNote").val(),c=0;c<a.length;c++)b>c?$(a[c]).prop("src",d+$(a[c]).attr("select")):$(a[c]).prop("src",d+$(a[c]).attr("blur"))},J=function(){var a=$("#userNote").val()||0,b=$(this).attr("note"),c=$("[note]").toArray();if(a!==b)for(var e=0;e<Math.max(a,b);e++)e<Math.min(a,b)?$(c[e]).prop("src",d+$(c[e]).attr("select")):a>b?$(c[e]).prop("src",d+$(c[e]).attr("hoverminus")):$(c[e]).prop("src",d+$(c[e]).attr("hoverplus"))},K=function(){$("#userNote").val($("#userNote").val()===$(this).attr("note")&&"1"===$("#userNote").val()?"0":$(this).attr("note")),I()},L=function(){var a=this.value.toLowerCase();this.checkValidity()&&a!==$(this).data("prec")&&($(this).data("prec",a),$(".bookcell").each(function(){var b=$(this).data("book"),c=b.title.toLowerCase(),d=b.authors?b.authors.join(", ").toLowerCase():"",e=b.description.toLowerCase();$(this).toggleClass("tohide",-1===c.indexOf(a)&&-1===d.indexOf(a)&&-1===e.indexOf(a))}),l())},M=function(a,b){var c=$.Deferred();return $(".description").remove(),a?(b?$("img","#waiting").show():$("img","#waiting").hide(),$("html").addClass("overflown"),$("#waiting").slideDown("slow",function(){c.resolve()})):$("#waiting").slideUp("slow",function(){$("html").removeClass("overflown"),$("#waiting").removeClass("over"),c.resolve()}),c.promise()},N=function(){$(".changePwd").slideToggle(function(){$("[type=password]",this).attr("required",$(this).is(":visible"))})},O=function(a){$("#sort").css({top:$("#navbar").height()+5,left:$("#tris").offset().left}),$("#sort").toggle(a)},P=function(a){$("#notifs").css({top:$("#navbar").height()+5,left:$("#notifications").offset().left}),$("#notifs").toggle(a)},Q=function(){O(!1),$(".sortBy").removeClass("sortBy"),t.call(".sortBy"),$(this).addClass("sortBy"),s.call(".sortBy");var a=$(this).attr("by"),b=$(this).attr("sort"),c=$(".bookcell").appendTo($("<div>"));c=_.sortBy(c,function(b){return $(b).data("book")[a]||null}),b&&c.reverse(),l(c)},R=function(){var a=new $.Deferred,b=$(this),c=b.closest(".bookcell");return!b.length||$(window).height()+$(window).scrollTop()<=c.offset().top?a.reject():(b.removeClass("torotate"),$("button",c).click(v),$("img, .title, .authors",c).not(".bouton").click(F),b.data("src")&&b.attr("src",b.data("src")),c.css("visibility","visible").show(),$({deg:-90}).animate({deg:0},{duration:250,step:function(a){c.css({transform:"rotateX("+a+"deg)"})},complete:function(){a.resolve()}})),a.promise()},S=function(a){var b=c.getColor(a),d="#"+((1<<24)+(b[0]<<16)+(b[1]<<8)+b[2]).toString(16).substr(1);return{rgb:b,hex:d}},T=function(){var a=this.files;if(a[0]){if(!a[0].type.match(/image.*/)||a[0].size>1e6)return alert("Veuillez sélectionner un fichier de type 'image' inférieure à 1MB."),!1;var b=new FileReader;b.onload=function(a){return function(b){a.on("load",function(){var a=S(this);$(this).attr("maincolor",a.hex),$("#detailContent").css("background","radial-gradient(whitesmoke 40%, "+a.hex+")")}),a.prop("src",b.target.result)}}($("#detailCover")),b.readAsDataURL(this.files[0])}},U=function(a){var b=$("#tempTag").clone().removeAttr("id").click(W);return $(".libelle",b).html(a),b},V=function(){event.preventDefault();var a=$(this).formToJSON().tag,b=$("#userTags > div").toArray(),c=_.find(b,function(b){return $(".libelle",b).html()===a});c||(b.push(U(a)),$("#userTags").append(_.sortBy(b,function(a){return $(".libelle",a).html()}))),this.reset()},W=function(){$(event.target).hasClass("libelle")?(E(),r($(event.target).html())):$(this).hide(function(){$(this).remove()})},X=function(){var c,d=$("#bookid","#detailWindow").val(),e=a.bookIndex(d),f=$(this).attr("actclick"),g={add:function(){w(d),$("[actclick=add], [actclick=update], #upload").toggle(),o()},update:function(){var e=!1,f={id:d},g=_.map($("#userTags > div").toArray(),function(a){return $(".libelle",a).html()});$("#userNote").val()&&$("#userNote").val()!==c.note&&(e=!0,f.userNote=$("#userNote").val()),$("textarea","#userComment").val()&&$("textarea","#userComment").val()!==c.comment&&(e=!0,f.comment=$("textarea","#userComment").val()),c.tags&&g===c.tags||(e="tags",f.tags=g),$("#detailCover").attr("maincolor")&&c.alternative!==$("#detailCover").prop("src")&&(e=!0,f.cover=$("#detailCover").prop("src"),f.maincolor=$("#detailCover").attr("maincolor"),$("img","#"+d).prop("src",f.cover)),e&&(f.userDate=(new Date).toJSON(),a.updateBook(f),a.updateTags(),b.emit("updateBook",f)),E()},preview:function(){$("[name=previewid]").val(d),$("#waiting").addClass("over"),D.call("#previewWindow").then(function(){$("#preview").submit()})},google:function(){window.open($(this).attr("link"))},recommand:function(){$("#waiting").addClass("over"),D.call("#recommandWindow")},close:function(){$(this).closest(".window").slideUp(function(){$("#waiting").removeClass("over")})}};-1!==e&&(c=a.books[e]),g[f].call(this)},Y=function(a){console.debug("endRequest",new Date,a),$("#navbar").removeClass("inactive"),$("#waitingAnim").hide(),$(".bookcell").hover(m).on({dragstart:function(a){$(this).addClass("isDrag"),a.dataTransfer.effectAllowed="move",a.dataTransfer.dropEffect="move",a.dataTransfer.setData("cellId",$(this).prop("id"))},dragend:function(){$(this).removeClass("isDrag"),$(".torotate").loadCovers()}})},Z=function(){window.open($(this).attr("url"))},aa=function(){document.location.href="mailto:"+$(this).attr("mail")},ba=function(){event.preventDefault();var a=$(this).formToJSON();a.book=$("#bookid").val(),a.title=$("#title").text(),b.emit("sendNotif",a),$("img","#recommandWindow").trigger("click")},ca=function(){$("#notifications, #notifNumber").toggle(!!a.notifs.length),$("#notifNumber").text(a.notifs.length);for(var b in a.notifs){var c=$("#tempNotif").clone().removeAttr("id").attr("bookid",a.notifs[b]._id.book).appendTo("#notifs").click(da);$("#notifName",c).html(a.notifs[b].from),$("#notifTitle",c).html(a.notifs[b].title)}},da=function(){var c=this;$("#notifs").toggle(function(){$(c).remove()}),_.remove(a.notifs,function(a){return a._id.book===$(c).attr("bookid")}),$("#notifications, #notifNumber").toggle(!!a.notifs.length),$("#notifNumber").text(a.notifs.length),b.emit("searchDetail",$(c).attr("bookid"))};f.prototype.addBook=function(a){return-1===this.bookIndex(a.id)&&(this.books.push(a),this.books=_.sortBy(this.books,"title")),this.books.length},f.prototype.bookIndex=function(a){return _.findIndex(this.books,{id:a})},f.prototype.removeBook=function(a){return _.remove(this.books,{id:a}),this.books.length},f.prototype.updateBook=function(a){var b=this.bookIndex(a.id);-1!==b&&(this.books[b]=$.extend(this.books[b],a))},f.prototype.updateUser=function(a){},f.prototype.updateTags=function(){this.tags=_.countBy(_.flatten(_.compact(_.pluck(this.books,"tags")),!0).sort()),$("span",$("#cloud")).remove()},$.fn.loadCovers=function(){return $.when(this.each(function(){R.call(this)}))},$.fn.formToJSON=function(){if(!this.is("form"))return!1;var a={};return _.forEach(this.serializeArray(),function(b){a[b.name]=b.value}),a},String.prototype.formatDate=function(){var a=this.substr(0,10).split("-");return 3===a.length&&(a=(1===a[2].length?"0":"")+a[2]+"/"+(1===a[1].length?"0":"")+a[1]+"/"+a[0]),a},b.on("connect",function(){console.debug("connect",b.connected),b.emit("isConnected")}),b.io.on("reconnect",function(){console.debug("reconnect",b.connected),b.io.reconnect()}),b.on("disconnect",function(){console.debug("disconnect",b.connected),a={},E(),M(1,1),k.remove()}),b.on("error",function(a){console.error(a)}),b.on("user",function(b){a=new f(b),console.debug("user",new Date),i()}),b.on("collection",function(b){a.books=b.books,a.notifs=b.notifs,a.notifs&&ca(),console.debug("collection",new Date,a),$("#nbBooks").html(a.books.length),$("#collection").trigger("click")}),b.on("books",n),b.on("endRequest",Y),b.on("returnAdd",x),b.on("returnDetail",G),b.on("logout",h),b.on("updateOk",A),b.on("error",function(a){console.warn(a)}),$(document).on("scroll",function(){$(".torotate").loadCovers(),$("#footer").toggle(!!$(window).scrollTop())}),$("[type=text], [type=search], [type=password], [type=email]").on("input propertychange",e),$(".navbar div").not("#tris").on("click",function(){O(!1)}),$("#logout").click(h),$("#formSearch").submit(y),$("#formProfil").submit(z),$("#formRecommand").submit(ba),$("#formTag").submit(V),$("#changePwd").click(N),$("#delete").click(C),$("#tris").click(O),$("#notifications").click(P),$("#sort > div").click(Q),$("[actclick]").hover(s,t).click(X),$(".closeWindow").click(E),$("#footer").click(function(){$("body").animate({scrollTop:0})}),$("#upload").click(function(){$("[type=file]","#uploadHidden").trigger("click")}),$("[type=file]","#uploadHidden").change(T),$("#userNote > img").hover(J,I).click(K),$(".navbar > div, .closeWindow, #footer, [by], .imgAction img, #cloud img, #contactsWindow img").not(".picture, [note]").hover(s,t),$("[blur]").each(t),$("img").attr("draggable",!1),$("#navbar").removeClass("notdisplayed"),$("#collection").click(o),$("#tags, #cloud > img").click(q),$("#recherche, #profil, #contact, #newbook").click(D),$("[name=filtre]").on("search",L),$("[name=filtre]").parent().on("submit",function(){event.preventDefault()}),$(".togglenavbar").click(j),$("[url]").click(Z),$("[mail]").click(aa),$(window).resize(function(){g!==~~($(window).innerWidth()/256)&&(E(),g=~~($(window).innerWidth()/256),l())})}):alert("Veuillez installer une version plus récente de votre navigateur!!!");
