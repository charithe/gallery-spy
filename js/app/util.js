var gallerySpy = gallerySpy || {};
gallerySpy.classes = gallerySpy.classes || {};

gallerySpy.classes.Util = function(){
    function logMessage(msg){
        if(console){
            console.log(msg);
        }
    }
    
    function isUndefined(obj){
        return (obj === undefined) || (obj == null);
    }
    
    function isDefined(obj){
        return !((obj === undefined) || (obj == null))
    }
    
    return {
        "log":logMessage,
        "isDefined":isDefined,
        "isUndefined":isUndefined
    };
}();