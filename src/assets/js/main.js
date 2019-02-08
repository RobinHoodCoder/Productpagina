function loadJSON(callback) {
    console.log(this);

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", "./product-db.json", true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);

}

($(function() {
    // console.log(this);


    var galleryThumbs = new Swiper(".gallery-thumbs", {
        spaceBetween: 14,
        slidesPerView: 3,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
    });
    var galleryTop = new Swiper(".gallery-top", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        thumbs: {
            swiper: galleryThumbs
        }
    });

    // Gallery


    var $pswp = $(".pswp")[0];
    var image = [];

    $(".photoswipe-gallery").each( function() {
        var $pic     = $(this),
            getItems = function() {
                var items = [];
                $pic.find("a").each(function() {

                    var $href   = $(this).attr("href"),
                        $size   = $(this).data("size").split("x"),
                        $width  = $size[0],
                        $height = $size[1],

                        $caption = $(this).data("caption"),
                        $tagitems = $(this).data("tags");

                    var item = {
                        src : $href,
                        w   : $width,
                        h   : $height,
                        title: $caption,
                        tagitems: $tagitems
                    };

                    items.push(item);
                });
                return items;
            };
        var items = getItems();

        $.each(items, function(index, value) {


            image[index]     = new Image();
            image[index].src = value["src"];


        });

        $pic.on("click", "figure", function(event) {
            event.preventDefault();

            var $index = $( "figure" ).index( this );
            var options = {
                index: $index,
                bgOpacity: 0.9,
                showHideOpacity: false,
            };
            var lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
            lightBox.init();

        });
    });

    $('a').smoothScroll();



    // const pID = 1001;
    const dynamicElements = {
        name : $('.p-name'),
        price : $('.p-price'),
        special_price : $('.p-special_price'),
        status : $('.status')
    }
    // console.log(dynamicElements);


    dynamicElements.name.text();
    dynamicElements.price.text();
    dynamicElements.special_price.text();






    function jsonInit() {
        loadJSON(function(response) {
            // Parse JSON string into object
            const json = JSON.parse(response);

            // console.log(json);

            // console.log(response.1001);
            // console.log(actual_JSON);


            const products = Object.entries(json)[0][1];
            // console.log(products);

            for(let product in products){


                // console.log(products[product].name);
                var pname = products[product].name

                dynamicElements.name.text(pname);

            }



            $.each(products, function(key, value) {
                // console.log(key);
                if(value === dynamicElements.name){
                    // console.log(this);


                }
                // dynamicElements.name.text(value.name);




            });

        });

    }
    // jsonInit();
    // var matches = jsonData.filter(el => el.target.jsonData.name === str);
}));


