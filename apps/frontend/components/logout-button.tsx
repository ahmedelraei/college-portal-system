"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("studentId")
    localStorage.removeItem("studentName")

    // Redirect to login
    router.push("/login")
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  )
}
