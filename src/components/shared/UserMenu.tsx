'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'

interface UserMenuProps {
  user: User | null
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) return

      const supabase = createClient()
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.is_admin || false)
    }

    checkAdminStatus()
  }, [user])

  const handleSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('Error signing out')
      return
    }

    toast.success('Signed out successfully')
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
          Sign In
        </Button>
        <Button size="sm" onClick={() => router.push('/signup')}>
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="text-lg">👤</span>
          <span className="hidden md:inline truncate max-w-[150px]">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">My Account</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
          ⚙️ Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings/password')} className="cursor-pointer">
          🔒 Change Password
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin/users')} className="cursor-pointer">
              <Shield className="h-4 w-4 mr-2" />
              Admin: Manage Users
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
          🚪 Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
