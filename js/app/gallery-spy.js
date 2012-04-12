/** #################### Create the nested namespaces #################### **/
var gallerySpy = gallerySpy || {};
gallerySpy.models = gallerySpy.models || {};
gallerySpy.collections = gallerySpy.collections || {};
gallerySpy.views = gallerySpy.views || {};
gallerySpy.classes = gallerySpy.classes || {};


/** #################### Models #################### **/
gallerySpy.models.URLControls = Backbone.Model.extend({
    defaults: {
        parsedURL : null,
        controlHTML : null,
        urlComponents : null,
        imageRange : null
    },
    
    initialize: function(){
        var parsedURL = this.get("parsedURL");
        var numRanges = parsedURL.ranges.length;
        var imageRange = parsedURL.ranges[numRanges - 1];
        var urlComponents = new Array(numRanges - 1);
        var controlHTML = [];
        
        var url = parsedURL.tokenizedURL;
        var sliceIndex = 0;
        for(var i = 0; i < numRanges -1; i++){
            urlComponents[i] = parsedURL.ranges[i].from;
            
            var endIndex = url.indexOf(parsedURL.ranges[i].patternKey);
            controlHTML.push(url.slice(sliceIndex, endIndex));            
            controlHTML.push(parsedURL.ranges[i].from);
            sliceIndex = endIndex + parsedURL.ranges[i].patternKey.length;
        }
        
        controlHTML.push(url.slice(sliceIndex).replace(imageRange.patternKey,"[" + imageRange.from + "-" + imageRange.to + "]"));
        
        this.set({
           "imageRange": imageRange,
           "urlComponents" : urlComponents,
           "controlHTML": controlHTML
        });        
    },
    
    setURLComponentValue : function(index,value){
        var urlComponents = this.get("urlComponents");
        urlComponents[index] = value;
        this.set({"urlComponents" : urlComponents});
    },
    
    
    getGallery: function(){
        var parsedURL = this.get("parsedURL");
        var urlComponents = this.get("urlComponents");
        var imageRange = this.get("imageRange");
        
        var url = parsedURL.tokenizedURL;
        for(var i = 0; i < parsedURL.ranges.length - 1; i++){
            url = parsedURL.ranges[i].format(url,urlComponents[i]);
        }
        
        
        var gallery = new gallerySpy.collections.Gallery();
        for(var i = imageRange.from; i < imageRange.to; i++){            
            gallery.add(new gallerySpy.models.ThumbnailImage({"src":imageRange.format(url,i)}))
        }
        
        return gallery;        
    }
    
});


gallerySpy.models.ThumbnailImage = Backbone.Model.extend({
    defaults: {
        src: null,        
        loaded: false,
        thumbnailWidth: null,
        thumbnailHeight: null,
        width: 0,
        height: 0,
        image: null
    },       
    
    load: function(loadedCallback){        
        if(!this.get("loaded")){
            gallerySpy.classes.Util.log("Loading " + this.get("src"));            
            var imgEl = new Image();
            
            imgEl.onload = _.bind(this.imageLoadCallback,this,imgEl,loadedCallback);
            imgEl.onerror = _.bind(this.imageErrorCallback,this,loadedCallback);            
            imgEl.src = this.get("src");
        }        
    },
    
    imageLoadCallback: function(imgEl,loadedCallback){
        gallerySpy.classes.Util.log("Image dimensions: " + imgEl.width + "x" + imgEl.height);        
        this.set({"width": imgEl.width, "height": imgEl.height, "image": imgEl});
        var w = ($(".gallery-thumbnails").width() - 30) / 5;
        this.calculateThumbnailSize(w);
        this.set({"loaded": true});
        loadedCallback();
    },
    
    imageErrorCallback: function(loadedCallback){
        gallerySpy.classes.Util.log("Image not found"); 
        loadedCallback();
    },
    
    calculateThumbnailSize: function(defaultThumbWidth, defaultThumbHeight){        
        var isDefined = gallerySpy.classes.Util.isDefined;
        var isUndefined = gallerySpy.classes.Util.isUndefined;
        
        var height = this.get("height");
        var width = this.get("width");
        var thumbHeight = defaultThumbHeight;
        var thumbWidth = defaultThumbWidth;
        
        // if the dimensions are explicitly defined, use them
        if(isDefined(thumbHeight) && isDefined(thumbWidth)){
            this.set({ "thumbnailWidth":thumbWidth, "thumbnailHeight": thumbHeight});
            return;            
        }
        
        // if nothing is defined, use the actual image dimensions
        if(isUndefined(thumbHeight) && isUndefined(thumbWidth)){
            this.set({"thumbnailWidth": width, "thumbnailHeight": height });
            return;
        }
        
        // otherwise, scale the undefined dimension using the defined one        
        var ratio = width / height;
        if(isDefined(thumbHeight)){
            thumbWidth  = Math.ceil(thumbHeight / ratio);
        }
        else{
            thumbHeight = Math.ceil(thumbWidth / ratio);
        }
        
        this.set({ "thumbnailWidth":thumbWidth, "thumbnailHeight": thumbHeight});        
    }
});


