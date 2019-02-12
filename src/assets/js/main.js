($(function() {

    //Slider voor thumbnails
    const galleryThumbs = new Swiper(".gallery-thumbs", {
        spaceBetween: 14,
        slidesPerView: 3,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
    });
    const galleryTop = new Swiper(".gallery-top", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        thumbs: {
            swiper: galleryThumbs
        }
    });

    // Photo Gallery
    const $pswp = $(".pswp")[0];
    const image = [];


    $(".photoswipe-gallery").each( function() {
        var $pic     = $(this),
            getItems = function() {
                let items = [];
                $pic.find("a").each(function() {

                    let $href   = $(this).attr("href"),
                        $size   = $(this).data("size").split("x"),
                        $width  = $size[0],
                        $height = $size[1],

                        $caption = $(this).data("caption"),
                        $tagitems = $(this).data("tags");

                    let item = {
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
        let items = getItems();

        $.each(items, function(index, value) {
            image[index]     = new Image();
            image[index].src = value["src"];
        });

        $pic.on("click", "figure", function(event) {
            event.preventDefault();

            let $index = $( "figure" ).index( this );
            let options = {
                index: $index,
                bgOpacity: 0.9,
                showHideOpacity: false,
            };
            let lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
            lightBox.init();

        });
    });

    // Smooth scroll plugin
    $('a').smoothScroll();

}));


