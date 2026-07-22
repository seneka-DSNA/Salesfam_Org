"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@radix-ui/react-label"

import { useToast } from "@/components/ui/use-toast"

import { Icons } from "./icons"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function SetPassword(props) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [verifyPassword, setverifyPassword] = useState()
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    setLoading(true)
    e.preventDefault()
    if (!email || !password || !verifyPassword) {
      console.log("all filled required")
      toast({
        variant: "destructive",
        title: "all fields required.",
      })
      setLoading(false)
      return
    }

    // eslint-disable-next-line security/detect-possible-timing-attacks -- comparación de dos campos del mismo formulario, no de un secreto contra un valor almacenado
    if (password != verifyPassword) {
      console.log("The password you entered does not match")
      toast({
        variant: "destructive",
        title: "The password you entered does not match",
      })
      setLoading(false)
      return
    }

    try {
      const res = await fetch("api/resetPassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (res.ok) {
        toast({
          title: "user password changed!",
        })
        setLoading(false)
        // router.push("/")
      } else {
        console.log("user reg failed!")
        toast({
          variant: "destructive",
          title: "user reg failed!",
        })
        setLoading(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error during set password" + error,
      })
      console.log("Error during set password", error)
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-1 mb-4">
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <Input
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
          />
        </div>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="password">
            Password
          </Label>
          <Input
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect="off"
          />
        </div>
        <div className="grid gap-1 mt-4">
          <Label className="sr-only" htmlFor="password">
            Verify Password
          </Label>
          <Input
            onChange={(e) => setverifyPassword(e.target.value)}
            placeholder="Verify Password"
            type="password"
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect="off"
          />
        </div>
        <Button disabled={loading} className="w-full mt-4">
          {loading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
          Confirm
        </Button>
      </form>
    </div>
  )
}
