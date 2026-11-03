import { sql } from 'drizzle-orm';
import {
  boolean, date, index, integer, jsonb, pgEnum, pgSequence, pgTable, primaryKey, text, time, timestamp, uuid,
} from 'drizzle-orm/pg-core';

export const orderStatus = pgEnum('order_status', [
  'BARU_WA', 'MENUNGGU_BAYARAN', 'DISAHKAN', 'DALAM_PENYEDIAAN', 'SEDIA_DIAMBIL', 'DALAM_PENGHANTARAN', 'SELESAI', 'DIBATALKAN',
]);
export const orderKind = pgEnum('order_kind', ['QUICK', 'LIST']);
export const receiveMode = pgEnum('receive_mode', ['PICKUP', 'DELIVERY']);
export const addonTextKind = pgEnum('addon_text_kind', ['NONE', 'NUMBER', 'MESSAGE']);
export const adminRole = pgEnum('admin_role', ['OWNER', 'STAFF']);

export const orderRefSeq = pgSequence('order_ref_seq', { startWith: 24100 });

const masa = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};

export const category = pgTable('category', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  sortOrder: integer().notNull().default(0),
});

export const product = pgTable('product', {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  categoryId: uuid().notNull().references(() => category.id),
  description: text().notNull().default(''),
  leadDays: integer().notNull().default(3),
  allergens: text(),
  storage: text(),
  active: boolean().notNull().default(true),
  onTable: boolean().notNull().default(false),
  tablePosition: integer(),
  allowDesign: boolean().notNull().default(false),
  allowMessage: boolean().notNull().default(true),
  popularity: integer().notNull().default(0),
  tableImageUrl: text(),
  tableImageOriginalUrl: text(),
  tableImageDraftUrl: text(),
  draft: jsonb(),
  publishedAt: timestamp({ withTimezone: true }),
  ...masa,
}, (t) => [index('product_category_idx').on(t.categoryId), index('product_table_idx').on(t.onTable, t.tablePosition)]);

export const productSize = pgTable('product_size', {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid().notNull().references(() => product.id, { onDelete: 'cascade' }),
  label: text().notNull(),
  priceSen: integer().notNull(),
  active: boolean().notNull().default(true),
  sortOrder: integer().notNull().default(0),
}, (t) => [index('product_size_product_idx').on(t.productId)]);

export const productImage = pgTable('product_image', {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid().notNull().references(() => product.id, { onDelete: 'cascade' }),
  url: text().notNull(),
  alt: text().notNull().default(''),
  sortOrder: integer().notNull().default(0),
}, (t) => [index('product_image_product_idx').on(t.productId)]);

export const addon = pgTable('addon', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  note: text().notNull().default(''),
  priceSen: integer().notNull(),
  textKind: addonTextKind().notNull().default('NONE'),
  active: boolean().notNull().default(true),
  sortOrder: integer().notNull().default(0),
});

export const settings = pgTable('settings', {
  id: integer().primaryKey().default(1),
  minLeadDays: integer().notNull().default(3),
  dailyCapacity: integer().notNull().default(12),
  deliveryAreas: text().array().notNull().default(sql`ARRAY['Kuantan','Pekan']::text[]`),
  holdHours: integer().notNull().default(48),
  whatsappNumber: text().notNull().default('601123023447'),
});

export const timeSlot = pgTable('time_slot', {
  id: uuid().primaryKey().defaultRandom(),
  label: text().notNull(),
  startsAt: time().notNull(),
  endsAt: time().notNull(),
  capacity: integer().notNull(),
  active: boolean().notNull().default(true),
  sortOrder: integer().notNull().default(0),
});

export const closedDate = pgTable('closed_date', {
  date: date({ mode: 'string' }).primaryKey(),
  reason: text(),
});

export const order = pgTable('orders', {
  id: uuid().primaryKey().defaultRandom(),
  ref: text().notNull().unique(),
  token: text().notNull(),
  kind: orderKind().notNull(),
  customerName: text(),
  phone: text(),
  mode: receiveMode(),
  area: text(),
  address: text(),
  date: date({ mode: 'string' }),
  timeSlotId: uuid().references(() => timeSlot.id),
  notes: text(),
  status: orderStatus().notNull().default('BARU_WA'),
  cakeSubtotalSen: integer().notNull(),
  addonSubtotalSen: integer().notNull().default(0),
  deliveryFeeSen: integer(),
  totalSen: integer().notNull(),
  paidAt: timestamp({ withTimezone: true }),
  waMessage: text().notNull(),
  ipHash: text().notNull(),
  dedupeKey: text().notNull(),
  ...masa,
}, (t) => [
  index('orders_date_idx').on(t.date),
  index('orders_status_idx').on(t.status),
  index('orders_dedupe_idx').on(t.dedupeKey, t.createdAt),
]);

export const orderItem = pgTable('order_item', {
  id: uuid().primaryKey().defaultRandom(),
  orderId: uuid().notNull().references(() => order.id, { onDelete: 'cascade' }),
  productId: uuid().notNull().references(() => product.id),
  productName: text().notNull(),
  sizeLabel: text().notNull(),
  unitPriceSen: integer().notNull(),
  qty: integer().notNull(),
  cakeMessage: text(),
}, (t) => [index('order_item_order_idx').on(t.orderId)]);

export const orderAddon = pgTable('order_addon', {
  id: uuid().primaryKey().defaultRandom(),
  orderId: uuid().notNull().references(() => order.id, { onDelete: 'cascade' }),
  addonId: uuid().notNull().references(() => addon.id),
  name: text().notNull(),
  unitPriceSen: integer().notNull(),
  qty: integer().notNull(),
  text: text(),
}, (t) => [index('order_addon_order_idx').on(t.orderId)]);

export const siteContent = pgTable('site_content', {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  draft: jsonb(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const faq = pgTable('faq', {
  id: uuid().primaryKey().defaultRandom(),
  question: text().notNull(),
  answer: text().notNull(),
  sortOrder: integer().notNull().default(0),
  visible: boolean().notNull().default(false),
  draftQuestion: text(),
  draftAnswer: text(),
});

export const adminProfile = pgTable('admin_profile', {
  userId: uuid().primaryKey(),
  name: text().notNull(),
  role: adminRole().notNull().default('STAFF'),
});

export const auditLog = pgTable('audit_log', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().notNull(),
  action: text().notNull(),
  entity: text().notNull(),
  entityId: text().notNull(),
  diff: jsonb().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('audit_entity_idx').on(t.entity, t.entityId)]);

export const rateLimit = pgTable('rate_limit', {
  key: text().notNull(),
  windowStart: timestamp({ withTimezone: true }).notNull(),
  count: integer().notNull().default(0),
}, (t) => [primaryKey({ columns: [t.key, t.windowStart] })]);

