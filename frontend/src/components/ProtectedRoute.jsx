import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Envuelve las rutas privadas:
 *   – Si hay token ⇒ Renderiza <Outlet /> (la ruta hija: ContactsPage, etc.)
 *   – Si no hay token ⇒ Redirige a /login
 */
export default function ProtectedRoute() {
  const { token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
}
