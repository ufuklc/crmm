import { z } from "zod";

export const customerSchema = z.object({
  first_name: z.string().min(1, "Ad zorunlu"),
  last_name: z.string().min(1, "Soyad zorunlu"),
  phone: z.string().min(7, "Telefon geçersiz"),
  cash_or_loan: z.enum(["Nakit", "Kredi"]),
  profession: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;


