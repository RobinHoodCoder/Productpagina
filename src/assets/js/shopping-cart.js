// 'use strict';

$(function () {
    const get = function (selector, scope) {
        scope = scope ? scope : document;
        return scope.querySelector(selector);
    };

    const getAll = function (selector, scope) {
        scope = scope ? scope : document;
        return scope.querySelectorAll(selector);
    };

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

    //Smooth naarboven scrollen als je een product toevoegd in je winkelwagen
    function scrollToTop(){
        $("html, body").animate({ scrollTop: 0 }, "slow");
    }


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

    openCartBtnDOM.addEventListener('click',function(){
       if (!cartItemsAmountDOM.innerText){
           hideOrShowPopup(popupClasses);
       }else{
           showMessage('Nog een items in winkelwagen');
       }
    });

    // Laat popup zien van winkelwagentje als je op de "clickToTogglePopupClasses" classes klikt.
    clickToTogglePopupClasses.forEach(toggleItem => {
            toggleItem.addEventListener("click", () => {
                hideOrShowPopup(popupClasses);
            }, false);
    });

    //For each add to cart button
    addToCartButtonsDOM.forEach(addToCartButtonDOM => {

        //If add to cart button is clicked
        addToCartButtonDOM.addEventListener('click', () => {
            hideOrShowPopup(popupClasses);
            scrollToTop();

            const productDOM = addToCartButtonDOM.closest('.product__container');
            const product = {
                image: productDOM.querySelector('.product__main-thumb').getAttribute('src'),
                name: productDOM.querySelector('.product__name').innerText,
                price: productDOM.querySelector('.product__price-special').getAttribute('data-price'),
                quantity: 1
            };

            const isInCart = (cart.filter(cartItem => (cartItem.name === product.name)).length > 0);


            if (!isInCart) {
                insertItemToDOM(product);
                cart.push(product);
                saveCart();
                handleActionButtons(addToCartButtonDOM, product);
            }

        });

    });

    function hideOrShowPopup (popupClasses){
        popupClasses.forEach(removableItem => {
            removableItem.classList.toggle('visible');
        });
    }
    function showMessage (message, appendAfter){
        let injecthtml = '<span class="no-items-added">'+message+'</span>';
        appendAfter.insertAdjacentHTML('afterend', injecthtml);
    };



    function insertItemToDOM(product) {
        cartDOM.insertAdjacentHTML('beforeend', `        
            <div class="cart__item">
              <img class="cart__item__image" src="${product.image}" alt="${product.name}">
              <div class="cart__item__left">
                <h3 class="cart__item__name">${product.name}</h3>
                <div class="control-buttons">	                
	                <button class="cart__item__decrease btn-mini ${(product.quantity === 1 ? ' decrease-last' : '')}" data-action="DECREASE_ITEM">&minus;</button>
	                <span class="cart__item__quantity ">${product.quantity}</span>
	                <button class="cart__item__increase btn-mini" data-action="INCREASE_ITEM">&plus;</button>             
				</div>
              </div>
              <div class="cleared"></div>
              <div class="cart__item__right">
               	<span class="cart__item__price btn-mini">${product.price}</span>  
              	<button class="cart__item__delete btn-mini" data-action="REMOVE_ITEM">&times;</button>                              
			  </div>         
            </div>       
        `);
        addCartFooter();
    }

    function handleActionButtons(addToCartButtonDOM, product) {
        addToCartButtonDOM.innerText = 'Toegevoegd';
        addToCartButtonDOM.classList.add('added-to-cart');
        addToCartButtonDOM.disabled = false;

        const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
        cartItemsDOM.forEach(cartItemDOM => {
            // cartItemDOM.querySelector('[data-action="CLOSE_POPUP"]');
            if (cartItemDOM.querySelector('.cart__item__name').innerText === product.name) {
                    cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => increaseItem(product, cartItemDOM));
                    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => decreaseItem(product, cartItemDOM, addToCartButtonDOM));
                    cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => removeItem(product, cartItemDOM, addToCartButtonDOM));
            }
        });
    }
    function increaseItem(product, cartItemDOM) {
        cart.forEach(cartItem => {
            if (cartItem.name === product.name) {
                cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
                cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('decrease-last');
                saveCart();
            }
        });
    }

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

    /*
    * Verwijder item uit winkelwagen
    * */
    function removeItem(product, cartItemDOM, addToCartButtonDOM) {

        cartItemDOM.classList.add('cart__item--removed');
        setTimeout(() => cartItemDOM.remove(), 250);
        cart = cart.filter(cartItem => cartItem.name !== product.name);
        saveCart();
        addToCartButtonDOM.innerText = 'In mijn winkelwagentje';
        addToCartButtonDOM.disabled = false;

        // If nothing in shopping cart after item remove, hide the shopping cart popup
        if (cart.length < 1) {
            document.querySelector('.cart-footer').remove();

            setTimeout(function(){
                hideOrShowPopup(popupClasses);
                cartItemsAmountDOM.parentNode.classList.remove('contains-items');
                cartItemsAmountDOM.innerText = ``;
                addToCartButtonDOM.classList.remove('added-to-cart');
            },200);

        }
    }

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

    /*
   * TODO: andere classes verwijderen
   * */
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
                cartItemsAmountDOM.innerText = ``;
                cartItemsAmountDOM.parentNode.classList.remove('contains-items');
            },200);
        });
    }

    // Paypal checkout
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

});

