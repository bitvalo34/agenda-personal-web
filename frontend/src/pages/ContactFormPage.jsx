import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Row,
  Col,
  Button,
  InputGroup,
  Spinner,
  Badge,
} from 'react-bootstrap';
import {
  PersonFill,
  TelephoneFill,
  EnvelopeFill,
  GeoAltFill,
  ChatDotsFill,
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ContactFormPage() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  /* ──────────────────── Estado ──────────────────── */
  const [contact, setContact] = useState({
    name: '',
    phone_landline: '',
    phone_mobile: '',
    email: '',
    address: '',
    notes: '',
    tags: [],
  });
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ──────────────────── Cargar datos ──────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const t = await api.get('/tags');
        setAllTags(t.data);

        if (isEdit) {
          setLoading(true);
          const { data } = await api.get(`/contacts/${id}`);
          setContact({ ...data, tags: data.tags.map((t) => t.id) });
        }
      } catch {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  /* Etiquetas seleccionadas (para chips bajo el select) */
  const selectedTags = useMemo(
    () => allTags.filter((t) => contact.tags.includes(t.id)),
    [allTags, contact.tags]
  );

  /* ──────────────────── Handlers ──────────────────── */
  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const vals = Array.from(selectedOptions, (opt) => Number(opt.value));
      setContact((p) => ({ ...p, tags: vals }));
    } else {
      setContact((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...contact };
      if (!payload.tags.length) delete payload.tags;

      if (isEdit) {
        await api.put(`/contacts/${id}`, payload);
        toast.success('Contacto actualizado');
      } else {
        await api.post('/contacts', payload);
        toast.success('Contacto creado');
      }
      navigate('/contacts');
    } catch {
      /* interceptor ya muestra error */
    } finally {
      setLoading(false);
    }
  };

  /* ──────────────────── Skeleton loading ──────────────────── */
  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /* ──────────────────── UI ──────────────────── */
  return (
    <Card className="shadow-lg border-0 rounded-4 mx-auto" style={{ maxWidth: 960 }}>
      <Card.Body className="p-4 p-md-5">
        <h2 className="fw-bold mb-4 text-primary">
          {isEdit ? 'Editar contacto' : 'Nuevo contacto'}
        </h2>

        <Form onSubmit={handleSubmit}>
          {/* Nombre */}
          <Form.Group className="mb-4" controlId="name">
            <Form.Label className="fw-semibold">Nombre completo</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <PersonFill />
              </InputGroup.Text>
              <Form.Control
                className="border-start-0"
                placeholder="Ej. Ana López"
                name="name"
                value={contact.name}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </Form.Group>

          {/* Teléfonos */}
          <Row className="mb-4 gy-3">
            <Col md={6}>
              <Form.Label className="fw-semibold">Teléfono móvil</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <TelephoneFill />
                </InputGroup.Text>
                <Form.Control
                  className="border-start-0"
                  placeholder="Ej. 555‑123456"
                  name="phone_mobile"
                  value={contact.phone_mobile}
                  onChange={handleChange}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-semibold">Teléfono fijo</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <TelephoneFill />
                </InputGroup.Text>
                <Form.Control
                  className="border-start-0"
                  placeholder="Ej. 232‑12345"
                  name="phone_landline"
                  value={contact.phone_landline}
                  onChange={handleChange}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* Email */}
          <Form.Group className="mb-4" controlId="email">
            <Form.Label className="fw-semibold">Correo electrónico</Form.Label>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <EnvelopeFill />
              </InputGroup.Text>
              <Form.Control
                type="email"
                className="border-start-0"
                placeholder="nombre@dominio.com"
                name="email"
                value={contact.email}
                onChange={handleChange}
              />
            </InputGroup>
          </Form.Group>

          {/* Dirección & Notas */}
          <Row className="mb-4 gy-3">
            <Col md={6}>
              <Form.Label className="fw-semibold">Dirección</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <GeoAltFill />
                </InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={2}
                  className="border-start-0"
                  placeholder="Calle, ciudad, país…"
                  name="address"
                  value={contact.address}
                  onChange={handleChange}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-semibold">Notas adicionales</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <ChatDotsFill />
                </InputGroup.Text>
                <Form.Control
                  as="textarea"
                  rows={2}
                  className="border-start-0"
                  placeholder="Comentarios, referencias…"
                  name="notes"
                  value={contact.notes}
                  onChange={handleChange}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* Etiquetas */}
          <Form.Group className="mb-5" controlId="tags">
            <Form.Label className="fw-semibold">Etiquetas</Form.Label>
            <Form.Select
              multiple
              size={3}
              name="tags"
              value={contact.tags}
              onChange={handleChange}
            >
              {allTags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Form.Select>
            {/* Chips */}
            <div className="mt-1 d-flex flex-wrap gap-2">
              {selectedTags.map((t) => (
                <Badge bg="primary" key={t.id} className="px-2 py-1 rounded-pill">
                  {t.name}
                </Badge>
              ))}
              {!selectedTags.length && (
                <span className="text-muted small">Sin etiquetas seleccionadas</span>
              )}
            </div>
          </Form.Group>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => navigate('/contacts')}>Cancelar</Button>
            <Button variant="primary" type="submit">
              {isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
