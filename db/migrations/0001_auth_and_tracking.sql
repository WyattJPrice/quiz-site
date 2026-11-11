CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "guest_merges" (
	"user_id" uuid NOT NULL,
	"device_id" text NOT NULL,
	"merged_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guest_merges_user_id_device_id_pk" PRIMARY KEY("user_id","device_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_progress" (
	"user_id" uuid NOT NULL,
	"study_set_id" uuid NOT NULL,
	"state" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_progress_user_id_study_set_id_pk" PRIMARY KEY("user_id","study_set_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"study_set_id" uuid NOT NULL,
	"mode" text NOT NULL,
	"answered" integer NOT NULL,
	"correct" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_results_mode_check" CHECK ("quiz_results"."mode" in ('learn', 'test')),
	CONSTRAINT "quiz_results_counts_check" CHECK ("quiz_results"."correct" >= 0 and "quiz_results"."correct" <= "quiz_results"."answered")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp with time zone,
	"image" text,
	"display_name" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_merges" ADD CONSTRAINT "guest_merges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_progress" ADD CONSTRAINT "quiz_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_progress" ADD CONSTRAINT "quiz_progress_study_set_id_study_sets_id_fk" FOREIGN KEY ("study_set_id") REFERENCES "public"."study_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_study_set_id_study_sets_id_fk" FOREIGN KEY ("study_set_id") REFERENCES "public"."study_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_results_user_created_idx" ON "quiz_results" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "quiz_results_study_set_idx" ON "quiz_results" USING btree ("study_set_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_display_name_lower_key" ON "users" USING btree (lower("display_name"));