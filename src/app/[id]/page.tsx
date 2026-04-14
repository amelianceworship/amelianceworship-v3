'use client';

import { use, useEffect, useState } from 'react';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
	Anchor,
	Breadcrumbs,
	Button,
	Center,
	Container,
	Loader,
	Stack,
	Text,
} from '@mantine/core';
import { IconDeviceDesktop, IconSettings } from '@tabler/icons-react';

import { getService } from '~/app/actions/services';

interface Props {
	params: Promise<{ id: string }>;
}

interface Service {
	id: string;
	name: string;
}

export default function ServiceDashboard({ params }: Props) {
	const { id } = use(params);
	const [service, setService] = useState<Service | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		getService(id).then((data) => {
			if (!data) return notFound();
			setService(data as Service);
			setIsLoading(false);
		});
	}, [id]);

	if (isLoading) {
		return (
			<Center h="100vh">
				<Loader size="xl" />
			</Center>
		);
	}

	return (
		<Container
			size="md"
			py="xl"
			style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}
		>
			<Stack gap="md" flex={1} style={{ minHeight: 0 }}>
				<Breadcrumbs flex="0 0 auto">
					<Anchor component={Link} href="/">
						Головна
					</Anchor>
					<Text fw={700}>{service?.name || '...'}</Text>
				</Breadcrumbs>

				<Stack gap="md" flex={1}>
					<Button
						size="xl"
						flex={1}
						variant="light"
						component={Link}
						href={`/${id}/control`}
						styles={{
							root: {
								height: '100%',
								transition: 'all 0.15s ease',
								'&:hover': {
									filter: 'brightness(1.05)',
								},
							},
							inner: {
								flexDirection: 'column',
								gap: 'var(--mantine-spacing-xs)',
							},
							label: {
								whiteSpace: 'normal',
								height: 'auto',
								lineHeight: 1.2,
								textAlign: 'center',
								fontSize: '2rem',
								fontWeight: 700,
								flexDirection: 'column',
								gap: '12px',
							},
						}}
					>
						<IconSettings size={48} stroke={2} />
						Керування
					</Button>

					<Button
						size="xl"
						flex={1}
						variant="light"
						component={Link}
						href={`/${id}/display`}
						styles={{
							root: {
								height: '100%',
								transition: 'all 0.15s ease',
								'&:hover': {
									filter: 'brightness(1.05)',
								},
							},
							inner: {
								flexDirection: 'column',
								gap: 'var(--mantine-spacing-xs)',
							},
							label: {
								whiteSpace: 'normal',
								height: 'auto',
								lineHeight: 1.2,
								textAlign: 'center',
								fontSize: '2rem',
								fontWeight: 700,
								flexDirection: 'column',
								gap: '12px',
							},
						}}
					>
						<IconDeviceDesktop size={48} stroke={2} />
						Дисплей
					</Button>
				</Stack>
			</Stack>
		</Container>
	);
}
