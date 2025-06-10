import React from 'react';
import { ButtonGroup, ToggleButton, InputGroup, FormControl } from 'react-bootstrap';
import { FunnelFill } from 'react-bootstrap-icons';

/**
 * TagFilter Component
 * Muestra un grupo de botones para filtrar contactos por etiquetas (Cliente/Proveedor)
 * y un Input para búsqueda por nombre.
 *
 * Props:
 *  - tags: Array de objetos { id, name }
 *  - value: Tag seleccionado (string) o vacío para mostrar todos
 *  - onChange: función(tag: string) callback al cambiar selección
 *  - onSearch: función(text: string) callback al escribir en búsqueda
 */
export default function TagFilter({ tags, value, onChange, onSearch }) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-md-center mb-4">
      {/* Search Input */}
      <InputGroup className="me-md-3 mb-3 mb-md-0" style={{ maxWidth: 300 }}>
        <InputGroup.Text><FunnelFill /></InputGroup.Text>
        <FormControl
          placeholder="Buscar por nombre..."
          onChange={e => onSearch?.(e.target.value)}
        />
      </InputGroup>

      {/* Tag ButtonGroup */}
      <ButtonGroup className="ms-auto">
        <ToggleButton
          key="all"
          id="filter-all"
          type="radio"
          variant={value === '' ? 'primary' : 'outline-primary'}
          name="tag"
          value=""
          checked={value === ''}
          onChange={() => onChange('')}
        >
          Todos
        </ToggleButton>
        {tags.map(tag => (
          <ToggleButton
            key={tag.id}
            id={`filter-${tag.id}`}
            type="radio"
            variant={value === tag.name ? 'primary' : 'outline-primary'}
            name="tag"
            value={tag.name}
            checked={value === tag.name}
            onChange={() => onChange(tag.name)}
          >
            {tag.name}
          </ToggleButton>
        ))}
      </ButtonGroup>
    </div>
  );
}