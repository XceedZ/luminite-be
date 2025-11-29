-- Initial migration: Create users table with username
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer DEFAULT 1 NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text DEFAULT '' NOT NULL,
	"fullname" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '',
	"private_key" text DEFAULT '',
	"active" text DEFAULT 'Y' NOT NULL,
	"active_datetime" text DEFAULT '',
	"non_active_datetime" text DEFAULT '',
	"create_user_id" integer DEFAULT -1 NOT NULL,
	"update_user_id" integer DEFAULT -1,
	"create_datetime" text DEFAULT '',
	"update_datetime" text DEFAULT '',
	"version" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