/** #################### Collections #################### **/
gallerySpy.collections.Gallery = Backbone.Collection.extend({
    model: gallerySpy.models.ThumbnailImage    
});


/** #################### Views #################### **/
gallerySpy.views.URLBox = Backbone.View.extend({
    
   el: $('#url-input-box'),   
   
   initialize: function(){        
        this.render();
   },
   
   render: function(){
        var template = _.template($('#url-box-template').html(),{});
        this.$el.html(template);
   },
   
   events: {
        "click #go-button":"loadGallery"        
   },
   
   loadGallery: function(event){
        var url = $('#gallery-url').val();        
       
        var parsedURL = gallerySpy.classes.URLParser.parse(url);
        gallerySpy.classes.Util.log(parsedURL);
        var urlModel =  new gallerySpy.models.URLControls({"parsedURL": parsedURL});
        var controlView = new gallerySpy.views.URLControls({"model": urlModel});
        controlView.render();
                
        $(this.el).append(controlView.el);
      
   }
});


gallerySpy.views.URLControls = Backbone.View.extend({
    tagName: 'div',
    
    className: 'url-controls',
    
    events: {        
        "input .url-control-input": "spinboxClicked",
        "keypress .url-control-input": "keyPressed"
    },
    
    initialize: function(){
        var callback = _.bind(this.renderGallery, this);
        this.model.bind("change:urlComponents",callback);
    },
    
    render: function(){
        gallerySpy.classes.Util.log("Rendering URL controls");
        $("." + this.className).remove();
        var template = _.template($('#url-control-template').html(),{"controlHTML" : this.model.get("controlHTML")});
        this.$el.html(template);
        
        this.renderGallery();
    },
    
    spinboxClicked: function(event){
        event.stopPropagation();
        var index = parseInt($(event.currentTarget).attr("data-index"));
        var value = parseInt($(event.currentTarget).val());
        
        this.model.setURLComponentValue(index,value);        
        this.renderGallery();
    },
    
    keyPressed: function(event){
        event.stopPropagation();        
        var index = parseInt($(event.currentTarget).attr("data-index"));
        var value = parseInt($(event.currentTarget).val());
        
        switch(event.keyCode){
            case 13:
                this.model.setURLComponentValue(index,value);
                this.renderGallery();
                break;
            case 37:
            case 40:
                $(event.currentTarget).val(value-1);
                this.model.setURLComponentValue(index,value-1);
                this.renderGallery();
                break;
            case 38:
            case 39:
                $(event.currentTarget).val(value+1);
                this.model.setURLComponentValue(index,value+1);
                this.renderGallery();
                break;
        }        
    },    
    
    renderGallery: function(){
        var galleryView = new gallerySpy.views.Gallery({"collection": this.model.getGallery()});
        galleryView.render();
    }
});


