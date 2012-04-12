var gallerySpy = gallerySpy || {};
gallerySpy.classes = gallerySpy.classes || {};

gallerySpy.classes.URLParser = function(){    
    var simpleRange = "\\[(\\d+)\\-(\\d+)\\]";
    var advancedRange = "\\[(\\%.*?)\\((\\d+)-(\\d+)\\)\\]";
    var fullExpressionStr = simpleRange + "|" + advancedRange;
    
    var fullRegEx = new RegExp(fullExpressionStr,"g");
    
    function parse(url){
        var tokenizedURL = url;
        var ranges = [];
        var index = 0;
        
        if(tokenizedURL.match(fullRegEx)){
            var r = null;
            while((r = fullRegEx.exec(tokenizedURL))){                
                var rangeObject = null;
                if(gallerySpy.classes.Util.isDefined(r[1])){
                    rangeObject = getSimpleRange(index,r);
                }
                else{
                    rangeObject = getAdvancedRange(index,r);
                }
                
                ranges.push(rangeObject);
                tokenizedURL = addPatternKeyToURL(tokenizedURL,rangeObject.patternKey,r);       
                index++;
                fullRegEx.compile(fullExpressionStr);
            }
        }
        else{
            ranges.push(getNoRange());
        }
        
        return {
            "tokenizedURL": tokenizedURL,
            "ranges": ranges,
            "rangeCount" : index
        };
    }
    
    function getSimpleRange(index,matches){
        var patternKey = "$" + index + "$";
        var from = matches[1];
        var to = matches[2];
        return {            
            "from": from,
            "to": to,
            "patternKey" : patternKey,
            "format": function(url,num){
                var formattedValue = _.string.sprintf("%d",parseInt(num));
                return url.replace(patternKey,formattedValue);
            }
        };
    }
    
    function getAdvancedRange(index,matches){
        var patternKey = "$" + index + "$";
        var formatStr = matches[3];
        var from = matches[4];
        var to = matches[5];
        return {
            "from": from,
            "to": to,
            "patternKey" : patternKey,
            "format": function(url,num){                
                var formattedValue = _.string.sprintf(formatStr,parseInt(num));
                return url.replace(patternKey,formattedValue);
            }
        };
    }
    
    function getNoRange(){
        return {
            "from" : 0,
            "to" : 0,
            "patternKey" : "",
            "format": function(url,num){
                return url;
            }
        };
    }
    
    function addPatternKeyToURL(url,patternKey,matches){
        var startIndex = matches.index;
        var endIndex = matches.index + matches[0].length;
        return url.slice(0,startIndex) + patternKey + url.slice(endIndex);
    }
    
    return {
        "parse":parse
    };
}();