import orderSlice, { initialState, getOrderByNumber } from './orderSlice';
import type { TOrder, TOrdersData } from '../../../utils/types';

describe('Редьюсер orderSlice', () => {
  const mockOrder: TOrder = {
    _id: '643d69a5c3f7b9001cfa093c',
    ingredients: ['60d3b41abdacab0026a733c6', '60d3b41abdacab0026a733c7'],
    status: 'done',
    name: 'Флюоресцентный бургер',
    createdAt: '2023-04-18T08:58:45.102Z',
    updatedAt: '2023-04-18T08:58:45.102Z',
    number: 12345
  };

  const partialOrder: TOrder = {
    _id: '123',
    number: 123,
    ingredients: [],
    status: 'pending',
    name: 'Тестовый бургер',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const testActions = {
    pending: {
      type: getOrderByNumber.pending.type,
      payload: null
    },
    rejected: {
      type: getOrderByNumber.rejected.type,
      error: { message: 'Ошибка получения заказа' }
    },
    rejectedFunny: {
      type: getOrderByNumber.rejected.type,
      error: { message: 'Funny mock-error' }
    },
    fulfilledWithOrder: {
      type: getOrderByNumber.fulfilled.type,
      payload: { orders: [mockOrder] }
    },
    fulfilledWithPartialOrder: {
      type: getOrderByNumber.fulfilled.type,
      payload: { orders: [partialOrder] }
    },
    fulfilledEmpty: {
      type: getOrderByNumber.fulfilled.type,
      payload: { orders: [] }
    },
    fulfilledWithSimpleOrder: {
      type: getOrderByNumber.fulfilled.type,
      payload: { orders: ['someOrder'] }
    }
  };

  describe('Обработка асинхронного экшена getOrderByNumber', () => {
    it('должен устанавливать флаг запроса и очищать ошибку при pending', () => {
      const state = orderSlice(initialState, testActions.pending);
      expect(state).toEqual({
        ...initialState,
        request: true,
        error: null
      });
    });

    it('должен сохранять ошибку при rejected', () => {
      const state = orderSlice(initialState, testActions.rejected);
      expect(state).toEqual({
        ...initialState,
        request: false,
        error: testActions.rejected.error.message,
        orderByNumberResponse: null
      });
    });

    it('должен корректно сохранять другую ошибку при rejected', () => {
      const state = orderSlice(initialState, testActions.rejectedFunny);
      expect(state.request).toBe(false);
      expect(state.error).toBe(testActions.rejectedFunny.error.message);
      expect(state.orderByNumberResponse).toBeNull();
    });

    it('должен сохранять заказ из payload при fulfilled', () => {
      const state = orderSlice(initialState, testActions.fulfilledWithOrder);
      expect(state).toEqual({
        ...initialState,
        request: false,
        error: null,
        orderByNumberResponse: mockOrder
      });
    });

    it('должен сохранять частично заполненный заказ при fulfilled', () => {
      const state = orderSlice(initialState, testActions.fulfilledWithPartialOrder);
      expect(state.orderByNumberResponse).toEqual(partialOrder);
    });

    it('должен обрабатывать пустой массив заказов при fulfilled', () => {
      const state = orderSlice(initialState, testActions.fulfilledEmpty);
      expect(state.orderByNumberResponse).toBeFalsy();
    });

    it('должен корректно обрабатывать простой заказ в массиве при fulfilled', () => {
      const state = orderSlice(initialState, testActions.fulfilledWithSimpleOrder);
      expect(state.orderByNumberResponse).toBe(testActions.fulfilledWithSimpleOrder.payload.orders[0]);
    });
  });

  describe('Поведение редьюсера в особых случаях', () => {
    it('должен возвращать initialState при неизвестном экшене', () => {
      const state = orderSlice(initialState, { type: 'UNKNOWN_ACTION' });
      expect(state).toEqual(initialState);
    });
  });
});

