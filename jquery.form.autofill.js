/**
 * 自动填充表单插件
 * @author winsonli
 * 用法：
 * 1.在需要填充值的任意html元素加上属性data-bind="xxx"，支持级联属性。如果日期字段需要格式化加data-bind-format="xxx"，比如data-bind-format="yyyy-MM-dd HH:mm" 用法和java日期格式化参数一样。
 * 2.在引入jquery的后面引入本文件
 * 3.调用语句 $.autofill(data)或$("...").autofill(data);
 * Date 2015-08-11
 * Version: 0.1
 */

(function($) {
	
//扩展内置对象Date的功能
Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,//month          
        "d+": this.getDate(),//day        
        "H+": this.getHours(),//hour      
        "m+": this.getMinutes(), //minute          
        "s+": this.getSeconds(),//second         
        "q+": Math.floor((this.getMonth() + 3) / 3),//quarter          
        "S": this.getMilliseconds() //millisecond   
    }
    if (/(y+)/.test(format)){
    	format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    } 
    for (var k in o){
    	if (new RegExp("(" + k + ")").test(format)){
    		format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    	} 
    } 
    return format;
}

	
function getTagName(element) {
        if (element) {
            return element.tagName.toLowerCase();
        }
        return null;
}

//Covert Nested Object To Plain Object
var preFixArray=[];
function covertToPlainObejct(source, dest, prefix) {	
        for (var property in source) {
            if ($.type(source[property]) != "object") {
                if (prefix) {
                    dest[prefix + property] = source[property];
                } else {
                    dest[property] = source[property];
                }
            } else {
                if (prefix) {
                    prefix = prefix + property + ".";
                    preFixArray.push(prefix);
                } else {
                    var prefix = property + ".";
                    preFixArray.push(prefix);
                }
                covertToPlainObejct(source[property], dest, prefix);
                if(prefix){
                	prefix=preFixArray[preFixArray.indexOf(prefix)-1];
                	preFixArray.push(prefix);
                }
            }
        }
}

function fillData(data,container){
	var plainObj={};
	covertToPlainObejct(data,plainObj);	
    $.each(plainObj,
    function(k, v) {
    	var selector=null;
    	if(container){
    		selector=container.find("[data-bind='" + k + "']");
    	}else{
    		selector = "[data-bind='" + k + "']";
    	}
        var elt = $(selector);
        var formatpattern=elt.data("bind-format");
        if(formatpattern){ //date format
        	v?v=new Date(v).format(formatpattern):v="";
         }
        if($.type(v)=="boolean") v=v.toString();
        if (elt.length == 1) {
            var element = elt[0];                 
            if (getTagName(element) == "input") {
                elt.val((elt.attr("type") == "checkbox") ? [v] : v);
            } else if (getTagName(element) == "img") {
            	if(v) elt.attr("src", v);                       
            } else if (getTagName(element) == "select" || getTagName(element) == "textarea") {
                elt.val(v);
            } else {
                elt.text(v || "");
            }
        } else if (elt.length > 1) {
            elt.each(function() {
                var element = $(this)[0];
                if (getTagName(element) == "input") { //handle multiple checkbox or radio                       
                    $(this).val(($(element).attr("type") == "radio") ? [v] : v);                                                        
                } else if (getTagName(element) == "img") {
                	if(v) $(this).attr("src", v);
                } else {
                    $(this).text(v);
                }
            });

        }
    });
}

    $.extend({
        autofill: function(data) {      	
        	fillData(data);       	
        }
    });
    
    $.fn.extend({     
    	autofill:function(data){
    		fillData(data,$(this));           
    	}     
   	});     
    
})(jQuery);
