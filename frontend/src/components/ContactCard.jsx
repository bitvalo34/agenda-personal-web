import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Trash2,
  PencilSquare,
  Telephone,
  Envelope,
  House,
  FileText
} from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import api from '../services/api';              // ⬅️ importa el wrapper de Axios

export default function ContactCard({ contact, onDelete }) {
  const {
    id,
    name,
    phone_landline,
    phone_mobile,
    email,
    address,
    notes,
    tags = []
  } = contact;

  /** Elimina sólo cuando la API responde éxito */
  const handleDelete = async () => {
    const ok = window.confirm(
      `¿Eliminar contacto «${name}»? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      await api.delete(`/contacts/${id}`);  // espera confirmación del servidor
      onDelete(id);                        // quita del estado de la lista
      toast.success(`Contacto «${name}» eliminado`, { autoClose: 2000 });
    } catch (err) {
      /* El interceptor de api.js ya muestra el toast de error */
    }
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-bold mb-2">{name}</Card.Title>

        <div className="mb-2">
          {tags.map((tag) => (
            <Badge
              bg={tag.name === 'Cliente' ? 'info' : 'warning'} // usa tus valores reales
              className="me-1"
              key={tag.id}
            >
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="mb-1 text-muted">
          <Telephone className="me-1" />
          {phone_mobile || '—'}
        </div>
        <div className="mb-1 text-muted">
          <Telephone className="me-1" />
          <small>(fijo) {phone_landline || '—'}</small>
        </div>
        <div className="mb-1 text-muted">
          <Envelope className="me-1" />
          {email || '—'}
        </div>
        <div className="mb-2 text-muted">
          <House className="me-1" />
          {address || '—'}
        </div>

        {notes && (
          <div className="mb-3 text-muted">
            <FileText className="me-1" />
            {notes}
          </div>
        )}

        <div className="mt-auto d-flex justify-content-between">
          <Link to={`/contacts/${id}/edit`} className="btn btn-outline-primary">
            <PencilSquare className="me-1" /> Editar
          </Link>
          <Button variant="outline-danger" onClick={handleDelete}>
            <Trash2 className="me-1" /> Eliminar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
