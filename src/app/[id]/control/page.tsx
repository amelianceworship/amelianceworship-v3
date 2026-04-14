'use client';

import { use, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import {
	ActionIcon,
	Anchor,
	Breadcrumbs,
	Button,
	ColorInput,
	Container,
	Flex,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
	useMantineTheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	IconCheck,
	IconChevronDown,
	IconChevronUp,
	IconCircleCheck,
	IconPencil,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';

import {
	createButton,
	deleteButton,
	getButtons,
	updateButton,
	updateButtonsOrder,
} from '~/app/actions/buttons';
import { getService } from '~/app/actions/services';
import { createClient } from '~/utils/supabase/client';

import type { RealtimeChannel } from '@supabase/supabase-js';

interface ControlButton {
	id: string;
	label: string;
	color: string;
	sortOrder: number;
}

interface Service {
	id: string;
	name: string;
}

export default function ControlPage({ params }: { params: Promise<{ id: string }> }) {
	const { id: serviceId } = use(params);
	const [buttons, setButtons] = useState<ControlButton[]>([]);
	const [service, setService] = useState<Service | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Стан для модального вікна (Add/Edit)
	const [opened, setOpened] = useState(false);
	const [editingButton, setEditingButton] = useState<ControlButton | null>(null);
	const [formLabel, setFormLabel] = useState('');
	const [formColor, setFormColor] = useState('#228be6');

	// Стан для підтвердження видалення
	const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
	const [idToDelete, setIdToDelete] = useState<string | null>(null);

	// Стан режиму редагування списку
	const [isEditMode, setIsEditMode] = useState(false);

	const supabase = createClient();
	const channelRef = useRef<RealtimeChannel | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);

	// Ініціалізація
	useEffect(() => {
		fetchData();

		channelRef.current = supabase.channel(`display-channel-${serviceId}`, {
			config: {
				broadcast: { self: true },
			},
		});

		channelRef.current.subscribe();

		return () => {
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supabase, serviceId]);

	const fetchData = async () => {
		try {
			const [buttonsData, serviceData] = await Promise.all([
				getButtons(serviceId),
				getService(serviceId),
			]);
			setButtons(buttonsData as ControlButton[]);
			setService(serviceData as Service);
		} catch {
			notifications.show({
				title: 'Помилка',
				message: 'Не вдалося завантажити дані',
				color: 'red',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAction = (message: string, color: string, id: string) => {
		if (activeId === id) {
			// Перемикач: вимикаємо
			setActiveId(null);
			broadcastUpdate(null, '#000000');
			return;
		}

		// Вмикаємо нову
		setActiveId(id);
		broadcastUpdate(message, color);
	};

	const broadcastUpdate = (message: string | null, color: string) => {
		if (channelRef.current) {
			channelRef.current.send({
				type: 'broadcast',
				event: 'update-text',
				payload: { message, color },
			});
		}
	};

	const theme = useMantineTheme();
	const swatches = [
		theme.colors.blue[6],
		theme.colors.green[6],
		theme.colors.red[6],
		theme.colors.yellow[6],
		theme.colors.grape[6],
		theme.colors.pink[6],
		theme.colors.orange[6],
		theme.colors.indigo[6],
		theme.colors.cyan[6],
		theme.colors.teal[6],
	];

	const openAdd = () => {
		setEditingButton(null);
		setFormLabel('');
		const randomColor = swatches[Math.floor(Math.random() * swatches.length)];
		setFormColor(randomColor);
		setOpened(true);
	};

	const openEdit = (btn: ControlButton) => {
		setEditingButton(btn);
		setFormLabel(btn.label);
		setFormColor(btn.color);
		setOpened(true);
	};

	const handleSave = async () => {
		if (!formLabel.trim()) return;

		try {
			if (editingButton) {
				await updateButton(editingButton.id, serviceId, {
					label: formLabel,
					color: formColor,
				});

				if (editingButton.id === activeId) {
					broadcastUpdate(formLabel, formColor);
				}
			} else {
				await createButton({
					label: formLabel,
					color: formColor,
					sortOrder: buttons.length,
					serviceId,
				});
			}
			setOpened(false);
			fetchData();
			notifications.show({
				title: 'Успіх',
				message: editingButton ? 'Кнопку оновлено' : 'Кнопку додано',
				color: 'green',
			});
		} catch {
			notifications.show({
				title: 'Помилка',
				message: 'Не вдалося зберегти зміни',
				color: 'red',
			});
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteButton(id, serviceId);
			setConfirmDeleteOpened(false);
			setOpened(false);
			fetchData();
			notifications.show({
				title: 'Видалено',
				message: 'Кнопку видалено',
				color: 'blue',
			});
		} catch {
			notifications.show({
				title: 'Помилка',
				message: 'Не вдалося видалити кнопку',
				color: 'red',
			});
		}
	};

	const handleMove = async (index: number, direction: 'up' | 'down') => {
		const newButtons = [...buttons];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;

		if (targetIndex < 0 || targetIndex >= newButtons.length) return;

		const [moved] = newButtons.splice(index, 1);
		newButtons.splice(targetIndex, 0, moved);

		setTimeout(() => {
			setButtons(newButtons);
		}, 100);

		try {
			await updateButtonsOrder(
				serviceId,
				newButtons.map((b) => b.id),
			);
		} catch {
			notifications.show({
				title: 'Помилка',
				message: 'Не вдалося змінити порядок',
				color: 'red',
			});
			fetchData();
		}
	};

	return (
		<Container size="sm" py="xl">
			<Stack gap="md">
				<Breadcrumbs>
					<Anchor component={Link} href="/">
						Головна
					</Anchor>
					<Anchor component={Link} href={`/${serviceId}`}>
						{service?.name || 'Завантаження...'}
					</Anchor>
					<Text fw={700}>Панель керування</Text>
				</Breadcrumbs>

				<Stack gap="md">
					<Flex gap="md">
						<Button
							flex={1}
							onClick={() => setIsEditMode(!isEditMode)}
							variant={isEditMode ? 'filled' : 'light'}
							color={isEditMode ? 'green' : 'gray'}
							leftSection={isEditMode ? <IconCheck size={16} /> : <IconPencil size={16} />}
						>
							{isEditMode ? 'Готово' : 'Редагувати'}
						</Button>
						<Button
							flex={1}
							onClick={openAdd}
							variant="light"
							leftSection={<IconPlus size={16} />}
						>
							Додати кнопку
						</Button>
					</Flex>
				</Stack>

				<Stack gap="md">
					{isLoading ? (
						<Text ta="center" c="dimmed">
							Завантаження...
						</Text>
					) : buttons.length === 0 ? (
						<Text ta="center" c="dimmed">
							Немає кнопок у цьому служінні. Додайте першу!
						</Text>
					) : (
						buttons.map((btn, index) => (
							<Flex key={btn.id} align="center" gap="md">
								{isEditMode && (
									<Stack gap={2}>
										<ActionIcon
											variant="subtle"
											size="sm"
											color="gray"
											onClick={() => handleMove(index, 'up')}
											disabled={index === 0}
										>
											<IconChevronUp size={16} />
										</ActionIcon>
										<ActionIcon
											variant="subtle"
											size="sm"
											color="gray"
											onClick={() => handleMove(index, 'down')}
											disabled={index === buttons.length - 1}
										>
											<IconChevronDown size={16} />
										</ActionIcon>
									</Stack>
								)}

								<Button
									flex={1}
									size="lg"
									h="auto"
									py="md"
									color={btn.color}
									justify="start"
									onClick={() =>
										isEditMode
											? openEdit(btn)
											: handleAction(btn.label, btn.color, btn.id)
									}
									leftSection={
										activeId === btn.id ? (
											<IconCircleCheck size={22} fill="white" color={btn.color} />
										) : null
									}
									styles={{
										root: {
											transition: 'all 0.2s ease',
											filter: activeId === btn.id ? 'brightness(1.1)' : 'none',
											boxShadow:
												activeId === btn.id ? `0 0 20px ${btn.color}cc` : 'none',
										},
										label: {
											whiteSpace: 'normal',
											height: 'auto',
											lineHeight: 1.2,
											textAlign: 'left',
										},
									}}
								>
									{btn.label}
								</Button>

								{isEditMode && (
									<Group gap="md">
										<ActionIcon
											variant="light"
											size="lg"
											color="red"
											onClick={() => {
												setIdToDelete(btn.id);
												setConfirmDeleteOpened(true);
											}}
										>
											<IconTrash size={18} />
										</ActionIcon>
										<ActionIcon
											variant="light"
											size="lg"
											onClick={() => openEdit(btn)}
											color="gray"
										>
											<IconPencil size={18} />
										</ActionIcon>
									</Group>
								)}
							</Flex>
						))
					)}
				</Stack>

				<Modal
					opened={opened}
					onClose={() => setOpened(false)}
					title={editingButton ? 'Редагувати кнопку' : 'Додати нову кнопку'}
					centered
				>
					<Stack>
						<TextInput
							label="Текст на кнопці"
							placeholder="Приклад: Старт"
							value={formLabel}
							onChange={(e) => {
								const val = e.currentTarget.value;
								setFormLabel(val);
								if (editingButton?.id === activeId) {
									broadcastUpdate(val, formColor);
								}
							}}
							required
						/>
						<ColorInput
							label="Колір кнопки"
							value={formColor}
							onChange={(val) => {
								setFormColor(val);
								if (editingButton?.id === activeId) {
									broadcastUpdate(formLabel, val);
								}
							}}
							format="hex"
							swatches={[
								'#228be6',
								'#40c057',
								'#fa5252',
								'#fab005',
								'#7950f2',
								'#e64980',
								'#fd7e14',
							]}
						/>
						<Group justify="flex-end" mt="md">
							<Button variant="subtle" onClick={() => setOpened(false)}>
								Відмінити
							</Button>
							<Button onClick={handleSave}>Зберегти</Button>
						</Group>
					</Stack>
				</Modal>

				<Modal
					opened={confirmDeleteOpened}
					onClose={() => setConfirmDeleteOpened(false)}
					title="Підтвердження видалення"
					size="sm"
					centered
				>
					<Stack>
						<Text size="sm">
							Ви впевнені, що хочете видалити цю кнопку? Цю дію неможливо буде скасувати.
						</Text>
						<Group justify="flex-end" mt="md">
							<Button
								variant="subtle"
								color="red"
								onClick={() => setConfirmDeleteOpened(false)}
							>
								Відмінити
							</Button>
							<Button color="red" onClick={() => idToDelete && handleDelete(idToDelete)}>
								Видалити
							</Button>
						</Group>
					</Stack>
				</Modal>
			</Stack>
		</Container>
	);
}
