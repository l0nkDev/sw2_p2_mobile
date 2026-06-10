import { createApi } from '@reduxjs/toolkit/query/react'
import { ClientError, GraphQLClient } from 'graphql-request'

const client = new GraphQLClient('https://pharmacy.lonk.dev/graphql')
// const client = new GraphQLClient('http://10.5.205.211:3000/graphql')

const graphqlBaseQuery =
  () =>
  async ({ body, variables }: { body: string; variables?: any }, { getState }: any) => {
    try {
      const state = getState()
      const token = state.auth?.token
      if (token) {
        client.setHeader('authorization', `Bearer ${token}`)
      } else {
        client.setHeader('authorization', '')
      }
      const result = await client.request(body, variables)
      return { data: result }
    } catch (error) {
      if (error instanceof ClientError) {
        return { error: { status: error.response.status, data: error.response.data } }
      }
      return { error: { status: 500, data: String(error) } }
    }
  }

export const api = createApi({
  reducerPath: 'api',
  baseQuery: graphqlBaseQuery(),
  tagTypes: ['Producto', 'Sucursal', 'Venta'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (variables: { correo_electronico: string; contrasena: string }) => ({
        body: `
          mutation Login($correo_electronico: String!, $contrasena: String!) {
            login(input: {
              correo_electronico: $correo_electronico
              contrasena: $contrasena
            }) {
              access_token
            }
          }
        `,
        variables,
      }),
    }),
    register: builder.mutation({
      query: (variables: {
        nombre: string
        apellido: string
        correo_electronico: string
        nombre_usuario: string
        contrasena: string
        celular?: string
      }) => ({
        body: `
          mutation Register($input: RegisterDto!) {
            register(input: $input) {
              access_token
            }
          }
        `,
        variables: { input: variables },
      }),
    }),
    getSucursales: builder.query({
      query: () => ({
        body: `
          query GetSucursales {
            sucursales {
              id
              nombre
              direccion
              latitud
              longitud
            }
          }
        `,
      }),
      providesTags: ['Sucursal'],
    }),
    getProductos: builder.query({
      query: (variables: { sucursalId: number }) => ({
        body: `
          query GetProductos($sucursalId: Int) {
            productos(sucursalId: $sucursalId) {
              id
              nombre
              precio_venta
              stock_actual
              sucursal_id
            }
          }
        `,
        variables,
      }),
      providesTags: ['Producto'],
    }),
    createVenta: builder.mutation({
      query: (variables: {
        sucursalId: number
        detalles: { productoId: number; cantidad: number }[]
      }) => ({
        body: `
          mutation CreateVenta($input: CreateVentaDto!) {
            createVenta(input: $input) {
              message
              venta {
                id
                total
              }
            }
          }
        `,
        variables: { input: variables },
      }),
      invalidatesTags: ['Producto', 'Venta'],
    }),
    getVentas: builder.query({
      query: () => ({
        body: `
          query GetVentas {
            ventas {
              id
              numero_venta
              fecha_venta
              estado
              sucursal_id
              total
              detalles {
                id
                producto_nombre
                cantidad
                precio_unitario
                subtotal
              }
            }
          }
        `,
      }),
      providesTags: ['Venta'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetSucursalesQuery,
  useGetProductosQuery,
  useCreateVentaMutation,
  useGetVentasQuery,
} = api
