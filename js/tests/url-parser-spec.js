describe ("URL Parser", function(){
    it("should parse a URL not containing a range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_1.jpg");
        expect(result.ranges.length).toBe(1);
        expect(parseInt(result.ranges[0].from)).toBe(0);
        expect(parseInt(result.ranges[0].to)).toBe(0);
    });
    
    
    it("should parse a URL containing a simple range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[1-10].jpg");
        expect(result.ranges.length).toBe(1);
        expect(parseInt(result.ranges[0].from)).toBe(1);
        expect(parseInt(result.ranges[0].to)).toBe(10);
    });
    
    
    it("should parse a URL containing an advanced range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[%02d(1-10)].jpg");
        expect(result.ranges.length).toBe(1);
        expect(parseInt(result.ranges[0].from)).toBe(1);
        expect(parseInt(result.ranges[0].to)).toBe(10);
    });
    
    
    it("should parse a URL containing square brackets without a range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[1].jpg");
        expect(result.ranges.length).toBe(1);
        expect(parseInt(result.ranges[0].from)).toBe(0);
        expect(parseInt(result.ranges[0].to)).toBe(0);
    });
    
    
    it("should parse a URL containing two simple ranges", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img[0-10]/img_[1-10].jpg");
        expect(result.ranges.length).toBe(2);
        expect(parseInt(result.ranges[0].from)).toBe(0);
        expect(parseInt(result.ranges[0].to)).toBe(10);
        expect(parseInt(result.ranges[1].from)).toBe(1);
        expect(parseInt(result.ranges[1].to)).toBe(10);
    });
    
    
    it("should parse a URL containing two mixed ranges", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img[%02d(0-10)]/img_[1-20].jpg");
        expect(result.ranges.length).toBe(2);
        expect(parseInt(result.ranges[0].from)).toBe(0);
        expect(parseInt(result.ranges[0].to)).toBe(10);
        expect(parseInt(result.ranges[1].from)).toBe(1);
        expect(parseInt(result.ranges[1].to)).toBe(20);
    });
    
    
    it("should parse a URL containing multiple ranges", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img[%02d(0-10)]/test_[5-50]/img_[1-20].jpg");
        expect(result.ranges.length).toBe(3);
        expect(parseInt(result.ranges[0].from)).toBe(0);
        expect(parseInt(result.ranges[0].to)).toBe(10);
        expect(parseInt(result.ranges[1].from)).toBe(5);
        expect(parseInt(result.ranges[1].to)).toBe(50);
        expect(parseInt(result.ranges[2].from)).toBe(1);
        expect(parseInt(result.ranges[2].to)).toBe(20);
    });
    
    
    it("should return an identity function for a URL without a range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_1.jpg");
        expect(result.ranges[0].format(result.tokenizedURL,5)).toBe("example.com/img/img_1.jpg");        
    });
    
    
    it("should return a working format function for a simple range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[1-10].jpg");
        expect(result.ranges[0].format(result.tokenizedURL,5)).toBe("example.com/img/img_5.jpg");        
    });
    
    
    it("should return a working format function for an advanced range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[%03d(1-10)].jpg");
        expect(result.ranges[0].format(result.tokenizedURL,5)).toBe("example.com/img/img_005.jpg");        
    });
    
    
    it("should format only the associated range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img[0-20]/img_[%03d(1-10)].jpg");
        expect(result.ranges[0].format(result.tokenizedURL,5)).toBe("example.com/img5/img_$1$.jpg");
        expect(result.ranges[1].format(result.tokenizedURL,5)).toBe("example.com/img$0$/img_005.jpg");  
    });
    
});