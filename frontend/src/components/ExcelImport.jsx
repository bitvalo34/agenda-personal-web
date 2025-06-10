import { useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function ExcelImport({ onDone }) {
  const fileRef = useRef();

  const handleUpload = async () => {
    const file = fileRef.current.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);

    try {
      await api.post('/contacts/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Importación exitosa');
      onDone();                             // recarga lista
    } catch {
      /* el interceptor global ya muestra el toast de error */
    }
  };

  return (
    <>
      <Form.Control
        type="file"
        accept=".xlsx"
        ref={fileRef}
        className="mb-2"
      />
      <Button onClick={handleUpload}>Importar Excel</Button>
    </>
  );
}
