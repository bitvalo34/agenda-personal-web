require('dotenv').config();

const express = require('express');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');

const multer  = require('multer');
const upload  = multer({ dest: '/tmp' });
const ExcelJS = require('exceljs');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true en 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.verify(err => {
  if (err) console.error('❌  SMTP no disponible:', err);
  else     console.log('✉️  SMTP listo para enviar');
});

/* ─────────────  CORS  ───────────── */
const FRONTEND = process.env.DEBUG_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND, credentials: true }));

/* ─────────────  MySQL pool  ───────────── */
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

/* ─────────────  AUTH  ───────────── */
app.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Usuario no encontrado' });

    const user   = rows[0];
    const okPass = await bcrypt.compare(password, user.password_hash);
    if (!okPass) return res.status(401).json({ message: 'Contraseña inválida' });

    const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (e) { next(e); }
});

app.post('/auth/forgot', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Falta email' });

    const [[user]] = await pool.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    if (!user) return res.status(200).json({ sent: true }); // no revelar existencia

    // 1) generar token aleatorio
    const token      = crypto.randomBytes(32).toString('hex'); // 64 caráct.
    const tokenHash  = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt  = new Date(Date.now() + 60 * 60 * 1000); // 1 h

    // 2) guardar / sustituir cualquiera anterior
    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          token_hash = VALUES(token_hash),
          expires_at = VALUES(expires_at)`,
      [user.id, tokenHash, expiresAt]
    );

    // 3) enviar correo
    const resetURL = `${process.env.BASE_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: `"Agenda Personal" <${process.env.SMTP_USER}>`,
      to:   user.email,
      subject: 'Restablecer contraseña',
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p><a href="${resetURL}">Haz clic aquí para crear una nueva</a>
           (válido 1 hora).</p>`
    });

    res.json({ sent: true });
  } catch (e) { next(e); }
});

app.post('/auth/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: 'Datos incompletos' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [[row]] = await pool.query(
      `SELECT pr.user_id
         FROM password_resets pr
         WHERE pr.token_hash = ? AND pr.expires_at > NOW()`,
      [tokenHash]
    );
    if (!row) return res.status(400).json({ message: 'Token inválido o expirado' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, row.user_id]);
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [row.user_id]);

    res.json({ reset: true });
  } catch (e) { next(e); }
});

/* ─────────────  JWT middleware  ───────────── */
app.use((req, res, next) => {
  if (req.path.startsWith('/auth')) return next();
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ message: 'Sin token' });

  try {
    const token = hdr.split(' ')[1];
    req.user    = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
});

/* ─────────────  GET /contacts (lista + filtro)  ───────────── */
app.get('/contacts', async (req, res, next) => {
  try {
    const tagParam = (req.query.tag || '').toString().replace(/^:/, ''); // admite :1, 1 o Cliente

    /* 1️⃣  Traer contactos con sus tags (JOIN plano) */
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.phone_landline, c.phone_mobile,
              c.email, c.address, c.notes,
              t.id AS tag_id, t.name AS tag_name
         FROM contacts c
    LEFT JOIN contact_tags ct ON ct.contact_id = c.id
    LEFT JOIN tags        t  ON t.id          = ct.tag_id
     ORDER BY c.name`
    );

    /* 2️⃣  Agrupar en JS */
    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.id)) {
        map.set(r.id, {
          id:             r.id,
          name:           r.name,
          phone_landline: r.phone_landline,
          phone_mobile:   r.phone_mobile,
          email:          r.email,
          address:        r.address,
          notes:          r.notes,
          tags:           []
        });
      }
      if (r.tag_id) map.get(r.id).tags.push({ id: r.tag_id, name: r.tag_name });
    });

    let contacts = [...map.values()];

    /* 3️⃣  Filtro opcional por etiqueta */
    if (tagParam) {
      contacts = contacts.filter(c =>
        c.tags.some(
          t =>
            String(t.id) === tagParam ||
            t.name.toLowerCase() === tagParam.toLowerCase()
        )
      );
    }
    res.json(contacts);
  } catch (e) { next(e); }
});

