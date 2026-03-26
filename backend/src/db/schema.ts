import { pgTable, serial, varchar, timestamp, integer, boolean, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username').notNull(),
  email: varchar('email').notNull().unique(),
  password_hash: varchar('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const curriculum = pgTable('curriculum', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  description: text('description'),
  user_id: integer('user_id').references(() => users.id),
});

export const disciplines = pgTable('disciplines', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  curriculum_id: integer('curriculum_id').references(() => curriculum.id),
});

export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  discipline_id: integer('discipline_id').references(() => disciplines.id),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  content: text('content').notNull(),
  topic_id: integer('topic_id').references(() => topics.id),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  question_text: text('question_text').notNull(),
  lesson_id: integer('lesson_id').references(() => lessons.id),
});

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  curriculum_id: integer('curriculum_id').references(() => curriculum.id),
});

export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  lesson_id: integer('lesson_id').references(() => lessons.id),
  status: boolean('status').notNull(),
});

export const gamification = pgTable('gamification', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  points: integer('points').notNull(),
  achievements: text('achievements'),
});

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  goal_description: text('goal_description').notNull(),
  target_date: timestamp('target_date').notNull(),
});

export const consent = pgTable('consent', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  consent_given: boolean('consent_given').notNull(),
  consent_date: timestamp('consent_date').defaultNow(),
});

export const institutions = pgTable('institutions', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  address: text('address'),
});

export const pdfs = pgTable('pdfs', {
  id: serial('id').primaryKey(),
  url: varchar('url').notNull(),
  topic_id: integer('topic_id').references(() => topics.id),
});

export const vadeMecum = pgTable('vade_mecum', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  topic_id: integer('topic_id').references(() => topics.id),
});

export const stats = pgTable('stats', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  metric: varchar('metric').notNull(),
  value: integer('value').notNull(),
});
