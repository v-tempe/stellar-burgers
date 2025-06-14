import ingredientSlice, { getIngredients, initialState } from './ingredientSlice';

describe('Тестирование редьюсера ingredientSlice', () => {
  const mockIngredientsFull = [
    {
      _id: '1',
      name: 'Булочка',
      type: 'bun',
      price: 100
    },
    {
      _id: '2',
      name: 'Котлета',
      type: 'main',
      price: 200
    }
  ];

  const mockIngredientsSimple = ['ingr1', 'ingr2'];

  const testActions = {
    pending: {
      type: getIngredients.pending.type,
      payload: null
    },
    rejected: {
      type: getIngredients.rejected.type,
      error: { message: 'Ошибка загрузки ингредиентов' }
    },
    rejectedFunny: {
      type: getIngredients.rejected.type,
      error: { message: 'Funny mock-error' }
    },
    fulfilledFull: {
      type: getIngredients.fulfilled.type,
      payload: mockIngredientsFull
    },
    fulfilledSimple: {
      type: getIngredients.fulfilled.type,
      payload: mockIngredientsSimple
    },
    fulfilledEmpty: {
      type: getIngredients.fulfilled.type,
      payload: []
    }
  };

  describe('Обработка асинхронного экшена getIngredients', () => {
    it('должен устанавливать флаг загрузки и очищать ошибку при pending', () => {
      const newState = ingredientSlice(initialState, testActions.pending);
      expect(newState).toMatchObject({
        loading: true,
        error: null,
        ingredients: []
      });
    });

    it('должен сохранять сообщение об ошибке при rejected', () => {
      const newState = ingredientSlice(initialState, testActions.rejected);
      expect(newState).toEqual({
        ...initialState,
        loading: false,
        error: testActions.rejected.error.message
      });
    });

    it('должен корректно сохранять ошибку с другим сообщением при rejected', () => {
      const newState = ingredientSlice(initialState, testActions.rejectedFunny);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(testActions.rejectedFunny.error.message);
    });

    it('должен сохранять список ингредиентов при fulfilled с полным payload', () => {
      const newState = ingredientSlice(initialState, testActions.fulfilledFull);
      expect(newState).toEqual({
        ...initialState,
        loading: false,
        error: null,
        ingredients: mockIngredientsFull
      });
    });

    it('должен сохранять список ингредиентов при fulfilled с простым payload', () => {
      const newState = ingredientSlice(initialState, testActions.fulfilledSimple);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
      expect(newState.ingredients).toEqual(mockIngredientsSimple);
    });

    it('должен корректно обрабатывать пустой массив ингредиентов при fulfilled', () => {
      const newState = ingredientSlice(initialState, testActions.fulfilledEmpty);
      expect(newState.ingredients).toEqual([]);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBeNull();
    });
  });

  describe('Поведение редьюсера в особых случаях', () => {
    it('должен возвращать initialState при неизвестном экшене', () => {
      const newState = ingredientSlice(initialState, { type: 'UNKNOWN_ACTION' });
      expect(newState).toBe(initialState);
    });
  });
});

