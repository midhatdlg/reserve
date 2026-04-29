-- Photo roles for dedicated section slots (hero, story, schedule, etc.)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS role TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS photos_role_unique ON photos(wedding_id, role) WHERE role IS NOT NULL;

-- Free-text content for template sections (love story, ceremony details, etc.)
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS template_content JSONB NOT NULL DEFAULT '{}';
