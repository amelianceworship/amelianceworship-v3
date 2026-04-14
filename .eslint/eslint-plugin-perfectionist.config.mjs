import perfectionist from 'eslint-plugin-perfectionist';

const config = {
	name: 'local/perfectionist-setup',
	files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}'],
	plugins: {
		perfectionist,
	},
	rules: {
		'perfectionist/sort-imports': [
			'error',
			{
				type: 'natural',
				order: 'asc',
				newlinesBetween: 1,
				internalPattern: ['^@/.*', '^~.*', '^___shared/.*'],
				groups: [
					//* 1. LOGIC (Functions and hooks)
					'react',
					'next',
					'external',
					'internal-alias',
					'internal-tilde',
					'ameliance-ui',
					['parent', 'sibling', 'index'],

					//* 2. CONSTANTS (Static data)
					'constants-external',
					'constants-internal',

					//* 3. TYPES (Divided into external and local)
					'type-external',
					'type-internal',

					//* 4. THE REST
					'assets',
					'styles',
					'unknown',
				],
				customGroups: [
					//* TYPES
					//* External types (libraries like mongoose)
					{
						groupName: 'type-external',
						modifiers: ['type'],
						elementNamePattern: '^(?!\\.|@/|~|___shared).*',
					},
					//* Local types
					{
						groupName: 'type-internal',
						modifiers: ['type'],
					},

					//* CONSTANTS
					{
						groupName: 'constants-external',
						elementNamePattern: '^[A-Z0-9_]+$',
						modifiers: [],
					},
					{ groupName: 'constants-internal', elementNamePattern: '.*constants.*' },

					//* LOGIC
					{ groupName: 'react', elementNamePattern: '^react' },
					{ groupName: 'next', elementNamePattern: '^next' },
					{ groupName: 'internal-alias', elementNamePattern: '^@/|^___shared' },
					{ groupName: 'internal-tilde', elementNamePattern: '^~(?!/ameliance-ui|assets)' },
					{ groupName: 'ameliance-ui', elementNamePattern: '^~/ameliance-ui' },

					//* THE REST
					{ groupName: 'assets', elementNamePattern: '^~assets' },
					{ groupName: 'styles', elementNamePattern: '\\.(css|scss|sass|less)$' },
				],
			},
		],

		'perfectionist/sort-named-imports': [
			'error',
			{
				type: 'natural',
				order: 'asc',
				groups: ['others', 'constants', 'types'],
				newlinesBetween: 1,
				customGroups: [
					{ groupName: 'types', modifiers: ['type'] },
					{ groupName: 'constants', elementNamePattern: '^[A-Z0-9_]+$' },
					{ groupName: 'others', elementNamePattern: '^(?![A-Z0-9_]+$).+$' },
				],
			},
		],

		'perfectionist/sort-named-exports': [
			'error',
			{
				type: 'natural',
				order: 'asc',
				groups: ['others', 'constants', 'types'],
				newlinesBetween: 1,
				customGroups: [
					{ groupName: 'types', modifiers: ['type'] },
					{ groupName: 'constants', elementNamePattern: '^[A-Z0-9_]+$' },
					{ groupName: 'others', elementNamePattern: '^(?![A-Z0-9_]+$).+$' },
				],
			},
		],

		'perfectionist/sort-exports': [
			'error',
			{
				type: 'natural',
				order: 'asc',
			},
		],
	},
};

export default config;
