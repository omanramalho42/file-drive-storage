import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Marca + Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo FileDrive"
            width={24}
            height={24}
            className="rounded-sm"
          />
          <span className="text-sm font-medium text-foreground">
            FileDrive
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="/privacidade"
          >
            Política de Privacidade
          </Link>

          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="/termos-de-uso"
          >
            Termos de Uso
          </Link>

          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="/sobre"
          >
            Sobre
          </Link>
        </div>
      </div>
    </footer>
  )
}