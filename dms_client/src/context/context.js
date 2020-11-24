import {createContext} from 'react';
const userContext = createContext();
export const userProvider = userContext.Provider;
export const userConsumer = userContext.Consumer;

export default userContext;