// 'use strict';

$(function () {

	$('.overlay').on('click',function () {
		$(this).toggleClass('visible');
		$('.shopping-cart-container').toggleClass('visible');
	});
	$('.purchase-button').on('click',(function () {
		$('.overlay').addClass('visible');
		const shoppingCartDOM = $(this).closest('.product__container').next('.shopping-cart-container');
		shoppingCartDOM.addClass('visible');
	}));






    class addProduct {

        constructor(name) {
            this.product = name;
        }

        sayHi() {
            alert(this.product);

        }

    }
    // $('button').on('click',(function () {
    //     let currProduct = document.getElementById('product-container');
    //     let productID = $(currProduct).attr('data-product');
	//
    //     // console.log(productID);
    //     let product = new addProduct("John");
    //     // product.sayHi();
    // }));



// Is there a cart in local storage? Set variable if not.
    let cart = (JSON.parse(localStorage.getItem('cart')) || []);

    const cartDOM = document.querySelector('.cart-items');
    const addToCartButtonsDOM = document.querySelectorAll('[data-action="ADD_PRODUCT_TO_CART"]');

	const popupClasses = document.querySelectorAll('.overlay, .shopping-cart-container');

	function hideOrShowPopup (popupClasses){
		popupClasses.forEach(removableItem => {
			removableItem.classList.add('visible');
		});
	}

    console.log(cart,cartDOM,addToCartButtonsDOM)

    if (cart.length > 0) {
        cart.forEach(cartItem => {
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

    addToCartButtonsDOM.forEach(addToCartButtonDOM => {
        addToCartButtonDOM.addEventListener('click', () => {
            // popupState(cartDOM,'visible');
	        popupClasses.forEach(removableItem => {
		        removableItem.classList.add('visible');
	        });


            const productDOM = addToCartButtonDOM.closest('.product__container');
            // console.log(productDOM);

            const product = {
                image: productDOM.querySelector('.product__main-thumb').getAttribute('src'),
                name: productDOM.querySelector('.product__name').innerText,
                price: productDOM.querySelector('.product__price-special').getAttribute('data-price'),
                quantity: 1,
            };
            // console.log(product.price);

            const isInCart = (cart.filter(cartItem => (cartItem.name === product.name)).length > 0);

            if (!isInCart) {
                insertItemToDOM(product);
                cart.push(product);
                saveCart();
                handleActionButtons(addToCartButtonDOM, product);
            }
        });
    });

    function insertItemToDOM(product) {
        cartDOM.insertAdjacentHTML('beforeend', `        
            <div class="cart__item">
              <img class="cart__item__image" src="${product.image}" alt="${product.name}">
              <div class="cart__item__left">
                <h3 class="cart__item__name">${product.name}</h3>
                <div class="control-buttons">	                
	                <button class="cart__item__decrease mini-btn ${(product.quantity === 1 ? ' decrease-last' : '')}" data-action="DECREASE_ITEM">&minus;</button>
	                <span class="cart__item__quantity ">${product.quantity}</span>
	                <button class="cart__item__increase mini-btn" data-action="INCREASE_ITEM">&plus;</button>             
				</div>
              </div>
              <div class="cleared"></div>
              <div class="cart__item__right">
               	<span class="cart__item__price mini-btn">${product.price}</span>  
              	<button class="cart__item__delete mini-btn" data-action="REMOVE_ITEM">&times;</button>                              
			  </div>         
            </div>
       
        `);
        addCartFooter();
    }

    function handleActionButtons(addToCartButtonDOM, product) {
        addToCartButtonDOM.innerText = 'Toegevoegd aan winkelwagen';
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

	// document.querySelector('[data-action="CLOSE_POPUP"]').addEventListener('click', () => hideOrShowPopup(popupClasses)); /*TODO*/



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

                if (cartItem.quantity === 1) {
                    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.add('decrease-last');
                }
            }
        });
    }

    function removeItem(product, cartItemDOM, addToCartButtonDOM) {
        cartItemDOM.classList.add('cart__item--removed');
        setTimeout(() => cartItemDOM.remove(), 250);
        cart = cart.filter(cartItem => cartItem.name !== product.name);
        saveCart();
        addToCartButtonDOM.innerText = 'Toevoegen aan winkelwagen';
        addToCartButtonDOM.disabled = false;

        if (cart.length < 1) {
            document.querySelector('.cart-footer').remove();
        }
    }

    function addCartFooter() {
        if (document.querySelector('.cart-footer') === null) {
            cartDOM.insertAdjacentHTML('afterend', `
              <div class="cart-footer">
                <button class="btn button-clear-items" data-action="CLEAR_CART">Leegmaken</button>
                <div class="main-btns">
                    <button class="btn button-continue-shopping" data-action="CLOSE_POPUP">Verder winkelen</button>
                    <button class="btn button-to-checkout" data-action="CHECKOUT">Naar betalen</button>               
                </div>
               
              </div>
    `);

            document.querySelector('[data-action="CLEAR_CART"]').addEventListener('click', () => clearCart());
            // document.querySelector('[data-action="CLOSE_POPUP"]').addEventListener('click', () => popupState());/*TODO*/
            document.querySelector('[data-action="CHECKOUT"]').addEventListener('click', () => checkout());
        }
    }

    function clearCart() {
        cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
            cartItemDOM.classList.add('cart__item--removed');
            setTimeout(() => cartItemDOM.remove(), 250);
        });

        cart = [];
        localStorage.removeItem('cart');
        document.querySelector('.cart-footer').remove();

       
	    popupClasses.forEach(removableItem => {
		    removableItem.classList.remove('visible');
	    });

        addToCartButtonsDOM.forEach(addToCartButtonDOM => {
            addToCartButtonDOM.innerText = 'In mijn winkelwagentje';
            addToCartButtonDOM.disabled = false;
        });
    }



    function checkout() {
        let paypalFormHTML = `
        <form id="paypal-form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
          <input type="hidden" name="cmd" value="_cart">
          <input type="hidden" name="upload" value="1">
          <input type="hidden" name="business" value="">
        `;

        cart.forEach((cartItem, index) => {
            ++index;
            paypalFormHTML += `
              <input type="hidden" name="item_name_${index}" value="${cartItem.name}">
              <input type="hidden" name="amount_${index}" value="${cartItem.price}">
              <input type="hidden" name="quantity_${index}" value="${cartItem.quantity}">
            `;
        });
        paypalFormHTML += `
            <input type="submit" value="PayPal">
        </form>
    <!--<div class="overlay"></div>-->
  `;

        document.querySelector('body').insertAdjacentHTML('beforeend', paypalFormHTML);
        document.getElementById('paypal-form').submit();
    }

    function countCartTotal() {
        let cartTotal = 0;
        cart.forEach(cartItem => cartTotal += cartItem.quantity * cartItem.price);
        document.querySelector('[data-action="CHECKOUT"]').innerText = `Afrekenen € ${cartTotal}`;
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        countCartTotal();
    }

});

