# Deployment research notes

- Vercel official environment-variable documentation: variables can be scoped to Production, Preview, Custom environments and Development. Changes apply to new deployments, not previous deployments. URL: https://vercel.com/docs/environment-variables
- Supabase official database migration documentation: link the CLI to the remote project with `supabase link`, push migrations with `supabase db push`, and use `supabase db push --include-seed` when the remote seed should also run. URL: https://supabase.com/docs/guides/deployment/database-migrations
- The staging guide should treat the remote Supabase project and Vercel Preview deployment as a non-production stakeholder environment, and must not promote DEMO/SAMPLE data or broad service-role credentials to production.
