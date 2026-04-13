This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Setup new project way:

1. `pnpm create next-app@latest .`
2. Add some .gitignore rules

   ```
   # temp folders / files
   *._backup*
   *._bash*
   *._legacy*
   *._temp*
   *._labs*
   *._dev*
   .file-status/
   .eslintcache
   .docker

   #history
   .history/
   .lh/

   .ameliance*.sh
   ```

3. Add `.editorconfig`

   ```
   root = true

   [*]
   end_of_line = lf
   charset = utf-8
   indent_style = tab
   indent_size = 3
   trim_trailing_whitespace = true
   insert_final_newline = true
   quote_type = single

   [*.{json,html,css,scss}]
   quote_type = double

   [*.{yml,yaml}]
   trim_trailing_whitespace = false
   indent_style = space
   indent_size = 3

   [*.md]
   trim_trailing_whitespace = false
   ```

4. Add `.prettier`
   ```
   {
   	"tabWidth": 3,
   	"singleQuote": true,
   	"trailingComma": "all",
   	"printWidth": 100,
   	"semi": true,
   	"overrides": [
   		{
   			"files": ["**/*.html", "**/*.css", "**/*.scss", "**/*.json", "**/*.md"],
   			"options": {
   				"singleQuote": false
   			}
   		},
   		{
   			"files": ["**.yml", "**.yaml"],
   			"options": {
   				"useTabs": false,
   				"tabWidth": 3
   			}
   		}
   	]
   }
   ```
5. Add `.prettierignore`
   ```
   test/
   dist/
   node_modules/
   ```
6. `pnpm add -D eslint-plugin-perfectionist`
