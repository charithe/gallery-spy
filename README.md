# Gallery Spy : Fetch sequentially numbered image galleries from the net #

Gallery Spy is a simple Javascript application that can fetch and render sequentially numbered image files from a URL. This is purely a toy project that was created in order to learn the Backbone.js library. If you are looking for a feature rich gallery viewer, this is probably not the best fit although it does work quite nicely for most use cases.

## Usage ##

Assume there are 10 images you wish to fetch where each image is numbered sequentially such as img1.jpg, img2.jpg and so on. If the URL of the first image is www.example.com/gal001/img1.jpg, you can instruct GallerySpy to fetch all 10 images by entering the following URL into the text box:

> www.example.com/gal001/img[1-10].jpg


Now assume that in addition to the image names, another portion of the URL can be altered to get access to a different gallery. In this example it would be by changing gal001 to gal002. GallerySpy can handle this situation as well.

> www.example.com/gal[%03d(1-20)]/img[1-10]/jpg

In the above example, standard C string format specifiers are used to format a number such as '2' in to the required format of '002'. Refer to [printf documentation](http://www.cplusplus.com/reference/clibrary/cstdio/printf/) for more information.

For every range defined in the URL except the last, GallerySpy will render a text box which allows you to easily change the value. Pressing the Up or Right arrow keys will increment the value by one and render the new gallery. Down or Left arrow will decrement the value.


## Libraries Used ##

* [Backbone](http://documentcloud.github.com/backbone/)
* [Underscore](http://documentcloud.github.com/underscore/)
* [jQuery](http://jquery.com/)
* [jQuery Masonry](http://masonry.desandro.com/)
* [Jasmine](https://jasmine.github.io/)
* [RequireJS](http://requirejs.org/)
* [Bootstrap](http://twitter.github.com/bootstrap/)

## Licence ##

Copyright 2012 - Charith Ellawala
Released under the [Apache 2.0 licence](http://www.apache.org/licenses/LICENSE-2.0.html)

