"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  QrCode,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/use-current-user";
import { WASTE_TYPES } from "@/lib/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";

interface Residuo {
  id: string;
  tipo: string;
  cantidad: number;
  ubicacion: string;
  fecha_generacion: string;
  estado: string;
  created_at: string;
  usuario_id?: string;
  usuario: {
    nombre_completo: string;
    departamento: string | null;
  } | null;
  etiquetas: {
    id: string;
    codigo_qr: string;
    tipo_etiqueta: string;
  }[];
}

export default function ResiduosPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [residuos, setResiduos] = useState<Residuo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const { t } = useLanguage();

  useEffect(() => {
    if (!userLoading && user) {
      loadResiduos();
    }
  }, [userLoading, user]);

  const loadResiduos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadResiduos = async (user: User) => {
    try {
      console.log("Loading residuos for user:", user.rol);
      
      // First attempt: Use our new RPC function that bypasses RLS
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_residuos_with_users');

      if (!rpcError && rpcData) {
        console.log("RPC get_residuos_with_users successful:", rpcData.length, "residuos");
        
        // Transform RPC data to expected format
        const transformedData = rpcData.map((residuo: any) => ({
          id: residuo.id,
          tipo: residuo.tipo,
          cantidad: residuo.cantidad,
          ubicacion: residuo.ubicacion,
          estado: residuo.estado,
          fecha_generacion: residuo.fecha_generacion,
          usuario_id: residuo.usuario_id,
          created_at: residuo.created_at,
          usuario: residuo.usuario_nombre ? {
            nombre_completo: residuo.usuario_nombre,
            departamento: residuo.usuario_departamento
          } : null,
          etiquetas: [] // We'll load these separately if needed
        }));
        
        // Filter by user if needed
        const filteredData = !["supervisor", "admin"].includes(user.rol) 
          ? transformedData.filter((r: any) => r.usuario_id === user.id)
          : transformedData;
        
        console.log("Residuos after filtering:", filteredData.length);
        console.log("Residuos with users:", filteredData.filter((r: any) => r.usuario).length);
        setResiduos(filteredData);
        return;
      }

      console.error("RPC get_residuos_with_users failed:", rpcError);

      // Fallback: original query with JOIN
      let query = supabase
        .from("residuos")
        .select(
          `
          *,
          usuario:users(nombre_completo, departamento),
          etiquetas(id, codigo_qr, tipo_etiqueta)
        `
        )
        .order("created_at", { ascending: false });

      // Filtrar por usuario si no es supervisor o admin
      if (!["supervisor", "admin"].includes(user.rol)) {
        query = query.eq("usuario_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading residuos with JOIN:", error);
        
        // Second fallback: cargar residuos sin join si falla
        console.log("Intentando segundo fallback sin join...");
        const { data: residuosData, error: residuosError } = await supabase
          .from("residuos")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (residuosError) {
          throw residuosError;
        }
        
        // Cargar usuarios por separado
        const { data: usuariosData } = await supabase
          .from("users")
          .select("id, nombre_completo, departamento");
          
        // Mapear usuarios a residuos
        const residuosWithUsers = residuosData?.map((residuo: any) => ({
          ...residuo,
          usuario: usuariosData?.find((u: any) => u.id === residuo.usuario_id) || null,
          etiquetas: []
        })) || [];
        
        console.log("Second fallback - Residuos cargados:", residuosWithUsers.length);
        console.log("Second fallback - Residuos with users:", residuosWithUsers.filter((r: any) => r.usuario).length);
        setResiduos(residuosWithUsers);
        return;
      }
      
      console.log("JOIN query successful - Residuos cargados:", data?.length || 0);
      console.log("JOIN query - Residuos sin usuario:", data?.filter((r: any) => !r.usuario).length || 0);
      
      setResiduos(data || []);
    } catch (error) {
      console.error("Error loading residuos:", error);
      setResiduos([]);
    }
  };

  const getWasteTypeInfo = (tipo: string) => {
    return (
      WASTE_TYPES.find((w) => w.value === tipo) || {
        label: tipo,
        color: "gray",
      }
    );
  };

  const getEstadoBadge = (
    estado: string
  ): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<
      string,
      "default" | "destructive" | "outline" | "secondary"
    > = {
      generado: "secondary",
      etiquetado: "default",
      pesado: "outline",
      almacenado: "secondary",
      entregado: "default",
    };
    return variants[estado] ?? "secondary";
  };

  const filteredResiduos = residuos.filter((residuo) => {
    const matchesSearch =
      residuo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      residuo.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (residuo.usuario?.nombre_completo || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesTipo = filterTipo === "all" || residuo.tipo === filterTipo;
    const matchesEstado =
      filterEstado === "all" || residuo.estado === filterEstado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted animate-pulse rounded w-48" />
          <div className="h-10 bg-muted animate-pulse rounded w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`residuo-skeleton-${i}`} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("gestionResiduos")}
          </h1>
          <p className="text-muted-foreground">
            {t("registroSeguimientoResiduos")}
          </p>
        </div>
        {user && ["generador", "admin"].includes(user.rol) && (
          <Link href="/residuos/nuevo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("registrarResiduo")}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalResiduos")}
            </CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{residuos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pendientes")}
            </CardTitle>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {residuos.filter((r) => r.estado === "generado").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("etiquetados")}
            </CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {residuos.filter((r) => r.etiquetas.length > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregados</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {residuos.filter((r) => r.estado === "entregado").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tipo, ubicación o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de residuo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {WASTE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="generado">Generado</SelectItem>
                <SelectItem value="etiquetado">Etiquetado</SelectItem>
                <SelectItem value="pesado">Pesado</SelectItem>
                <SelectItem value="almacenado">Almacenado</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterTipo !== "all" || filterEstado !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterTipo("all");
                  setFilterEstado("all");
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Residuos Registrados</CardTitle>
          <CardDescription>
            {filteredResiduos.length} de {residuos.length} residuos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Etiquetas</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResiduos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No se encontraron residuos.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResiduos.map((residuo) => {
                    const wasteType = getWasteTypeInfo(residuo.tipo);
                    return (
                      <TableRow key={residuo.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {wasteType.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {residuo.cantidad} kg
                        </TableCell>
                        <TableCell>{residuo.ubicacion}</TableCell>
                        <TableCell>
                          {residuo.usuario ? (
                            <div className="space-y-1">
                              <div className="font-medium">
                                {residuo.usuario.nombre_completo}
                              </div>
                              {residuo.usuario.departamento && (
                                <div className="text-sm text-muted-foreground">
                                  {residuo.usuario.departamento}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic">
                              Usuario no disponible
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadge(residuo.estado)}>
                            {residuo.estado.charAt(0).toUpperCase() +
                              residuo.estado.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(residuo.fecha_generacion),
                            "dd/MM/yyyy HH:mm",
                            { locale: es }
                          )}
                        </TableCell>
                        <TableCell>
                          {residuo.etiquetas.length > 0 ? (
                            <Badge variant="default" className="gap-1">
                              <QrCode className="h-3 w-3" />
                              {residuo.etiquetas.length}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Sin etiqueta</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/residuos/${residuo.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("verDetalles")}
                                </Link>
                              </DropdownMenuItem>
                              {user &&
                                ["supervisor", "admin"].includes(user.rol) && (
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/residuos/${residuo.id}/editar`}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      {t("editar")}
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              {residuo.etiquetas.length === 0 && (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/etiquetas/generar?residuo=${residuo.id}`}
                                  >
                                    <QrCode className="mr-2 h-4 w-4" />
                                    {t("generarEtiqueta")}
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
