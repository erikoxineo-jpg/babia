import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true, city: true, state: true },
  });

  if (!tenant) {
    return { title: "Agendar" };
  }

  const location = [tenant.city, tenant.state].filter(Boolean).join("/");
  const title = `Agendar - ${tenant.name}`;
  const description = `Agende seu horário na ${tenant.name}${location ? ` em ${location}` : ""}. Rápido, fácil e sem precisar ligar.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function PublicBookingLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
