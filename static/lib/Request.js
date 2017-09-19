"use strict";!function(a,b){var c=function d(a){var c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"GET",e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!(this instanceof d))return new d(a,c,e);this.method=_.toUpper(c),this.headers={};for(var f in e)_.has(e,f)&&(this.headers[_.toUpper(f)]=e[f]);return this.url=_.startsWith(a,"http")||_.startsWith(a,"/")?a:"/"+a,this.req=new b,this};c.prototype.jsonToQueryString=function(a){var b="",c=_.keys(a),d=c.length-1;return _.isPlainObject(a)&&(b+="?",_.forEach(c,function(c,e){b+=c+"="+a[c],d>e&&(b+="&")})),this.url+=encodeURI(b),this},c.prototype["long"]=function(){return this.req.timeout=9e5,this.send()},c.prototype.send=function(a){var c=this;return this.url?new Promise(function(d,e){try{"GET"===c.method?c.jsonToQueryString(a):!_.has(c.headers,"CONTENT-TYPE")&&_.isPlainObject(a)?(c.headers={"CONTENT-TYPE":"application/json;charset=UTF-8"},c.data=JSON.stringify(a)):c.data=a,c.req.open(c.method,c.url,!0),c.setHeaders(),c.req.addEventListener("error",e),c.req.addEventListener("readystatechange",function(){if(c.req.readyState===b.DONE)if(403===c.req.status)em.emit("logout");else if(_.includes([200,204],c.req.status))try{d(JSON.parse(c.req.response))}catch(a){d(c.req.responseText)}else try{e(JSON.parse(c.req.response))}catch(a){e(c.req.responseText)}}),c.req.send(c.data)}catch(f){e(f)}}):Promise.reject(new Error(["Request invalid argument","URL parameter is missing."]))},c.prototype.setHeaders=function(){for(var a in this.headers)_.has(this.headers,a)&&this.req.setRequestHeader(a,this.headers[a]);return this},Reflect.defineProperty(c.prototype,"response",{get:function(){if(!_.has([200,204],this.req.status))return null;try{return JSON.parse(this.req.response)}catch(a){return this.req.responseText}}}),Reflect.defineProperty(c.prototype,"error",{get:function(){return 200!==this.req.status&&204!==this.req.status&&this.req.responseText}}),a.req=c}(window,XMLHttpRequest);