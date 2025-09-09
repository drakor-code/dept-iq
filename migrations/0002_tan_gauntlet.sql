ALTER TABLE "system_settings" ADD COLUMN "company_logo_webp" text;--> statement-breakpoint
ALTER TABLE "system_settings" ADD COLUMN "company_logo_png" text;--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "company_logo";