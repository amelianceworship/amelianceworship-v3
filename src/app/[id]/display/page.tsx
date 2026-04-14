'use client';

import { use, useEffect, useState } from 'react';

import Link from 'next/link';

import { Anchor, Breadcrumbs, Center, Group, Text, Title } from '@mantine/core';

import { getService } from '~/app/actions/services';
import { createClient } from '~/utils/supabase/client';

function getCurrentTime(): string {
	const now = new Date();
	return now.toLocaleTimeString(undefined, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
}

export default function DisplayPage({ params }: { params: Promise<{ id: string }> }) {
	const { id: serviceId } = use(params);
	const [activeMessage, setActiveMessage] = useState<string | null>(null);
	const [activeColor, setActiveColor] = useState<string>('#0a0a0a');
	const [time, setTime] = useState<string>('');
	const [isAttentionPhase, setIsAttentionPhase] = useState(false);
	const [serviceName, setServiceName] = useState<string>('...');

	const supabase = createClient();

	useEffect(() => {
		const updateTime = () => setTime(getCurrentTime());
		setTimeout(updateTime, 0);

		const interval = setInterval(updateTime, 1000);

		getService(serviceId).then((data) => {
			if (data) setServiceName(data.name);
		});

		return () => clearInterval(interval);
	}, [serviceId]);

	useEffect(() => {
		const channel = supabase.channel(`display-channel-${serviceId}`);

		channel
			.on('broadcast', { event: 'update-text' }, (payload) => {
				const newMessage = payload.payload.message;
				const newColor = payload.payload.color;

				setActiveMessage(newMessage || null);
				if (newColor) setActiveColor(newColor);

				// Запускаємо фазу привернення уваги на 2 секунди
				setIsAttentionPhase(true);
				setTimeout(() => setIsAttentionPhase(false), 2000);
			})
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, serviceId]);

	const backgroundColor = activeMessage ? activeColor : '#000000';

	return (
		<Center
			h="100vh"
			w="100vw"
			style={{
				backgroundColor,
				transition: 'background-color 1s ease',
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			<Group
				justify="space-between"
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					padding: '24px 32px',
					zIndex: 100,
					opacity: activeMessage ? 0.3 : 0.6,
					transition: 'opacity 0.3s',
				}}
			>
				<Breadcrumbs
					styles={{
						separator: { color: 'white' },
						breadcrumb: { color: 'white' },
					}}
				>
					<Anchor component={Link} href="/" c="white" size="sm">
						Головна
					</Anchor>
					<Anchor component={Link} href={`/${serviceId}`} c="white" size="sm">
						{serviceName}
					</Anchor>
					<Text c="white" size="sm" fw={700}>
						Дисплей
					</Text>
				</Breadcrumbs>

				{activeMessage && (
					<Text c="white" size="xl" fw={700} style={{ opacity: 0.8 }}>
						{time}
					</Text>
				)}
			</Group>

			<style
				dangerouslySetInnerHTML={{
					__html: `
				@keyframes entry {
					0% {
						transform: scale(0.5);
						opacity: 0;
					}
					100% {
						transform: scale(1);
						opacity: 1;
					}
				}

				@keyframes attention {
					0%, 100% {
						transform: scale(1);
						opacity: 1;
						filter: brightness(1);
					}
					50% {
						transform: scale(0.92);
						opacity: 0.7;
						filter: brightness(1.3);
					}
				}

				@keyframes breathe {
					0%, 100% {
						opacity: 1;
						transform: scale(1);
					}
					50% {
						opacity: 0.8;
						transform: scale(0.98);
					}
				}
			`,
				}}
			/>

			<div
				key={activeMessage || 'time'}
				style={{
					textAlign: 'center',
					padding: '32px',
					animation: activeMessage
						? isAttentionPhase
							? 'entry 0.3s ease-out, attention 0.5s ease-in-out 4'
							: 'breathe 4s ease-in-out infinite'
						: 'none',
				}}
			>
				<Title
					order={1}
					style={{
						fontSize: '10vmax',
						color: 'white',
						textShadow: '0 20px 80px rgba(0,0,0,0.6)',
						lineHeight: 1,
						fontWeight: 900,
						whiteSpace: 'pre-wrap',
						wordBreak: 'normal',
					}}
				>
					{activeMessage || time || '...'}
				</Title>
			</div>
		</Center>
	);
}
