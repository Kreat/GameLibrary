CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"content" text NOT NULL,
	"sender_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chat_messages_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "content_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" integer NOT NULL,
	"content_type" text NOT NULL,
	"content_id" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending',
	"action_taken" text,
	"admin_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"icon_name" text,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "forum_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"views" integer DEFAULT 0,
	"is_pinned" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_post_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"min_players" integer,
	"max_players" integer,
	"complexity" text,
	"play_time" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"is_host" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"target_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"content" text,
	"is_host_review" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"game_id" integer,
	"game_type" text NOT NULL,
	"game_name" text NOT NULL,
	"host_id" integer NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"location_notes" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration" text,
	"recurring" text DEFAULT 'once',
	"min_players" integer NOT NULL,
	"max_players" integer NOT NULL,
	"current_players" integer DEFAULT 1 NOT NULL,
	"experience_level" text NOT NULL,
	"is_beginner_friendly" boolean DEFAULT false NOT NULL,
	"host_photo_url" text,
	"host_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"host_data" json,
	"participants_data" json
);
--> statement-breakpoint
CREATE TABLE "user_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"weekday_morning" boolean DEFAULT false,
	"weekday_afternoon" boolean DEFAULT false,
	"weekday_evening" boolean DEFAULT false,
	"weekend_morning" boolean DEFAULT false,
	"weekend_afternoon" boolean DEFAULT false,
	"weekend_evening" boolean DEFAULT false,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"sessions_hosted" integer DEFAULT 0 NOT NULL,
	"sessions_joined" integer DEFAULT 0 NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"host_rating" integer DEFAULT 0 NOT NULL,
	"player_rating" integer DEFAULT 0 NOT NULL,
	"reviews_received" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"bio" text,
	"location" text,
	"favorite_games" text,
	"photo_url" text,
	"role" text DEFAULT 'user',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"firebase_uid" text,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_firebase_uid_unique" UNIQUE("firebase_uid")
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_thread_id_forum_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."forum_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reviews" ADD CONSTRAINT "session_reviews_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reviews" ADD CONSTRAINT "session_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reviews" ADD CONSTRAINT "session_reviews_target_id_users_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_availability" ADD CONSTRAINT "user_availability_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;