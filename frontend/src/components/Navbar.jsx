import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Reusable navigation bar
 * ---------------------------------------------------
 * Props
 *  - transparent (boolean) → si es true el navbar no tiene fondo, se posiciona
 *    absoluto y deja ver el hero de la landing page.  En el resto de páginas
 *    basta con no pasar la prop y tendrá fondo azul + sombra como siempre.
 *
 * Ejemplos de uso
 *  <AppNavbar transparent />     // en LandingPage.jsx
 *  <AppNavbar />                 // en todas las rutas protegidas
 *
 * El componente mantiene la lógica de autenticación y cierre de sesión que ya
 * existía, pero ahora admite la presentación "hero" sin duplicar código.
 */
export default function AppNavbar({ transparent = false }) {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Sesión cerrada', { autoClose: 2000 });
    navigate('/login');
  };

  // Estilo dinámico
  const bg        = transparent ? 'transparent' : 'primary';
  const extraCls  = transparent
    ? 'position-absolute w-100 top-0'
    : 'shadow-sm';
  const stickyOpt = transparent ? undefined : 'top';

  return (
    <Navbar
      bg={bg}
      variant="dark"
      expand="lg"
      sticky={stickyOpt}
      className={extraCls}
    >
      <Container>
        {/* Branding */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold">
          <span className="me-2" style={{ fontSize: '1.5rem' }}>📒</span>
          Agenda Personal
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center gap-2">
            {token ? (
              <>
                <Nav.Link as={NavLink} to="/contacts" end>
                  Contactos
                </Nav.Link>
                <Nav.Link as={NavLink} to="/contacts/new">
                  + Nuevo
                </Nav.Link>
                <Button
                  variant="outline-light"
                  className="ms-md-2 mt-2 mt-md-0"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Nav.Link as={NavLink} to="/login" className="fw-semibold">
                Ingresar
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}