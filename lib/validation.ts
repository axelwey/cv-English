import { z } from "zod";

const bilingualText = z.object({
  nl: z.string().max(2000),
  en: z.string().max(2000),
});

export const timelineItemSchema = z.object({
  id: z.string().min(1).max(50),
  order: z.number().int().min(0),
  year: bilingualText,
  title: bilingualText,
  desc: bilingualText,
});

export const timelineDataSchema = z.object({
  items: z.array(timelineItemSchema).max(100),
});

export const projectItemSchema = z.object({
  id: z.string().min(1).max(50),
  order: z.number().int().min(0),
  title: bilingualText,
  desc: bilingualText,
  file: z.string().max(200),
});

export const projectsDataSchema = z.object({
  githubUrl: z.string().url().max(200),
  items: z.array(projectItemSchema).max(50),
});

export const homeBlockSchema = z.object({
  id: z.string().min(1).max(50),
  order: z.number().int().min(0),
  title: bilingualText,
  text: bilingualText,
});

export const homeDataSchema = z.object({
  heroTitle: z.string().min(1).max(100),
  blocks: z.array(homeBlockSchema).max(20),
});
