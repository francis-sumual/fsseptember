import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        member: true,
        gathering: true,
        group: true,
      },
    })
    // Ensure we always return an array
    return NextResponse.json(Array.isArray(registrations) ? registrations : [])
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Error fetching registrations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check if registration already exists
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        memberId_gatheringId: {
          memberId: body.memberId,
          gatheringId: body.gatheringId,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "Member is already registered for this gathering" }, { status: 400 })
    }

    const registration = await prisma.registration.create({
      data: {
        memberId: body.memberId,
        gatheringId: body.gatheringId,
        groupId: body.groupId,
        status: body.status || "PENDING",
      },
      include: {
        member: true,
        gathering: true,
        group: true,
      },
    })

    return NextResponse.json(registration)
  } catch (error) {
    return NextResponse.json({ error: "Error creating registration" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const registration = await prisma.registration.update({
      where: { id: body.id },
      data: {
        status: body.status,
      },
      include: {
        member: true,
        gathering: true,
        group: true,
      },
    })
    return NextResponse.json(registration)
  } catch (error) {
    return NextResponse.json({ error: "Error updating registration" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    await prisma.registration.delete({
      where: { id: Number(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting registration" }, { status: 500 })
  }
}

