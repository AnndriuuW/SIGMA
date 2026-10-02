import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

interface VehiculoDetallePDFProps {
  unidad: {
    nombre: string;
    indicativo?: string | null;
  };

  ubicaciones: Array<{
    id: number;
    nombre: string;
    tipo: string;
  }>;

  recursos: Array<{
    id: number;
    nombre: string;
    codigo: string;
    nombreTipoRecurso: string;
    marca?: string | null;
  }>;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 42,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },

  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#d9dee5",
    paddingBottom: 16,
    marginBottom: 20,
  },

  logo: {
    width: 52,
    height: 52,
    objectFit: "contain",
    marginBottom: 10,
  },

  system: {
    fontSize: 9,
    color: "#b32025",
    fontWeight: 700,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  title: {
    fontSize: 22,
    color: "#172033",
    fontWeight: 700,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 10,
    color: "#6f7a89",
  },

  summary: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#dfe4ea",
    marginBottom: 22,
  },

  summaryItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#dfe4ea",
  },

  summaryItemLast: {
    borderRightWidth: 0,
  },

  summaryLabel: {
    fontSize: 8,
    color: "#7f8998",
    marginBottom: 4,
    fontWeight: 700,
  },

  summaryValue: {
    fontSize: 11,
    color: "#172033",
    fontWeight: 700,
  },

  sectionTitle: {
    fontSize: 13,
    color: "#172033",
    fontWeight: 700,
    marginBottom: 10,
  },

  locationBlock: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d7dde5",
    breakInside: "avoid",
  },

  locationHeader: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: "#f0f2f4",
    borderBottomWidth: 1,
    borderBottomColor: "#d7dde5",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  locationHeaderLeft: {
    flexDirection: "row",
  },

  locationNumber: {
    width: 30,
    fontSize: 10,
    color: "#b32025",
    fontWeight: 700,
  },

  locationType: {
    fontSize: 8,
    color: "#b32025",
    fontWeight: 700,
    marginBottom: 2,
    textTransform: "uppercase",
  },

  locationName: {
    fontSize: 10,
    color: "#172033",
    fontWeight: 700,
  },

  locationCount: {
    fontSize: 8,
    color: "#6f7a89",
  },

  resource: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e3e7eb",
    flexDirection: "row",
  },

  resourceLast: {
    borderBottomWidth: 0,
  },

  resourceMain: {
    flex: 1,
    paddingRight: 15,
  },

  resourceName: {
    fontSize: 9,
    color: "#253247",
    fontWeight: 700,
    marginBottom: 3,
  },

  resourceType: {
    fontSize: 7.5,
    color: "#8792a0",
  },

  resourceCode: {
    width: 125,
    fontSize: 8,
    color: "#687586",
    fontFamily: "Courier",
    textAlign: "right",
  },

  empty: {
    padding: 12,
    fontSize: 8,
    color: "#8b95a3",
  },

  footer: {
    marginTop: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d9dee5",
    fontSize: 7,
    color: "#8993a1",
  },
});

export default function VehiculoDetallePDF({
  unidad,
  ubicaciones,
  recursos,
}: VehiculoDetallePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src="/src/assets/Logo_B120.jpg"
            style={styles.logo}
          />

          <Text style={styles.system}>
            SIGMA · REPORTE INSTITUCIONAL
          </Text>

          <Text style={styles.title}>
            {unidad.nombre}
          </Text>

          <Text style={styles.subtitle}>
            Detalle de unidad e inventario de recursos
          </Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              INDICATIVO
            </Text>

            <Text style={styles.summaryValue}>
              {unidad.indicativo || "—"}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>
              UBICACIONES
            </Text>

            <Text style={styles.summaryValue}>
              {ubicaciones.length}
            </Text>
          </View>

          <View
            style={[
              styles.summaryItem,
              styles.summaryItemLast,
            ]}
          >
            <Text style={styles.summaryLabel}>
              RECURSOS
            </Text>

            <Text style={styles.summaryValue}>
              {recursos.length}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          UBICACIONES Y RECURSOS
        </Text>

        {ubicaciones.map((ubicacion, index) => {
          const recursosUbicacion = recursos.filter(
            (recurso) =>
              (recurso as any).idUbicacion === ubicacion.id,
          );

          return (
            <View
              key={ubicacion.id}
              style={styles.locationBlock} wrap={false}
            >
              <View style={styles.locationHeader}>
                <View style={styles.locationHeaderLeft}>
                  <Text style={styles.locationNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>

                  <View>
                    <Text style={styles.locationType}>
                      {ubicacion.tipo.replaceAll("_", " ")}
                    </Text>

                    <Text style={styles.locationName}>
                      {ubicacion.nombre}
                    </Text>
                  </View>
                </View>

                <Text style={styles.locationCount}>
                  {recursosUbicacion.length}{" "}
                  {recursosUbicacion.length === 1
                    ? "recurso"
                    : "recursos"}
                </Text>
              </View>

              {recursosUbicacion.length > 0 ? (
                recursosUbicacion.map(
                  (recurso, recursoIndex) => (
                    <View
                      key={recurso.id}
                      style={[
                        styles.resource,
                        recursoIndex ===
                          recursosUbicacion.length - 1
                          ? styles.resourceLast
                          : {},
                      ]}
                    >
                      <View style={styles.resourceMain}>
                        <Text style={styles.resourceName}>
                          {recurso.nombre}
                        </Text>

                        <Text style={styles.resourceType}>
                          {recurso.nombreTipoRecurso}
                          {recurso.marca
                            ? ` · ${recurso.marca}`
                            : ""}
                        </Text>
                      </View>

                      <Text style={styles.resourceCode}>
                        {recurso.codigo}
                      </Text>
                    </View>
                  ),
                )
              ) : (
                <Text style={styles.empty}>
                  Sin recursos asignados.
                </Text>
              )}
            </View>
          );
        })}

        <Text style={styles.footer}>
          SIGMA · Gestión de Máquinas · Compañía de
          Bomberos 120
        </Text>
      </Page>
    </Document>
  );
}