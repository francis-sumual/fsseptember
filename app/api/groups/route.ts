import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const groups = await prisma.group.findMany()
  return NextResponse.json(groups)
}

export async function POST(request: Request) {
  const body = await request.json()
  const group = await prisma.group.create({
    data: {
      name: body.name,
    },
  })
  return NextResponse.json(group)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const group = await prisma.group.update({
    where: { id: body.id },
    data: {
      name: body.name,
    },
  })
  return NextResponse.json(group)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const group = await prisma.group.delete({
    where: { id: Number(id) },
  })
  return NextResponse.json(group)
}

