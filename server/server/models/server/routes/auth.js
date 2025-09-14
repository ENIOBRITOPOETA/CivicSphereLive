const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, 'seusupersegredotopsecret', { expiresIn: '24h' });

    res.json({ user: { username, email }, token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ id: user._id }, 'seusupersegredotopsecret', { expiresIn: '24h' });

    res.json({ user: { username: user.username, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao logar' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    if (!userId) return res.status(401).json({ message: 'Não autenticado' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

module.exports = router;
