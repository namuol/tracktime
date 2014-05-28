/*! 
  jquery.event.drag - v 2.0.0 
  Copyright (c) 2010 Three Dub Media - http://threedubmedia.com
  Open Source MIT License - http://threedubmedia.com/code/license
 */;(function($){$.fn.drag=function(str,arg,opts){var type=typeof str=="string"?str:"",fn=$.isFunction(str)?str:$.isFunction(arg)?arg:null;if(type.indexOf("drag")!==0)
type="drag"+type;opts=(str==fn?arg:opts)||{};return fn?this.bind(type,opts,fn):this.trigger(type);};var $event=$.event,$special=$event.special,drag=$special.drag={defaults:{which:1,distance:0,not:':input',handle:null,relative:false,drop:true,click:false},datakey:"dragdata",livekey:"livedrag",add:function(obj){var data=$.data(this,drag.datakey),opts=obj.data||{};data.related+=1;if(!data.live&&obj.selector){data.live=true;$event.add(this,"draginit."+drag.livekey,drag.delegate);}
$.each(drag.defaults,function(key,def){if(opts[key]!==undefined)
data[key]=opts[key];});},remove:function(){$.data(this,drag.datakey).related-=1;},setup:function(){if($.data(this,drag.datakey))
return;var data=$.extend({related:0},drag.defaults);$.data(this,drag.datakey,data);$event.add(this,"mousedown",drag.init,data);if(this.attachEvent)
this.attachEvent("ondragstart",drag.dontstart);},teardown:function(){if($.data(this,drag.datakey).related)
return;$.removeData(this,drag.datakey);$event.remove(this,"mousedown",drag.init);$event.remove(this,"draginit",drag.delegate);drag.textselect(true);if(this.detachEvent)
this.detachEvent("ondragstart",drag.dontstart);},init:function(event){var dd=event.data,results;if(dd.which>0&&event.which!=dd.which)
return;if($(event.target).is(dd.not))
return;if(dd.handle&&!$(event.target).closest(dd.handle,event.currentTarget).length)
return;dd.propagates=1;dd.interactions=[drag.interaction(this,dd)];dd.target=event.target;dd.pageX=event.pageX;dd.pageY=event.pageY;dd.dragging=null;results=drag.hijack(event,"draginit",dd);if(!dd.propagates)
return;results=drag.flatten(results);if(results&&results.length){dd.interactions=[];$.each(results,function(){dd.interactions.push(drag.interaction(this,dd));});}
dd.propagates=dd.interactions.length;if(dd.drop!==false&&$special.drop)
$special.drop.handler(event,dd);drag.textselect(false);$event.add(document,"mousemove mouseup",drag.handler,dd);return false;},interaction:function(elem,dd){return{drag:elem,callback:new drag.callback(),droppable:[],offset:$(elem)[dd.relative?"position":"offset"]()||{top:0,left:0}};},handler:function(event){var dd=event.data;switch(event.type){case!dd.dragging&&'mousemove':if(Math.pow(event.pageX-dd.pageX,2)+Math.pow(event.pageY-dd.pageY,2)<Math.pow(dd.distance,2))
break;event.target=dd.target;drag.hijack(event,"dragstart",dd);if(dd.propagates)
dd.dragging=true;case'mousemove':if(dd.dragging){drag.hijack(event,"drag",dd);if(dd.propagates){if(dd.drop!==false&&$special.drop)
$special.drop.handler(event,dd);break;}
event.type="mouseup";}
case'mouseup':$event.remove(document,"mousemove mouseup",drag.handler);if(dd.dragging){if(dd.drop!==false&&$special.drop)
$special.drop.handler(event,dd);drag.hijack(event,"dragend",dd);}
drag.textselect(true);if(dd.click===false&&dd.dragging){jQuery.event.triggered=true;setTimeout(function(){jQuery.event.triggered=false;},20);dd.dragging=false;}
break;}},delegate:function(event){var elems=[],target,events=$.data(this,"events")||{};$.each(events.live||[],function(i,obj){if(obj.preType.indexOf("drag")!==0)
return;target=$(event.target).closest(obj.selector,event.currentTarget)[0];if(!target)
return;$event.add(target,obj.origType+'.'+drag.livekey,obj.origHandler,obj.data);if($.inArray(target,elems)<0)
elems.push(target);});if(!elems.length)
return false;return $(elems).bind("dragend."+drag.livekey,function(){$event.remove(this,"."+drag.livekey);});},hijack:function(event,type,dd,x,elem){if(!dd)
return;var orig={event:event.originalEvent,type:event.type},mode=type.indexOf("drop")?"drag":"drop",result,i=x||0,ia,$elems,callback,len=!isNaN(x)?x:dd.interactions.length;event.type=type;event.originalEvent=null;dd.results=[];do if(ia=dd.interactions[i]){if(type!=="dragend"&&ia.cancelled)
continue;callback=drag.properties(event,dd,ia);ia.results=[];$(elem||ia[mode]||dd.droppable).each(function(p,subject){callback.target=subject;result=subject?$event.handle.call(subject,event,callback):null;if(result===false){if(mode=="drag"){ia.cancelled=true;dd.propagates-=1;}
if(type=="drop"){ia[mode][p]=null;}}
else if(type=="dropinit")
ia.droppable.push(drag.element(result)||subject);if(type=="dragstart")
ia.proxy=$(drag.element(result)||ia.drag)[0];ia.results.push(result);delete event.result;if(type!=="dropinit")
return result;});dd.results[i]=drag.flatten(ia.results);if(type=="dropinit")
ia.droppable=drag.flatten(ia.droppable);if(type=="dragstart"&&!ia.cancelled)
callback.update();}
while(++i<len)
event.type=orig.type;event.originalEvent=orig.event;return drag.flatten(dd.results);},properties:function(event,dd,ia){var obj=ia.callback;obj.drag=ia.drag;obj.proxy=ia.proxy||ia.drag;obj.startX=dd.pageX;obj.startY=dd.pageY;obj.deltaX=event.pageX-dd.pageX;obj.deltaY=event.pageY-dd.pageY;obj.originalX=ia.offset.left;obj.originalY=ia.offset.top;obj.offsetX=event.pageX-(dd.pageX-obj.originalX);obj.offsetY=event.pageY-(dd.pageY-obj.originalY);obj.drop=drag.flatten((ia.drop||[]).slice());obj.available=drag.flatten((ia.droppable||[]).slice());return obj;},element:function(arg){if(arg&&(arg.jquery||arg.nodeType==1))
return arg;},flatten:function(arr){return $.map(arr,function(member){return member&&member.jquery?$.makeArray(member):member&&member.length?drag.flatten(member):member;});},textselect:function(bool){$(document)[bool?"unbind":"bind"]("selectstart",drag.dontstart).attr("unselectable",bool?"off":"on").css("MozUserSelect",bool?"":"none");},dontstart:function(){return false;},callback:function(){}};drag.callback.prototype={update:function(){if($special.drop&&this.available.length)
$.each(this.available,function(i){$special.drop.locate(this,i);});}};$special.draginit=$special.dragstart=$special.dragend=drag;})(jQuery);