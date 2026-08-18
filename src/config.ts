import { z } from "zod";

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    EXTRACTION_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).default("gpt-5.6-luna"),
    OPENAI_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .max(60_000)
      .default(4500),
    MAX_FILE_SIZE_BYTES: z.coerce
      .number()
      .int()
      .min(1024)
      .max(25 * 1024 * 1024)
      .default(10 * 1024 * 1024),
    MAX_IMAGE_PIXELS: z.coerce
      .number()
      .int()
      .min(1)
      .max(100_000_000)
      .default(25_000_000),
  })
  .superRefine((environment, context) => {
    if (
      environment.EXTRACTION_PROVIDER === "openai" &&
      !environment.OPENAI_API_KEY
    ) {
      context.addIssue({
        code: "custom",
        path: ["OPENAI_API_KEY"],
        message: "OPENAI_API_KEY is required when EXTRACTION_PROVIDER=openai.",
      });
    }
  });

export type AppConfig = z.infer<typeof environmentSchema>;

export function loadConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AppConfig {
  return environmentSchema.parse(environment);
}
