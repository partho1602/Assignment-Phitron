let selectedDrinks = [];

document.addEventListener("DOMContentLoaded", () => {
    loadDrinksByUrl("https://thecocktaildb.com/api/json/v1/1/search.php?f=a", true);
});

document.getElementById("search-btn").addEventListener("click", () => {
    const query = document.getElementById("search-input").value.trim();
    if (!query) return;

    let url;
    if (query.length === 1) {
        url = `https://thecocktaildb.com/api/json/v1/1/search.php?f=${query}`;
    } else {
        url = `https://thecocktaildb.com/api/json/v1/1/search.php?s=${query}`;
    }
    loadDrinksByUrl(url, false);
});

async function loadDrinksByUrl(url, isDefaultLoad) {
    try {
        const response = await fetch(url, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let drinks = data.drinks;

        if (!drinks) {
            displayNotFound();
            return;
        }

        if (isDefaultLoad) {
            drinks = drinks.slice(0, 10);
        }
        displayDrinks(drinks);
    } catch (err) {
        console.error("Error fetching data: ", err);
        displayNotFound();
    }
}

function displayDrinks(drinks) {
    const container = document.getElementById("drinks-container");
    container.innerHTML = "";

    drinks.forEach(drink => {
        const isAlreadyAdded = selectedDrinks.some(item => item.idDrink === drink.idDrink);
        
        let instructions = drink.strInstructions ? drink.strInstructions : "";
        if (instructions.length > 15) {
            instructions = instructions.substring(0, 15) + "...";
        }

        const cardHtml = `
            <div class="col-md-6 col-xl-4">
                <div class="drink-card shadow-sm d-flex flex-column">
                    <img src="${drink.strDrinkThumb}" class="drink-img" alt="${drink.strDrink}">
                    <div class="card-body d-flex flex-column justify-content-between p-3">
                        <div>
                            <h6 class="fw-bold mb-2">Name: ${drink.strDrink}</h6>
                            <p class="text-muted">Category: ${drink.strCategory || 'N/A'}</p>
                            <p class="text-secondary">Instructions: ${instructions}</p>
                        </div>
                        <div class="d-flex gap-2 mt-2">
                            <button class="btn ${isAlreadyAdded ? 'btn-secondary' : 'btn-select'} btn-sm flex-fill" 
                                id="add-btn-${drink.idDrink}" 
                                ${isAlreadyAdded ? 'disabled' : ''} 
                                onclick="addToCart('${drink.idDrink}', '${escapeHtml(drink.strDrink)}', '${drink.strDrinkThumb}')">
                                ${isAlreadyAdded ? 'Already Selected' : 'Add to cart'}
                            </button>
                            <button class="btn btn-details btn-sm" onclick="showDrinkDetails('${drink.idDrink}')">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

function displayNotFound() {
    const container = document.getElementById("drinks-container");
    container.innerHTML = `
        <div class="col-12 text-center my-5">
            <h3 class="text-danger fw-bold">No drinks found matching your search.</h3>
            <p class="text-muted">Try searching another term or letter!</p>
        </div>
    `;
}

function addToCart(id, name, img) {
    if (selectedDrinks.length >= 7) {
        alert("Warning: You cannot add more than 7 drinks to your cart!");
        return;
    }

    selectedDrinks.push({ idDrink: id, strDrink: name, strDrinkThumb: img });
    
    const btn = document.getElementById(`add-btn-${id}`);
    if (btn) {
        btn.innerText = "Already Selected";
        btn.classList.remove("btn-select");
        btn.classList.add("btn-secondary");
        btn.disabled = true;
    }

    updateCartTable();
}

function updateCartTable() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    
    cartItemsContainer.innerHTML = "";
    cartCount.innerText = selectedDrinks.length;

    selectedDrinks.forEach((drink, index) => {
        const row = `
            <tr class="border-bottom">
                <td class="fw-bold">${index + 1}</td>
                <td><img src="${drink.strDrinkThumb}" class="cart-thumb" alt=""></td>
                <td class="text-secondary">${drink.strDrink}</td>
            </tr>
        `;
        cartItemsContainer.innerHTML += row;
    });
}

async function showDrinkDetails(id) {
    const url = `https://thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`;
    try {
        const response = await fetch(url, { cache: "no-cache" });
        const data = await response.json();
        const drink = data.drinks[0];
        
        document.getElementById("modal-drink-name").innerText = drink.strDrink;
        
        const modalBody = document.getElementById("modal-body-content");
        modalBody.innerHTML = `
            <img src="${drink.strDrinkThumb}" class="img-fluid rounded mb-3" style="max-height: 200px; object-fit: cover;">
            <div class="text-start">
                <p><strong>Category:</strong> ${drink.strCategory || 'N/A'}</p>
                <p><strong>Type:</strong> ${drink.strAlcoholic || 'N/A'}</p>
                <p><strong>Glass Type:</strong> ${drink.strGlass || 'N/A'}</p>
                <p><strong>Key Ingredient:</strong> ${drink.strIngredient1 || 'None'}</p>
                <p><strong>Detailed Instructions:</strong> ${drink.strInstructions || 'No instructions available.'}</p>
            </div>
        `;
        
        const myModal = new bootstrap.Modal(document.getElementById('drinkModal'));
        myModal.show();
    } catch (err) {
        console.error("Error loading details: ", err);
    }
}

function escapeHtml(text) {
    return text.replace(/'/g, "\\'");
}