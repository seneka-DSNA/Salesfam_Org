"use client"

import React, { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"

const ResetPassword = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setLoading] = useState(false)

  const { data: session } = useSession()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "All fields are required",
      })
    // eslint-disable-next-line security/detect-possible-timing-attacks -- comparación de dos campos del mismo formulario, no de un secreto contra un valor almacenado
    } else if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "confirm password not match",
      })
    } else {
    setLoading(true)
      const res = await fetch("/api/resetPassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          email: session?.user?.email,
        }),
      })

      if (res.ok) {
        setLoading(false)
       await  signOut({ redirect: true }).then(() => {(window.location.href = "/login")})
        toast({
          variant: "default",
          title: "password Updated login please!",
        })
      } else {
        setLoading(false)
        console.log("reset submit failed!")
        toast({
          variant: "destructive",
          title: "reset submit failed!",
        })
        setLoading(false)
      }
    }
  }
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-md px-14 py-7 gap-y-3">
      <div className="flex items-center justify-center border rounded-full shadow-md bg-cyan-700 w-28 h-28">
      <Lock  className="text-white size-14" />
      </div>
      <h1 className="my-4 text-lg font-bold text-cyan-600">
        Now reset your password
      </h1>
      <form onSubmit={handleSubmit} action="flex flex-col gap-y-3">
        <div className="w-[350px]">
          <Label htmlFor="email">New password</Label>
          <Input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-2"
            placeholder="Enter new password"
          />
        </div>
        <div className="mt-5 grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Confirm new password </Label>
          <Input
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            className="mt-2"
            placeholder="Enter confirm password"
          />
        </div>
        <Button className="w-full my-8 font-bold bg-cyan-700" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
         Reset password
        </Button>
      </form>
    </div>
  )
}

export default ResetPassword
