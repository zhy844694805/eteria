-- 性能优化索引
-- 为SQLite数据库添加关键索引以提升查询性能

-- 纪念页查询优化
CREATE INDEX IF NOT EXISTS idx_memorial_slug ON memorials(slug);
CREATE INDEX IF NOT EXISTS idx_memorial_author ON memorials(authorId);
CREATE INDEX IF NOT EXISTS idx_memorial_type_status ON memorials(type, status);
CREATE INDEX IF NOT EXISTS idx_memorial_public ON memorials(isPublic, status);
CREATE INDEX IF NOT EXISTS idx_memorial_featured ON memorials(featured, status, createdAt);
CREATE INDEX IF NOT EXISTS idx_memorial_created ON memorials(createdAt);

-- 用户查询优化
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_provider ON users(provider, providerId);

-- 留言查询优化
CREATE INDEX IF NOT EXISTS idx_message_memorial ON messages(memorialId, createdAt);
CREATE INDEX IF NOT EXISTS idx_message_public ON messages(isPublic, isApproved);

-- 点蜡烛查询优化
CREATE INDEX IF NOT EXISTS idx_candle_memorial ON candles(memorialId, createdAt);
CREATE INDEX IF NOT EXISTS idx_candle_user_daily ON candles(userId, memorialId, DATE(createdAt));

-- 点赞查询优化
CREATE INDEX IF NOT EXISTS idx_like_user_memorial ON likes(userId, memorialId);

-- 图片查询优化
CREATE INDEX IF NOT EXISTS idx_image_memorial ON memorial_images(memorialId, isMain, "order");

-- 管理后台查询优化
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role, isActive);
CREATE INDEX IF NOT EXISTS idx_memorial_status_type ON memorials(status, type, createdAt);