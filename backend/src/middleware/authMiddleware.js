const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

async function authMiddleware(req, res, next) {
	const auth = req.headers.authorization;
	if (!auth) return res.status(401).json({ error: 'Missing authorization header' });

	const parts = auth.split(' ');
	if (parts.length !== 2) return res.status(401).json({ error: 'Invalid authorization header' });

	const token = parts[1];
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		const user = await prisma.user.findUnique({ where: { id: payload.userId } });
		if (!user) return res.status(401).json({ error: 'Invalid token' });
		req.userId = user.id;
		next();
	} catch (err) {
		console.error(err);
		res.status(401).json({ error: 'Unauthorized' });
	}
}

module.exports = authMiddleware;
