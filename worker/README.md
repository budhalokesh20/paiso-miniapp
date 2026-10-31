# Paiso keep-awake worker

This is a Render Cron Job. Every ten minutes it checks the app's `/healthz` endpoint and exits. `PAISO_URL` is configured in `worker/render.yaml`. No Cloudflare service or account is used.

Create a **Cron Job** in the Render Dashboard using this repository and branch `main`:

- Build command: `node --version`
- Start command: `node worker/keep-awake.mjs`
- Schedule: `*/10 * * * *`
- Environment variable: `PAISO_URL=https://paiso-miniapp.onrender.com`

Alternatively create a separate Blueprint using `worker/render.yaml` as the Blueprint path. This file is separate from the root Blueprint so an ordinary push to the existing web app cannot silently provision a paid service. Render Cron Jobs have a $1/month minimum charge: https://render.com/docs/cronjobs . Creating the Cron Job needs Render account access and acceptance of that charge.

After creating it once, use **Trigger Run** and check for `Paiso app health check passed.` in the job logs. Git push can update an existing Cron Job's source, but it does not create a new Cron Job for a manually connected web service.

The Cron Job has not been created by this repository change. Render can restart free services and suspend them after free instance-hour limits are exhausted; a scheduled ping is not an uptime guarantee. A paid web service plan avoids idle spin-down without a keep-awake job. Keep the application database on persistent storage.
