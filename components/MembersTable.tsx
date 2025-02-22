"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/pagination"

type Member = {
  id: number
  name: string
  contact: string
  groupId: number
  group: {
    id: number
    name: string
  }
}

type Group = {
  id: number
  name: string
}

export default function MembersTable() {
  const [members, setMembers] = useState<Member[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [pageSize, setPageSize] = useState(5)
  const [currentPage, setCurrentPage] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    groupId: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError("")

      console.log("Fetching data...")
      const [membersRes, groupsRes] = await Promise.all([fetch("/api/members"), fetch("/api/groups")])

      if (!membersRes.ok) {
        const errorData = await membersRes.json()
        throw new Error(errorData.error || "Failed to fetch members")
      }

      if (!groupsRes.ok) {
        const errorData = await groupsRes.json()
        throw new Error(errorData.error || "Failed to fetch groups")
      }

      const membersData = await membersRes.json()
      const groupsData = await groupsRes.json()

      console.log("Members data:", membersData)
      console.log("Groups data:", groupsData)

      // Ensure we're working with arrays
      if (!Array.isArray(membersData)) {
        console.error("Members data is not an array:", membersData)
        throw new Error("Invalid members data received")
      }

      if (!Array.isArray(groupsData)) {
        console.error("Groups data is not an array:", groupsData)
        throw new Error("Invalid groups data received")
      }

      setMembers(membersData)
      setGroups(groupsData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
      setMembers([])
      setGroups([])
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate pagination values
  const totalItems = members.length
  const totalPages = pageSize === 0 ? 1 : Math.ceil(totalItems / pageSize)
  const paginatedMembers =
    pageSize === 0 ? members : members.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (!formData.groupId) {
        throw new Error("Please select a group")
      }

      const payload = {
        ...formData,
        groupId: Number(formData.groupId),
      }

      console.log("Submitting form data:", payload)

      if (editingMember) {
        const response = await fetch("/api/members", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingMember.id }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to update member")
        }
      } else {
        const response = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to create member")
        }
      }

      setIsOpen(false)
      setEditingMember(null)
      setFormData({ name: "", contact: "", groupId: "" })
      fetchData()
    } catch (err) {
      console.error("Form submission error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      console.log("Deleting member:", id)
      const response = await fetch(`/api/members?id=${id}`, { method: "DELETE" })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete member")
      }

      fetchData()
    } catch (err) {
      console.error("Error deleting member:", err)
      setError(err instanceof Error ? err.message : "Failed to delete member")
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingMember(null)
                setFormData({ name: "", contact: "", groupId: "" })
                setError("")
              }}
            >
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Member" : "Add Member"}</DialogTitle>
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
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="groupId">Group</Label>
                <Select
                  value={formData.groupId}
                  onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                >
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
              </div>
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">No members found</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.id}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.contact}</TableCell>
                    <TableCell>{member.group.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        className="mr-2"
                        onClick={() => {
                          setEditingMember(member)
                          setFormData({
                            name: member.name,
                            contact: member.contact,
                            groupId: member.groupId.toString(),
                          })
                          setError("")
                          setIsOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(member.id)}>
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
  )
}

