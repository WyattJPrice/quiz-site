CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_set_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"answer" text NOT NULL,
	"question_type" text DEFAULT 'fill_blank' NOT NULL,
	"category" text NOT NULL,
	"choices" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon_key" text,
	"test_at" date,
	"test_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon_key" text,
	"sort_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_study_set_id_study_sets_id_fk" FOREIGN KEY ("study_set_id") REFERENCES "public"."study_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_sets" ADD CONSTRAINT "study_sets_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "questions_study_set_id_idx" ON "questions" USING btree ("study_set_id");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_study_set_sort_order_key" ON "questions" USING btree ("study_set_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "study_sets_slug_key" ON "study_sets" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "study_sets_created_at_idx" ON "study_sets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "study_sets_subject_id_idx" ON "study_sets" USING btree ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "subjects_sort_order_idx" ON "subjects" USING btree ("sort_order");