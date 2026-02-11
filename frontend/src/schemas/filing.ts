import { z } from "zod";

export const filingCreateSchema = z.object({
  accession_number: z.string().min(1),
  form_type: z.string().min(1),
  filed_at: z.string(),
  accepted_at: z.string().nullable().default(null),
  filer_cik: z.string().min(1),
  filer_name: z.string().min(1),
  url: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const filingSchema = filingCreateSchema.extend({
  id: z.number().int(),
  full_text: z.string().nullable().default(null),
  embedding: z.array(z.number()).nullable().default(null),
  processed: z.boolean().default(false),
  created_at: z.string(),
});

export type FilingCreate = z.infer<typeof filingCreateSchema>;
export type Filing = z.infer<typeof filingSchema>;
