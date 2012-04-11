var gallerySpy = gallerySpy || {};
gallerySpy.classes = gallerySpy.classes || {};

gallerySpy.classes.URLParser = function(){
    var simpleRangeRegEx = /\[(\d+)\-(\d+)\]/;
    var advancedRangeRegEx = /\[(\%.*)\((\d+)-(\d+)\)\]/;
    
    function parse(url){
        if(url.match(simpleRangeRegEx)){
            return parseSimple(url);
        }
        else if(url.match(advancedRangeRegEx)){
            return parseAdvanced(url);
        }
        else{
            return noPattern(url);
        }
    }
    
    function parseSimple(url){
        var matches = simpleRangeRegEx.exec(url)
        gallerySpy.classes.Util.log("Matches : " + matches);
        return {
            "start": matches[1],
            "end": matches[2],
            "format": function(num){
                var formattedValue = _.string.sprintf("%d",parseInt(num));
                return url.replace(simpleRangeRegEx,formattedValue);
            }
        };
    }
    
    function parseAdvanced(url){
        var matches = advancedRangeRegEx.exec(url);
        gallerySpy.classes.Util.log("Matches : " + matches);
        return {
            "start": matches[2],
            "end": matches[3],
            "format": function(num){
                gallerySpy.classes.Util.log("Format=" + matches[1] + ", Number=" + num);
                var formattedValue = _.string.sprintf(matches[1],parseInt(num));
                return url.replace(advancedRangeRegEx,formattedValue);
            }
        };        
    }
    
    function noPattern(url){
        return {
            "start": 0,
            "end": 0,
            "format" : function(num){
                return url;
            }
        };
    }
    
    return {
        "parse":parse
    };
}();