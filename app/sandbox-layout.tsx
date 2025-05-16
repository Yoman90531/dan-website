"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(pathname)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-lg font-semibold text-gray-900">
                JPM PDP Sandbox
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/project4"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "/project4"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("/project4")}
              >
                Project 4
              </Link>
              <Link
                href="/stats"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "/stats"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => setActiveTab("/stats")}
              >
                Stats
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
