-- L'app accède à catalog_items via le service_role (server actions / webhooks).
-- Une table avec RLS activé exige tout de même les GRANT de base pour ce rôle.
grant all on public.catalog_items to service_role;
