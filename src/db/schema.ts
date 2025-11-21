import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  tenant_id: integer('tenant_id').notNull().default(1),
  email: text('email').notNull().unique(),
  password: text('password').notNull().default(''),
  fullname: text('fullname').notNull().default(''),
  phone: text('phone').default(''),
  private_key: text('private_key').default(''),
  active: text('active').notNull().default('Y'),
  active_datetime: text('active_datetime').default(''),
  non_active_datetime: text('non_active_datetime').default(''),
  create_user_id: integer('create_user_id').notNull().default(-1),
  update_user_id: integer('update_user_id').default(-1),
  create_datetime: text('create_datetime').default(''),
  update_datetime: text('update_datetime').default(''),
  version: integer('version').notNull().default(0),
});