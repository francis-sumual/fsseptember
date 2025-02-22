"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Pagination } from "@/components/pagination"

type Gathering = {
  id: number
  name: string
  date: string
  location: string
  description: string | null
  capacity: number
  status: "ACTIVE" | "NOT_ACTIVE"
  _count?: {
    registrations: number
  }
}

export function GatheringsTable() {
  const [gatherings, setGatherings] = useState<Gathering[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingGathering, setEditingGathering] = useState<Gathering | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
    capacity: "",
    status: "ACTIVE",
  })
  const [error, setError] = useState("")

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  // Calculate pagination values
  const totalItems = gatherings.length
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize)
  const paginatedGatherings =
    pageSize === 0 ? gatherings : gatherings.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    fetchGatherings()
  }, [])

  const fetchGatherings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/gatherings")
      if (!response.ok) {
        throw new Error("Failed to fetch gatherings")
      }
      const data = await response.json()
      setGatherings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching gatherings:", err)
      setError("Failed to load gatherings")
      setGatherings([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const payload = {
        ...formData,
        capacity: Number.parseInt(formData.capacity),
      }

      if (editingGathering) {
        const response = await fetch("/api/gatherings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingGathering.id }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to update gathering")
        }
      } else {
        const response = await fetch("/api/gatherings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create gathering")
        }
      }

      setIsOpen(false)
      setEditingGathering(null)
      setFormData({
        name: "",
        date: "",
        location: "",
        description: "",
        capacity: "",
        status: "ACTIVE",
      })
      fetchGatherings()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/gatherings?id=${id}`, { method: "DELETE" })
      if (!response.ok) {
        throw new Error("Failed to delete gathering")
      }
      fetchGatherings()
    } catch (err) {
      console.error("Error deleting gathering:", err)
      setError("Failed to delete gathering")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingGathering(null)
                setFormData({
                  name: "",
                  date: "",
                  location: "",
                  description: "",
                  capacity: "",
                  status: "ACTIVE",
                })
                setError("")
              }}
            >
              Add Gathering
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGathering ? "Edit Gathering" : "Add Gathering"}</DialogTitle>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as "ACTIVE" | "NOT_ACTIVE" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="NOT_ACTIVE">Not Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Pagination
          pageSize={pageSize}
          setPageSize={setPageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      </div>
      {gatherings.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">No gatherings found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGatherings.map((gathering) => (
              <TableRow key={gathering.id}>
                <TableCell>{gathering.name}</TableCell>
                <TableCell>{format(new Date(gathering.date), "PPp")}</TableCell>
                <TableCell>{gathering.location}</TableCell>
                <TableCell>
                  {gathering._count?.registrations || 0} / {gathering.capacity}
                </TableCell>
                <TableCell>
                  <Badge variant={gathering.status === "ACTIVE" ? "default" : "secondary"}>
                    {gathering.status === "ACTIVE" ? "Active" : "Not Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => {
                      setEditingGathering(gathering)
                      setFormData({
                        name: gathering.name,
                        date: new Date(gathering.date).toISOString().slice(0, 16),
                        location: gathering.location,
                        description: gathering.description || "",
                        capacity: gathering.capacity.toString(),
                        status: gathering.status,
                      })
                      setError("")
                      setIsOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(gathering.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

