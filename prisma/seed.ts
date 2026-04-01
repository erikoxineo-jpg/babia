import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "barbearia-demo" },
    update: { onboardingStep: 5, onboardingCompleted: true },
    create: {
      name: "Barbearia Demo",
      slug: "barbearia-demo",
      phone: "11999999999",
      whatsapp: "5511999999999",
      email: "contato@barbearia-demo.com",
      address: "Rua Exemplo, 123",
      city: "São Paulo",
      state: "SP",
      plan: "professional",
      status: "active",
      onboardingStep: 5,
      onboardingCompleted: true,
    },
  });
  console.log(`Tenant: ${tenant.name}`);

  // 2. Owner user
  const passwordHash = await bcrypt.hash("123456", 10);

  const owner = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@barberflow.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Administrador",
      email: "admin@barberflow.com",
      phone: "11999999990",
      passwordHash,
      role: "owner",
    },
  });
  console.log(`Owner: ${owner.email}`);

  // Staff user for RBAC testing
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "staff@barberflow.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Recepcionista Demo",
      email: "staff@barberflow.com",
      phone: "11999999991",
      passwordHash,
      role: "receptionist",
    },
  });
  console.log("Receptionist: staff@barberflow.com");

  // 3. Professionals
  const profData = [
    { name: "Carlos Silva", phone: "11988881111", specialty: "Corte e Barba" },
    { name: "Ricardo Santos", phone: "11988882222", specialty: "Corte Degradê" },
    { name: "Bruno Ferreira", phone: "11988883333", specialty: "Barba e Tratamentos" },
  ];

  await prisma.professionalService.deleteMany({});
  await prisma.professionalBreak.deleteMany({});
  await prisma.professionalSchedule.deleteMany({});
  // Delete blocks before professionals
  await prisma.scheduleBlock.deleteMany({});
  await prisma.professional.deleteMany({ where: { tenantId: tenant.id } });

  const professionals = [];
  for (let i = 0; i < profData.length; i++) {
    const p = profData[i];
    const prof = await prisma.professional.create({
      data: {
        tenantId: tenant.id,
        name: p.name,
        phone: p.phone,
        specialty: p.specialty,
        isActive: true,
        displayOrder: i,
      },
    });
    professionals.push(prof);
    console.log(`Professional: ${prof.name}`);
  }

  // 4. Services (6 barbershop templates)
  await prisma.service.deleteMany({ where: { tenantId: tenant.id } });
  const serviceData = [
    { name: "Corte Masculino", duration: 30, price: 45, category: "Corte", interval: 5 },
    { name: "Corte Degradê", duration: 40, price: 55, category: "Corte", interval: 5 },
    { name: "Barba", duration: 20, price: 30, category: "Barba", interval: 5 },
    { name: "Combo (Corte + Barba)", duration: 50, price: 65, category: "Combo", interval: 5 },
    { name: "Hidratação Capilar", duration: 40, price: 55, category: "Tratamento", interval: 0 },
    { name: "Pigmentação", duration: 60, price: 80, category: "Tratamento", interval: 0 },
  ];

  const services = [];
  for (let i = 0; i < serviceData.length; i++) {
    const s = serviceData[i];
    const service = await prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: s.name,
        durationMinutes: s.duration,
        price: s.price,
        category: s.category,
        intervalMinutes: s.interval,
        isActive: true,
        displayOrder: i,
      },
    });
    services.push(service);
  }
  console.log(`${services.length} services created`);

  // 5. Link professionals to services
  for (const prof of professionals) {
    for (const svc of services) {
      await prisma.professionalService.create({
        data: { professionalId: prof.id, serviceId: svc.id },
      });
    }
  }

  // 6. Schedules (Mon-Sat 09:00-19:00) + Lunch break 12:00-13:00
  for (const prof of professionals) {
    for (let day = 1; day <= 6; day++) {
      await prisma.professionalSchedule.create({
        data: {
          professionalId: prof.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "19:00",
          isActive: true,
        },
      });
      await prisma.professionalBreak.create({
        data: {
          professionalId: prof.id,
          dayOfWeek: day,
          startTime: "12:00",
          endTime: "13:00",
        },
      });
    }
  }
  console.log("Schedules and breaks created");

  // 7. Clients (10 clients with varied statuses)
  const clientsData = [
    { name: "João Mendes", phone: "11977771111", email: "joao@email.com", status: "active" as const, visits: 12, spent: 540 },
    { name: "Pedro Oliveira", phone: "11977772222", email: "pedro@email.com", status: "active" as const, visits: 8, spent: 360 },
    { name: "Lucas Ferreira", phone: "11977773333", email: "lucas@email.com", status: "active" as const, visits: 15, spent: 675 },
    { name: "Marcos Souza", phone: "11977774444", email: "marcos@email.com", status: "active" as const, visits: 6, spent: 270 },
    { name: "Rafael Lima", phone: "11977775555", email: "rafael@email.com", status: "at_risk" as const, visits: 4, spent: 180 },
    { name: "Thiago Costa", phone: "11977776666", email: "thiago@email.com", status: "at_risk" as const, visits: 3, spent: 135 },
    { name: "André Rocha", phone: "11977777777", email: "andre@email.com", status: "inactive" as const, visits: 2, spent: 90 },
    { name: "Bruno Alves", phone: "11977778888", email: "bruno@email.com", status: "inactive" as const, visits: 1, spent: 45 },
    { name: "Diego Martins", phone: "11977779999", email: "diego@email.com", status: "active" as const, visits: 20, spent: 900 },
    { name: "Felipe Nascimento", phone: "11977770000", email: "felipe@email.com", status: "active" as const, visits: 10, spent: 450 },
  ];

  const clients = [];
  for (const c of clientsData) {
    const now = new Date();
    const daysAgo = c.status === "inactive" ? 60 : c.status === "at_risk" ? 35 : 7;
    const lastVisit = new Date(now);
    lastVisit.setDate(lastVisit.getDate() - daysAgo);

    const client = await prisma.client.upsert({
      where: { tenantId_phone: { tenantId: tenant.id, phone: c.phone } },
      update: {
        status: c.status,
        totalVisits: c.visits,
        totalSpent: c.spent,
        averageTicket: c.visits > 0 ? c.spent / c.visits : 0,
        lastVisit,
      },
      create: {
        tenantId: tenant.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        status: c.status,
        totalVisits: c.visits,
        totalSpent: c.spent,
        averageTicket: c.visits > 0 ? c.spent / c.visits : 0,
        firstVisit: new Date("2026-01-15"),
        lastVisit,
      },
    });
    clients.push(client);
  }
  console.log(`${clients.length} clients created`);

  // 8. Appointments - today and recent days
  await prisma.appointmentHistory.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.appointment.deleteMany({ where: { tenantId: tenant.id } });

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayDate = new Date(todayStr + "T00:00:00");

  // Today's appointments
  const todayAppts = [
    { clientIdx: 0, profIdx: 0, svcIdx: 0, time: "09:00", status: "completed" as const },
    { clientIdx: 1, profIdx: 0, svcIdx: 3, time: "09:35", status: "completed" as const },
    { clientIdx: 2, profIdx: 1, svcIdx: 0, time: "09:00", status: "confirmed" as const },
    { clientIdx: 3, profIdx: 1, svcIdx: 2, time: "09:35", status: "confirmed" as const },
    { clientIdx: 8, profIdx: 0, svcIdx: 0, time: "10:30", status: "confirmed" as const },
    { clientIdx: 9, profIdx: 2, svcIdx: 3, time: "14:00", status: "pending" as const },
    { clientIdx: 0, profIdx: 2, svcIdx: 0, time: "15:00", status: "pending" as const },
    { clientIdx: 4, profIdx: 0, svcIdx: 1, time: "14:00", status: "pending" as const },
  ];

  for (const apt of todayAppts) {
    const svc = services[apt.svcIdx];
    const endMinutes = timeToMin(apt.time) + svc.durationMinutes;
    const endTime = minToTime(endMinutes);

    await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        clientId: clients[apt.clientIdx].id,
        professionalId: professionals[apt.profIdx].id,
        serviceId: svc.id,
        date: todayDate,
        startTime: apt.time,
        endTime,
        status: apt.status,
        price: svc.price,
        source: "internal",
        ...(apt.status === "completed" && { completedAt: new Date() }),
        ...(apt.status === "confirmed" && { confirmedAt: new Date() }),
      },
    });
  }
  console.log(`${todayAppts.length} today's appointments created`);

  // Yesterday's appointments (all completed)
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);

  for (let i = 0; i < 5; i++) {
    const svc = services[i % services.length];
    const startMin = 540 + i * 60; // 09:00, 10:00, ...
    const endMin = startMin + svc.durationMinutes;

    await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        clientId: clients[i % clients.length].id,
        professionalId: professionals[i % professionals.length].id,
        serviceId: svc.id,
        date: yesterday,
        startTime: minToTime(startMin),
        endTime: minToTime(endMin),
        status: "completed",
        price: svc.price,
        source: "internal",
        completedAt: yesterday,
      },
    });
  }

  // A no-show from this week
  const twoDaysAgo = new Date(todayDate);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      clientId: clients[6].id, // André Rocha (inactive)
      professionalId: professionals[0].id,
      serviceId: services[0].id,
      date: twoDaysAgo,
      startTime: "10:00",
      endTime: "10:30",
      status: "no_show",
      price: services[0].price,
      source: "internal",
    },
  });
  console.log("Historical appointments created");

  // 9. Plans
  await prisma.clientPlan.deleteMany({});
  await prisma.plan.deleteMany({ where: { tenantId: tenant.id } });

  const planData = [
    { name: "Plano Mensal Corte", desc: "4 cortes por mês", price: 150, days: 30, sessions: 4 },
    { name: "Plano Mensal Premium", desc: "4 cortes + 4 barbas por mês", price: 250, days: 30, sessions: 8 },
    { name: "Plano Trimestral", desc: "12 cortes em 3 meses", price: 400, days: 90, sessions: 12 },
  ];

  for (const p of planData) {
    const plan = await prisma.plan.create({
      data: {
        tenantId: tenant.id,
        name: p.name,
        description: p.desc,
        price: p.price,
        durationDays: p.days,
        totalSessions: p.sessions,
        services: services.slice(0, 3).map((s) => s.id),
        isActive: true,
      },
    });

    // Link first plan to Diego (VIP client)
    if (p.name.includes("Premium")) {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + p.days);
      await prisma.clientPlan.create({
        data: {
          clientId: clients[8].id, // Diego
          planId: plan.id,
          sessionsTotal: p.sessions,
          sessionsUsed: 3,
          startDate: start,
          endDate: end,
        },
      });
    }
  }
  console.log("Plans created");

  // 10. Tenant settings
  await prisma.tenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      bookingAdvanceDays: 30,
      cancellationPolicyHours: 2,
      confirmationEnabled: true,
      reminderHoursBefore: 2,
      inactiveDaysThreshold: 45,
      workingDays: [1, 2, 3, 4, 5, 6],
    },
  });
  console.log("Settings created");

  console.log("\nSeed complete! Login: admin@barberflow.com / 123456");
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
