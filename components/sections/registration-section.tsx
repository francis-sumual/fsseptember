"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type Group = {
  id: number;
  name: string;
};

type Member = {
  id: number;
  name: string;
  groupId: number;
};

type Gathering = {
  id: number;
  name: string;
  date: string;
  location: string;
  capacity: number;
  status: "ACTIVE" | "NOT_ACTIVE";
  _count?: {
    registrations: number;
  };
};

type Registration = {
  id: number;
  memberId: number;
  gatheringId: number;
};

export function RegistrationSection() {
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoadingGatherings, setIsLoadingGatherings] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [formData, setFormData] = useState({
    gatheringId: "",
    groupId: "",
    memberId: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchGatherings(), fetchGroups(), fetchRegistrations()]);
  }, []);

  const fetchGatherings = async () => {
    try {
      setIsLoadingGatherings(true);
      const response = await fetch("/api/gatherings");
      if (!response.ok) throw new Error("Failed to fetch gatherings");
      const data = await response.json();
      // Filter only active gatherings that aren't full
      const activeGatherings = data.filter(
        (g: Gathering) => g.status === "ACTIVE" && (!g._count || g._count.registrations < g.capacity)
      );
      setGatherings(activeGatherings);
    } catch (err) {
      console.error("Error fetching gatherings:", err);
      setError("Failed to load gatherings");
    } finally {
      setIsLoadingGatherings(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("Failed to load groups");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations");
      if (!response.ok) throw new Error("Failed to fetch registrations");
      const data = await response.json();
      setRegistrations(data);
    } catch (err) {
      console.error("Error fetching registrations:", err);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      setIsLoadingMembers(true);
      const response = await fetch(`/api/members?groupId=${groupId}`);
      if (!response.ok) throw new Error("Failed to fetch members");
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members");
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleGroupChange = (groupId: string) => {
    setFormData({ ...formData, groupId, memberId: "" }); // Reset member selection
    if (groupId) {
      fetchMembers(groupId);
    } else {
      setMembers([]);
    }
  };

  const getAvailableMembers = () => {
    if (!formData.gatheringId) return members;

    // Filter out members who are already registered for this gathering
    const registeredMemberIds = registrations
      .filter((r) => r.gatheringId === Number(formData.gatheringId))
      .map((r) => r.memberId);

    return members.filter((member) => !registeredMemberIds.includes(member.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      if (!formData.gatheringId || !formData.groupId || !formData.memberId) {
        throw new Error("Please fill in all fields");
      }

      // Check if member is already registered
      const existingRegistration = registrations.find(
        (r) => r.memberId === Number(formData.memberId) && r.gatheringId === Number(formData.gatheringId)
      );
      if (existingRegistration) {
        throw new Error("You are already registered for this gathering");
      }

      // Check if gathering is full
      const gathering = gatherings.find((g) => g.id === Number(formData.gatheringId));
      if (gathering && gathering._count && gathering._count.registrations >= gathering.capacity) {
        throw new Error("This gathering has reached its capacity");
      }

      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: Number(formData.memberId),
          gatheringId: Number(formData.gatheringId),
          groupId: Number(formData.groupId),
          status: "CONFIRMED", // Changed from "PENDING" to "CONFIRMED"
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to register");
      }

      setStatus("success");
      // Trigger a refresh of the registration list by updating lastUpdate
      const event = new CustomEvent("registration-updated");
      window.dispatchEvent(event);
      setFormData({ gatheringId: "", groupId: "", memberId: "" });
      setMembers([]);
      // Refresh gatherings and registrations to update counts
      await Promise.all([fetchGatherings(), fetchRegistrations()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section id="register" className="py-24">
      <div className="container px-4 mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Registrasi Tepro September</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Daftarkan diri anda segera dengan mengisi form dan klik register untuk registrasi, pastikan nama anda pada
              list peserta, jika ada kendala silahkan hubungi panitia.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Pilih Gathering</h3>
                  <p className="text-sm text-muted-foreground">Choose an gathering</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Pilih Group/Kelompok</h3>
                  <p className="text-sm text-muted-foreground">Choose your group/kelompok</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Pilih Nama Anda</h3>
                  <p className="text-sm text-muted-foreground">Choose your name</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">4</span>
                </div>
                <div>
                  <h3 className="font-semibold">Klik Tombol Register</h3>
                  <p className="text-sm text-muted-foreground">Click register button</p>
                </div>
              </div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Gathering Registration</CardTitle>
              <CardDescription>Register for an upcoming gathering.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="gatheringId">Gathering</Label>
                  {isLoadingGatherings ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading gatherings...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.gatheringId}
                      onValueChange={(value) => setFormData({ ...formData, gatheringId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a gathering" />
                      </SelectTrigger>
                      <SelectContent>
                        {gatherings.map((gathering) => (
                          <SelectItem key={gathering.id} value={gathering.id.toString()}>
                            {gathering.name} - {format(new Date(gathering.date), "PPp")}
                            <span className="ml-2 text-muted-foreground">
                              ({gathering._count?.registrations || 0}/{gathering.capacity})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="groupId">Group</Label>
                  {isLoadingGroups ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading groups...</span>
                    </div>
                  ) : (
                    <Select value={formData.groupId} onValueChange={handleGroupChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label htmlFor="memberId">Member</Label>
                  {isLoadingMembers ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading members...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.memberId}
                      onValueChange={(value) => setFormData({ ...formData, memberId: value })}
                      disabled={!formData.groupId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.groupId ? "Select your name" : "Select a group first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableMembers().map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {formData.groupId && getAvailableMembers().length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      No available members found. They might already be registered for this gathering.
                    </p>
                  )}
                </div>
                {status === "error" && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {status === "success" && (
                  <Alert>
                    <AlertDescription>
                      Registration successful! You will receive a confirmation shortly.
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={status === "loading" || !formData.gatheringId || !formData.groupId || !formData.memberId}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
