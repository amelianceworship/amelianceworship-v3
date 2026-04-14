'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import {
	ActionIcon,
	Button,
	Center,
	Container,
	Flex,
	Group,
	Image,
	Loader,
	Modal,
	Paper,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	IconCheck,
	IconChevronDown,
	IconChevronUp,
	IconPencil,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';

import {
	createService,
	deleteService,
	getServices,
	updateService,
	updateServicesOrder,
} from './actions/services';

interface Service {
	id: string;
	name: string;
	sortOrder: number;
	createdAt: Date;
}

export default function ServicesPage() {
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [opened, setOpened] = useState(false);
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [formName, setFormName] = useState('');

	const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
	const [idToDelete, setIdToDelete] = useState<string | null>(null);

	const moveTimeout = useRef<NodeJS.Timeout | null>(null);

	// Стан режиму редагування списку
	const [isEditMode, setIsEditMode] = useState(false);

	useEffect(() => {
		fetchServices();
	}, []);

	const fetchServices = async () => {
		try {
			const data = await getServices();
			setServices(data);
		} catch {
			notifications.show({
				title: 'Помилка',
				message: 'Не вдалося завантажити служіння',
				color: 'red',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenAdd = () => {
		setEditingService(null);
		setFormName('');
		setOpened(true);
	};

	const handleOpenEdit = (service: Service) => {
		setEditingService(service);
		setFormName(service.name);
		setOpened(true);
	};

	const handleSave = async () => {
		if (!formName.trim()) return;

		try {
			if (editingService) {
				await updateService(editingService.id, { name: formName });
			} else {
				await createService({ name: formName });
			}
			setOpened(false);
			fetchServices();
			notifications.show({
				title: 'Успіх',
				message: editingService ? 'Служіння оновлено' : 'Служіння додано',
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
			await deleteService(id);
			setConfirmDeleteOpened(false);
			fetchServices();
			notifications.show({
				title: 'Видалено',
				message: 'Служіння видалено',
				color: 'blue',
			});
		} catch {
			notifications.show({
				title: 'Помилка',
				message: 'Не вдалося видалити служіння',
				color: 'red',
			});
		}
	};

	const handleMove = async (index: number, direction: 'up' | 'down') => {
		const newServices = [...services];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;

		if (targetIndex < 0 || targetIndex >= newServices.length) return;

		// Міняємо місцями
		[newServices[index], newServices[targetIndex]] = [
			newServices[targetIndex],
			newServices[index],
		];

		setServices(newServices);

		// Зберігаємо з дебаунсом
		if (moveTimeout.current) clearTimeout(moveTimeout.current);
		moveTimeout.current = setTimeout(async () => {
			try {
				await updateServicesOrder(newServices.map((s) => s.id));
			} catch {
				notifications.show({
					title: 'Помилка',
					message: 'Не вдалося змінити порядок',
					color: 'red',
				});
			}
		}, 500);
	};

	return (
		<Container
			size="md"
			py="xl"
			style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}
		>
			<Stack gap="md" flex={1} style={{ minHeight: 0 }}>
				<Stack gap="md" flex="0 0 auto">
					<Stack gap="xs">
						<Center>
							<Image src="/hog-2021-logo.svg" alt="Logo" w={60} h="auto" />
						</Center>
						<Title
							order={2}
							ta="center"
							m={0}
							w="100%"
							style={{ whiteSpace: 'nowrap', fontSize: 'clamp(1.25rem, 5vw, 2.25rem)' }}
						>
							Сторінка вибору служіння
						</Title>
					</Stack>

					<Flex gap="md">
						<Button
							flex={1}
							onClick={handleOpenAdd}
							variant="light"
							color="gray"
							leftSection={<IconPlus size={18} />}
						>
							Додати
						</Button>
						<Button
							flex={1}
							onClick={() => setIsEditMode(!isEditMode)}
							variant={isEditMode ? 'filled' : 'light'}
							color={isEditMode ? 'green' : 'gray'}
							leftSection={isEditMode ? <IconCheck size={18} /> : <IconPencil size={18} />}
						>
							{isEditMode ? 'Готово' : 'Редагувати'}
						</Button>
					</Flex>
				</Stack>

				{isLoading ? (
					<Center flex={1}>
						<Loader size="xl" />
					</Center>
				) : services.length === 0 ? (
					<Paper
						withBorder
						p="xl"
						radius="md"
						flex={1}
						style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
					>
						<Text c="dimmed" ta="center">
							Немає створених служінь. Додайте перше!
						</Text>
					</Paper>
				) : (
					<Stack gap="md" flex={1} style={{ overflowY: 'auto' }}>
						{services.map((service, index) => (
							<Flex
								key={service.id}
								align="stretch"
								gap="md"
								flex={1}
								style={{ minHeight: '100px' }}
							>
								{isEditMode && (
									<Stack gap="xs" flex="0 0 auto">
										<ActionIcon
											variant="light"
											size="lg"
											h="100%"
											color="gray"
											onClick={() => handleMove(index, 'up')}
											disabled={index === 0}
										>
											<IconChevronUp size={18} />
										</ActionIcon>
										<ActionIcon
											variant="light"
											size="lg"
											h="100%"
											color="gray"
											onClick={() => handleMove(index, 'down')}
											disabled={index === services.length - 1}
										>
											<IconChevronDown size={18} />
										</ActionIcon>
									</Stack>
								)}
								{isEditMode && (
									<ActionIcon
										variant="light"
										size="lg"
										h="100%"
										color="red"
										onClick={() => {
											setIdToDelete(service.id);
											setConfirmDeleteOpened(true);
										}}
									>
										<IconTrash size={18} />
									</ActionIcon>
								)}

								<Button
									flex={1}
									size="xl"
									variant="light"
									justify="center"
									py="xl"
									component={Link}
									href={`/${service.id}`}
									onClick={(e) =>
										(isEditMode && e.preventDefault()) ||
										(isEditMode && handleOpenEdit(service))
									}
									styles={{
										root: {
											height: '100%',
											transition: 'all 0.15s ease',
											'&:hover': {
												filter: 'brightness(1.05)',
											},
										},
										label: {
											whiteSpace: 'normal',
											height: 'auto',
											lineHeight: 1.3,
											textAlign: 'center',
											fontSize: '1.5rem',
											fontWeight: 700,
										},
									}}
								>
									{service.name}
								</Button>

								{isEditMode && (
									<ActionIcon
										variant="light"
										size="lg"
										h="100%"
										onClick={() => handleOpenEdit(service)}
										color="gray"
									>
										<IconPencil size={18} />
									</ActionIcon>
								)}
							</Flex>
						))}
					</Stack>
				)}

				<Modal
					opened={opened}
					onClose={() => setOpened(false)}
					title={editingService ? 'Редагувати служіння' : 'Додати служіння'}
					centered
				>
					<Stack>
						<TextInput
							label="Назва служіння"
							placeholder="Приклад: Основне служіння"
							value={formName}
							onChange={(e) => setFormName(e.currentTarget.value)}
							required
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
							{`Ви впевнені, що хочете видалити це служіння? Усі кнопки, пов'язані з ним, також
							будуть видалені`}
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
