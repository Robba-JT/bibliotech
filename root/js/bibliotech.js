window.FileReader&&"formNoValidate"in document.createElement("input")?$(document).ready(function(){"use strict";console.debug("start",new Date),$.event.props.push("dataTransfer");var a,b=io({reconnection:!0}),c=new ColorThief,d="images/",e=function(){var b;switch(this.setCustomValidity(""),this.name){case"searchinput":b=this.value.length<3;break;case"filtre":b=!!this.value.length&&this.value.length<3;break;case"name":b=this.value.length<4;break;case"pwd":b=this.value.length<4||this.value.length>12;break;case"newPwd":b=this.value.length<4||this.value.length>12;break;case"confirmPwd":b=this.value!==$("[name=newPwd]").val();break;case"recommand":b=this.value.toLowerCase()===a.id,console.debug(this.value.toLowerCase(),$("[name=mail]").val(),a.id,b)}b&&this.setCustomValidity($(this).attr("error"))},f=function(b){if(!b.id)return h();this.updateUser=function(a){},this.bookIndex=function(a){return _.findIndex(this.books,{id:a})},this.addBook=function(a){return-1===this.bookIndex(a.id)&&(this.books.push(a),this.books=_.sortBy(this.books,"title")),this.books.length},this.removeBook=function(a){return _.remove(this.books,{id:a}),this.books.length},this.updateBook=function(a){var b=this.bookIndex(a.id);-1!==b&&(this.books[b]=$.extend(this.books[b],a))},this.updateTags=function(){this.tags=_.countBy(_.flatten(_.compact(_.pluck(this.books,"tags")),!0).sort()),$("span",$("#cloud")).remove()};for(var c in b)this[c]=b[c];this.picture&&this.link&&($(".picture").html($("<img>").attr("src",this.picture).css({width:32,height:32,cursor:"pointer"})).attr("alt","Google+").click(function(){window.open(a.link)}),$(".gSignIn").toggleClass("notdisplayed")),this.first&&$("#profileWindow").trigger("click")},g=~~($(window).innerWidth()/256),h=function(){return a={},b.close(),window.location.assign("/logout")},i=function(){t.call($("#sort img").first()),$("#tags").toggle(!$.isEmptyObject(a.tags)),$("#notifications").toggle(!!a.notifs)},j=function(){$(".navbar").slideToggle(function(){$("#dock").animate({"padding-top":$("#navbar").is(":visible")?$("#navbar").height():0})})},k=function(){return{get:function(){var a=$("#dock").length?$("#dock"):$("<section>").prop("id","dock").attr("role","main").appendTo($("body")).append($("<section>").addClass("notdisplayed")),b=a.width()/g;if($(".col",a).length!==g){$(".col",a).remove();for(var c=[],d=0;g>d;d++)c.push($("<div>").addClass("col").attr("colid",d).css({width:b,"max-width":b}));a.css("padding-top",$("#navbar").is(":visible")?$("#navbar").height():0).append(c),$(".col").on({dragenter:function(){event.preventDefault()},dragover:function(){event.preventDefault()},drop:function(a){a.preventDefault();var b=a.dataTransfer.getData("cellId"),c=a.target;return $(c).closest(".bookcell").length?$("#"+b).insertBefore($(c).closest(".bookcell")):$("#"+b).appendTo($(this)),!1}})}return a},remove:function(){return $("#dock").remove()}}}(),l=function(a){a=a||_.sortBy($(".bookcell").appendTo($("<div>")),function(a){return[$(a).attr("row"),$(a).attr("col")]});var b=k.get(),c=0;$(a).each(function(a){if(!$("#"+$(this).prop("id")).length){var d=a%g,e=a/g;if($(this).attr("col",d).attr("row",e),$(this).hasClass("tohide"))return $(this).removeClass("torotate tohide").appendTo($(".notdisplayed",b));$(this).appendTo($("[colid="+c%g+"]",b)).css("visibility","hidden"),$("img",this).addClass("torotate"),c++}}),$(".torotate").loadCovers()},m=function(a){if($(a.relatedTarget).hasClass("description")||$(".description").remove(),"mouseenter"===a.type&&$(a.relatedTarget).attr("bookid")!==$(this).data("book").id&&$(this).data("book").description){var b=$(this).data("book").description.indexOf(" ",500),c=function(){$(this).remove()},d={"max-height":$(window).height(),left:Math.min($(this).position().left+$(this).innerWidth()/3,$(window).innerWidth()-1.333*$(this).innerWidth())},e=$(this).position().top+$(this).innerHeight()/3,f=$("<div>").hide().width($(this).width()).appendTo($("body")).addClass("description").html($(this).data("book").description.substr(0,Math.max(b,500))+(-1!==b?"...":"")).prepend($("<span>").html($(this).data("book").title+"<BR>")).click(c).attr("bookid",$(this).data("book").id);e+f.outerHeight()>$(document).innerHeight()?d.bottom=.333*$(this).innerHeight():d.top=e,f.css(d),setTimeout(function(){f.fadeIn().mouseleave(c)},1e3)}},n=function(b,c){c||(c=a.bookIndex(b.id));var d=$("#tempCell").clone().prop("id",b.id).data("book",b).addClass("bookcell").css("visibility","hidden");return $("header",d).html(b.title),$("figcaption",d).html(b.authors?b.authors.join(", "):""),$("img",d).data("src",b.alternative||b.cover),$("article",d).attr("description",b.description||""),-1!==c?$(".add",d).hide():$(".remove",d).hide(),d},o=function(b){var c=[];for(var d in b){var e=a.bookIndex(b[d].id),f=-1!==e?a.books[e]:b[d];c.push(n(f,e))}c&&(l(c),N()),console.debug("showBooks",new Date,c.length)},p=function(){$("[name=filtre]").val(""),$("[name=filtre]").data("prec",""),$("#tags").toggle(!$.isEmptyObject(a.tags)),$("#collection").hasClass("active")?(l(),Z(a.books.length)):(v.call("#collection"),k.remove(),o(a.books))},q=function(a){var b=function(){r(),s($(this).html())};if(a){var c=[];for(var d in a)c.push({text:d,weight:a[d],html:{"class":"tag",weight:a[d]},handlers:{click:b}});$("#cloud").jQCloud(c)}},r=function(){$("html").toggleClass("overflown",!$("#cloud").is(":visible")),$("#cloud").fadeToggle(function(){a.tags&&!$("span",$(this)).length&&q(a.tags)})},s=function(b){for(var c in a.books)$("#"+a.books[c].id).toggleClass("tohide",-1===$.inArray(b,a.books[c].tags));l()},t=function(){var a=$(this).is("img")?$(this):$("img",this);return $(this).hasClass("active")||$(this).hasClass("sortBy")?!1:void a.attr("src",d+a.attr("hover"))},u=function(){var a=$(this).is("img")?$(this):$("img",this);return $(this).hasClass("active")||$(this).hasClass("sortBy")?!1:void a.attr("src",d+a.attr("blur"))},v=function(){$(".active").removeClass("active").each(u),$(this).addClass("active"),$("#tags").toggle("collection"===$(this).prop("id")),$("img",this).attr("src",d+$("img",this).attr("active"))},w=function(){var c=$(this).closest(".bookcell"),d=c.data("book").id,e=$(this).prop("class"),f={add:function(){x(d)},remove:function(){$("button","#"+d).fadeToggle(),$("#collection").hasClass("active")&&c.fadeToggle(function(){$(this).remove(),$(".torotate").loadCovers()}),b.emit("removeBook",d),$("#nbBooks").html(a.removeBook(d))}};f[e].call()},x=function(a){$("button","#"+a).fadeToggle(),b.emit("addBook",a)},y=function(b){$("#nbBooks").html(a.addBook(b))},z=function(){event.preventDefault();var a=$(this).formToJSON();return k.remove(),v.call("#recherche"),$("[name=filtre]").val("").data("prec",""),b.emit("searchBooks",{q:a.searchby+a.searchinput,langRestrict:a.langage}),F(),$("#navbar").addClass("inactive"),$("#waitingAnim").fadeIn(),!1},A=function(){return event.preventDefault(),$("#errPwd").fadeOut(),b.emit("updateUser",$(this).formToJSON()),!1},B=function(b){return b?(a.name=b.name,a.googleSync=b.googleSync,F()):void $("#errPwd").show()},C=function(){$("#formProfil [name=mail]").val(a.id),$("#formProfil [name=name]").val(a.name),a.googleSignIn?($("[name=googleSignIn]").prop("checked",!0),a.googleSync&&$("#formProfil [name=googleSync]").prop("checked",!0)):$("#formProfil [name=pwd]").attr("required",!0)},D=function(){return $("#errPwd").hide(),document.getElementById("pwd").checkValidity()?(confirm("Cette opération est irréversible. Etes-vous de vouloir supprimer votre compte?")&&b.emit("deleteUser",$("[name=pwd]").val()),!1):$("#errPwd").show()},E=function(){var a=$.Deferred(),b=$(this).attr("window")||$(this);return"#profileWindow"===b&&(C(),$(".changePwd input").attr("required")&&O()),$(".errMsg").hide(),N(1).always(function(){$(b).css("top",$(window).scrollTop()+10).fadeIn(),$(document).keyup(function(){27===event.keyCode&&F()}),$("[autofocus]",b).focus(),a.resolve()}),a.promise()},F=function(a){$(document).unbind("keyup"),$("[note]").each(u),$("form").not("#formFilter").trigger("reset"),$(".window").fadeOut().promise().then(function(){$.isFunction(a)?a.call():N()})},G=function(){var c=$(this).closest(".bookcell").data("book").id,d=_.find(a.books,{id:c});N(1,1),d?H(d,!0):b.emit("searchDetail",c)},H=function(b,c){a.lastDetail=b,$("#upload","#detailWindow").toggle(!b.cover&&!!c),$("[type=file]","#detailWindow").val(""),$("#comments").children().remove(),$("#detailContent").css("background","whitesmoke"),$("#userNote").val(b.note),J(),$("#detailCover").unbind("load"),b.mainColor?$("#detailContent").css("background","radial-gradient(whitesmoke 40%, "+b.mainColor+")"):$("#detailCover").on("load",function(){(b.alternative||b.cover)&&(b.mainColor=T(this).hex,$("#detailContent").css("background","radial-gradient(whitesmoke 40%, "+b.mainColor+")"))}),$("#detailCover").prop("src",b.alternative||b.cover||d+"iconmonstr-book-4-icon-grey.png"),$(".direct").text(""),$("#userTags > div").remove(),$("#bookid").val(b.id),$(".windowheader span").text(b.title),$("[actclick=add]").toggle(!c),$("[actclick=update], [actclick=recommand]").toggle(!!c),$("[actclick=preview]").toggle("NONE"!==b.access),$("[actclick=google]").attr("link",b.link).toggle(!!b.link),$(".comments").toggle(!!b.comments&&!!b.comments.length);for(var e in b){var f=b[e];if($("#"+e).closest(".volumeInfo").toggle(!!f),"authors"===e&&b[e].length){var g=[];for(var h in b[e])g.push($("<span>").addClass("link").attr("searchby",3).text(b[e][h]));$("#authors").append(g)}else if("tags"===e&&b[e].length){for(var i=b[e],j=[],k=0,l=i.length;l>k;k++)j.push(V(i[k]));$("#userTags").append(j)}else if("userNote"!==e)if("comments"===e&&b[e].length){var m=[];for(var n in b[e]){var o=$("#tempComment").clone().removeAttr("id");$("#commentAuthor",o).text(b[e][n].name),$("#commentDate",o).text(b[e][n].date.formatDate()),$("#commentNote",o).text(b[e][n].note),$("#commentComment",o).text(b[e][n].comment),m.push(o)}$("span#comments").append(m)}else $("#"+e).hasClass("date")&&(f=f.formatDate()),$.isArray(f)&&(f=f.join(", ")),$("#"+e,"#detailWindow").html(f);else L.call($("[note="+b[e]+"]"))}$(".link").unbind("click").click(I),E.call("#detailWindow")},I=function(){$(this).attr("searchby")&&$(this).text()&&($("[type=search]","#formSearch").val($(this).text()),$("[name=searchby]","#formSearch")[$(this).attr("searchby")].checked=!0,$("#formSearch").submit())},J=function(){for(var a=$("[note]").toArray(),b=$("#userNote").val(),c=0;c<a.length;c++)b>c?$(a[c]).prop("src",d+$(a[c]).attr("select")):$(a[c]).prop("src",d+$(a[c]).attr("blur"))},K=function(){var a=$("#userNote").val()||0,b=$(this).attr("note"),c=$("[note]").toArray();if(a!==b)for(var e=0;e<Math.max(a,b);e++)e<Math.min(a,b)?$(c[e]).prop("src",d+$(c[e]).attr("select")):a>b?$(c[e]).prop("src",d+$(c[e]).attr("hoverminus")):$(c[e]).prop("src",d+$(c[e]).attr("hoverplus"))},L=function(){$("#userNote").val($("#userNote").val()===$(this).attr("note")&&"1"===$("#userNote").val()?"0":$(this).attr("note")),J()},M=function(){var a=this.value.toLowerCase();this.checkValidity()&&a!==$(this).data("prec")&&($(this).data("prec",a),$(".bookcell").each(function(){var b=$(this).data("book"),c=b.title.toLowerCase(),d=b.authors?b.authors.join(", ").toLowerCase():"",e=b.description.toLowerCase();$(this).toggleClass("tohide",-1===c.indexOf(a)&&-1===d.indexOf(a)&&-1===e.indexOf(a))}),l())},N=function(a,b){var c=$.Deferred();return $(".window").is(":visible")?c.reject():($(".description").remove(),a?(b?$("img","#waiting").show():$("img","#waiting").hide(),$("html").addClass("overflown"),$("#waiting").fadeIn().promise().then(function(){c.resolve()})):$("#waiting").fadeOut().promise().then(function(){$("html").removeClass("overflown"),$("#waiting").removeClass("over"),c.resolve()})),c.promise()},O=function(){$(".changePwd").slideToggle(function(){$("[type=password]",this).attr("required",$(this).is(":visible"))})},P=function(a){a&&$("#notifs").fadeOut(),$("#sort").css({top:$("#navbar").height()+5,left:$("#tris").offset().left}),$("#sort").fadeToggle()},Q=function(a){a&&$("#sort").fadeOut(),$("#notifs").css({top:$("#navbar").height()+5,left:$("#notifications").offset().left}),$("#notifs").fadeToggle()},R=function(){$(".sortBy").removeClass("sortBy"),u.call(".sortBy"),$(this).addClass("sortBy"),t.call(".sortBy");var a=$(this).attr("by"),b=$(this).attr("sort"),c=$(".bookcell").appendTo($("<div>"));c=_.sortBy(c,function(b){return $(b).data("book")[a]||null}),b&&c.reverse(),l(c)},S=function(){var a=new $.Deferred,b=$(this),c=b.closest(".bookcell");return!b.length||$(window).height()+$(window).scrollTop()<=c.offset().top?a.reject():(b.removeClass("torotate"),$("button",c).click(w),$("img, .title, .authors",c).not(".bouton").click(G),b.data("src")&&b.attr("src",b.data("src")),c.css("visibility","visible").fadeIn(),$({deg:-90}).animate({deg:0},{duration:250,step:function(a){c.css({transform:"rotateX("+a+"deg)"})},complete:function(){a.resolve()}})),a.promise()},T=function(a){var b=c.getColor(a),d="#"+((1<<24)+(b[0]<<16)+(b[1]<<8)+b[2]).toString(16).substr(1);return{rgb:b,hex:d}},U=function(){var a=this.files;if(a[0]){if(!a[0].type.match(/image.*/)||a[0].size>1e6)return alert("Veuillez sélectionner un fichier de type 'image' inférieure à 1MB."),!1;var b=new FileReader;b.onload=function(a){return function(b){a.on("load",function(){var a=T(this);$(this).attr("maincolor",a.hex),$("#detailContent").css("background","radial-gradient(whitesmoke 40%, "+a.hex+")")}),a.prop("src",b.target.result)}}($("#detailCover")),b.readAsDataURL(this.files[0])}},V=function(a){var b=$("#tempTag").clone().removeAttr("id").click(X);return $(".libelle",b).html(a),b},W=function(){event.preventDefault();var a=$(this).formToJSON().tag,b=$("#userTags > div").toArray(),c=_.find(b,function(b){return $(".libelle",b).html()===a});c||(b.push(V(a)),$("#userTags").append(_.sortBy(b,function(a){return $(".libelle",a).html()}))),this.reset()},X=function(){$(event.target).hasClass("libelle")?(F(),s($(event.target).html())):$(this).fadeOut().promise().then(function(){$(this).remove(),$("[autofocus]","#detailWindow").focus()})},Y=function(){var c,d=$("#bookid","#detailWindow").val(),e=a.bookIndex(d),f=$(this).attr("actclick"),h={add:function(){if(b.emit("addDetail"),$("#nbBooks").html(a.addBook(a.lastDetail)),$("[actclick=add], [actclick=update], #upload").toggle(),$("#collection").hasClass("active")&&!$("#"+d).length){var c=a.books.length%g,e=$(".bookcell","[colid="+a.books.length%g+"]").length;n(a.lastDetail).attr("col",(c||1)-1).attr("row",e).appendTo("[colid=1]"),l()}},associated:function(){$("#dock").remove(),v.call("#recherche"),$("#navbar").addClass("inactive"),$("#waitingAnim").fadeIn(),F(function(){N(1,1),b.emit("associated",d)})},update:function(){var e=!1,f={id:d},g=_.map($("#userTags > div").toArray(),function(a){return $(".libelle",a).html()});$("#userNote").val()&&$("#userNote").val()!==c.note&&(e=!0,f.userNote=$("#userNote").val()),$("textarea","#userComment").val()&&$("textarea","#userComment").val()!==c.comment&&(e=!0,f.comment=$("textarea","#userComment").val()),c.tags&&g===c.tags||(e="tags",f.tags=g),$("#detailCover").attr("maincolor")&&c.alternative!==$("#detailCover").prop("src")&&(e=!0,f.cover=$("#detailCover").prop("src"),f.maincolor=$("#detailCover").attr("maincolor"),$("img","#"+d).prop("src",f.cover)),e&&(f.userDate=(new Date).toJSON(),a.updateBook(f),a.updateTags(),$("#tags").toggle(!$.isEmptyObject(a.tags)),b.emit("updateBook",f)),F()},preview:function(){$("[name=previewid]").val(d),$("#waiting").addClass("over"),E.call("#previewWindow").then(function(a){$("#preview").submit()})},google:function(){window.open($(this).attr("link"))},recommand:function(){$("#waiting").addClass("over"),E.call("#recommandWindow")},close:function(){$(this).closest(".window").fadeOut().promise().then(function(){$("#waiting").removeClass("over")})}};-1!==e&&(c=a.books[e]),h[f].call(this)},Z=function(a){console.debug("endRequest",new Date,a),$("#navbar").removeClass("inactive"),$("#waitingAnim").fadeOut(),N(),$(".bookcell").hover(m).on({dragstart:function(a){$(this).addClass("isDrag"),a.dataTransfer.effectAllowed="move",a.dataTransfer.dropEffect="move",a.dataTransfer.setData("cellId",$(this).prop("id"))},dragend:function(){$(this).removeClass("isDrag"),$(".torotate").loadCovers()}})},aa=function(){window.open($(this).attr("url"))},ba=function(){document.location.href="mailto:"+$(this).attr("mail")},ca=function(){event.preventDefault();var a=$(this).formToJSON();a.book=$("#bookid").val(),a.title=$("#title").text(),b.emit("sendNotif",a),$("img","#recommandWindow").trigger("click")},da=function(){$("#notifications, #notifNumber").toggle(!!a.notifs.length),$("#notifNumber").text(a.notifs.length);for(var b in a.notifs){var c=$("#tempNotif").clone().removeAttr("id").attr("bookid",a.notifs[b]._id.book).appendTo("#notifs").click(ea);$("#notifName",c).html(a.notifs[b].from),$("#notifTitle",c).html(a.notifs[b].title)}},ea=function(){var c=this;$("#notifs").toggle(function(){$(c).remove()}),_.remove(a.notifs,function(a){return a._id.book===$(c).attr("bookid")}),$("#notifications, #notifNumber").toggle(!!a.notifs.length),$("#notifNumber").text(a.notifs.length),N(1,1),b.emit("readNotif",$(c).attr("bookid"))},fa=function(){$("#dock").remove(),v.call("#recherche"),$("#navbar").addClass("inactive"),$("#waitingAnim").fadeIn(),F(function(){N(1,1),b.emit("recommanded")})},ga=function(){"importNow"===$(this).prop("id")&&($("#dock").remove(),v.call("#collection"),$("#navbar").addClass("inactive"),$("#waitingAnim").fadeIn(),F(function(){N(1,1)})),console.debug($(this).prop("id")),b.emit($(this).prop("id"))};$.fn.loadCovers=function(){return $.when(this.each(function(){S.call(this)}))},$.fn.formToJSON=function(){if(!this.is("form"))return!1;var a={};return _.forEach(this.serializeArray(),function(b){a[b.name]=b.value}),a},String.prototype.formatDate=function(){var a=this.substr(0,10).split("-");return 3===a.length&&(a=(1===a[2].length?"0":"")+a[2]+"/"+(1===a[1].length?"0":"")+a[1]+"/"+a[0]),a},b.on("connect",function(){console.debug("connect",b.connected),b.emit("isConnected")}),b.io.on("reconnect",function(){console.debug("reconnect",b.connected),b.io.reconnect()}),b.on("disconnect",function(){console.debug("disconnect",b.connected),a={},F(),N(1,1),$(".deroulant").hide(),k.remove()}),b.on("error",function(a){console.error(a)}),b.on("user",function(b){a=new f(b),console.debug("user",new Date),i()}),b.on("collection",function(b){a.books=b.books,a.notifs=b.notifs,a.notifs&&da(),console.debug("collection",new Date),$("#nbBooks").html(a.books.length),$("#collection").trigger("click")}),b.on("books",o),b.on("endRequest",Z),b.on("returnAdd",y),b.on("returnDetail",H),b.on("logout",h),b.on("updateOk",B),b.on("error",function(a){console.warn(a)}),$(document).on("scroll",function(){$(".torotate").loadCovers(),$("#footer").toggle(!!$(window).scrollTop())}),$("[type=text], [type=search], [type=password], [type=email]").on("input propertychange",e),$("#logout").click(h),$("#formSearch").submit(z),$("#formProfil").submit(A),$("#formRecommand").submit(ca),$("#formTag").submit(W),$("#changePwd").click(O),$("#delete").click(D),$("#tris").click(P),$("#notifications").click(Q),$("#sort > div").click(R),$("[actclick]").hover(t,u).click(Y),$(".closeWindow").click(F),$("#footer").click(function(){$("body").animate({scrollTop:0})}),$("#upload").click(function(){$("[type=file]","#uploadHidden").trigger("click")}),$("[type=file]","#uploadHidden").change(U),$("#userNote > img").hover(K,J).click(L),$(".navbar > div, .closeWindow, #footer, [by], .imgAction img, #cloud img, #contactsWindow img").not(".picture, [note]").hover(t,u),$("[blur]").each(u),$("img").attr("draggable",!1),$("#navbar").removeClass("notdisplayed"),$("#collection").click(p),$("#tags, #cloud > img").click(r),$("#recherche, #profil, #contact, #newbook").click(E),$("[name=filtre]").on("search",M),$("#formFilter").on("submit",function(){event.preventDefault()}),$(".togglenavbar").click(j),$("[url]").click(aa),$("[mail]").click(ba),$("#recommand4u").click(fa),$("#importNow, #exportNow").click(ga),$("html").click(function(a){-1===$.inArray($(a.target).closest(".action").prop("id"),["notifications","tris"])&&$(".deroulant").fadeOut()}),$(window).resize(function(){g!==~~($(window).innerWidth()/256)&&(F(),$(".deroulant").hide(),g=~~($(window).innerWidth()/256),l())})}):alert("Veuillez installer une version plus récente de votre navigateur!!!");
