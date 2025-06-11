import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import loginIllustration from '../assets/login-illustration.svg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, remember);
      navigate('/contacts');
    } catch (error) {
      /* el interceptor global de api.js ya muestra toast en 4xx/5xx */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: 900 }}>
        {/* Columna ilustración */}
        <div className="d-none d-md-flex col-md-6 bg-primary text-white flex-column justify-content-center p-5">
          <h2 className="fw-bold">¡Bienvenido de vuelta!</h2>
          <p className="opacity-75 mb-4">Accede a tu agenda y mantén tus contactos al día.</p>
          <img src={loginIllustration} alt="Ilustración de agenda" className="img-fluid mt-auto" />
        </div>

        {/* Columna formulario */}
        <div className="col-12 col-md-6 bg-white p-5">
          <h3 className="text-center mb-4">Iniciar sesión</h3>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-floating mb-3">
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="correo@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">Correo</label>
            </div>

            <div className="form-floating mb-3 position-relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  id="remember"
                  type="checkbox"
                  className="form-check-input"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="remember">
                  Recuérdame
                </label>
              </div>
              <Link to="/forgot-password" className="link-primary">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

