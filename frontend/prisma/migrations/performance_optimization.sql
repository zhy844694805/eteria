-- 性能优化 SQL 迁移
-- 为经常查询的字段添加索引

-- 用户表优化索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(isBanned);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(lastLoginAt);

-- 纪念页表优化索引
CREATE INDEX IF NOT EXISTS idx_memorials_type ON memorials(type);
CREATE INDEX IF NOT EXISTS idx_memorials_status ON memorials(status);
CREATE INDEX IF NOT EXISTS idx_memorials_author_id ON memorials(authorId);
CREATE INDEX IF NOT EXISTS idx_memorials_slug ON memorials(slug);
CREATE INDEX IF NOT EXISTS idx_memorials_is_public ON memorials(isPublic);
CREATE INDEX IF NOT EXISTS idx_memorials_featured ON memorials(featured);
CREATE INDEX IF NOT EXISTS idx_memorials_created_at ON memorials(createdAt);
CREATE INDEX IF NOT EXISTS idx_memorials_updated_at ON memorials(updatedAt);
CREATE INDEX IF NOT EXISTS idx_memorials_published_at ON memorials(publishedAt);
CREATE INDEX IF NOT EXISTS idx_memorials_view_count ON memorials(viewCount);

-- 复合索引 - 常见查询组合
CREATE INDEX IF NOT EXISTS idx_memorials_type_status_public ON memorials(type, status, isPublic);
CREATE INDEX IF NOT EXISTS idx_memorials_author_type ON memorials(authorId, type);
CREATE INDEX IF NOT EXISTS idx_memorials_public_created ON memorials(isPublic, createdAt DESC);

-- 纪念页图片表优化索引
CREATE INDEX IF NOT EXISTS idx_memorial_images_memorial_id ON memorial_images(memorialId);
CREATE INDEX IF NOT EXISTS idx_memorial_images_is_main ON memorial_images(isMain);
CREATE INDEX IF NOT EXISTS idx_memorial_images_order ON memorial_images("order");
CREATE INDEX IF NOT EXISTS idx_memorial_images_memorial_main ON memorial_images(memorialId, isMain, "order");

-- 留言表优化索引
CREATE INDEX IF NOT EXISTS idx_messages_memorial_id ON messages(memorialId);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(userId);
CREATE INDEX IF NOT EXISTS idx_messages_is_public ON messages(isPublic);
CREATE INDEX IF NOT EXISTS idx_messages_is_approved ON messages(isApproved);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(createdAt);
CREATE INDEX IF NOT EXISTS idx_messages_memorial_public_approved ON messages(memorialId, isPublic, isApproved);

-- 蜡烛表优化索引
CREATE INDEX IF NOT EXISTS idx_candles_memorial_id ON candles(memorialId);
CREATE INDEX IF NOT EXISTS idx_candles_user_id ON candles(userId);
CREATE INDEX IF NOT EXISTS idx_candles_created_at ON candles(createdAt);

-- 点赞表优化索引
CREATE INDEX IF NOT EXISTS idx_likes_memorial_id ON likes(memorialId);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(userId);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(createdAt);

-- 数字生命表优化索引
CREATE INDEX IF NOT EXISTS idx_digital_lives_creator_id ON digital_lives(creatorId);
CREATE INDEX IF NOT EXISTS idx_digital_lives_memorial_id ON digital_lives(memorialId);
CREATE INDEX IF NOT EXISTS idx_digital_lives_status ON digital_lives(status);
CREATE INDEX IF NOT EXISTS idx_digital_lives_is_public ON digital_lives(isPublic);
CREATE INDEX IF NOT EXISTS idx_digital_lives_created_at ON digital_lives(createdAt);

-- 数字生命对话表优化索引
CREATE INDEX IF NOT EXISTS idx_digital_life_conversations_digital_life_id ON digital_life_conversations(digitalLifeId);
CREATE INDEX IF NOT EXISTS idx_digital_life_conversations_user_id ON digital_life_conversations(userId);
CREATE INDEX IF NOT EXISTS idx_digital_life_conversations_created_at ON digital_life_conversations(createdAt);

-- 图片生成表优化索引（只在表存在时创建）
-- CREATE INDEX IF NOT EXISTS idx_image_generations_creator_id ON image_generations(creatorId);
-- CREATE INDEX IF NOT EXISTS idx_image_generations_memorial_id ON image_generations(memorialId);
-- CREATE INDEX IF NOT EXISTS idx_image_generations_digital_life_id ON image_generations(digitalLifeId);
-- CREATE INDEX IF NOT EXISTS idx_image_generations_status ON image_generations(status);
-- CREATE INDEX IF NOT EXISTS idx_image_generations_task_id ON image_generations(taskId);
-- CREATE INDEX IF NOT EXISTS idx_image_generations_created_at ON image_generations(createdAt);

-- 管理日志表优化索引
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(adminId);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(createdAt);

-- 内容审核表优化索引
CREATE INDEX IF NOT EXISTS idx_content_reviews_type ON content_reviews(type);
CREATE INDEX IF NOT EXISTS idx_content_reviews_status ON content_reviews(status);
CREATE INDEX IF NOT EXISTS idx_content_reviews_target_id ON content_reviews(targetId);
CREATE INDEX IF NOT EXISTS idx_content_reviews_reviewer_id ON content_reviews(reviewerId);
CREATE INDEX IF NOT EXISTS idx_content_reviews_created_at ON content_reviews(createdAt);

-- 全文搜索支持（SQLite FTS） - 简化版本
-- 为纪念页内容创建全文搜索表
CREATE VIRTUAL TABLE IF NOT EXISTS memorials_fts USING fts5(
  memorial_id,
  title,
  subject_name,
  story,
  breed,
  occupation
);

-- 查询性能分析支持
-- ANALYZE;