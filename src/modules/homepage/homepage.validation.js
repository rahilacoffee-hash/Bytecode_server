import { z } from "zod";

const text = (max = 5000) => z.string().trim().min(1).max(max);
const imageOrUrl = z
  .string()
  .max(8_000_000)
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\//i.test(value) ||
      /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(value),
    "Use an http(s) URL or an uploaded image."
  );
const link = z
  .string()
  .max(2000)
  .refine((value) => value === "#" || value === "" || /^https?:\/\//i.test(value), "Use an http(s) URL.");

const homepageSchema = z.object({
  hero: z.object({
    eyebrow: text(150),
    title: text(100),
    description: text(2000),
    scrollLabel: text(40),
    toolsLabel: text(40),
    backgroundVideo: link,
  }),
  about: z.object({
    eyebrow: text(150),
    heading: text(80),
    accentHeading: text(80),
    trailingHeading: text(80),
    description: text(2000),
    tags: z.array(text(50)).max(20),
    stats: z
      .array(
        z.object({
          value: z.number().int().min(0).max(99999),
          suffix: z.string().max(10),
          label: text(50),
        })
      )
      .min(1)
      .max(8),
  }),
  projects: z.object({
    eyebrow: text(150),
    heading: text(100),
    intro: text(1000),
    githubUrl: link,
    items: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          label: text(100),
          title: text(150),
          description: text(2000),
          tech: z.array(text(50)).max(20),
          image: imageOrUrl,
          github: link,
          live: link,
        })
      )
      .max(30),
  }),
  testimonials: z.object({
    eyebrow: text(150),
    heading: text(100),
    intro: text(1000),
    items: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          name: text(150),
          role: text(200),
          quote: text(2000),
          rating: z.number().int().min(1).max(5),
          color: z.string().regex(/^#[0-9a-f]{6}$/i),
        })
      )
      .min(1)
      .max(30),
  }),
});

export const updateHomepageSchema = z.object({ content: homepageSchema });
