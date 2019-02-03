function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', './product-db.json', true); // Replace 'my_data' with the path to your file
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


    const pID = 1001;
    const dynamicElements = {
        name : $('.p-name'),
        price : $('.p-price'),
        special_price : $('.p-special_price'),
        status : $('.status')
    }
    console.log(dynamicElements);


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
            console.log(products);

            for(let product in products){


                console.log(products[product].name);
                var pname = products[product].name

                dynamicElements.name.text(pname);

            }




            $.each(products, function(key, value) {
                console.log(key);
                if(value === dynamicElements.name){
                    console.log(this);

                }
                // dynamicElements.name.text(value.name);


            });

        });
    }
    jsonInit();











    // var matches = jsonData.filter(el => el.target.jsonData.name === str);






}));




