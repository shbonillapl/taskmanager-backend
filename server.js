const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];
const tasks = [];
const SECRET = 'demo_secret';

// Auth
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ msg: 'User already exists' });
  }
  users.push({ username, password });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware
const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded.username;
    next();
  } catch {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

// Tasks
app.get('/api/tasks', auth, (req, res) => {
  res.json(tasks.filter(t => t.user === req.user));
});

app.post('/api/tasks', auth, (req, res) => {
  const task = { id: Date.now().toString(), title: req.body.title, completed: false, user: req.user };
  tasks.push(task);
  res.json(task);
});

app.put('/api/tasks/:id', auth, (req, res) => {
  const task = tasks.find(t => t.id === req.params.id && t.user === req.user);
  if (!task) return res.status(404).json({ msg: 'Task not found' });
  task.title = req.body.title ?? task.title;
  task.completed = req.body.completed ?? task.completed;
  res.json(task);
});

app.delete('/api/tasks/:id', auth, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id && t.user === req.user);
  if (index === -1) return res.status(404).json({ msg: 'Task not found' });
  tasks.splice(index, 1);
  res.json({ msg: 'Task deleted' });
});

app.get('/', (req, res) => res.send('TaskManager backend is running.'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
