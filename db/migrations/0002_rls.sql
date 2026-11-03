-- Supabase dedahkan skema public melalui REST (PostgREST) kepada kunci anon yang awam.
-- RLS tanpa polisi menolak semua akses anon/authenticated. Aplikasi bersambung sebagai pemilik
-- jadual (DATABASE_URL), jadi tidak terjejas.
ALTER TABLE "category" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_size" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_image" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "addon" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "time_slot" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "closed_date" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_item" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_addon" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_content" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "faq" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rate_limit" ENABLE ROW LEVEL SECURITY;
