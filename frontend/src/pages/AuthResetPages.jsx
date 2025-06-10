// --- AuthResetPages.jsx ----------------------------------------------------
// Contiene dos componentes: ForgotPasswordPage y ResetPasswordPage.
// Puedes mantenerlos juntos o separarlos en archivos individuales si prefieres
// (ForgotPasswordPage.jsx y ResetPasswordPage.jsx). Ambos están listos para
// usarse con react-router-dom v6.

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

/* ------------------------------------------------------
 * ForgotPasswordPage – Solicita correo y envía link
 * ---------------------------------------------------- */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/forgot', { email }); // siempre responde { sent: true }
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: 420 }}>
        <h2 className="text-center fw-bold mb-3">¿Olvidaste tu contraseña?</h2>
        {sent ? (
          <>
            <p className="text-success text-center">
              Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <div className="d-grid gap-2 mt-4">
              <Link to="/login" className="btn btn-outline-primary">
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        ) : (
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
              <label htmlFor="email">Correo registrado</label>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                'Enviar enlace'
              )}
            </button>
            <div className="text-center mt-3">
              <Link to="/login" className="link-secondary small">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------
 * ResetPasswordPage – Captura token y crea nueva password
 * ---------------------------------------------------- */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const valid = password.length >= 8 && password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    try {
      setLoading(true);
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
        <p className="text-danger fw-bold">Token de restablecimiento no proporcionado.</p>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: 420 }}>
        {success ? (
          <>
            <h2 className="text-center mb-3">¡Contraseña actualizada!</h2>
            <p className="text-success text-center">Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <div className="d-grid gap-2 mt-4">
              <Link to="/login" className="btn btn-primary">Ir a Login</Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-center fw-bold mb-3">Crear nueva contraseña</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-floating mb-3">
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Nueva contraseña"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="password">Nueva contraseña</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  id="confirm"
                  type="password"
                  className="form-control"
                  placeholder="Confirmar contraseña"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <label htmlFor="confirm">Confirmar contraseña</label>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={!valid || loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  'Actualizar contraseña'
                )}
              </button>
              <div className="text-center mt-3">
                <Link to="/login" className="link-secondary small">
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}