"use client"

import React from 'react'

import {
  OrganizationSwitcher,
  SignInButton,
  SignOutButton,
  UserButton
} from '@clerk/nextjs'
import { Button } from '../ui/button'
import { Authenticated, Unauthenticated } from 'convex/react'

interface HeaderProps {}

const Header:React.FC<HeaderProps> = ({}) => {
  return (
    <div className="border-b py-4 bg-gray-50">
      <div className="items-center container px-20 mx-auto justify-between flex">
        <div>FileDrive</div>
        <div className="flex gap-2">

          <div className='flex items-center gap-2'>
            <OrganizationSwitcher />
            <UserButton />
          </div>

          <div>
            <Unauthenticated>
              <SignInButton>
                <Button>
                  Entrar
                </Button>
              </SignInButton>
            </Unauthenticated>
            <Authenticated>
              <SignOutButton>
                <Button>
                  Sair
                </Button>
              </SignOutButton>
            </Authenticated>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header