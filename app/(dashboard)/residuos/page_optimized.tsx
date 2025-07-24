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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && user) {
      loadResiduos();
    }
  }, [userLoading, user]);

  const loadResiduos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_residuos_with_users');

      if (!rpcError && rpcData) {
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
          etiquetas: []
        }));
        setResiduos(transformedData);
        return;
      }

      // Fallback to direct query
      const { data, error } = await supabase
        .from("residuos")
        .select(`
          *,
          usuario:users!residuos_usuario_id_fkey(nombre_completo, departamento),
          etiquetas(id, codigo_qr, tipo_etiqueta)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResiduos(data || []);
      
    } catch (error) {
      console.error("Error loading residuos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los residuos",
        variant: "destructive",
      });
      setResiduos([]);
    } finally {
      setLoading(false);
    }
  };

  // Optimized filtering with useMemo
  const filteredResiduos = useMemo(() => {
    return residuos.filter((residuo) => {
      const matchesSearch =
        residuo.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residuo.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        residuo.usuario?.nombre_completo
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesTipo = filterTipo === "all" || residuo.tipo === filterTipo;
      const matchesEstado = filterEstado === "all" || residuo.estado === filterEstado;

      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [residuos, searchTerm, filterTipo, filterEstado]);

  // Optimized stats calculation
  const stats = useMemo(() => {
    const total = residuos.length;
    const generado = residuos.filter(r => r.estado === "generado").length;
    const recolectado = residuos.filter(r => r.estado === "recolectado").length;
    const tratado = residuos.filter(r => r.estado === "tratado").length;
    const cantidadTotal = residuos.reduce((sum, r) => sum + r.cantidad, 0);

    return { total, generado, recolectado, tratado, cantidadTotal };
  }, [residuos]);

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "generado": return "destructive";
      case "recolectado": return "default";
      case "tratado": return "secondary";
      default: return "outline";
    }
  };

  if (userLoading || loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={`skeleton-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={`row-${i}`} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("residuos.title")}</h1>
          <p className="text-gray-600">{t("residuos.subtitle")}</p>
        </div>
        <Link href="/residuos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("residuos.new")}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residuos</CardTitle>
            <Trash2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">
              {stats.cantidadTotal.toFixed(2)} kg totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generados</CardTitle>
            <Plus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.generado}</div>
            <p className="text-xs text-gray-500">
              {stats.total > 0 ? Math.round((stats.generado / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recolectados</CardTitle>
            <Search className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.recolectado}</div>
            <p className="text-xs text-gray-500">
              {stats.total > 0 ? Math.round((stats.recolectado / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tratados</CardTitle>
            <QrCode className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.tratado}</div>
            <p className="text-xs text-gray-500">
              {stats.total > 0 ? Math.round((stats.tratado / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por tipo, ubicación o responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="lg:w-48">
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
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
            </div>

            <div className="lg:w-48">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="generado">Generado</SelectItem>
                  <SelectItem value="recolectado">Recolectado</SelectItem>
                  <SelectItem value="tratado">Tratado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Residuos Hospitalarios</CardTitle>
          <CardDescription>
            Mostrando {filteredResiduos.length} de {residuos.length} residuos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResiduos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Trash2 className="h-8 w-8" />
                        <p>No se encontraron residuos</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResiduos.map((residuo) => (
                    <TableRow key={residuo.id}>
                      <TableCell className="font-medium">{residuo.tipo}</TableCell>
                      <TableCell>{residuo.cantidad} kg</TableCell>
                      <TableCell>{residuo.ubicacion}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {residuo.usuario?.nombre_completo || "Usuario no disponible"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {residuo.usuario?.departamento || "Sin departamento"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadgeVariant(residuo.estado)}>
                          {residuo.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(residuo.fecha_generacion), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/residuos/${residuo.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/residuos/${residuo.id}/editar`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem>
                              <QrCode className="mr-2 h-4 w-4" />
                              Generar QR
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
