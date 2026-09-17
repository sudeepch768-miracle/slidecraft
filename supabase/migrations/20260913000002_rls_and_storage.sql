-- =============================================================================
-- SlideCraft AI - Row Level Security (RLS) & Private Storage Buckets
-- =============================================================================

-- 1. ENABLE RLS ON ALL USER-OWNED TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. PROJECTS POLICIES (Strict user isolation: Read, Edit, Delete own)
DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_update_own" ON public.projects;
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- 4. PROJECT_VERSIONS POLICIES
DROP POLICY IF EXISTS "project_versions_select_own" ON public.project_versions;
CREATE POLICY "project_versions_select_own" ON public.project_versions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "project_versions_insert_own" ON public.project_versions;
CREATE POLICY "project_versions_insert_own" ON public.project_versions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "project_versions_delete_own" ON public.project_versions;
CREATE POLICY "project_versions_delete_own" ON public.project_versions FOR DELETE USING (auth.uid() = user_id);

-- 5. UPLOADED_FILES POLICIES (Strict access to own uploaded files)
DROP POLICY IF EXISTS "uploaded_files_select_own" ON public.uploaded_files;
CREATE POLICY "uploaded_files_select_own" ON public.uploaded_files FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "uploaded_files_insert_own" ON public.uploaded_files;
CREATE POLICY "uploaded_files_insert_own" ON public.uploaded_files FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "uploaded_files_update_own" ON public.uploaded_files;
CREATE POLICY "uploaded_files_update_own" ON public.uploaded_files FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "uploaded_files_delete_own" ON public.uploaded_files;
CREATE POLICY "uploaded_files_delete_own" ON public.uploaded_files FOR DELETE USING (auth.uid() = user_id);

-- 6. GENERATED_ASSETS POLICIES (Strict access to own generated assets)
DROP POLICY IF EXISTS "generated_assets_select_own" ON public.generated_assets;
CREATE POLICY "generated_assets_select_own" ON public.generated_assets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "generated_assets_insert_own" ON public.generated_assets;
CREATE POLICY "generated_assets_insert_own" ON public.generated_assets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "generated_assets_delete_own" ON public.generated_assets;
CREATE POLICY "generated_assets_delete_own" ON public.generated_assets FOR DELETE USING (auth.uid() = user_id);

-- 7. BRAND_KITS POLICIES (Manage own brand kits)
DROP POLICY IF EXISTS "brand_kits_select_own" ON public.brand_kits;
CREATE POLICY "brand_kits_select_own" ON public.brand_kits FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "brand_kits_insert_own" ON public.brand_kits;
CREATE POLICY "brand_kits_insert_own" ON public.brand_kits FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "brand_kits_update_own" ON public.brand_kits;
CREATE POLICY "brand_kits_update_own" ON public.brand_kits FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "brand_kits_delete_own" ON public.brand_kits;
CREATE POLICY "brand_kits_delete_own" ON public.brand_kits FOR DELETE USING (auth.uid() = user_id);

-- 8. USAGE_EVENTS POLICIES (View own usage information)
DROP POLICY IF EXISTS "usage_events_select_own" ON public.usage_events;
CREATE POLICY "usage_events_select_own" ON public.usage_events FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "usage_events_insert_own" ON public.usage_events;
CREATE POLICY "usage_events_insert_own" ON public.usage_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- STORAGE BUCKETS SETUP (Private Buckets)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('uploads', 'uploads', false, 26214400, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv']),
    ('generated-assets', 'generated-assets', false, 52428800, ARRAY['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf', 'image/png', 'image/jpeg', 'image/svg+xml', 'application/json']),
    ('brand-assets', 'brand-assets', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Objects must be placed inside a folder named after auth.uid()
-- e.g. uploads/<user_id>/document.pdf
DROP POLICY IF EXISTS "storage_user_select_own" ON storage.objects;
CREATE POLICY "storage_user_select_own" ON storage.objects FOR SELECT
USING (
    bucket_id IN ('uploads', 'generated-assets', 'brand-assets')
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "storage_user_insert_own" ON storage.objects;
CREATE POLICY "storage_user_insert_own" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id IN ('uploads', 'generated-assets', 'brand-assets')
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "storage_user_delete_own" ON storage.objects;
CREATE POLICY "storage_user_delete_own" ON storage.objects FOR DELETE
USING (
    bucket_id IN ('uploads', 'generated-assets', 'brand-assets')
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);
