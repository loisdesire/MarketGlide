-- Course modules (groups of lessons within a product)
CREATE TABLE course_modules (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID    NOT NULL REFERENCES platform_products(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual lessons
CREATE TABLE course_lessons (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID    NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  video_url   TEXT    NOT NULL DEFAULT '',
  duration_s  INTEGER NOT NULL DEFAULT 0,
  is_preview  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-user lesson progress
CREATE TABLE lesson_progress (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id  UUID    NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_modules_product   ON course_modules (product_id, sort_order);
CREATE INDEX idx_lessons_module    ON course_lessons  (module_id,  sort_order);
CREATE INDEX idx_progress_user     ON lesson_progress (user_id);
CREATE INDEX idx_progress_lesson   ON lesson_progress (lesson_id);

-- RLS
ALTER TABLE course_modules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Purchased users can read modules + lessons for their products
CREATE POLICY "course_modules_read" ON course_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_purchases up
      WHERE up.product_id = course_modules.product_id
        AND up.user_id = auth.uid()
        AND up.status = 'completed'
    )
    OR
    -- free preview: allow reading if any lesson in this module is a preview
    EXISTS (
      SELECT 1 FROM course_lessons cl
      WHERE cl.module_id = course_modules.id AND cl.is_preview = TRUE
    )
  );

CREATE POLICY "course_lessons_read" ON course_lessons FOR SELECT
  USING (
    is_preview = TRUE
    OR EXISTS (
      SELECT 1 FROM user_purchases up
      JOIN course_modules cm ON cm.id = course_lessons.module_id
      WHERE cm.product_id = up.product_id
        AND up.user_id = auth.uid()
        AND up.status = 'completed'
    )
  );

-- Users manage their own progress
CREATE POLICY "progress_own" ON lesson_progress FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
