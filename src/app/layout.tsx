import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ColorSchemeScript, createTheme, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
	activeClassName: '',
});

export const metadata = {
	title: 'Ameliance Worship v3',
	description: 'A modern worship display and control platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" {...mantineHtmlProps} suppressHydrationWarning style={{ height: '100%' }}>
			<head>
				<ColorSchemeScript />
			</head>
			<body suppressHydrationWarning style={{ height: '100%', margin: 0 }}>
				<MantineProvider theme={theme}>
					<Notifications />
					{children}
				</MantineProvider>
			</body>
		</html>
	);
}
