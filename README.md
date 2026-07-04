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

## Deploy on GitHub Pages

Pushing to `main` triggers the [Deploy to GitHub Pages](.github/workflows/deploy.yml) workflow, which builds the static export (`next build` with `output: 'export'`) and publishes the `out/` directory to GitHub Pages.

The site is served under the `/nutrition-optimizer` base path. The workflow sets `NEXT_PUBLIC_BASE_PATH=/nutrition-optimizer` at build time; local `pnpm dev` and `pnpm build` are unaffected and serve from the root.

One-time setup: in the repository settings, set **Settings → Pages → Source** to **GitHub Actions**.
