-- ═══════════════════════════════════════════════════
-- GLOBAL ADMIN ESCALATION
-- Promotes all existing users to 'admin' role
-- ═══════════════════════════════════════════════════

UPDATE public.profiles SET role = 'admin';
