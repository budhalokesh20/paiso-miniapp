# Paiso keep-awake worker

This independent Cloudflare Worker requests the configured HTTPS `*.onrender.com` service every ten minutes. It has no public HTTP handler. `PAISO_URL` in `wrangler.toml` is set from the project’s local app URL. Deploy with `npx wrangler deploy --config worker/wrangler.toml` from the project root after authenticating to the intended Cloudflare account.

The worker is source code only until it is deployed to a Cloudflare account. Verify the cron invocation and Render logs after deployment. Render can restart free services and suspend them after free instance-hour limits are exhausted; a scheduled ping is not an uptime guarantee. Render's local filesystem is ephemeral, so keep the application database on persistent storage.
