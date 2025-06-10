import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import agendaSvg from '../assets/agenda-illustration.svg';

/**
 * Hero de bienvenida (página pública)
 * ▸ Fondo degradado de color corporativo
 * ▸ Ilustración animada
 * ▸ Título y subtítulo con sombra
 * ▸ Call‑to‑action “Ingresar”
 */
export default function LandingPage() {
  return (
    <header className="hero-bg d-flex align-items-center min-vh-100">
      <Container className="text-white py-5">
        <Row className="gy-5 align-items-center flex-column-reverse flex-md-row">
          {/* Texto */}
          <Col md={6} className="text-center text-md-start">
            <h1 className="display-4 fw-bold mb-3 drop-shadow">
              Tu Agenda <br className="d-none d-md-block" /> Personal en la&nbsp;Nube
            </h1>
            <p className="lead opacity-75 mb-4">
              Gestiona clientes y proveedores, añade notas y lleva tu base de
              contactos siempre contigo. Exporta o importa todo con un solo
              clic.
            </p>

            <Link to="/login">
              <Button size="lg" variant="light" className="fw-semibold px-4 shadow-sm">
                Ingresar
              </Button>
            </Link>
          </Col>

          {/* Ilustración */}
          <Col md={6} className="text-center">
            <img
              src={agendaSvg}
              alt="Ilustración agenda"
              className="hero-img mx-auto"
              width="380"
              height="auto"
            />
          </Col>
        </Row>
      </Container>
    </header>
  );
}
