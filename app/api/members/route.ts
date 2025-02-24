import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    const query = groupId ? { where: { groupId: Number(groupId) } } : {};

    const members = await prisma.member.findMany({
      ...query,
      include: {
        group: true,
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Error fetching members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.groupId) {
      return NextResponse.json({ error: "Name and group are required" }, { status: 400 });
    }

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: Number(body.groupId) },
    });

    if (!group) {
      return NextResponse.json({ error: "Selected group does not exist" }, { status: 400 });
    }

    const member = await prisma.member.create({
      data: {
        name: body.name,
        groupId: Number(body.groupId),
        contact: body.contact || "", // Make contact optional
      },
      include: {
        group: true,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ error: "Error creating member" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("Updating member with data:", body);

    const member = await prisma.member.update({
      where: { id: body.id },
      data: {
        name: body.name,
        contact: body.contact,
        groupId: body.groupId,
      },
      include: {
        group: true,
      },
    });

    console.log("Member updated:", member);
    return NextResponse.json(member);
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json({ error: "Error updating member" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    console.log("Deleting member with id:", id);

    await prisma.member.delete({
      where: { id: Number(id) },
    });

    console.log("Member deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json({ error: "Error deleting member" }, { status: 500 });
  }
}
