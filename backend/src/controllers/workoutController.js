const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const calculateStats = require('../utils/calculateStats');

async function createWorkout(req, res) {
	try {
		const userId = req.userId;
		const { type, duration, calories, notes } = req.body;
		const workout = await prisma.workout.create({
			data: { userId, type, duration: Number(duration), calories: calories ? Number(calories) : null, notes }
		});
		res.json(workout);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
}

async function getWorkouts(req, res) {
	try {
		const userId = req.userId;
		const workouts = await prisma.workout.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
		const stats = calculateStats(workouts);
		res.json({ workouts, stats });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
}

async function updateWorkout(req, res) {
	try {
		const userId = req.userId;
		const id = Number(req.params.id);
		const existing = await prisma.workout.findUnique({ where: { id } });
		if (!existing || existing.userId !== userId) return res.status(404).json({ error: 'Not found' });

		const { type, duration, calories, notes } = req.body;
		const updated = await prisma.workout.update({ where: { id }, data: { type, duration: duration ? Number(duration) : existing.duration, calories: calories ? Number(calories) : existing.calories, notes } });
		res.json(updated);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
}

async function deleteWorkout(req, res) {
	try {
		const userId = req.userId;
		const id = Number(req.params.id);
		const existing = await prisma.workout.findUnique({ where: { id } });
		if (!existing || existing.userId !== userId) return res.status(404).json({ error: 'Not found' });

		await prisma.workout.delete({ where: { id } });
		res.json({ ok: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
}

module.exports = { createWorkout, getWorkouts, updateWorkout, deleteWorkout };
