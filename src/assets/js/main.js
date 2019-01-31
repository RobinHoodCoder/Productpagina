($(function() {
    console.log(this);

    var galleryThumbs = new Swiper('.gallery-thumbs', {
        spaceBetween: 14,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
    });
    var galleryTop = new Swiper('.gallery-top', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',

        },
        thumbs: {
            swiper: galleryThumbs
        }
    });



}));
console.log("new");
console.log("new");
