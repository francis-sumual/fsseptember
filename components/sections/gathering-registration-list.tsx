"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";
import { format } from "date-fns";

type Registration = {
  id: number;
  status: string;
  member: {
    name: string;
    contact: string;
  };
  gathering: {
    id: number;
    name: string;
    date: string;
  };
  group: {
    id: number;
    name: string;
  };
};

type GroupedRegistrations = {
  [groupId: string]: {
    groupName: string;
    gatherings: {
      [gatheringId: string]: {
        gatheringName: string;
        date: string;
        registrations: Registration[];
      };
    };
  };
};

type RegistrationSummary = {
  totalRegistrations: number;
  groupSummaries: {
    [groupId: string]: {
      total: number;
      byStatus: {
        CONFIRMED: number;
        PENDING: number;
        CANCELLED: number;
      };
    };
  };
};

export function GatheringRegistrationList() {
  const [registrations, setRegistrations] = useState<GroupedRegistrations>({});
  const [summary, setSummary] = useState<RegistrationSummary>({
    totalRegistrations: 0,
    groupSummaries: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch registrations on component mount and set up event listener
  useEffect(() => {
    fetchRegistrations();

    // Listen for registration updates
    const handleRegistrationUpdate = () => {
      console.log("Registration update detected, refreshing list...");
      fetchRegistrations();
    };

    window.addEventListener("registration-updated", handleRegistrationUpdate);

    return () => {
      window.removeEventListener("registration-updated", handleRegistrationUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateSummary = (grouped: GroupedRegistrations): RegistrationSummary => {
    const summary: RegistrationSummary = {
      totalRegistrations: 0,
      groupSummaries: {},
    };

    Object.entries(grouped).forEach(([groupId, group]) => {
      const groupSummary = {
        total: 0,
        byStatus: {
          CONFIRMED: 0,
          PENDING: 0,
          CANCELLED: 0,
        },
      };

      Object.values(group.gatherings).forEach((gathering) => {
        gathering.registrations.forEach((registration) => {
          groupSummary.total++;
          groupSummary.byStatus[registration.status as keyof typeof groupSummary.byStatus]++;
          summary.totalRegistrations++;
        });
      });

      summary.groupSummaries[groupId] = groupSummary;
    });

    return summary;
  };

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/registrations");
      if (!response.ok) throw new Error("Failed to fetch registrations");
      const data: Registration[] = await response.json();

      // Group registrations by group first, then by gathering
      const grouped = data.reduce((acc: GroupedRegistrations, reg: Registration) => {
        const groupId = reg.group.id.toString();
        const gatheringId = reg.gathering.id.toString();

        if (!acc[groupId]) {
          acc[groupId] = {
            groupName: reg.group.name,
            gatherings: {},
          };
        }

        if (!acc[groupId].gatherings[gatheringId]) {
          acc[groupId].gatherings[gatheringId] = {
            gatheringName: reg.gathering.name,
            date: reg.gathering.date,
            registrations: [],
          };
        }

        acc[groupId].gatherings[gatheringId].registrations.push(reg);
        return acc;
      }, {});

      // Sort registrations within each gathering
      Object.values(grouped).forEach((group) => {
        Object.values(group.gatherings).forEach((gathering) => {
          gathering.registrations.sort((a, b) => {
            const statusOrder = { CONFIRMED: 0, PENDING: 1, CANCELLED: 2 };
            const statusDiff =
              statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
            if (statusDiff !== 0) return statusDiff;
            return a.member.name.localeCompare(b.member.name);
          });
        });
      });

      setRegistrations(grouped);
      setSummary(calculateSummary(grouped));
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError("Failed to load registrations");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="list" className="py-24 bg-muted/50">
        <div className="container px-4 mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading registrations...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="list" className="py-24 bg-muted/50">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </section>
    );
  }

  const groupIds = Object.keys(registrations);
  if (groupIds.length === 0) {
    return (
      <section id="list" className="py-24 bg-muted/50">
        <div className="container px-4 mx-auto text-center">
          <Users className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No registrations found</p>
        </div>
      </section>
    );
  }

  return (
    <section id="list" className="py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Registrations List</h2>
          <p className="mt-4 text-lg text-muted-foreground">Pastikan nama anda ada dalam list ini.</p>
        </div>

        {/* Registration Summary */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Registration Summary</CardTitle>
              <CardDescription>Total Registrations: {summary.totalRegistrations}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(summary.groupSummaries).map(([groupId, stats]) => (
                  <div key={groupId} className="space-y-2">
                    <h4 className="font-semibold">{registrations[groupId].groupName}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span>{stats.total}</span>
                      <span className="text-muted-foreground">Confirmed:</span>
                      <span>{stats.byStatus.CONFIRMED}</span>
                      <span className="text-muted-foreground">Pending:</span>
                      <span>{stats.byStatus.PENDING}</span>
                      <span className="text-muted-foreground">Cancelled:</span>
                      <span>{stats.byStatus.CANCELLED}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Group Registrations */}
        <div className="space-y-12">
          {groupIds.map((groupId) => {
            const group = registrations[groupId];
            const gatheringIds = Object.keys(group.gatherings);
            const groupStats = summary.groupSummaries[groupId];

            return (
              <div key={groupId} className="space-y-6">
                <div className="flex items-center justify-between flex-col">
                  <h3 className="text-2xl font-bold tracking-tight">{group.groupName}</h3>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm">
                      Total: {groupStats.total}
                    </Badge>
                    <Badge variant="default" className="text-sm">
                      Confirmed: {groupStats.byStatus.CONFIRMED}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      Pending: {groupStats.byStatus.PENDING}
                    </Badge>
                    <Badge variant="destructive" className="text-sm">
                      Cancelled: {groupStats.byStatus.CANCELLED}
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-4">
                  <div className="col-span-2 col-start-2">
                    {gatheringIds.map((gatheringId) => {
                      const gathering = group.gatherings[gatheringId];
                      return (
                        <Card key={gatheringId}>
                          <CardHeader>
                            <CardTitle>{gathering.gatheringName}</CardTitle>
                            <CardDescription>{format(new Date(gathering.date), "PPp")}</CardDescription>
                            <p>List Berdasarkan Abjad</p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {gathering.registrations.map((registration) => (
                                <div
                                  key={registration.id}
                                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                                >
                                  <div className="space-y-1">
                                    <p className="font-medium leading-none">{registration.member.name}</p>
                                    <p className="text-sm text-muted-foreground">{registration.member.contact}</p>
                                  </div>
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
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
