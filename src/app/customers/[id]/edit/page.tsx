import type React from "react";
import { headers } from "next/headers";
import { EditCustomerForm } from "@/components/customers/EditCustomerForm";

type PageParams = { params: Promise<{ id: string }> };

async function fetchCustomer(id: string): Promise<{ id: string; first_name: string; last_name: string; phone: string; cash_or_loan: string; preferred_listing_type?: string | null; profession?: string | null } | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/customers/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = await res.json();
  const customer = j.customer;
  // profession bilgisini düzelt
  if (customer && customer.professions) {
    customer.profession = customer.professions.name;
    delete customer.professions;
  }
  return customer;
}

export default async function EditCustomerPage({ params }: PageParams): Promise<React.ReactElement> {
  const { id } = await params;
  const customer = await fetchCustomer(id);
  if (!customer) return <div className="max-w-5xl mx-auto p-6">Kayıt bulunamadı.</div>;
  return <EditCustomerForm customer={customer} />;
}