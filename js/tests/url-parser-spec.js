describe ("URL Parser", function(){
    it("should parse a URL not containing a range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_1.jpg");
        expect(parseInt(result.start)).toBe(0);
        expect(parseInt(result.end)).toBe(0);
    });
    
    
    it("should parse a URL containing a simple range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[1-10].jpg");
        expect(parseInt(result.start)).toBe(1);
        expect(parseInt(result.end)).toBe(10);
    });
    
    
    it("should parse a URL containing an advanced range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[%02d(1-10)].jpg");
        expect(parseInt(result.start)).toBe(1);
        expect(parseInt(result.end)).toBe(10);
    });
    
    
    it("should parse a URL containing square brackets without a range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[1].jpg");
        expect(parseInt(result.start)).toBe(0);
        expect(parseInt(result.end)).toBe(0);
    });
    
    
    it("should parse a URL containing two simple ranges", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img[0-10]/img_[1-10].jpg");
        expect(parseInt(result.start)).toBe(0);
        expect(parseInt(result.end)).toBe(10);
    });
    
    
    it("should return an identity function for a URL without a range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_1.jpg");
        expect(result.format(5)).toBe("example.com/img/img_1.jpg");        
    });
    
    
    it("should return a working format function for a simple range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[1-10].jpg");
        expect(result.format(5)).toBe("example.com/img/img_5.jpg");        
    });
    
    
    it("should return a working format function for an advanced range", function(){
        var result = gallerySpy.classes.URLParser.parse("example.com/img/img_[%03d(1-10)].jpg");
        expect(result.format(5)).toBe("example.com/img/img_005.jpg");        
    });
});