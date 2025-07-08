import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Acceso Denegado</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No tienes permisos para acceder a esta página</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Permisos Insuficientes</CardTitle>
            <CardDescription className="text-center">
              Tu rol actual no tiene los permisos necesarios para acceder a este recurso. Contacta al administrador del
              sistema si necesitas acceso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Si crees que esto es un error, por favor contacta al administrador del sistema.
              </p>
              <Link href="/">
                <Button className="w-full">Volver al Inicio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
