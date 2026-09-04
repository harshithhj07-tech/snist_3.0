-- ====================================================================
-- Bharat Navigator - Supabase Row Level Security (RLS) Policies
-- Migration: 20260904130001_enable_rls_policies.sql
-- Description: Translates Firestore security rules (isOwner(userId))
--              into PostgreSQL Row Level Security (RLS) policies.
--              Every table is Deny-by-Default and strictly scoped to auth.uid().
-- ====================================================================

-- 1. Enable RLS on All Tables (Deny-by-default)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orchestrator_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_source_versions ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Policy Helper Logic:
-- Citizen is authorized if auth.uid() matches user_id (or id for users table)
-- or if the verified JWT email claim matches (mirroring isOwner rule in Firestore).
-- --------------------------------------------------------------------

-- 2. Users Table RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (
    auth.uid()::text = id 
    OR (auth.jwt() ->> 'email') = id 
    OR (auth.jwt() ->> 'email') = email
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = id 
    OR (auth.jwt() ->> 'email') = id 
    OR (auth.jwt() ->> 'email') = email
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (
    auth.uid()::text = id 
    OR (auth.jwt() ->> 'email') = id 
    OR (auth.jwt() ->> 'email') = email
  )
  WITH CHECK (
    auth.uid()::text = id 
    OR (auth.jwt() ->> 'email') = id 
    OR (auth.jwt() ->> 'email') = email
  );

-- 3. Roadmaps Table RLS
DROP POLICY IF EXISTS "Users can view own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can view own roadmaps" ON public.roadmaps
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can insert own roadmaps" ON public.roadmaps
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can update own roadmaps" ON public.roadmaps
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own roadmaps" ON public.roadmaps;
CREATE POLICY "Users can delete own roadmaps" ON public.roadmaps
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 4. Documents Table RLS
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 5. Notifications Table RLS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 6. Bookmarks Table RLS
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can update own bookmarks" ON public.bookmarks
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 7. Timeline Events Table RLS
DROP POLICY IF EXISTS "Users can view own timeline events" ON public.timeline_events;
CREATE POLICY "Users can view own timeline events" ON public.timeline_events
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own timeline events" ON public.timeline_events;
CREATE POLICY "Users can insert own timeline events" ON public.timeline_events
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own timeline events" ON public.timeline_events;
CREATE POLICY "Users can update own timeline events" ON public.timeline_events
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own timeline events" ON public.timeline_events;
CREATE POLICY "Users can delete own timeline events" ON public.timeline_events
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 8. Consent Permissions Table RLS
DROP POLICY IF EXISTS "Users can view own consent permissions" ON public.consent_permissions;
CREATE POLICY "Users can view own consent permissions" ON public.consent_permissions
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own consent permissions" ON public.consent_permissions;
CREATE POLICY "Users can insert own consent permissions" ON public.consent_permissions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own consent permissions" ON public.consent_permissions;
CREATE POLICY "Users can update own consent permissions" ON public.consent_permissions
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own consent permissions" ON public.consent_permissions;
CREATE POLICY "Users can delete own consent permissions" ON public.consent_permissions
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 9. Messages Table RLS
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
CREATE POLICY "Users can insert own messages" ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete own messages" ON public.messages
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 10. AI Conversations Table RLS
DROP POLICY IF EXISTS "Users can view own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can view own AI conversations" ON public.ai_conversations
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can insert own AI conversations" ON public.ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can update own AI conversations" ON public.ai_conversations
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can delete own AI conversations" ON public.ai_conversations
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 11. Chat History Table RLS
DROP POLICY IF EXISTS "Users can view own chat history" ON public.chat_history;
CREATE POLICY "Users can view own chat history" ON public.chat_history
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own chat history" ON public.chat_history;
CREATE POLICY "Users can insert own chat history" ON public.chat_history
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own chat history" ON public.chat_history;
CREATE POLICY "Users can delete own chat history" ON public.chat_history
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 12. Activity Logs Table RLS
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
CREATE POLICY "Users can insert own activity logs" ON public.activity_logs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own activity logs" ON public.activity_logs;
CREATE POLICY "Users can delete own activity logs" ON public.activity_logs
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 13. Eligibility Checks Table RLS
DROP POLICY IF EXISTS "Users can view own eligibility checks" ON public.eligibility_checks;
CREATE POLICY "Users can view own eligibility checks" ON public.eligibility_checks
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own eligibility checks" ON public.eligibility_checks;
CREATE POLICY "Users can insert own eligibility checks" ON public.eligibility_checks
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own eligibility checks" ON public.eligibility_checks;
CREATE POLICY "Users can delete own eligibility checks" ON public.eligibility_checks
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 14. App Data Table RLS
DROP POLICY IF EXISTS "Users can view own app data" ON public.app_data;
CREATE POLICY "Users can view own app data" ON public.app_data
  FOR SELECT
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can insert own app data" ON public.app_data;
CREATE POLICY "Users can insert own app data" ON public.app_data
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can update own app data" ON public.app_data;
CREATE POLICY "Users can update own app data" ON public.app_data
  FOR UPDATE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id)
  WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

DROP POLICY IF EXISTS "Users can delete own app data" ON public.app_data;
CREATE POLICY "Users can delete own app data" ON public.app_data
  FOR DELETE
  USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'email') = user_id);

-- 15. Orchestrator Runs Table RLS
DROP POLICY IF EXISTS "Users can view own orchestrator runs" ON public.orchestrator_runs;
CREATE POLICY "Users can view own orchestrator runs" ON public.orchestrator_runs
  FOR SELECT
  USING (
    user_id IS NULL 
    OR auth.uid()::text = user_id 
    OR (auth.jwt() ->> 'email') = user_id 
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Users can manage own orchestrator runs" ON public.orchestrator_runs;
CREATE POLICY "Users can manage own orchestrator runs" ON public.orchestrator_runs
  FOR ALL
  USING (
    user_id IS NULL 
    OR auth.uid()::text = user_id 
    OR (auth.jwt() ->> 'email') = user_id 
    OR auth.role() = 'service_role'
  );

-- 16. Public Reference Tables (Government Sources Registry)
DROP POLICY IF EXISTS "Public can view government sources" ON public.government_sources;
CREATE POLICY "Public can view government sources" ON public.government_sources
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage government sources" ON public.government_sources;
CREATE POLICY "Authenticated users can manage government sources" ON public.government_sources
  FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Public can view government source versions" ON public.government_source_versions;
CREATE POLICY "Public can view government source versions" ON public.government_source_versions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage source versions" ON public.government_source_versions;
CREATE POLICY "Authenticated users can manage source versions" ON public.government_source_versions
  FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
