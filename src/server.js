import express from 'express';
import session from 'express-session';
import cors from 'cors';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.use(session({
  name: 'sis-test-session',
  secret: process.env.SESSION_SECRET || 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60
  }
}));


app.get('/', (req, res) => {
  res.send('OK - backend-sis funcionando');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'backend-sis', time: new Date().toISOString() });
});


// LOGIN FAKE
app.post('/login', (req, res) => {
  req.session.user = { id: 1, nombre: 'Admin Test' };
  res.json({ ok: true, user: req.session.user });
});

// ENDPOINT PROTEGIDO
app.get('/protected', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  res.json({ message: 'Acceso correcto con sesión 🎉' });
});

// LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sis-test-session');
    res.json({ ok: true });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Backend listo en puerto', PORT);
});
