## Supabase helpful commands

````sh
```sh
# Start the local Supabase development environment
npx supabase start

# Create a new database migration (replace "add_new_feature" with your migration name)
npx supabase migration new add_new_feature

# Apply pending migrations to your local database
npx supabase migration apply

# Check the status of your migrations
npx supabase migration status

# Up
supabase migration up

# Prod
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > database.types.ts

# Local
npx supabase gen types typescript --local > database.types.ts

````
