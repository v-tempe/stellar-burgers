import feedSlice, { getFeeds, initialState } from './feedSlice';

describe('Тестирование редьюсера feedSlice', () => {
  const mockOrders = [
    { id: 1, ingredients: ['ing1', 'ing2'], status: 'created' },
    { id: 2, ingredients: ['ing3', 'ing4'], status: 'pending' }
  ];

  const actions = {
    pending: {
      type: getFeeds.pending.type
    },
    rejected: {
      type: getFeeds.rejected.type,
      error: { message: 'Server error' }
    },
    fulfilled: {
      type: getFeeds.fulfilled.type,
      payload: {
        orders: mockOrders,
        total: 50,
        totalToday: 5
      }
    }
  };

  it('должен устанавливать loading=true и очищать ошибку при pending', () => {
    const state = feedSlice(initialState, actions.pending);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('должен сохранять ошибку и loading=false при rejected', () => {
    const state = feedSlice(initialState, actions.rejected);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(actions.rejected.error.message);
  });

  it('должен сохранять данные заказов и сбрасывать loading и ошибку при fulfilled', () => {
    const state = feedSlice(initialState, actions.fulfilled);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.orders).toEqual(mockOrders);
    expect(state.total).toBe(50);
    expect(state.totalToday).toBe(5);
  });

  it('должен возвращать initialState при неизвестном экшене', () => {
    const state = feedSlice(initialState, { type: 'UNKNOWN_ACTION' });
    expect(state).toBe(initialState);
  });

  it('корректно обрабатывает пустой payload в fulfilled', () => {
    const emptyPayloadAction = {
      type: getFeeds.fulfilled.type,
      payload: {
        orders: [],
        total: 0,
        totalToday: 0
      }
    };
    const state = feedSlice(initialState, emptyPayloadAction);
    expect(state.orders).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.totalToday).toBe(0);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

