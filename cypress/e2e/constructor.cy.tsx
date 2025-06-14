const PATHS = {
  mainPage: 'http://localhost:4000/',
  user: '/api/auth/user',
  ingredients: '/api/ingredients',
  orders: '/api/orders',
  profileSection: '/profile',
};

const SELECTORS = {
  nameField: 'input[name="name"]',
}

const NAMES = { 
  userName: 'User_test',
}

const UI = {
  accountBtn: 'Личный кабинет',
  burgerTitle: 'Соберите бургер',
  bunPrompt: 'Выберите булки',
  fillingPrompt: 'Выберите начинку',
  sausePrompt: 'Выберите соус',
  bunName: 'Флюоресцентная булка R2-D3',
  bunVariant: 'Краторная булка N-200i',
  fillingName: 'Биокотлета из марсианской Магнолии',
  sauseName: 'Соус фирменный Space Sauce',
  orderIdLabel: 'идентификатор заказа',
  orderBtn: 'Оформить заказ',
};


describe('Проверка аккаунта пользователя', () => {
  beforeEach(() => {
    cy.intercept('GET', PATHS.user, {
      statusCode: 200,
      body: {
        success: true,
        user: {
          email: 'mail@example.com',
          name: NAMES.userName,
        }
      }
    }).as('getUser');
  });

  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Переход в профиль после авторизации', () => {
    cy.loginByApi();
    cy.visit('/');
    cy.contains(UI.accountBtn).click();
    cy.wait('@getUser');
    cy.contains(NAMES.userName).click();
    cy.location('pathname').should('include', PATHS.profileSection);
    cy.get('form', { timeout: 10000 }).should('exist');
    cy.get(SELECTORS.nameField).should('have.value', NAMES.userName);
  });
});


describe('Тестирование конструктора бургеров', () => {
  beforeEach(() => {
    cy.fixture('ingredients.json').as('ingredientsData');
    cy.fixture('user.json').as('userData');

    cy.intercept('GET', PATHS.ingredients, { fixture: 'ingredients.json' }).as('getIngredients');
    cy.intercept('GET', PATHS.user, { fixture: 'user.json' }).as('getUser');

    cy.setCookie('accessToken', 'mockToken');
    cy.window().then(win => win.localStorage.setItem('refreshToken', 'mockToken'));

    cy.visit(PATHS.mainPage);
    cy.wait('@getIngredients');
    cy.contains(UI.burgerTitle, { timeout: 10000 }).should('be.visible');
  });

  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Отсутствие булки и начинки в начале', () => {
    cy.contains(UI.bunPrompt).should('exist');
    cy.contains(UI.fillingPrompt).should('exist');
  });

  it('Добавление начинки', () => {
    cy.contains('Начинки').scrollIntoView().click({ force: true });
    cy.contains(UI.fillingName).parent().find('button').click();
    cy.contains(UI.fillingName).should('exist');
  });
  
  it('Добавление соуса', () => {
    cy.contains('Соусы').scrollIntoView().click({ force: true });
    cy.contains(UI.sauseName).parent().find('button').click();
    cy.contains(UI.sauseName).should('exist');
  });

  it('Добавление булки', () => {
    cy.contains(UI.bunName).parent().find('button').click();
    cy.contains(UI.bunName, { timeout: 10000 }).should('exist');
  });
  
  describe('Добавление нескольких начинок', () => {
    it('После добавления булки', () => {
      cy.contains(UI.bunName).parent().find('button').click();
      cy.contains(UI.fillingName).parent().find('button').click();
      cy.contains(UI.sauseName).parent().find('button').click();
      cy.contains(UI.fillingName).parent().find('button').click();
      
      cy.contains(UI.bunName, { timeout: 10000 }).should('exist');
      cy.contains(UI.sauseName, { timeout: 10000 }).should('exist');
      cy.contains(UI.fillingName, { timeout: 10000 }).should('exist');
    });
    it('Перед добавлением булки', () => {
      cy.contains(UI.fillingName).parent().find('button').click();
      cy.contains(UI.sauseName).parent().find('button').click();
      cy.contains(UI.fillingName).parent().find('button').click();
      cy.contains(UI.bunName).parent().find('button').click();
      
      cy.contains(UI.bunName, { timeout: 10000 }).should('exist');
      cy.contains(UI.sauseName, { timeout: 10000 }).should('exist');
      cy.contains(UI.fillingName, { timeout: 10000 }).should('exist');
    });
  });

  describe('Замена булки', () => {
    it('При пустом списке начинок', () => {
      cy.contains(UI.bunName).parent().find('button').click();
      cy.contains(UI.bunVariant).parent().find('button').click();
      cy.contains(UI.bunVariant, { timeout: 10000 }).should('exist');
    });
    it('При непустом списке начинок', () => {
      cy.contains(UI.bunName).parent().find('button').click();
      cy.contains(UI.fillingName).parent().find('button').click();
      cy.contains(UI.sauseName).parent().find('button').click();
      cy.contains(UI.fillingName).parent().find('button').click();
      cy.contains(UI.bunVariant).parent().find('button').click();
      cy.contains(UI.bunVariant, { timeout: 10000 }).should('exist');
    });
  });
  
  it('Добавление ингредиентов в заказ и очистка конструктора', () => {
    cy.intercept('POST', PATHS.orders, {
      fixture: 'makeOrder.json',
      statusCode: 200
    }).as('placeOrder');

    cy.contains(UI.bunName).parent().find('button').click();
    cy.contains('Начинки').scrollIntoView();
    cy.contains(UI.fillingName).parent().find('button').click();
    cy.contains(UI.sauseName).parent().find('button').click();

    cy.contains(UI.orderBtn).should('not.be.disabled').click();
    cy.wait('@placeOrder', { timeout: 30000 }).its('response.statusCode').should('eq', 200);

    cy.contains(UI.orderIdLabel).should('be.visible');
    cy.get('body').type('{esc}');
    cy.contains(UI.bunPrompt).should('exist');
    cy.contains(UI.fillingPrompt).should('exist');
    cy.get('[class^="burger-constructor_ingredients"]').should('not.exist');
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    cy.contains(UI.bunVariant).click();
    cy.location('pathname').should('include', '/ingredients/');
    cy.contains(UI.bunVariant).should('exist');
    cy.contains('Детали ингредиента').should('exist');
    cy.contains('Калории, ккал').should('exist');
    cy.contains('420').should('exist');
    cy.contains('Белки, г').should('exist');
    cy.contains('80').should('exist');
    cy.get('body').type('{esc}');
    cy.location('href').should('eq', PATHS.mainPage);
  });

  it('Закрытие модального окна кликом на оверлей', () => {
    cy.contains(UI.bunVariant).click();
    cy.url().should('include', '/ingredients/');
    cy.contains('Детали ингредиента').should('exist');
    cy.contains(UI.bunVariant).should('exist');
    cy.go('back');
    cy.url().should('eq', PATHS.mainPage);
    cy.contains('Детали ингредиента').should('not.exist');
  });
});

