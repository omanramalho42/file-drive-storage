import { OrganizationSwitcher, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import { Button } from '../ui/button'

interface HeaderProps {}

const Header:React.FC<HeaderProps> = ({}) => {
  return (
    <div className="border-b py-4 bg-gray-50">
      <div className="items-center container mx-auto justify-between flex">
        <div>FileDrive</div>
        <div className="flex gap-2">

          <div className='flex items-center gap-2'>
            <OrganizationSwitcher />
            <UserButton />
          </div>

          <div>
            <SignInButton>
              <Button>
                Entrar
              </Button>
            </SignInButton>

            <SignOutButton>
              <Button>
                Sair
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header