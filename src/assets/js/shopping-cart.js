// 'use strict';

$(function () {

    // Check local storage of er al een winkelwagentje is en zet ze in een variable. Zo niet, dan een lege variable
    let cart = (JSON.parse(localStorage.getItem('cart')) || []);

    // Hier komen de items in die je in je winkelwagen stopt (DOM)
    const cartDOM = document.querySelector('.cart-items');

    //Buttons om producten in winkelwagen te zetten (kunnen er ook meerdere later met product overzicht pagina)
    const addToCartButtonsDOM = document.querySelectorAll('[data-action="ADD_PRODUCT_TO_CART"]');

    //Deze elementen worden zichtbaar als je je winkelwagentje opent (een achtergrond en een modal box)
	const popupClasses = document.querySelectorAll('.overlay, .shopping-cart-container');

	//Buttons en elementen die kunt klikken om de Shopping cart popup te laten zien of verdwijnen
    const clickToTogglePopupClasses = document.querySelectorAll('.overlay , .button-continue-shopping, .button-continue-shopping');

    const openCartBtnDOM = document.querySelector('.open-cart');

    //Element met indicator van hoeveelheid producten in je winkelwagentje (navbar)
    const cartItemsAmountDOM = document.querySelector('.cart-items-amount');




    /*======================================================================================
    ======================================================================================
    /* HELPER FUNCTIES*/
    /*=====================================================================================
    =======================================================================================*/
    //Smooth naarboven scrollen als je een product toevoegd in je winkelwagen
    function scrollToTop(){
        $("html, body").animate({ scrollTop: 0 }, "slow");
    }
    //Haal element weg met een animatie en verwijder ze daarna uit de DOM
    function smoothRemove(removeClass,animationClass,timeOut) {
        removeClass.classList.add(animationClass);
        setTimeout(function () {
            removeClass.remove();
        },timeOut);
    }

    //Haal meerdere elementen weg met een animatie. Kan ze eventueel ook verwijderen uit de DOM.
    function smoothRemoveOrHideAll(removeClasses,animationClass,timeOut,remove) {
        removeClasses.forEach((element => {
            element.classList.add(animationClass);
            setTimeout(function () {
                if(remove === false){
                    element.classList.remove(animationClass);
                    element.classList.remove('visible');
                }else{
                    element.remove();
                }
            },timeOut);
        }));
    }

    function hideOrShowPopup (popupClasses){
        popupClasses.forEach(element => {
            element.classList.toggle('visible');
        });
    }
    function showMessage (message, appendInside, ){
        let injectHTML = '<span class="no-items-added">'+message+'</span>';
        let conatainerDOM = document.querySelector(appendInside);

        if (conatainerDOM.children.length < 2){
            conatainerDOM.insertAdjacentHTML('beforeend', injectHTML);
        }
        smoothRemove(conatainerDOM.children[1],'move-in-and-out',3000);
    }
	// Verminder het toegevoegde aantal items van een product
    function decreaseItem(product, cartItemDOM, addToCartButtonDOM) {
        cart.forEach(cartItem => {
            if (cartItem.name === product.name) {
                if (cartItem.quantity > 1) {
                    cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
                    saveCart();
                } else {
                    removeItem(product, cartItemDOM, addToCartButtonDOM);
                }
                //Disable de knop om een item te verwijderen
                if (cartItem.quantity === 1) {
                    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.add('decrease-last');
                }
            }
        });
    }

    /*====================
    * Basisfuncties
    * ====================*/

    // Haal een item weg
    function increaseItem(product, cartItemDOM) {
        cart.forEach(cartItem => {
            if (cartItem.name === product.name) {
                cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
                cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('decrease-last');
                saveCart();
            }
        });
    }

    function removeItem(product, cartItemDOM, addToCartButtonDOM) {

        cartItemDOM.classList.add('cart__item--removed');
        setTimeout(() => cartItemDOM.remove(), 250);
        cart = cart.filter(cartItem => cartItem.name !== product.name);
        saveCart();
        addToCartButtonDOM.innerText = 'In mijn winkelwagentje';
        addToCartButtonDOM.disabled = false;

        // Als er niets meer in je winkelwagen zit, haal dan de popup weg
        if (cart.length < 1) {

            smoothRemove(document.querySelector('.cart-footer'),'move-out-to-top',100);
            setTimeout(function(){
                smoothRemoveOrHideAll(popupClasses,'move-out-to-top',100,false);
                // hideOrShowPopup(popupClasses);
                cartItemsAmountDOM.parentNode.classList.remove('contains-items');
                cartItemsAmountDOM.innerText = ``;
                addToCartButtonDOM.classList.remove('added-to-cart');
            },500);

        }
    }
    //Leeg het winkelwagentje
    function clearCart() {
        cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
            cartItemDOM.classList.add('cart__item--removed');
            setTimeout(() => cartItemDOM.remove(), 250);
            setTimeout(() => hideOrShowPopup(popupClasses),250);
        });

        cart = [];
        localStorage.removeItem('cart');
        document.querySelector('.cart-footer').remove();

        addToCartButtonsDOM.forEach(addToCartButtonDOM => {
            //Cart is empty. Reset add to cart button text.
            addToCartButtonDOM.innerText = 'In mijn winkelwagentje';
            addToCartButtonDOM.classList.remove('added-to-cart');
            addToCartButtonDOM.disabled = false;
            setTimeout(function () {
                //Haal het aantal weg in de badge met aantal producten bovenaan pagina
                cartItemsAmountDOM.innerText = ``;
                cartItemsAmountDOM.parentNode.classList.remove('contains-items');
            },200);
        });
    }
    /*=============================
    * Functies die HTML injecteren
    * ===========================*/

    //Voeg een footer toe aan de winkelwagen popup
    function addCartFooter() {
        if (document.querySelector('.cart-footer') === null) {
            cartDOM.insertAdjacentHTML('afterend', `
              <div class="cart-footer">
                <button class="btn-outline button-clear-items" data-action="CLEAR_CART">Leegmaken</button>
                <div class="order-progress-navigation">
                    <button class="btn-outline button-continue-shopping" data-action="CLOSE_POPUP">Verder winkelen</button>
                    <button class="button-to-checkout" data-action="CHECKOUT">Naar betalen</button>               
                </div>
               
              </div>
            `);
            document.querySelector('[data-action="CLOSE_POPUP"]').addEventListener('click',(function () {
                hideOrShowPopup(popupClasses);
            }));
            document.querySelector('[data-action="CLEAR_CART"]').addEventListener('click', () => clearCart());
            //document.querySelector('[data-action="CHECKOUT"]').addEventListener('click', () => checkout());
        }
    }

    //Voeg HTML van product toe aan het winkelwagentje
    function insertItemToDOM(product) {
        cartDOM.insertAdjacentHTML('beforeend', `        
            <div class="cart__item">
              <img class="cart__item__image" src="${product.image}" alt="${product.name}">
              <div class="cart__item__left">
                <h3 class="cart__item__name">${product.name}</h3>
                <div class="control-buttons">	                
	                <button class="cart__item__decrease btn-mini ${(product.quantity === 1 ? ' decrease-last' : '')}" data-action="DECREASE_ITEM">&minus;</button>
	                <span class="cart__item__quantity">${product.quantity}</span>
	                <button class="cart__item__increase" data-action="INCREASE_ITEM">&plus;</button>             
				</div>
              </div>
              <div class="cleared"></div>
              <div class="cart__item__right">
                <span class="cart__item__price-initial">${product.priceInitial}</span>
               	<span class="cart__item__price">${product.price}</span>                 	
              	<button class="cart__item__delete" data-action="REMOVE_ITEM">&times;</button>                              
			  </div>         
            </div>       
        `);
        addCartFooter();
    }


    /*=====================
    * Gecombineerde functies
    * =====================*/


    //Variable om totaal aantal producten te tellen in winkelwagentje
    let totalItems = 0;

    //Chck of er producten in de winkelwagen zitten. Zo ja, zet elk product één voor één de winkelwagen popup DOM.
    //Tel het aantal producten op en bereken de prijs.
    //Koppel de juiste buttons aan het juiste product
    if (cart.length > 0) {
        cart.forEach(cartItem => {

            totalItems =+ cartItem.quantity;

            const product = cartItem;
            insertItemToDOM(product);
            countCartTotal();

            addToCartButtonsDOM.forEach(addToCartButtonDOM => {
                const productDOM = addToCartButtonDOM.closest('.product__container');
                if (productDOM.querySelector('.product__name').innerText === product.name) {
                    handleActionButtons(addToCartButtonDOM, product);
                }
            });

        });
    }

    // Button om winkelwagen te openen
    openCartBtnDOM.addEventListener('click',function(){
        //console.log(cartItemsAmountDOM.innerText);

        // Als er geen innerText is zijn er geen items in het winkelwagentje. Laat een bericht zien die dit zegt
       if (!cartItemsAmountDOM.innerText){
           showMessage('Nog geen producten in winkelwagen','header',);
       }else{
           hideOrShowPopup(popupClasses);
       }
    });

    // Laat popup zien van winkelwagentje als je op de "clickToTogglePopupClasses" classes klikt.
    clickToTogglePopupClasses.forEach(toggleItem => {
            toggleItem.addEventListener("click", () => {
                hideOrShowPopup(popupClasses);
            }, false);
    });

    //Voeg het juiste product toe met de juiste knop
    addToCartButtonsDOM.forEach(addToCartButtonDOM => {

        addToCartButtonDOM.addEventListener('click', () => {
            hideOrShowPopup(popupClasses);
            scrollToTop();

            const productDOM = addToCartButtonDOM.closest('.product__container');
            const product = {
                image: productDOM.querySelector('.product__main-thumb').getAttribute('src'),
                name: productDOM.querySelector('.product__name').innerText,
                priceInitial: productDOM.querySelector('.product__price-initial').getAttribute('data-initial-price'),
                price: productDOM.querySelector('.product__price-special').getAttribute('data-price'),
                quantity: 1
            };

            // is product al in winkelwagen?
            const isInCart = (cart.filter(cartItem => (cartItem.name === product.name)).length > 0);

            // Niet in winkelwagen? Voeg toe aan DOM
            if (!isInCart) {
                insertItemToDOM(product);
                cart.push(product);
                saveCart();
                handleActionButtons(addToCartButtonDOM, product);
            }

        });

    });


    //Alle clicks van actie buttons in het winkelwagentje koppelen aan functies
    function handleActionButtons(addToCartButtonDOM, product) {
        addToCartButtonDOM.innerText = 'Toegevoegd';
        addToCartButtonDOM.classList.add('added-to-cart');
        addToCartButtonDOM.disabled = false;

        const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
        cartItemsDOM.forEach(cartItemDOM => {
            if (cartItemDOM.querySelector('.cart__item__name').innerText === product.name) {
                    cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => increaseItem(product, cartItemDOM));
                    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => decreaseItem(product, cartItemDOM, addToCartButtonDOM));
                    cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => removeItem(product, cartItemDOM, addToCartButtonDOM));
            }
        });
    }

    function countCartTotal() {
        let cartTotal = 0;
        let totalItems = 0;

        cart.forEach(cartItem => [cartTotal += cartItem.quantity * cartItem.price, totalItems += cartItem.quantity]);
        console.log(document.querySelector('.cart-items-amount'));
        document.querySelector('[data-action="CHECKOUT"]');


        document.querySelector('[data-action="CHECKOUT"]').innerText = `Afrekenen € ${cartTotal}`;
        setTimeout(function () {
            cartItemsAmountDOM.innerText = `${totalItems}`;
            cartItemsAmountDOM.parentNode.classList.add('contains-items');
        },200);

    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        countCartTotal();
    }


    // Paypal
    //   function checkout() {
    //       let paypalFormHTML = `
    //       <form id="paypal-form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
    //         <input type="hidden" name="cmd" value="_cart">
    //         <input type="hidden" name="upload" value="1">
    //         <input type="hidden" name="business" value="">
    //       `;
    //
    //       cart.forEach((cartItem, index) => {
    //           ++index;
    //           paypalFormHTML += `
    //             <input type="hidden" name="item_name_${index}" value="${cartItem.name}">
    //             <input type="hidden" name="amount_${index}" value="${cartItem.price}">
    //             <input type="hidden" name="quantity_${index}" value="${cartItem.quantity}">
    //           `;
    //       });
    //       paypalFormHTML += `
    //           <input type="submit" value="PayPal">
    //       </form>
    //   <!--<div class="overlay"></div>-->
    // `;
    //
    //       document.querySelector('body').insertAdjacentHTML('beforeend', paypalFormHTML);
    //       document.getElementById('paypal-form').submit();
    //   }
});

