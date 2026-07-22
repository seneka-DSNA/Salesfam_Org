"use client"

import React, { useEffect, useState } from "react"
import { FilePlus2, Pencil } from "lucide-react"

import { fetchCompanies } from "@/lib/company/company"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

export default function EditContract(props) {
  const userId = props.id
  const contract = props.contract
  const [Loading, setLoading] = useState(false)
  const [userData, setuserData] = useState()

  const [activeCompany, setactiveCompany] = useState()
  const [offerCompany, setofferCompany] = useState()

  const [NewCompany, setNewCompany] = useState()
  const [selectedRate, setSelectedRate] = useState(null)
  const [selectedLogo, setSelectedLogo] = useState(null)

  useEffect(() => {
    fetch(`/api/user/?id=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        const userData = data.user
        setuserData(userData)
        const companyNamesArray = userData.contracts.map(
          (contract) => contract.companyName
        )
        setactiveCompany(companyNamesArray)
      })
      .catch((error) => {
        console.error("Error:", error)
      })

    fetchCompanies().then((companies) => {
      setofferCompany(companies)
    })
  }, [])

  const handleCompanyChange = (selectedCompany) => {
    setNewCompany(selectedCompany)
    const selectedCompanyObj = offerCompany.find(
      (company) => company.companyName === selectedCompany
    )
    if (selectedCompanyObj) {
      setSelectedRate(selectedCompanyObj.rate)
      setSelectedLogo(selectedCompanyObj.companyLogo)
    }
  }

  useEffect(() => {
    setNewCompany(contract.companyName)
    setSelectedRate(contract.rate)
    setSelectedLogo(contract.companyLogo)
  },[])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/user/?id=${userId}`)
      const userData = await response.json()

      const updatedContracts = userData?.user?.contracts.filter(
        (item) => item._id !== contract._id
      )
      const newContract = {
        companyName: NewCompany,
        rate: selectedRate,
        logo: selectedLogo,
      }
      const allContracts = updatedContracts
        ? [...updatedContracts, newContract]
        : [newContract]
      const updatedUser = {
        ...userData,
        contracts: allContracts,
      }

      const res = await fetch(`/api/user/?id=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      })

      if (res.status === 200 || res.status === 201) {
        setLoading(false)
        toast({
          variant: "default",
          title: "User Updated!",
        })
        window.location.reload()
      } else {
        console.log("Submission failed!")
        toast({
          title: `Submission failed! Status: ${res.status}`,
        })
        setLoading(false)
      }
    } catch (error) {
      console.log("Error during submit:", error)
      toast({
        variant: "destructive",
        title: `Error during submit: ${error.message}`,
      })
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Pencil className="w-[15px] cursor-pointer text-blue-600" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Select onValueChange={handleCompanyChange}>
            <SelectTrigger className="text-md w-[220px] bg-white capitalize text-black">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {offerCompany &&
                activeCompany &&
                offerCompany.map(
                  (singleCompany, index) =>
                    !activeCompany.includes(singleCompany.companyName) && (
                      // eslint-disable-next-line react/jsx-key -- deuda conocida, ver SECURITY_DEBT.md #2, pendiente de fix
                      <SelectItem
                        className="capitalize"
                        value={singleCompany.companyName}
                        defaultValue={NewCompany}
                      >
                        {singleCompany.companyName}
                      </SelectItem>
                    )
                )}
            </SelectContent>
          </Select>
          <Label className="block mt-5 mb-2">Commission Rate:</Label>
          <Input
            type="text"
            defaultValue={selectedRate}
            placeholder="commission rate"
          />
          <Button className="mt-5">
            {Loading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
            Add Contract
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
