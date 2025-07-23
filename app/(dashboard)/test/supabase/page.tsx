"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

export default function SupabaseTestPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults = []

    try {
      // Test 1: Conexión básica
      testResults.push({ test: "Conexión Supabase", status: "OK", data: "Conectado" })

      // Test 2: Usuario actual
      try {
        const user = await getCurrentUser()
        testResults.push({ 
          test: "Usuario actual", 
          status: user ? "OK" : "ERROR", 
          data: user ? `ID: ${user.id}` : "No autenticado" 
        })
      } catch (err) {
        testResults.push({ test: "Usuario actual", status: "ERROR", data: String(err) })
      }

      // Test 3: Listar tablas
      try {
        const { data, error } = await supabase.rpc('get_schema_tables')
        testResults.push({ 
          test: "Listar tablas", 
          status: error ? "ERROR" : "OK", 
          data: error ? String(error) : `${data?.length || 0} tablas encontradas` 
        })
      } catch (err) {
        testResults.push({ test: "Listar tablas", status: "SKIP", data: "RPC no disponible" })
      }

      // Test 4: Consulta básica a residuos
      try {
        const { data, error } = await supabase
          .from("residuos")
          .select("count", { count: 'exact', head: true })

        testResults.push({ 
          test: "Tabla residuos - count", 
          status: error ? "ERROR" : "OK", 
          data: error ? String(error) : `${data?.length || 0} registros` 
        })
      } catch (err) {
        testResults.push({ test: "Tabla residuos - count", status: "ERROR", data: String(err) })
      }

      // Test 5: Consulta completa a residuos
      try {
        const { data, error } = await supabase
          .from("residuos")
          .select("*")
          .limit(5)

        testResults.push({ 
          test: "Tabla residuos - select", 
          status: error ? "ERROR" : "OK", 
          data: error ? String(error) : JSON.stringify(data?.slice(0, 2), null, 2) 
        })
      } catch (err) {
        testResults.push({ test: "Tabla residuos - select", status: "ERROR", data: String(err) })
      }

      // Test 6: Verificar gestores externos
      try {
        const { data, error } = await supabase
          .from("gestores_externos")
          .select("*")
          .limit(5)

        testResults.push({ 
          test: "Tabla gestores_externos", 
          status: error ? "ERROR" : "OK", 
          data: error ? String(error) : `${data?.length || 0} gestores encontrados` 
        })
      } catch (err) {
        testResults.push({ test: "Tabla gestores_externos", status: "ERROR", data: String(err) })
      }

    } catch (error) {
      testResults.push({ test: "Error general", status: "ERROR", data: String(error) })
    }

    setResults(testResults)
    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Supabase</h1>
        <p className="text-muted-foreground">Verificar conexión y datos en Supabase</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={runTests} disabled={loading}>
          {loading ? "Ejecutando tests..." : "Ejecutar Tests"}
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  result.status === 'OK' ? 'bg-green-500' : 
                  result.status === 'ERROR' ? 'bg-red-500' : 
                  'bg-yellow-500'
                }`} />
                {result.test}
              </CardTitle>
              <CardDescription>Status: {result.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                {result.data}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
