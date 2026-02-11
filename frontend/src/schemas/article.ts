import { z } from "zod";

export const articleCreateSchema = z.object({
  source_id: z.number().int(),
  url: z.string().min(1),
  title: z.string().min(1),
  author: z.string().nullable().default(null),
  published_at: z.string().nullable().default(null),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const articleSchema = articleCreateSchema.extend({
  id: z.number().int(),
  content: z.string().nullable().default(null),
  embedding: z.array(z.number()).nullable().default(null),
  processed: z.boolean().default(false),
  created_at: z.string(),
});

export type ArticleCreate = z.infer<typeof articleCreateSchema>;
export type Article = z.infer<typeof articleSchema>;
