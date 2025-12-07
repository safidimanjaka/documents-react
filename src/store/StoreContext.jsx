import React, { createContext, useReducer, useContext } from "react";

const initialState = {
  user: null, 
  documents: [],
  allDocuments: [],
  users: [],
  departments: [],
  allDepartments:[]
};

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...initialState, user: null };
    case "SET_DOCUMENTS":
      return { ...state, documents: action.payload };
    case "SET_ALL_DOCUMENTS":
      return { ...state, allDocuments: action.payload };
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "SET_DEPARTMENTS":
      return { ...state, departments: action.payload };
      case "SET_ALL_DEPARTMENTS":
      return { ...state, allDepartments: action.payload };
    default:
      return state;
  }
}

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
};