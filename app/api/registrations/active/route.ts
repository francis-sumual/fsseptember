import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      where: {
        gathering: {
          status: "ACTIVE",
        },
      },
      include: {
        member: true,
        gathering: true,
        group: true,
      },
    });
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(registrations) ? registrations : []);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ error: "Error fetching registrations" }, { status: 500 });
  }
}
