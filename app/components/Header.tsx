import { Bell, Menu, Mic, Search, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header({ visible = true, onMenuClick }: { visible?: boolean; onMenuClick?: () => void }) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background border-b transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">YourTube</h1>
      </div>
      <div className="flex-1 max-w-2xl mx-4">
        <div className="flex">
          <Input type="search" placeholder="Buscar" className="rounded-r-none" />
          <Button className="rounded-l-none">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="ml-2">
            <Mic className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Upload className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-6 w-6" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configurar cuenta</DropdownMenuItem>
            <DropdownMenuItem>Cambiar cuenta</DropdownMenuItem>
            <DropdownMenuItem>Cambiar tema</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

