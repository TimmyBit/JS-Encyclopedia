// Init variables
const sideMenuBtn = document.querySelector('#menu');
const introBox = document.querySelector('#intro-box');

// Fetch from JSON
const fetchJSON = async (path) => {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.log('Error fetching JSON:', err);
        return null;
    }
};

// Recursive function to find a card by title, no matter how deep it's nested
const findCardRecursive = (cards, title, depth = 0) => {
    if (depth > 10) return null; // prevent runaway recursion
    for (const card of cards) {
        if (card.title === title) return card;
        if (Array.isArray(card.content)) {
            const found = findCardRecursive(card.content, title, depth + 1);
            if (found) return found;
        }
    }
    return null;
};

// Display categories
const displayCategories = async () => {
    const data = await fetchJSON('./data.json');
    const sideMenuList = document.querySelector('#side-menu ul');
    if (!data) return;

    data.categories.forEach((category) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.innerHTML = `<i class="fa-solid ${category.icon}"></i> ${category.name}`;
        button.id = category.id;
        button.addEventListener('click', () => displayCategoryContent(button));
        li.appendChild(button);
        sideMenuList.appendChild(li);
    });
};

// Display category content
const displayCategoryContent = async (button) => {
    const categoryCards = document.querySelector('.cards');
    categoryCards.innerHTML = '';

    const menuButtons = document.querySelectorAll('#side-menu button');
    menuButtons.forEach((button) => button.classList.remove('active'));
    button.classList.add('active');

    const data = await fetchJSON('./data.json');
    if (!data) return;

    const introText = document.querySelector('#intro-text');
    const id = button.id;
    const categoryData = data.categories.find((cat) => cat.id === id);

    introText.innerText = `${categoryData.description}`;
    introBox.innerHTML = `
        <i id="top-left" class="fa-solid ${categoryData.icon}"></i>
        <i id="bottom-left" class="fa-solid ${categoryData.icon}"></i>
        <i id="bottom-center" class="fa-solid ${categoryData.icon}"></i>
        <h2>${categoryData.name}</h2>
        <i id="top-right" class="fa-solid ${categoryData.icon}"></i>
        <i id="bottom-right" class="fa-solid ${categoryData.icon}"></i>
        <i id="top-center" class="fa-solid ${categoryData.icon}"></i>
    `;

    categoryData.cards.forEach((card) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.innerHTML = `
        <div class="card-icon">
            <div class="card-icon-group">
                <i class="fa-solid ${categoryData.icon}"></i>
                <i class="fa-solid ${card.nestIcon}"></i>
            </div>
            <img src="${categoryData.favorite}" alt="Fav">    
        </div>
        <h2>${card.title}</h2>
        <p>${card.description}</p>
        `;
        if (card.nestIcon) cardDiv.classList.add('has-nest');
        categoryCards.appendChild(cardDiv);
        document.querySelectorAll('.has-nest').forEach((nest) => {
            const title = nest.querySelector('h2').textContent;
            nest.addEventListener('click', () => displayNestedCards(title));
        });

        if (!cardDiv.classList.contains('has-nest')) {
            cardDiv.addEventListener('click', () =>
                displayCardContent(card.title)
            );
        }
    });
    displaySideMenu();
};

// Display card content
const displayCardContent = async (title) => {
    introBox.innerHTML = '';
    const data = await fetchJSON('./data.json');
    if (!data) return;

    // Search all categories recursively
    let cardData = null;
    for (const category of data.categories) {
        if (Array.isArray(category.cards)) {
            cardData = findCardRecursive(category.cards, title);
            if (cardData) break; // stop if found
        }
    }

    if (!cardData) {
        introBox.innerHTML = `<p>Card not found.</p>`;
        return;
    }

    introBox.innerHTML = `
        <h2>${cardData.title}</h2>
        <p>${cardData.description || ''}</p>
        ${cardData.syntax ? `<pre><code>${cardData.syntax}</code></pre>` : ''}
        ${cardData.example ? `<pre><code>${cardData.example}</code></pre>` : ''}
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Display nested cards
const displayNestedCards = async (title) => {
    introBox.innerHTML = '<h2></h2>';
    const data = await fetchJSON('./data.json');
    if (!data) return;

    let cardData = null;
    for (const category of data.categories) {
        if (Array.isArray(category.cards)) {
            cardData = findCardRecursive(category.cards, title);
            if (cardData) break;
        }
    }

    introBox.querySelector('h2').textContent = cardData.title;

    if (!cardData || !cardData.content) {
        console.log('No nested cards found for:', title);
        return;
    }

    const categoryCards = document.querySelector('.cards');
    categoryCards.innerHTML = '';

    // Loop through its nested content
    cardData.content.forEach((nestedCard) => {
        const nestedDiv = document.createElement('div');
        nestedDiv.classList.add('card');
        nestedDiv.innerHTML = `
            <div class="card-icon">
                <div class="card-icon-group">
                    <i class="fa-solid ${nestedCard.nestIcon || 'fa-code'}"></i>
                </div>
                <img src="${data.categories[0].favorite}" alt="Fav">
            </div>
            <h2>${nestedCard.title}</h2>
            <p>${nestedCard.description || ''}</p>
        `;

        if (nestedCard.content) nestedDiv.classList.add('has-nest');

        categoryCards.appendChild(nestedDiv);

        // If this card has nested content, allow drilling deeper
        if (nestedCard.content) {
            nestedDiv.addEventListener('click', () =>
                displayNestedCards(nestedCard.title)
            );
        } else {
            nestedDiv.addEventListener('click', () =>
                displayCardContent(nestedCard.title)
            );
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Display the side menu
const displaySideMenu = () => {
    const sideMenu = document.querySelector('#side-menu');
    sideMenu.classList.toggle('active');
};

// Event Listeners / Calling functions
sideMenuBtn.addEventListener('click', displaySideMenu);
displayCategories();
