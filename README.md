# Kino XII

Cinema network web app built for the Redberry Bootcamp XII assignment. Users browse films, pick a session in one of the venues, choose seats and buy tickets.

Built with React, TypeScript, Vite, Tailwind CSS, TanStack Query and React Router.

## Running locally

```bash
npm install
npm run dev
```

The app runs on http://localhost:8080 and talks to the Kino XII API (`https://api.kinoxii.redberryinternship.ge/api`). To point it somewhere else, set `VITE_API_URL` in a `.env.local` file.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – type check and build for production
- `npm run preview` – serve the production build
- `npm run lint` – lint the code
