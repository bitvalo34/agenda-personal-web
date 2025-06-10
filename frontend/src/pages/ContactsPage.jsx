import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  InputGroup,
  FormControl,
  Row,
  Col,
} from 'react-bootstrap';
import fileDownload from 'js-file-download';
import api from '../services/api';
import ContactCard from '../components/ContactCard';
import ExcelImport from '../components/ExcelImport';
import { Search } from 'react-bootstrap-icons';

export default function ContactsPage() {
  /* ----------------------- Estados ----------------------- */
  const [contacts, setContacts]   = useState([]);  // data cruda desde API
  const [tags, setTags]           = useState([]);  // lista de etiquetas
  const [tagFilter, setTagFilter] = useState('');  // id o nombre de tag
  const [search, setSearch]       = useState('');  // texto de búsqueda (UI)

  /* -------------------- Cargar desde API ----------------- */
  const loadData = async () => {
    try {
      const params = tagFilter ? { tag: tagFilter } : {};
      const [cRes, tRes] = await Promise.all([
        api.get('/contacts', { params }),
        api.get('/tags'),
      ]);
      setContacts(cRes.data);
      setTags(tRes.data);
    } catch {
      /* Toast global en interceptor */
    }
  };

    // Lanza la carga pero sin devolver la Promesa al efecto (React 19 no acepta values)
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFilter]);

  /* ------------- Filtro en memoria por nombre ------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c => c.name.toLowerCase().includes(q));
  }, [contacts, search]);

  /* ------------------- Exportar Excel -------------------- */
  const handleExport = async () => {
    try {
      const res = await api.get('/contacts/export', { responseType: 'blob' });
      fileDownload(res.data, 'agenda.xlsx');
    } catch {/* toast global */}
  };

  /* ---------------------- Render UI ---------------------- */
  return (
    <>
      {/* 🔵 Barra superior */}
      <Row className="g-3 align-items-center mb-4 flex-column flex-lg-row">
        {/* Título */}
        <Col xs="auto">
          <h1 className="fw-bold m-0">Contactos</h1>
        </Col>

        {/* Buscador */}
        <Col className="flex-grow-1 w-100 w-lg-auto">
          <InputGroup className="shadow-sm">
            <InputGroup.Text className="bg-white border-end-0">
              <Search />
            </InputGroup.Text>
            <FormControl
              className="border-start-0"
              placeholder="Buscar por nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

        {/* Botones de acción */}
        <Col xs="auto" className="d-flex flex-wrap gap-2">
          <Button variant="outline-secondary" onClick={handleExport}>
            Exportar
          </Button>
          <ExcelImport onDone={loadData} />
          <Link to="/contacts/new" className="btn btn-success">
            + Nuevo
          </Link>
        </Col>
      </Row>

      {/* 🟢 Filtros de etiqueta */}
      <div className="mb-3">
        <ButtonGroup>
          <Button
            variant={tagFilter ? 'outline-primary' : 'primary'}
            onClick={() => setTagFilter('')}
          >
            Todos
          </Button>
          {tags.map((t) => (
            <Button
              key={t.id}
              variant={String(tagFilter) === String(t.id) ? 'primary' : 'outline-primary'}
              onClick={() => setTagFilter(t.id)}
            >
              {t.name}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* 🗂️  Grid de tarjetas */}
      <Row xxl={3} lg={3} md={2} sm={1} className="g-4">
        {filtered.map((c) => (
          <Col key={c.id}>
            <div className="contact-card p-3">
            <ContactCard
              contact={c}
              onDelete={() => setContacts((prev) => prev.filter((x) => x.id !== c.id))}
            />
            </div>
          </Col>
        ))}
        {!filtered.length && (
          <Col>
            <p className="text-muted text-center mt-4">No se encontraron contactos.</p>
          </Col>
        )}
      </Row>
    </>
  );
}
