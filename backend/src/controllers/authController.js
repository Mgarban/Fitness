const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

async function signup(req, res) {
	try {
		const { email, password, name } = req.body;
		if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return res.status(400).json({ error: 'Email already in use' });

		const hashed = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({ data: { email, password: hashed, name } });

		const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
		res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
}

async function login(req, res) {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });

		const ok = await bcrypt.compare(password, user.password);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

		const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
		res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
}

module.exports = { signup, login };