gallerySpy.views.Gallery = Backbone.View.extend({
    el: $('#thumbnail-container'),
    
    progressDialog : null,
    
    paginator: null,
        
    initialize: function(){
        this.progressDialog = new gallerySpy.views.ProgressDialog();
        this.paginator = new gallerySpy.classes.Paginator(this.collection.size());
    },
    
    render: function(){
        gallerySpy.classes.Util.log("Rendering Gallery");        
        var template = _.template($('#gallery-template').html(),{});
        this.$el.html(template);
        
        var pageOptions = this.paginator.getAll();
        this.renderThumbs(pageOptions.start, pageOptions.end);        
    },
    
    renderThumbs: function(start,finish){
        gallerySpy.classes.Util.log("Rendering Thumbnails");
        this.progressDialog.show();
        
        var renderCallback = _.bind(this.renderCompleteCallback(finish-start),this);
        for(var i = start; i < finish; i++){
            var image = this.collection.at(i);
            var thumbView = new gallerySpy.views.ThumbnailImage({"model":image});
            thumbView.render();
            $('.gallery-thumbnails', this.el).append(thumbView.el);
            image.load(renderCallback);                                                
        }                    
    },  
    
    
    renderCompleteCallback: function(numThumbs){
        var totalNumberOfThumbs = numThumbs;
        var loadedThumbs = 0;
        return function(){
            loadedThumbs = loadedThumbs + 1;
            var percent = Math.ceil((loadedThumbs / totalNumberOfThumbs) * 100);            
            this.progressDialog.updateProgressBar(percent);
            if(loadedThumbs >= totalNumberOfThumbs){
                this.arrangeThumbnails();                
                this.progressDialog.hide();
            }
        };
    },
    
    arrangeThumbnails: function(){                
        $(".gallery-thumbnails").masonry({
            itemSelector:'.gallery-thumb',
            gutterWidth: 10,
            isFitWidth: true
        });                            
    }    
});


gallerySpy.views.ThumbnailImage = Backbone.View.extend({
    tagName: 'div',
    
    className: 'gallery-thumb',    
    
    initialize: function(){
        var callback = _.bind(this.displayImage,this);
        this.model.bind("change:loaded",callback);  
    },
    
    render: function(){
        gallerySpy.classes.Util.log("Rendering thumbnail image");
        var template = _.template($('#thumbnail-template').html(),{"src" : this.model.get("src")});
        $(this.el).html(template);
    },
    
    displayImage: function(){        
        if(this.model.get("loaded") == true){
            gallerySpy.classes.Util.log("Displaying thumbnail image" + this.model.get("thumbnailWidth") + "x" + this.model.get("thumbnailHeight"));        
            var imgEl = this.model.get("image");
              
            $(this.el).width(this.model.get("thumbnailWidth"));
            $(this.el).height(this.model.get("thumbnailHeight"));
            $(imgEl).width(this.model.get("thumbnailWidth"));
            $(imgEl).height(this.model.get("thumbnailHeight"));
            $("a", this.el).append($(imgEl));            
        }
    }
});


gallerySpy.views.ProgressDialog = Backbone.View.extend({
    el: $('#progress-container'),
    
    template: _.template($('#progress-dialog-template').html(),{}),
    
    progressDialog: '#progress-dialog',
    
    progressBar: '#progress-bar',
    
    initialize: function(){                
        this.render();            
    },
    
    render: function(){
        $(this.el).html(this.template);
    },
    
    resetProgressBar: function(){
        $(this.progressBar).width(0);
    },
    
    updateProgressBar: function(value){
        $(this.progressBar).width(value);
    },
    
    show: function(){
        this.resetProgressBar();
        $(this.progressDialog).modal('show');
    },
    
    hide: function(){
        $(this.progressDialog).modal('hide');
    }  
});


/** #################### Control Classes #################### **/

gallerySpy.classes.GallerySpy = function(){      
    function loadGallery(url){        
        var parsedURL = gallerySpy.classes.URLParser.parse(url);        
        return new gallerySpy.Models.URLControls({"parsedURL": parsedURL});
      
    }
    
    return {
        "loadGallery":loadGallery        
    };   
}();


gallerySpy.classes.Paginator = function(sizeOfCollection,pageSizeParam){
    
    var numElements = sizeOfCollection;
    var pageSize = pageSizeParam || Math.min(25,numElements);
    var totalPages = Math.ceil(numElements / pageSize);
    var numPagesRendered = 0;
        
    function getNext(){
        var newPage = numPagesRendered + 1;
        if(newPage <= totalPages){
            var startIndex = pageSize * (newPage - 1);
            var endIndex = pageSize * newPage;
            numPagesRendered++;
            return {"start": startIndex, "end": endIndex};
        }
        else{
            return {"start": numElements, "end": numElements};
        }
    }
    
    function getAll(){
        return {"start": 0, "end": numElements};
    }
    
    function renderedPercentage(){
        return (numPagesRendered / totalPages) * 100;
    }    
    
    function hasNoMore(){
        return numPagesRendered >= totalPages;
    }
    
    return {
        "getNext": getNext,
        "getAll": getAll,
        "renderedPercentage": renderedPercentage,
        "hasNoMore": hasNoMore
    };    
};


/** #################### Entry point #################### **/
$(function(){    
    var urlBoxView = new gallerySpy.views.URLBox();    
});

