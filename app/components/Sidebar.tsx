import { Home, Tv, Music, SmilePlus, Gamepad2, Clock, ThumbsUp, Flame, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  return (
    <ScrollArea
      className={`w-64 border-r bg-background transition-all duration-300 fixed top-0 left-0 h-full z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 space-y-4">
        <Button variant="ghost" className="w-full justify-start" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Cerrar
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Home className="mr-2 h-4 w-4" />
          Inicio
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Flame className="mr-2 h-4 w-4" />
          Tendencias
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Suscripciones
        </Button>
        <hr className="my-4" />
        <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">Categorías</h3>
        <Button variant="ghost" className="w-full justify-start">
          <Tv className="mr-2 h-4 w-4" />
          Noticias
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Music className="mr-2 h-4 w-4" />
          Música
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <SmilePlus className="mr-2 h-4 w-4" />
          Videos de risa
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Gamepad2 className="mr-2 h-4 w-4" />
          Videojuegos
        </Button>
        <hr className="my-4" />
        <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">Biblioteca</h3>
        <Button variant="ghost" className="w-full justify-start">
          <Clock className="mr-2 h-4 w-4" />
          Historial
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <ThumbsUp className="mr-2 h-4 w-4" />
          Videos que me gustan
        </Button>
      </div>
    </ScrollArea>
  )
}

