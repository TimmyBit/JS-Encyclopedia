// Init variables
const sideMenuBtn = document.querySelector('#menu');

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
    const introBox = document.querySelector('#intro-box');
    const id = button.id;
    const categoryData = data.categories.find((cat) => cat.id === id);

    introText.innerText = `${categoryData.description}`;
    introBox.innerHTML = `
        <i class="fa-solid ${categoryData.icon}"></i>
        <i class="fa-solid ${categoryData.icon}"></i>
        <i class="fa-solid ${categoryData.icon}"></i>
        <h2>${categoryData.name}</h2>
        <i class="fa-solid ${categoryData.icon}"></i>
        <i class="fa-solid ${categoryData.icon}"></i>
        <i class="fa-solid ${categoryData.icon}"></i>
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
        categoryCards.appendChild(cardDiv);
    });
};

// Display the side menu
const displaySideMenu = () => {
    const sideMenu = document.querySelector('#side-menu');
    sideMenu.classList.toggle('active');
};

// Event Listeners / Calling functions
sideMenuBtn.addEventListener('click', displaySideMenu);
displayCategories();
