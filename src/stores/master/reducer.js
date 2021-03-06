import * as types from './actionTypes';

const initialState = {
  roles: {}
};

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.LOAD_ROLE_SUCCESS:
      return {
        ...state,
        roles: action.payload.result
      };

    case types.LOAD_ERROR:
      return {
        ...state,
        error: action.payload.error
      };

    default:
      return state;
  }
}

export function getState(state) {
  return state.master;
}
