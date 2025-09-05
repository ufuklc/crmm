import { z } from "zod";

export const propertySchema = z.object({
  type: z.enum(["Daire", "İş Yeri", "Arsa"]),
  listing_type: z.enum(["Satılık", "Kiralık"]).superRefine((val, ctx) => {
    const parent = (ctx as unknown as { parent?: { type?: string } }).parent;
    const type = parent?.type;
    if (type === "Arsa" && val === "Kiralık") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Arsa kiralanamaz" });
    }
  }),
  city: z.string().min(1),
  district: z.string().min(1),
  neighborhood: z.string().min(1),
  price: z.number().nonnegative(),
  gross_m2: z.number().positive(),
  net_m2: z.number().positive().optional(),
  rooms: z.number().int().min(0).optional(),
  heating: z.string().optional(),
  building_age_range: z.tuple([z.number().int().min(0), z.number().int().min(0)]).optional(),
  credit: z.boolean().optional(),
  ensuite_bath: z.boolean().optional(),
  pool: z.boolean().optional(),
  dressing_room: z.boolean().optional(),
  furnished: z.boolean().optional(),
  bathroom_count: z.number().int().min(0).optional(),
  balcony: z.boolean().optional(),
  aspect: z.array(z.enum(["Kuzey","Güney","Doğu","Batı"]).or(z.string())).optional(),
  in_site: z.boolean().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;


