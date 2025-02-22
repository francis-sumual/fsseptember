import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const gatherings = await prisma.gathering.findMany({
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        date: "asc",
      },
    })
    return NextResponse.json(gatherings)
  } catch (error) {
    console.error("Error fetching gatherings:", error)
    return NextResponse.json({ error: "Error fetching gatherings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const gathering = await prisma.gathering.create({
      data: {
        name: body.name,
        date: new Date(body.date),
        location: body.location,
        description: body.description,
        capacity: Number.parseInt(body.capacity),
        status: body.status,
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })
    return NextResponse.json(gathering)
  } catch (error) {
    console.error("Error creating gathering:", error)
    return NextResponse.json({ error: "Error creating gathering" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const gathering = await prisma.gathering.update({
      where: { id: body.id },
      data: {
        name: body.name,
        date: new Date(body.date),
        location: body.location,
        description: body.description,
        capacity: Number.parseInt(body.capacity),
        status: body.status,
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })
    return NextResponse.json(gathering)
  } catch (error) {
    console.error("Error updating gathering:", error)
    return NextResponse.json({ error: "Error updating gathering" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    await prisma.gathering.delete({
      where: { id: Number(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting gathering:", error)
    return NextResponse.json({ error: "Error deleting gathering" }, { status: 500 })
  }
}