/* ─────────────  EXPORTAR EXCEL  ───────────── */
app.get('/contacts/export', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, t.name AS tag
        FROM contacts c
   LEFT JOIN contact_tags ct ON ct.contact_id = c.id
   LEFT JOIN tags          t ON t.id          = ct.tag_id
    ORDER BY c.name;
    `);

    const map = new Map();
    rows.forEach(r => {
      if (!map.has(r.id)) {
        map.set(r.id, { ...r, tags: [] });
      }
      if (r.tag) map.get(r.id).tags.push(r.tag);
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Agenda');

    ws.columns = [
      { header: 'Nombre',          key: 'name',           width: 25 },
      { header: 'Móvil',           key: 'phone_mobile',   width: 15 },
      { header: 'Fijo',            key: 'phone_landline', width: 15 },
      { header: 'Email',           key: 'email',          width: 25 },
      { header: 'Dirección',       key: 'address',        width: 30 },
      { header: 'Notas',           key: 'notes',          width: 30 },
      { header: 'Etiquetas',       key: 'tags',           width: 20 }
    ];

    [...map.values()].forEach(c =>
      ws.addRow({ ...c, tags: c.tags.join(', ') })
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="agenda.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
});

/* ─────────────  GET /contacts/:id  ───────────── */
app.get('/contacts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [cRows] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
    if (!cRows.length) return res.status(404).json({ message: 'No existe' });

    const [tRows] = await pool.query(
      `SELECT t.id, t.name
         FROM tags t
         JOIN contact_tags ct ON ct.tag_id = t.id
        WHERE ct.contact_id = ?`,
      [id]
    );
    res.json({ ...cRows[0], tags: tRows });
  } catch (e) { next(e); }
});

/* ---- 2.3 Crear ---- */
app.post('/contacts', async (req, res) => {
  try {
    const { name, phone_landline, phone_mobile, email, address, notes, tags } = req.body;
    const [result] = await pool.query(
      `INSERT INTO contacts
         (name, phone_landline, phone_mobile, email, address, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, phone_landline, phone_mobile, email, address, notes]
    );
    const contactId = result.insertId;

    if (Array.isArray(tags) && tags.length > 0) {
      const values = tags.map(tid => [contactId, tid]);
      await pool.query('INSERT INTO contact_tags (contact_id, tag_id) VALUES ?', [values]);
    }
    res.status(201).json({ id: contactId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---- 2.4 Actualizar ---- */
app.put('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phone_landline, phone_mobile, email, address, notes, tags } = req.body;

    await pool.query(
      `UPDATE contacts SET
         name=?, phone_landline=?, phone_mobile=?, email=?, address=?, notes=?
       WHERE id = ?`,
      [name, phone_landline, phone_mobile, email, address, notes, id]
    );

    await pool.query('DELETE FROM contact_tags WHERE contact_id = ?', [id]);
    if (Array.isArray(tags) && tags.length > 0) {
      const values = tags.map(tid => [id, tid]);
      await pool.query('INSERT INTO contact_tags (contact_id, tag_id) VALUES ?', [values]);
    }
    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---- 2.5 Eliminar ---- */
app.delete('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM contact_tags WHERE contact_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'No existe' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────  LISTA DE ETIQUETAS  ───────────── */
app.get('/tags', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tags');
    res.json(rows);
  } catch (e) { next(e); }
});

/* ─────────────  IMPORTAR EXCEL  ───────────── */
app.post('/contacts/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Sin archivo' });

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(req.file.path);
    const ws = wb.worksheets[0];

    const insertContacts = [];
    const insertTagsMap  = [];

    for (let i = 2; i <= ws.rowCount; i++) {
      const [
        name, mobile, land, email,
        address, notes, tagStr
      ] = ws.getRow(i).values.slice(1);

      if (!name) continue;

      insertContacts.push([
        name, land || '', mobile || '', email || '',
        address || '', notes || ''
      ]);

      const tags = (tagStr || '').split(',')
        .map(t => t.trim())
        .filter(Boolean);
      insertTagsMap.push(tags);
    }

    if (!insertContacts.length) {
      return res.status(400).json({ message: 'Archivo sin datos válidos' });
    }

    const [contRes] = await pool.query(
      `INSERT INTO contacts
         (name, phone_landline, phone_mobile, email, address, notes)
       VALUES ?`,
      [insertContacts]
    );
    const firstId = contRes.insertId;

    const [existing]  = await pool.query('SELECT * FROM tags');
    const tagIdByName = new Map(existing.map(t => [t.name, t.id]));

    let nextTagId   = Math.max(...tagIdByName.values(), 0) + 1;
    const tagInsert = [];

    insertTagsMap.forEach(tags => {
      tags.forEach(t => {
        if (!tagIdByName.has(t)) {
          tagIdByName.set(t, nextTagId++);
          tagInsert.push([tagIdByName.get(t), t]);
        }
      });
    });

    if (tagInsert.length) {
      await pool.query('INSERT INTO tags (id, name) VALUES ?', [tagInsert]);
    }

    const contactTagRows = [];
    insertTagsMap.forEach((tags, idx) => {
      const contactId = firstId + idx;
      tags.forEach(t =>
        contactTagRows.push([contactId, tagIdByName.get(t)])
      );
    });

    if (contactTagRows.length) {
      await pool.query(
        'INSERT INTO contact_tags (contact_id, tag_id) VALUES ?',
        [contactTagRows]
      );
    }

    res.json({
      imported: insertContacts.length,
      newTags:  tagInsert.length
    });
  } catch (e) { next(e); }
});

/* ─────────────  Error handler global  ───────────── */
app.use((err, _req, res, _next) => {
  console.error('🔥  Error interno:', err);
  res.status(500).json({ message: 'Error interno' });
});


module.exports = app; 