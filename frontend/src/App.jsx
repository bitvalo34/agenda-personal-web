import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// estilos globales
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './App.css';

// pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ContactsPage from './pages/ContactsPage';
import ContactFormPage from './pages/ContactFormPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/AuthResetPages'; 

// components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

/* -------------------------------------------------------------
 * AppRoutes – define rutas públicas / privadas y controla el
 * aspecto del Navbar. Cuando la url es '/', el navbar se vuelve
 * transparente y el hero ocupa todo el viewport.
 * ----------------------------------------------------------- */
function AppRoutes() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <>
      <Navbar transparent={isLanding} />

      {/* Landing y Login sin contenedor */}
      {isLanding ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      ) : (
        /* resto de la app con padding Bootstrap */
        <div className="container py-4">
          <Routes>
            {/* públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* zona protegida */}
            <Route element={<ProtectedRoute />}>
              {/* exacto y comodín para refrescar sobre /contacts o futuras sub‑rutas */}
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/contacts/*" element={<ContactsPage />} />

              <Route path="/contacts/new" element={<ContactFormPage />} />
              <Route path="/contacts/:id/edit" element={<ContactFormPage />} />
            </Route>
          </Routes>
        </div>
      )}

      <ToastContainer position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

