import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCategoryEnum = z.enum([
	'PLC Communication Patterns',
	'SCADA/MES Integration',
	'IIoT & Data Pipelines',
]);

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			heroImageUrl: z.string().optional(),
			category: blogCategoryEnum.optional(),
			whoIsItFor: z.string().optional(),
			startHere: z.boolean().optional(),
		}),
});

export const collections = { blog };
