import store, { rootReducer } from '../services/store';

test('проверка работы rootReducer', () => {
  const stateFromReducer = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
  
  // Проверяем, что состояние содержит необходимые срезы
  expect(stateFromReducer).toEqual(expect.objectContaining({
    user: expect.any(Object),
    ingredient: expect.any(Object),
    order: expect.any(Object),
    constructorBurger: expect.any(Object),
    feed: expect.any(Object)
  }));

  // И дополнительно убеждаемся, что состояние совпадает со стейтом из store
  expect(stateFromReducer).toEqual(store.getState());
});

