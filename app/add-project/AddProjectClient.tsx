"use client"

import { useEffect, useState } from "react"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeftIcon,
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useSession } from "next-auth/react"

import { fetchCompanies } from "@/lib/company/company"
import { fetchClients } from "@/lib/fetchClients"
import { getUser } from "@/lib/getUser"
import {
  sendAdminNotification,
  sendUserNotification,
} from "@/lib/notification/sendNotification"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

export default function AddProject() {
  const AdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const [open, setOpen] = useState(false)
  const [openClient, setOpenClient] = useState(false)
  const [value, setValue] = useState("")
  const [valueClient, setValueClient] = useState("")

  const { toast } = useToast()
  const router = useRouter()

  const { data: session } = useSession()

  const [isLoading, setLoading] = useState(false)
  const [projectName, setprojectName] = useState("")
  const [salesPerson, setUserId] = useState("")
  const [salesPersonEmail, setSalesPersonEmail] = useState("")
  const [salesId, setsalesId] = useState()
  const [clientId, setClientId] = useState("")
  const [upSellerId, setupSellerId] = useState()
  const [projectDetails, setprojectDetails] = useState("")
  const [budget, setbudget] = useState("")
  const [companyName, setcompanyName] = useState("image appeal")
  let [dateSigned, setdateSigned] = useState("")
  const [clientName, setclientName] = useState("")
  const [email, setemail] = useState("")
  const [phone, setphone] = useState("")
  const [address, setaddress] = useState("")
  const [Users, setUsers] = useState([])
  const [clients, setClients] = useState([])
  const [Allcompanies, setAllcompanies] = useState()
  const [contracts, setContracts] = useState()
  const [currentUser, setcurrentUser] = useState()
  const [isClientCall, setIsClientCall] = useState(false)
  const [isClientEmail, setIsClientEmail] = useState(false)
  const [hasClient, setHasClient] = useState(false)
  const role = session?.user?.role
  const name = session?.user?.name
  const id = session?.user?.id
  const salesPersonsEmail = session?.user?.email
  console.log(salesPersonsEmail)

  useEffect(() => {
    fetch("/api/user")
      .then((response) => response.json())
      .then((data) => {
        const main = data.users
        const users = main.filter((item) => item.role != "SuperAdmin")
        setUsers(users)
        console.log(users)
      })
      .catch((error) => {
        console.error("Error:", error)
      })

    if (role != "SuperAdmin") {
      setUserId(name)
      
    
    }

    fetchCompanies().then((data) => {
      setAllcompanies(data)
    })

    if (session) {
      const userId = session?.user?.id
      const role = session?.user?.role

      fetchClients(role).then((data) => {
        if (role !== "SuperAdmin" && role !== "Admin-IA") {
          setClients(data)
          const filterPerson = data.filter((item) => userId == item.sellerId)
          setClients(filterPerson)
        } else {
          setClients(data)
        }
      })

      getUser(userId).then((salesPerson) => {
        console.log(salesPerson)
        setcurrentUser(salesPerson)
        setContracts(salesPerson.contracts)

        if (role != "SuperAdmin" && role == "Sales1") {
          setsalesId(salesPerson._id)
          setupSellerId(salesPerson.upSellerId)
        }

        if (role != "SuperAdmin" && role == "Sales2") {
          setsalesId(salesPerson._id)
          setupSellerId(salesPerson.upSellerId)
        }
        if (role != "SuperAdmin" && role == "Admin-IA") {
          setsalesId(salesPerson._id)
          setupSellerId(salesPerson.upSellerId)
        }
      })
    }
  }, [session, salesPerson, role])

  //=====================handle has client
  const handleClient = () => {
    setHasClient(!hasClient)
    if (!hasClient) {
      setClientId("")
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    function formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" }
      return new Intl.DateTimeFormat("en-US", options).format(
        new Date(dateString)
      )
    }

    if (dateSigned) {
      dateSigned = formatDate(dateSigned)
    }
    if (clientId) {
      if (
        !projectName ||
        !projectDetails ||
        !budget ||
        !salesPerson ||
        !salesId ||
        // !upSellerId ||
        !companyName ||
        !dateSigned
      ) {
        toast({
          variant: "destructive",
          title: "All fields required with client.",
        })
        setLoading(false)
        return
      }
    } else {
      if (
        !projectName ||
        !projectDetails ||
        !budget ||
        !salesPerson ||
        !salesId ||
        !upSellerId ||
        !companyName ||
        !dateSigned ||
        !clientName ||
        !email ||
        !phone ||
        !address
      ) {
        toast({
          variant: "destructive",
          title: "All fields required.",
        })
        setLoading(false)
        return
      }
    }

    try {
      const res = await fetch("api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          projectDetails,
          budget,
          salesPerson,
          salesId,
          upSellerId,
          companyName: companyName ? companyName : null,
          dateSigned,
          clientName,
          email: email ? email : null,
          phone: phone ? phone : null,
          address: address ? address : null,
          clientId: clientId ? clientId : null,
          callClient: isClientCall,
          emailClient: isClientEmail,
        }),
      })

      if (res.ok) {
        setLoading(false)
        await sendUserNotification(projectName, salesPerson, salesPersonEmail?salesPersonEmail:salesPersonsEmail)
       await sendAdminNotification(projectName, salesPerson, AdminEmail)
         router.push("/dashboard")

      } else {
        if (res.status == 409) {
          toast({
            variant: "destructive",
            title: "Client email already exist!",
          })
        } else if (res.status == 408) {
          toast({
            variant: "destructive",
            title: "Client name already exist!",
          })
        } else {
          toast({
            variant: "destructive",
            title: "project submit failed!",
          })
        }
        setLoading(false)
      }
    } catch (error) {
      console.log("Error during project submit:", error)
      toast({
        variant: "destructive",
        title: `Error during project submit:", ${error}`,
      })
      setLoading(false)
    }
  }

  return (
    <div className="container min-w-[1400px]">
      <div className="flex p-10 mb-5 bg-white border rounded-md">
        <div className="w-full">
          <h4 className="flex items-center mb-5 text-3xl font-semibold text-primary">
            <Link href="/dashboard">
              <div className="p-1 mr-5 duration-500 border-2 rounded-lg cursor-pointer border-primary hover:bg-primary hover:text-white">
                <ArrowLeftIcon />
              </div>
            </Link>
            Add New Project
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="flex">
              <div className="w-6/12 pr-2">
                <label className="block mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Project Name:
                </label>
                <input
                  className="mb-4 w-full rounded-md border border-slate-400 bg-[#f4f4f4] px-4 py-2"
                  type="text"
                  onChange={(e) => setprojectName(e.target.value.trim())}
                  placeholder="Project Name"
                />
              </div>
              <div className="w-6/12 pl-2">
                <label className="block mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Sales Person:
                </label>

                {(Users && role == "SuperAdmin") ||
                (Users && role == "Admin-IA") ? (
                  <div className="w-full">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild className="w-full">
                        <Button
                          variant="outline"
                          name="combobox"
                          aria-expanded={open}
                          className="w-full justify-between border-slate-400 bg-[#f4f4f4] capitalize"
                        >
                          {value
                            ? Users?.find((user) => user?.name === value)?.name
                            : "Select Sales Person..."}
                          <ChevronsUpDown className="ml-2 opacity-50 size-4 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[38vw] p-0">
                        <Command className="w-full">
                          <CommandInput placeholder="Search sales person..." />
                          <CommandEmpty>No sales person found.</CommandEmpty>
                          <CommandGroup>
                            {Users?.map((user) => (
                              
                              <CommandItem
                                className="text-center"
                                key={user?.name}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue == value ? "" : currentValue
                                  )
                                  setsalesId(user?._id)
                                  setupSellerId(user?.upSellerId)
                                  setUserId(
                                    currentValue == value ? "" : currentValue
                                  )
                                  setSalesPersonEmail(user.email)
                                  setOpen(false)
                                }}
                              >
                            
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    value === user?.name
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {user?.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <>
                    <input
                      className="mb-4 w-full rounded-md border border-slate-400 bg-[#f4f4f4] px-4 py-2"
                      type="text"
                      disabled
                      onLoad={(e) => setUserId(e.target.value.trim())}
                      defaultValue={name}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-4/12 pr-2">
                <label className="block mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Company:
                </label>
                <Select
                  value={
                    session?.user.role === "Admin-IA"
                      ? "image appeal"
                      : companyName
                  }
                  onValueChange={setcompanyName}
                >
                  <SelectTrigger className="w-full border-slate-400 bg-[#f4f4f4] text-black">
                    <SelectValue placeholder="Company Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {role == "SuperAdmin" && name && (
                      <>
                        {Allcompanies &&
                          Allcompanies.map((company, index) => (
                            <SelectItem key={index} value={company.companyName}>
                              <span className="capitalize">
                                {company.companyName}
                              </span>
                            </SelectItem>
                          ))}
                      </>
                    )}

                    {role != "SuperAdmin" && name && (
                      <>
                        {contracts &&
                          contracts.map((contract, index) => {
                            if (
                              role === "Admin-IA" &&
                              contract.companyName !== "image appeal"
                            ) {
                              return
                            } else {
                              return (
                                <SelectItem
                                  key={index}
                                  value={contract.companyName}
                                >
                                  <span className="capitalize">
                                    {contract.companyName}
                                  </span>
                                </SelectItem>
                              )
                            }
                          })}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-4/12 px-2">
                <label className="block mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Date Signed:
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start border-slate-400 bg-[#f4f4f4] text-left font-normal",
                        !dateSigned && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {dateSigned ? (
                        format(dateSigned, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateSigned}
                      onSelect={setdateSigned}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-4/12 pl-2">
                <label className="block mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Budget:
                </label>
                <input
                  className="w-full rounded-md border border-slate-400 bg-[#f4f4f4] px-4 py-2"
                  type="number"
                  onChange={(e) => setbudget(e.target.value)}
                  placeholder="Project Budget"
                />
              </div>
            </div>
            <label className="block mt-4 mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Project Scope:
            </label>
            <Textarea
              onChange={(e) => setprojectDetails(e.target.value)}
              className="w-full rounded-md border border-slate-400 bg-[#f4f4f4] px-4 py-2"
            />
            <h2 className="mt-10 mb-2 text-2xl font-semibold text-primary">
              Client Information
            </h2>
            <hr />
            {/* //===================================== clients */}

            <div className="flex items-center justify-start my-4 gap-x-1">
              <Checkbox id="hasClient" onCheckedChange={handleClient} />
              <label
                htmlFor="hasClient"
                className="text-lg font-medium leading-none text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Existing client?
              </label>
            </div>

            {/* //===================================== clients */}

            {hasClient ? (
              <>
                <div className="w-full">
                  <Popover open={openClient} onOpenChange={setOpenClient}>
                    <PopoverTrigger asChild className="w-full">
                      <Button
                        variant="outline"
                        name="combobox"
                        aria-expanded={openClient}
                        className="w-full justify-between border-slate-400 bg-[#f4f4f4] capitalize"
                      >
                        {valueClient
                          ? clients.find(
                              (client) =>
                                client?.clientName?.trim()?.toLowerCase() ===
                                valueClient?.trim()?.toLowerCase()
                            )?.clientName
                          : "Select client ..."}
                        <ChevronsUpDown className="ml-2 opacity-50 size-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[38vw] p-0">
                      <Command className="w-full">
                        <CommandInput placeholder="Search client person..." />
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          {clients?.map((client) => (
                            <CommandItem
                              className="text-center"
                              key={client?.clientName}
                              onSelect={(clientValue) => {
                                setValueClient(
                                  clientValue.toLowerCase() ==
                                    valueClient.toLowerCase()
                                    ? ""
                                    : clientValue
                                )
                                setClientId(client?._id)
                                setOpenClient(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 size-4",
                                  valueClient?.toLowerCase() ===
                                    client?.clientName?.toLowerCase()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {client?.clientName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-4/12">
                    <label className="block mt-4 mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Client Name:
                    </label>
                    <input
                      className="w-full rounded-md border border-slate-400 bg-[#f4f4f4] px-4 py-2"
                      type="text"
                      onChange={(e) => setclientName(e.target.value)}
                      placeholder="Project Name"
                    />
                  </div>
                  <div className="w-4/12">
                    <label className="block mt-4 mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Email Address:
                    </label>
                    <input
                      className="w-full rounded-md border border-slate-400 bg-[#f4f4f4] px-4 py-2"
                      type="text"
                      onChange={(e) => setemail(e.target.value)}
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="w-4/12">
                    <label className="block mt-4 mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Phone Number:
                    </label>
                    <input
                      className="w-full rounded-md border border-slate-400 bg-[#f4f4f4] px-4 py-2"
                      type="number"
                      onChange={(e) => setphone(e.target.value)}
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
                <label className="block mt-4 mb-2 text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Client Address:
                </label>
                <textarea
                  onChange={(e) => setaddress(e.target.value)}
                  className="w-4/12 rounded-md border border-slate-400 bg-[#f4f4f4] px-4 py-2"
                ></textarea>
              </>
            )}
            <br />
            {!hasClient && (
              <div className="flex items-center justify-start mt-4 gap-x-1">
                <Checkbox
                  id="hasEmail"
                  onCheckedChange={() => setIsClientCall(!isClientCall)}
                />
                <label
                  htmlFor="hasEmail"
                  className="mr-5 font-normal leading-none text-md text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Do not call the client directly.
                </label>
                <Checkbox
                  id="hasCall"
                  onCheckedChange={() => setIsClientEmail(!isClientEmail)}
                />
                <label
                  htmlFor="hasCall"
                  className="font-normal leading-none text-md text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Do not send marketing emails to the client.
                </label>
              </div>
            )}
            <br />
            <Button className="mt-1" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Submit Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
