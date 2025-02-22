"use client"

import { useState } from "react"
import { useTable, usePagination } from "react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Member = {
  id: number
  name: string
  email: string
  groupId: number
}

type Group = {
  id: number
  name: string
}

const initialMembers: Member[] = [
  { id: 1, name: "John Doe", email: "john@example.com", groupId: 1 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", groupId: 2 },
  // Add more sample data as needed
]

const initialGroups: Group[] = [
  { id: 1, name: "Group A" },
  { id: 2, name: "Group B" },
  { id: 3, name: "Group C" },
  // Add more sample data as needed
]

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [groups] = useState<Group[]>(initialGroups)
  const [isOpen, setIsOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const { register, handleSubmit, reset, setValue } = useForm<Member>()

  const columns = [
    {
      Header: "ID",
      accessor: "id",
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Group",
      accessor: "groupId",
      Cell: ({ value }: { value: number }) => groups.find((g) => g.id === value)?.name || "Unknown",
    },
    {
      Header: "Actions",
      Cell: ({ row }: { row: { original: Member } }) => (
        <div className="space-x-2">
          <Button onClick={() => handleEdit(row.original)}>Edit</Button>
          <Button variant="destructive" onClick={() => handleDelete(row.original.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: members,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    usePagination,
  )

  const onSubmit = (data: Member) => {
    if (editingMember) {
      setMembers(members.map((m) => (m.id === editingMember.id ? { ...m, ...data } : m)))
    } else {
      setMembers([...members, { ...data, id: Math.max(...members.map((m) => m.id)) + 1 }])
    }
    setIsOpen(false)
    reset()
    setEditingMember(null)
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsOpen(true)
    setValue("name", member.name)
    setValue("email", member.email)
    setValue("groupId", member.groupId)
  }

  const handleDelete = (id: number) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Members</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingMember(null)
                reset()
              }}
            >
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Member" : "Add Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name", { required: true })} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email", { required: true })} />
              </div>
              <div>
                <Label htmlFor="groupId">Group</Label>
                <Select onValueChange={(value) => setValue("groupId", Number(value))}>
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

      <Table {...getTableProps()}>
        <TableHeader>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableHead {...column.getHeaderProps()}>{column.render("Header")}</TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row)
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <TableCell {...cell.getCellProps()}>{cell.render("Cell")}</TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="space-x-2">
          <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {"<<"}
          </Button>
          <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {"<"}
          </Button>
          <Button onClick={() => nextPage()} disabled={!canNextPage}>
            {">"}
          </Button>
          <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {">>"}
          </Button>
        </div>
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
          }}
          className="border rounded p-1"
        >
          {[5, 10, 20].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

