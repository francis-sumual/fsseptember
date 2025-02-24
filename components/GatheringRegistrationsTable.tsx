/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Pagination } from "@/components/pagination";

type Registration = {
  id: number;
  memberId: number;
  gatheringId: number;
  member: {
    name: string;
    contact: string;
  };
  gathering: {
    name: string;
    date: string;
  };
  group: {
    name: string;
  };
  status: string;
};

type Member = {
  id: number;
  name: string;
  contact: string;
  groupId: number;
};

type Gathering = {
  id: number;
  name: string;
  date: string;
  status: string;
  capacity: number;
  _count?: {
    registrations: number;
  };
};

export function GatheringRegistrationsTable() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [formData, setFormData] = useState({
    memberId: "",
    gatheringId: "",
    status: "PENDING",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [registrationsRes, membersRes, gatheringsRes] = await Promise.all([
        fetch("/api/registrations"),
        fetch("/api/members"),
        fetch("/api/gatherings"),
      ]);

      if (!registrationsRes.ok || !membersRes.ok || !gatheringsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [registrationsData, membersData, gatheringsData] = await Promise.all([
        registrationsRes.json(),
        membersRes.json(),
        gatheringsRes.json(),
      ]);

      setRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setGatherings(Array.isArray(gatheringsData) ? gatheringsData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Get available members for a specific gathering
  const getAvailableMembersForGathering = (gatheringId: string) => {
    const registeredMemberIds = registrations
      .filter((r) => r.gatheringId === Number(gatheringId))
      .map((r) => r.memberId);

    return members.filter((member) => !registeredMemberIds.includes(member.id));
  };

  // Get available gatherings for a specific member
  const getAvailableGatheringsForMember = (memberId: string) => {
    const memberRegistrations = registrations.filter((r) => r.memberId === Number(memberId)).map((r) => r.gatheringId);

    return gatherings.filter(
      (gathering) =>
        gathering.status === "ACTIVE" &&
        !memberRegistrations.includes(gathering.id) &&
        (!gathering._count || gathering._count.registrations < gathering.capacity)
    );
  };

  // Calculate pagination values
  const totalItems = registrations.length;
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize);
  const paginatedRegistrations =
    pageSize === 0 ? registrations : registrations.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const member = members.find((m) => m.id === Number(formData.memberId));
      if (!member) throw new Error("Member not found");

      const gathering = gatherings.find((g) => g.id === Number(formData.gatheringId));
      if (!gathering) throw new Error("Gathering not found");

      // Additional validations for new registrations
      if (!editingRegistration) {
        // Check if gathering is active
        if (gathering.status !== "ACTIVE") {
          throw new Error("Cannot register for inactive gathering");
        }

        // Check if gathering has reached capacity
        if (gathering._count && gathering._count.registrations >= gathering.capacity) {
          throw new Error("Gathering has reached capacity");
        }

        // Check if member is already registered
        const existingRegistration = registrations.find(
          (r) => r.memberId === Number(formData.memberId) && r.gatheringId === Number(formData.gatheringId)
        );
        if (existingRegistration) {
          throw new Error("Member is already registered for this gathering");
        }
      }

      const payload = {
        ...formData,
        memberId: Number(formData.memberId),
        gatheringId: Number(formData.gatheringId),
        groupId: member.groupId,
      };

      if (editingRegistration) {
        const response = await fetch("/api/registrations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingRegistration.id }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update registration");
        }
      } else {
        const response = await fetch("/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create registration");
        }
      }

      setIsOpen(false);
      setEditingRegistration(null);
      setFormData({
        memberId: "",
        gatheringId: "",
        status: "PENDING",
      });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/registrations?id=${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete registration");
      }
      fetchData();
    } catch (err) {
      console.error("Error deleting registration:", err);
      setError("Failed to delete registration");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch("/api/registrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      fetchData();
    } catch (err) {
      console.error("Error updating registration status:", err);
      setError("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingRegistration(null);
                setFormData({
                  memberId: "",
                  gatheringId: "",
                  status: "PENDING",
                });
                setError("");
              }}
            >
              Add Registration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRegistration ? "Edit Registration" : "Add Registration"}</DialogTitle>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="gatheringId">Gathering</Label>
                <Select
                  value={formData.gatheringId}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      gatheringId: value,
                      memberId: "", // Reset member selection when gathering changes
                    });
                  }}
                  disabled={Boolean(editingRegistration)} // Disable when editing
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a gathering" />
                  </SelectTrigger>
                  <SelectContent>
                    {gatherings
                      .filter((g) => g.status === "ACTIVE")
                      .map((gathering) => (
                        <SelectItem key={gathering.id} value={gathering.id.toString()}>
                          {gathering.name} ({format(new Date(gathering.date), "PPp")})
                          <span className="ml-2 text-muted-foreground">
                            ({gathering._count?.registrations || 0}/{gathering.capacity})
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="memberId">Member</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) => setFormData({ ...formData, memberId: value })}
                  disabled={!formData.gatheringId || Boolean(editingRegistration)} // Disable when no gathering selected or editing
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.gatheringId ? "Select a member" : "Select a gathering first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.gatheringId ? getAvailableMembersForGathering(formData.gatheringId) : []).map(
                      (member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name} ({member.contact})
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {formData.gatheringId && getAvailableMembersForGathering(formData.gatheringId).length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    All members are already registered for this gathering
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={!formData.memberId || !formData.gatheringId}>
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">No registrations found</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Gathering</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>{registration.member.name}</TableCell>
                    <TableCell>{registration.member.contact}</TableCell>
                    <TableCell>{registration.gathering.name}</TableCell>
                    <TableCell>{format(new Date(registration.gathering.date), "PPp")}</TableCell>
                    <TableCell>{registration.group.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          registration.status === "CONFIRMED"
                            ? "default"
                            : registration.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {registration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setEditingRegistration(registration);
                          setFormData({
                            memberId: registration.memberId.toString(),
                            gatheringId: registration.gatheringId.toString(),
                            status: registration.status,
                          });
                          setError("");
                          setIsOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(registration.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
