import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { defineConfig, globalIgnores } from 'eslint/config';

import localEslintConfigs from './.eslint/index.config.mjs';

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	...localEslintConfigs,
	globalIgnores([
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		'node_modules/**',
		'dist/**',
		'._backup/**',
		'._legacy/**',
		'._temp/**',
		'._labs/**',
		'**/*._backup*',
		'**/*._legacy*',
		'**/*._temp*',
		'**/*._labs*',
		'history/**',
		'.lh/**',
	]),
]);

export default eslintConfig;
