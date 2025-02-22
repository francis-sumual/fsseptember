"use client"

import { useState } from "react"
import { useTable, usePagination } from "react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"

type Group = {
  id: number
  name: string
}

const initialGroups: Group[] = [
  { id: 1, name: "Group A" },
  { id: 2, name: "Group B" },
  { id: 3, name: "Group C" },
  // Add more sample data as needed
]

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [isOpen, setIsOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)

  const { register, handleSubmit, reset } = useForm<Group>()

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
      Header: "Actions",
      Cell: ({ row }: { row: { original: Group } }) => (
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
      data: groups,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    usePagination,
  )

  const onSubmit = (data: Group) => {
    if (editingGroup) {
      setGroups(groups.map((g) => (g.id === editingGroup.id ? { ...g, ...data } : g)))
    } else {
      setGroups([...groups, { ...data, id: Math.max(...groups.map((g) => g.id)) + 1 }])
    }
    setIsOpen(false)
    reset()
    setEditingGroup(null)
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setIsOpen(true)
    reset(group) // Populate the form with the group's data
  }

  const handleDelete = (id: number) => {
    setGroups(groups.filter((g) => g.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Groups</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingGroup(null)
                reset()
              }}
            >
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGroup ? "Edit Group" : "Add Group"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name", { required: true })} />
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
              <TableRow key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <TableCell key={cell.column.id} {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </TableCell>
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

