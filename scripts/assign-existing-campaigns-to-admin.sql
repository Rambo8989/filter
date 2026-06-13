-- ============================================================
-- Fix: campaigns created before per-user accounts existed have
-- websites.user_id = NULL, which made them visible to EVERY
-- logged-in user (including brand-new signups).
--
-- This assigns any campaign with a NULL user_id to the original
-- admin account (admin@example.com), so it stays visible only to
-- that account and new signups get a clean, empty dashboard.
-- ============================================================

UPDATE websites
SET user_id = (SELECT id FROM admin_users WHERE email = 'admin@example.com' LIMIT 1)
WHERE user_id IS NULL;
