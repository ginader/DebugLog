/**
 * DebugLog - nicer Javascript console logging
 *
 * code: http://github.com/ginader/DebugLog
 * please report issues at: http://github.com/ginader/DebugLog/issues
 *
 * Copyright (c) 2010 Dirk Ginader (ginader.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Version: 1.0
 *
 * Ideas:
 * * filter to only log calls of whitelisted classes and/or their specific methods for noise reduction
 * * 
 */

DebugLog = {
    on : false,
    usecookie : true,
    initialized : false,
    is : {},
    can : {},
    filter : [],
    conf : {},
    showNodeProperties : ['id','class','href','type','value'],
    
    init : function(){
        this.initialized = true;
        this.can.log = (window.console && window.console.log);
        if(!this.can.log){
            //alert('No console found. No logging possible. Sorry Dude');
            this.on = false;
            return;
        }
        this.is = {
            /* yeah I don't like browser sniffing either but 
               I have not found a way to detect consoles other 
               than Firebug and Opera Dragonfly - suggestions? */
            firebug     : !!(window.console.firebug),
            companionJS : !!(window.console.provider && window.console.provider == 'Companion.JS'),
            ie          : !!(navigator.appVersion.indexOf('MSIE ')!=-1),
            chrome      : !!(window.chrome),
            safari      : !!(navigator.vendor && navigator.vendor.indexOf('Apple')!=-1),
            opera       : !!(window.opera && window.opera.postError)
        }
        
        this.can.renderObjects = (this.is.firebug || this.is.chrome || this.is.safari);
        this.log(this.serialize(this.is));
    },
    
    log : function(o){
        if(!this.initialized){this.init();}
        if(!this.on){
            if(this.usecookie){
                this.conf = eval(this.readConf());
                if(!!this.conf){
                    this.on = true;
                }else{
                    return
                }
            }else{
                return;
            }
        }
        if(this.can.renderObjects){
            console.log(o);
        }
        else if(this.is.opera){
            opera.postError(this.serialize(o));
        }
        else{
            console.log(this.serialize(o));
        }
    },
    
    enable : function(conf,persistant){
        this.on = !!conf;
        if(persistant){
            this.log('saving');
            this.log(conf);
            this.saveConf(conf);
        }
    },
    
    getNodeMarkup : function(o){
        // only showing whitelisted properties
        var output='domEl{<';
        output+=o.nodeName.toLowerCase();
        for(var i=0,l=this.showNodeProperties.length;i<l;i++){
            output+=this.getProperty(o,this.showNodeProperties[i]);
        }
        output+='>}';
        return output;
    },
    
    getProperty:function(o,prop){
        if(o[prop]){return ' '+prop+'="'+o[prop]+'"';}
        else{return ''; }
    },
    
    serialize : function(o){
        // alternative object rendering for consoles that cannot render complex objects
        // thanks to: http://blog.stchur.com/2007/04/06/serializing-objects-in-javascript/
       if(o && o.nodeName){
           return this.getNodeMarkup(o);
       }
       switch (typeof o){
          case 'number':
          case 'boolean':
          case 'function':
             return o;
             break;
          case 'string':
             return '\'' + o + '\'';
             break;
          case 'object':
             var str;
             if (o.constructor === Array || typeof o.callee !== 'undefined'){
                str = '[';
                var i, len = o.length;
                for (i = 0; i < len-1; i++) { str += this.serialize(o[i]) + ','; }
                str += this.serialize(o[i]) + ']';
             }
             else{
                str = '{';
                var key;
                for (key in o) { str += key + ':' + this.serialize(o[key]) + ','; }
                str = str.replace(/\,$/, '') + '}';
             }
             return str;
             break;
          default:
             return 'UNKNOWN';
             break;
       }
    },
    
    saveConf : function(conf) {
        document.cookie = "DebugLog="+this.serialize(conf)+"; path=/";
    },
    
    readConf : function() {
        var nameEQ = "DebugLog=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },
    
    deleteConf : function(name) {
        saveConf("");
    }
}
