## Supabase helpful commands

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
npx supabase gen types typescript --project-id tzgvclnbglljmjodmswl --schema public > src/types/database.types.ts

# Local

npx supabase gen types typescript --local > src/types/database.types.ts


# Functions

supabase functions serve --env-file ./supabase/functions/.env

# Migrate to prod

supabase login

supabase link --project-ref tzgvclnbglljmjodmswl

supabase db pull
# Capture any changes that you have made to your remote database before you went through the steps above
# If you have not made any changes to the remote database, skip this step
# To apply the new migration to your local database:
supabase migration up

# To reset your local database completely:
supabase db reset

# To push
supabase db push --include-all

# Deploy function
# Deploy a specific function
supabase functions deploy ocr --project-ref tzgvclnbglljmjodmswl --no-verify-jwt

# Deploy all functions
supabase functions deploy --project-ref tzgvclnbglljmjodmswl

```
