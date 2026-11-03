CREATE TYPE "public"."addon_text_kind" AS ENUM('NONE', 'NUMBER', 'MESSAGE');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('OWNER', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."order_kind" AS ENUM('QUICK', 'LIST');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('BARU_WA', 'MENUNGGU_BAYARAN', 'DISAHKAN', 'DALAM_PENYEDIAAN', 'SEDIA_DIAMBIL', 'DALAM_PENGHANTARAN', 'SELESAI', 'DIBATALKAN');--> statement-breakpoint
CREATE TYPE "public"."receive_mode" AS ENUM('PICKUP', 'DELIVERY');--> statement-breakpoint
CREATE SEQUENCE "public"."order_ref_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 24100 CACHE 1;--> statement-breakpoint
CREATE TABLE "addon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"price_sen" integer NOT NULL,
	"text_kind" "addon_text_kind" DEFAULT 'NONE' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_profile" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" "admin_role" DEFAULT 'STAFF' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"diff" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "closed_date" (
	"date" date PRIMARY KEY NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT false NOT NULL,
	"draft_question" text,
	"draft_answer" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"token" text NOT NULL,
	"kind" "order_kind" NOT NULL,
	"customer_name" text,
	"phone" text,
	"mode" "receive_mode",
	"area" text,
	"address" text,
	"date" date,
	"time_slot_id" uuid,
	"notes" text,
	"status" "order_status" DEFAULT 'BARU_WA' NOT NULL,
	"cake_subtotal_sen" integer NOT NULL,
	"addon_subtotal_sen" integer DEFAULT 0 NOT NULL,
	"delivery_fee_sen" integer,
	"total_sen" integer NOT NULL,
	"paid_at" timestamp with time zone,
	"wa_message" text NOT NULL,
	"ip_hash" text NOT NULL,
	"dedupe_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "order_addon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"addon_id" uuid NOT NULL,
	"name" text NOT NULL,
	"unit_price_sen" integer NOT NULL,
	"qty" integer NOT NULL,
	"text" text
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"size_label" text NOT NULL,
	"unit_price_sen" integer NOT NULL,
	"qty" integer NOT NULL,
	"cake_message" text
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category_id" uuid NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"lead_days" integer DEFAULT 3 NOT NULL,
	"allergens" text,
	"storage" text,
	"active" boolean DEFAULT true NOT NULL,
	"on_table" boolean DEFAULT false NOT NULL,
	"table_position" integer,
	"allow_design" boolean DEFAULT false NOT NULL,
	"allow_message" boolean DEFAULT true NOT NULL,
	"popularity" integer DEFAULT 0 NOT NULL,
	"table_image_url" text,
	"table_image_original_url" text,
	"table_image_draft_url" text,
	"draft" jsonb,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_size" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"label" text NOT NULL,
	"price_sen" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"key" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limit_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"min_lead_days" integer DEFAULT 3 NOT NULL,
	"daily_capacity" integer DEFAULT 12 NOT NULL,
	"delivery_areas" text[] DEFAULT ARRAY['Kuantan','Pekan']::text[] NOT NULL,
	"hold_hours" integer DEFAULT 48 NOT NULL,
	"whatsapp_number" text DEFAULT '601123023447' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"draft" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_slot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"starts_at" time NOT NULL,
	"ends_at" time NOT NULL,
	"capacity" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_time_slot_id_time_slot_id_fk" FOREIGN KEY ("time_slot_id") REFERENCES "public"."time_slot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_addon" ADD CONSTRAINT "order_addon_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_addon" ADD CONSTRAINT "order_addon_addon_id_addon_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addon"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_size" ADD CONSTRAINT "product_size_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "orders_date_idx" ON "orders" USING btree ("date");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_dedupe_idx" ON "orders" USING btree ("dedupe_key","created_at");--> statement-breakpoint
CREATE INDEX "order_addon_order_idx" ON "order_addon" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "product" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_table_idx" ON "product" USING btree ("on_table","table_position");--> statement-breakpoint
CREATE INDEX "product_image_product_idx" ON "product_image" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_size_product_idx" ON "product_size" USING btree ("product_id");