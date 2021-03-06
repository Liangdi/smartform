/* 
 * 表单提交工具,基于jQuery
 * Author:	Liangdi
 * Email:	wu@liangdi.me
 */

function SmartForm(id,els,option){
	this.form = $("#" + id);
	this.option = option || {};
	this.option.els = els;
	this.els = [];
	this.url=option.url;
	this.action = option.action?option.action:"GET";
	this.pre = option.pre?option.pre:"";
	
	
	this.debug = option.debug?true:false;
	
	this.successCallbacks = [];
	this.failueCallbacks = [];
	this.completeCallbacks = [];
	this.validCallbacks = [];
	this.beforeCallbacks = [];
	
	for (var i = 0; i < els.length; i++) {
		var id = els[i];
		var elId = this.pre+els[i];
		var el = this.form.find("#"+elId);
		var elObj = {
			id:id,
			el:el,
			notNull:el.attr("data-not-null")?true:false
		};
		this.els.push(elObj);
	}
	
	if(this.debug){
		console.log("form",this.form);
		console.log("els",this.els);
	}
	var that = this;
	this.form.submit(function(){
		that.submit();
		return false;
	});
}

SmartForm.prototype.updateEl = function() {
	var els  = this.option.els;
	this.els = [];
	for (var i = 0; i < els.length; i++) {
		var id = els[i];
		var elId = this.pre+els[i];
		var el = this.form.find("#"+elId);
		var elObj = {
			id:id,
			el:el,
			notNull:el.attr("data-not-null")?true:false
		};
		this.els.push(elObj);
	}
};
SmartForm.prototype.setAction = function(action) {
	this.action = action;
};
SmartForm.prototype.setUrl = function(url){
	this.url = url;
};
SmartForm.prototype.submit = function(){
	var CKEDITOR= window.CKEDITOR || undefined;
	console.log(CKEDITOR);
	if((typeof CKEDITOR) !=="undefined" && (typeof CKEDITOR.instances ) !=="undefined"  ){
		 for ( instance in CKEDITOR.instances ){
				CKEDITOR.instances[instance].updateElement();
		 }
	}
	var data = {};
	for (var i = 0; i < this.els.length; i++) {
		var elObj = this.els[i];
		
		if(elObj.el.attr("data-ace")) {
			var aceSession = elObj.el.attr("data-ace");
			var code = window[aceSession].getSession().getValue();
			elObj.el.val(code);
		}
		
		var v = elObj.el.val();
		var notNull = elObj.notNull;
		if(this.debug){
			console.log("value:",elObj.id,elObj.el,notNull,v,v == null || v == "")	
		}
		if(notNull && (v == null || v == "")){
			for (var j = 0; j < this.validCallbacks.length; j++) {
				this.validCallbacks[j](elObj);
			}
			return false;
		}
		if(v instanceof Array){
			v=v.join();
		}
		data[elObj.id] = v;
	}
	if(this.debug){
		console.log("data:",data);
	}
	var url = this.url;
	var type = this.action;
	var successCallbacks = this.successCallbacks;
	var completeCallbacks = this.completeCallbacks;
	var beforeCallbacks = this.beforeCallbacks;
	for (i = 0; i < beforeCallbacks.length; i++) {
		beforeCallbacks[i](this);
	}
	$.ajax({
		url:url,
		type:type,
		data:data,
		success:function(data){
			for (var j = 0; j < successCallbacks.length; j++) {
				successCallbacks[j](data);
			}
		},
		complete:function(){
			for (var j = 0; j < completeCallbacks.length; j++) {
				completeCallbacks[j]();
			}
		}
	});
	
	return false;
};
SmartForm.prototype.update = function(value){
	for (var k in value) {
		//console.log(k,value[k]);
		var el = this.form.find("#" + this.pre + k);
		el.val(value[k]);
		if(el.attr("data-ace")) {
			var aceSession = el.attr("data-ace");
			 window[aceSession].getSession().setValue(value[k]);
		}
	}
};
SmartForm.prototype.onSuccess = function(callback){
	typeof callback === "function" && this.successCallbacks.push(callback);
};
SmartForm.prototype.onComplete = function(callback){
	typeof callback === "function" && this.completeCallbacks.push(callback);
};
SmartForm.prototype.onVerificationError = function(callback){
	typeof callback === "function" && this.validCallbacks.push(callback);
};
SmartForm.prototype.onSubmit = function(callback){
	typeof callback === "function" && this.beforeCallbacks.push(callback);
};


