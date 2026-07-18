"use client"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { fetchInvoices } from "@/lib/fetchInvoices"
import { fetchProjects } from "@/lib/fetchProjects"

import AdminIA from "./AdminIA"
import SalesOne from "./SalesOne"
import SalesTwo from "./SalesTwo"
import SuperAdmin from "./SuperAdmin"


export default function DashboardPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const username = session?.user?.name

  useEffect(() => {
    if (session && role == "Sales2") {
      fetchProjects()
        .then((apiData) => {
          if (apiData) {
            const pendingProjects = apiData.filter(
              (item) => item.status == "Pending" && item.salesPerson == username
            )
            const filteredData = apiData.filter(
              (item) =>
                item.status !== "Pending" && item.salesPerson == username
            )

            const completedproject = apiData.filter(
              (item) =>
                item.status == "Complete" && item.salesPerson == username
            )

            const uniqueClientNames = []

            filteredData.forEach((item) => {
              if (!uniqueClientNames.includes(item.clientName)) {
                uniqueClientNames.push(item.clientName)
              }
            })

            setcompletedproject(completedproject)
            setclientName(uniqueClientNames)
            setpendingProject(pendingProjects)
            setData(filteredData)
            setLoading(false)
          }
        })
        .catch((error) => {
          console.error("Error in component:", error)
        })

      fetchInvoices()
        .then((invoiceData) => {
          if (invoiceData) {
            const earning = invoiceData.filter(
              (item) =>
                item.status == "Paid" &&
                item.commission_paid == "Yes" &&
                item.userId == session?.user?.id
            )

            const total = earning.reduce(
              (total, item) => total + (item.amount / 100) * item.rate,
              0
            )

            settotalEarn(total)
          }
        })
        .catch((error) => {
          console.error("Error in component:", error)
        })
    }
  }, [session, role, username])

  return (
    <>
      <div className="container mt-5 min-w-[1400px]">
        {role == "SuperAdmin" && <SuperAdmin />}
        {role == "Admin-IA" && <AdminIA />}
        {role == "Sales1" && <SalesOne />}
        {role == "Sales2" && <SalesTwo />}
      </div>
    </>
  )
}
