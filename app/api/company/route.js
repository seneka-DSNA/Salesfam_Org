import { NextResponse } from "next/server"
import Company from "@/models/company"
import { getServerSession } from "next-auth"

import { connectMongoDB } from "@/lib/mongodb"

import { cloudDelete } from "../../../lib/cloudinary"

export async function POST(req) {
  const session = await getServerSession(req)
  if (!session) {
    return NextResponse.json("Unauthorized")
  } else {
    try {
      const {
        companyLogo,
        companyName,
        companyAddress,
        companyType,
        companyEmail,
        companyPhone,
        overview,
        rate,
        socialLink,
      } = await req.json()
      await connectMongoDB()
      const companyNameTrim = companyName?.trim()
      await Company.create({
        companyLogo,
        companyName: companyNameTrim,
        companyAddress,
        companyType,
        companyEmail,
        companyPhone,
        overview,
        rate,
        socialLink,
      })

      return NextResponse.json({ message: "Company Submited" }, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { message: "An error occurred while Company Submited." },
        { status: 500 }
      )
    }
  }
}
export async function PUT(req) {
  const session = await getServerSession(req)
  if (!session) {
    return NextResponse.json("Unauthorized")
  } else {
    const projectId = req.nextUrl.searchParams.get("id")
    try {
      const {
        companyLogo,
        companyName,
        companyAddress,
        companyType,
        companyEmail,
        companyPhone,
        overview,
        rate,
        socialLink,
      } = await req.json()

      await connectMongoDB()

      const existingCompany = await Company.findById(projectId)
      const companyNameTrim = companyName?.trim()
      const updatedFields = {
        companyName: companyNameTrim,
        companyAddress,
        companyType,
        companyEmail,
        companyPhone,
        overview,
        rate,
        socialLink,
      }

      if (companyLogo !== null) {
        await cloudDelete(existingCompany.companyLogo)
        updatedFields.companyLogo = companyLogo
      }

      await Company.findByIdAndUpdate(projectId, updatedFields)

      return NextResponse.json({ message: "Company Edited!" }, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { message: "An error occurred while Company Edit." },
        { status: 500 }
      )
    }
  }
}

export async function GET(req) {
  const session = await getServerSession(req)
  if (!session) {
    return NextResponse.json("Unauthorized")
  } else {
    const companyName = req.nextUrl.searchParams.get("companyName")
    const _id = req.nextUrl.searchParams.get("id")
    if (_id) {
      try {
        await connectMongoDB()
        const company = await Company.findOne({ _id: _id })
        return NextResponse.json({ company })
      } catch (error) {
        console.log(error)
      }
    }
    if (companyName) {
      try {
        await connectMongoDB()
        // SECURITY DEBT: ver SECURITY_DEBT.md #1 — companyName no saneado antes de construir el RegExp (ReDoS + regex injection)
        const company = await Company.findOne({
          companyName: { $regex: new RegExp("^" + companyName + "$", "i") },
        }).select()

        return NextResponse.json({ company })
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await connectMongoDB()
        const company = await Company.find().select()
        return NextResponse.json({ company })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
export async function DELETE(req) {
  const session = await getServerSession(req)
  if (!session) {
    return NextResponse.json("Unauthorized")
  } else {
    const companyName = req.nextUrl.searchParams.get("companyId")
    await connectMongoDB()
    await Company.findByIdAndDelete(companyName)
    return NextResponse.json({ message: "Company deleted" }, { status: 200 })
  }
}
