"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileEdit, Pencil, Search, Trash, User } from "lucide-react"

import { getallUser } from "@/lib/getUser"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import AddContract from "../app/settings/manage-contracts/AddContract.tsx"
import DeleteContract from "../app/settings/manage-contracts/DeleteContract"
import EditContract from "../app/settings/manage-contracts/EditContract"
import { Button } from "@/components/ui/button"
const ContractTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [allUser, setAllUser] = useState([])
  const [search, setSearch] = useState("")
  const fetchContact = async () => {
    const user = await getallUser()
    setAllUser(user)
  }

  useEffect(() => {
    fetchContact()
  }, [])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = allUser
    ?.filter((item) => {
      const searchLowerCase = search.toLowerCase().trim()
      if (searchLowerCase === "") {
        return true // Return true for all items if search is empty
      } else {
        return item.name.toLowerCase().includes(searchLowerCase)
      }
    })
    .slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <>
      <div className="w-full">
        <h1 className="mb-5 text-2xl">Manage Contracts</h1>
        <div className="flex items-center justify-start w-full px-3 bg-white border rounded-md ">
          <Search className="text-primary size-5" />
          <Input
            placeholder="Search seller..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full border-0 rounded-none"
          />
        </div>
      </div>
      <Table className="w-full border-separate dataTable userTable caption-bottom border-spacing-y-2">
        <TableHeader className="w-full">
          <TableRow className="w-full">
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Contracts</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="w-full">
          {currentItems?.length > 0 &&
            currentItems?.map(
              (singleUser) =>
                singleUser.name !== "super admin" && (
                  <TableRow
                    className="border-color-[#E9EFF4] mb-10 overflow-hidden rounded-md border shadow-md "
                    key={singleUser.id}
                  >
                    <TableCell className="h-10 py-2 font-medium capitalize gap-x-2">
                      <div className="flex items-center gap-x-2">
                        <User
                          size={18}
                          className="font-bold border-[1px] rounded-full text-primary border-primary"
                        />{" "}
                        <Link
                          href={`/sales/${singleUser.name}`}
                          className="font-bold text-primary"
                        >
                          {singleUser.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="flex py-2 overflow-x-auto gap-x-2">
                      {singleUser.contracts.map((contract, index) => (
                        // eslint-disable-next-line react/jsx-key -- deuda conocida, ver SECURITY_DEBT.md #2, pendiente de fix
                        <div className="flex px-2 border rounded-md ">
                          <span
                            className="inline-block px-4 py-1 mr-2 capitalize bg-white rounded"
                            key={index}
                          >
                            {contract.companyName} | {contract.rate}%
                          </span>
                          <div className="flex items-center justify-center gap-x-2">
                            |
                            <DeleteContract
                              allUser={allUser}
                              id={singleUser._id}
                              contract={contract}
                            />
                          </div>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="py-2">
                      <AddContract id={singleUser._id} />
                    </TableCell>
                  </TableRow>
                )
            )}
        </TableBody>
      </Table>
      {currentItems?.length > 0 && (
        <div className="flex justify-end w-full mt-4 gap-x-4">
          <Button
           size="sm"
           className="w-[100px]"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            className="w-[100px]"
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastItem >= allUser.length}
          >
            Next
          </Button>
        </div>
      )}
    </>
  )
}

export default ContractTable
