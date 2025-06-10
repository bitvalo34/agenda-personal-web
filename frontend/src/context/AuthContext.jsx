import { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const STORAGE_KEY = 'token';

  /**
   * 1. Al arrancar la app buscamos un posible JWT en:
   *    – localStorage (sesiones persistentes)
   *    – sessionStorage (solo mientras la pestaña esté abierta)
   */
  const [token, setToken] = useState(
    localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || null
  );

  /**
   * 2. Guarda el token según la elección del usuario.
   *    @param {string} jwt  – token JWT devuelto por /auth/login
   *    @param {boolean} remember – true = persistir en localStorage
   */
  const login = (jwt, remember = false) => {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, jwt);      // persiste entre sesiones
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, jwt);    // se borra al cerrar pestaña
      localStorage.removeItem(STORAGE_KEY);
    }
    setToken(jwt);
  };

  /**
   * 3. Elimina el token de ambos almacenes y del estado.
   */
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
