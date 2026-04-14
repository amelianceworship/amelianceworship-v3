'use server';

import { revalidatePath } from 'next/cache';

import prisma from '~/lib/prisma';

export async function getServices() {
	return await prisma.service.findMany({
		orderBy: { sortOrder: 'asc' },
	});
}

export async function getService(id: string) {
	return await prisma.service.findUnique({
		where: { id },
	});
}

export async function createService(data: { name: string }) {
	// Отримуємо макс. порядковий номер
	const lastService = await prisma.service.findFirst({
		orderBy: { sortOrder: 'desc' },
	});
	const sortOrder = lastService ? lastService.sortOrder + 1 : 0;

	const service = await prisma.service.create({
		data: { ...data, sortOrder },
	});
	revalidatePath('/');
	return service;
}

export async function updateService(id: string, data: { name: string }) {
	const service = await prisma.service.update({
		where: { id },
		data,
	});
	revalidatePath('/');
	revalidatePath(`/${id}`);
	return service;
}

export async function updateServicesOrder(ids: string[]) {
	await Promise.all(
		ids.map((id, index) =>
			prisma.service.update({
				where: { id },
				data: { sortOrder: index },
			}),
		),
	);
	revalidatePath('/');
}

export async function deleteService(id: string) {
	await prisma.service.delete({
		where: { id },
	});
	revalidatePath('/');
}
