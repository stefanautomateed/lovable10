import { z } from 'zod';

export const BlueprintSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pages: z.array(z.string()).optional(),
  components: z.array(z.string()).optional(),
  routes: z.array(z.string()).optional(),
  tech: z.object({
    framework: z.string(),
    ui: z.string().optional(),
    styling: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

export const FileChunkSchema = z.object({
  type: z.literal('file'),
  file: z.object({
    path: z.string().min(1),
    language: z.string().optional(),
    purpose: z.string().optional(),
    contents: z.string(),
  }),
});

export type FileChunk = z.infer<typeof FileChunkSchema>;

export const StreamMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('status'),
    message: z.string(),
  }),
  z.object({
    type: z.literal('blueprint'),
    blueprint: BlueprintSchema,
  }),
  FileChunkSchema,
  z.object({
    type: z.literal('file_update'),
    file: z.object({
      path: z.string(),
      diff: z.string().optional(),
      contents: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('complete'),
    metrics: z.object({
      tokens: z.number().optional(),
      files: z.number().optional(),
    }).optional(),
  }),
  z.object({
    type: z.literal('error'),
    message: z.string(),
    details: z.string().optional(),
  }),
]);

export type StreamMessage = z.infer<typeof StreamMessageSchema>;

export interface GeneratedFile {
  path: string;
  language?: string;
  purpose?: string;
  contents: string;
}
