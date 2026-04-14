'use server';

import { revalidatePath } from 'next/cache';

import prisma from '~/lib/prisma';

export async function getButtons(serviceId: string) {
	return await prisma.controlButton.findMany({
		where: { serviceId },
		orderBy: { sortOrder: 'asc' },
	});
}

export async function createButton(data: { label: string; color: string; sortOrder: number; serviceId: string }) {
	const button = await prisma.controlButton.create({
		data,
	});
	revalidatePath(`/${data.serviceId}/control`);
	return button;
}

export async function updateButton(
	id: string,
	serviceId: string,
	data: { label?: string; color?: string; sortOrder?: number },
) {
	const button = await prisma.controlButton.update({
		where: { id },
		data,
	});
	revalidatePath(`/${serviceId}/control`);
	return button;
}

export async function deleteButton(id: string, serviceId: string) {
	await prisma.controlButton.delete({
		where: { id },
	});
	revalidatePath(`/${serviceId}/control`);
}

export async function updateButtonsOrder(serviceId: string, orderedIds: string[]) {
	// Оновлюємо кожну кнопку з новим порядковим номером
	await Promise.all(
		orderedIds.map((id, index) =>
			prisma.controlButton.update({
				where: { id },
				data: { sortOrder: index },
			}),
		),
	);
	revalidatePath(`/${serviceId}/control`);
}
