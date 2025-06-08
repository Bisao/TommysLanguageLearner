
-- Add foreign key constraints
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE;
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX "idx_user_progress_user_id" ON "user_progress"("user_id");
CREATE INDEX "idx_user_progress_lesson_id" ON "user_progress"("lesson_id");
CREATE INDEX "idx_user_progress_completed" ON "user_progress"("completed");
CREATE INDEX "idx_user_stats_user_id" ON "user_stats"("user_id");
CREATE INDEX "idx_user_stats_date" ON "user_stats"("date");
CREATE INDEX "idx_lessons_category" ON "lessons"("category");
CREATE INDEX "idx_lessons_level" ON "lessons"("level");
CREATE INDEX "idx_lessons_order" ON "lessons"("order");

-- Add unique constraint for user progress per lesson
ALTER TABLE "user_progress" ADD CONSTRAINT "unique_user_lesson" UNIQUE("user_id", "lesson_id");

-- Add unique constraint for user stats per date
ALTER TABLE "user_stats" ADD CONSTRAINT "unique_user_date" UNIQUE("user_id", "date");

-- Add check constraints for validation
ALTER TABLE "lessons" ADD CONSTRAINT "check_level_positive" CHECK ("level" > 0);
ALTER TABLE "lessons" ADD CONSTRAINT "check_xp_reward_positive" CHECK ("xp_reward" >= 0);
ALTER TABLE "lessons" ADD CONSTRAINT "check_order_positive" CHECK ("order" > 0);
ALTER TABLE "user_progress" ADD CONSTRAINT "check_score_range" CHECK ("score" >= 0 AND "score" <= 100);
ALTER TABLE "user_progress" ADD CONSTRAINT "check_attempts_positive" CHECK ("attempts" >= 0);
ALTER TABLE "user_progress" ADD CONSTRAINT "check_time_spent_positive" CHECK ("time_spent" >= 0);
ALTER TABLE "users" ADD CONSTRAINT "check_level_positive" CHECK ("level" > 0);
ALTER TABLE "users" ADD CONSTRAINT "check_total_xp_positive" CHECK ("total_xp" >= 0);
ALTER TABLE "users" ADD CONSTRAINT "check_streak_positive" CHECK ("streak" >= 0);
ALTER TABLE "users" ADD CONSTRAINT "check_daily_goal_positive" CHECK ("daily_goal" > 0);
