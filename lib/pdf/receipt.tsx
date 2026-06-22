import { renderToBuffer, Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"

// Police par défaut (Helvetica) : aucune dépendance réseau ni woff2 (non supporté par
// @react-pdf), donc le rendu ne peut plus échouer à cause de la police.
const LOGO_URL = "https://vocali.ca/vocali-logo-white.png"

const styles = StyleSheet.create({
  page: { fontSize: 10, color: "#1C1C1E", backgroundColor: "#FFFFFF", padding: 0 },
  header: { backgroundColor: "#1C1C1E", paddingHorizontal: 48, paddingTop: 40, paddingBottom: 32, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 90, height: 28, objectFit: "contain" },
  headerRight: { alignItems: "flex-end" },
  receiptLabel: { color: "#C9A864", fontSize: 9, fontWeight: 600, letterSpacing: 2, marginBottom: 4 },
  headerDate: { color: "#FFFFFF", fontSize: 11 },
  goldBar: { height: 3, backgroundColor: "#C9A864" },
  body: { paddingHorizontal: 48, paddingTop: 40, paddingBottom: 80 },
  invoiceNumberRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  invoiceNumber: { fontSize: 20, fontWeight: 600, color: "#1C1C1E" },
  badge: { backgroundColor: "#F0FAF4", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#6ed4a4" },
  badgeText: { color: "#1a7a4a", fontSize: 9, fontWeight: 600 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 8, fontWeight: 600, color: "#8C8C90", letterSpacing: 1.5, marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: "#EDE3D4" },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { color: "#8C8C90", width: 100, fontSize: 10 },
  infoValue: { color: "#1C1C1E", flex: 1, fontSize: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#FAF7F2", borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 2 },
  tableRow: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F5EFE6" },
  tableColDesc: { flex: 3, fontSize: 9, fontWeight: 600, color: "#8C8C90" },
  tableColAmount: { flex: 1, textAlign: "right", fontSize: 9, fontWeight: 600, color: "#8C8C90" },
  tableDescValue: { flex: 3, fontSize: 10, color: "#1C1C1E" },
  tableAmountValue: { flex: 1, textAlign: "right", fontSize: 10, color: "#1C1C1E" },
  totalRow: { flexDirection: "row", paddingHorizontal: 14, paddingTop: 12, marginTop: 4 },
  totalLabel: { flex: 3, fontSize: 12, fontWeight: 600, color: "#1C1C1E" },
  totalAmount: { flex: 1, textAlign: "right", fontSize: 14, fontWeight: 600, color: "#C9A864" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: "#EDE3D4", paddingHorizontal: 48, paddingVertical: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { color: "#B0B0B3", fontSize: 8.5 },
  footerGold: { color: "#C9A864", fontSize: 8.5, fontWeight: 600 },
})

export type InvoicePDFData = {
  id: string
  number: string | null
  amount_paid: number
  currency: string
  created: number
  period_start: number | null
  period_end: number | null
  customer_email: string | null
  lines: Array<{ description: string | null; amount: number }>
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100)
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })
}

function getPeriod(start: number | null): string {
  if (!start) return ""
  const d = new Date(start * 1000)
  const label = d.toLocaleDateString("fr-CA", { month: "long", year: "numeric" })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export async function buildReceiptPDF(invoice: InvoicePDFData, clinicName: string): Promise<Buffer> {
  const period = getPeriod(invoice.period_start)
  const invoiceRef = invoice.number ?? invoice.id.slice(-8).toUpperCase()

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={LOGO_URL} style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.receiptLabel}>REÇU DE PAIEMENT</Text>
            <Text style={styles.headerDate}>{formatDate(invoice.created)}</Text>
          </View>
        </View>
        <View style={styles.goldBar} />

        <View style={styles.body}>
          <View style={styles.invoiceNumberRow}>
            <Text style={styles.invoiceNumber}>#{invoiceRef}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Payé</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FACTURÉ À</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Clinique</Text>
              <Text style={styles.infoValue}>{clinicName}</Text>
            </View>
            {invoice.customer_email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Courriel</Text>
                <Text style={styles.infoValue}>{invoice.customer_email}</Text>
              </View>
            )}
            {period && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Période</Text>
                <Text style={styles.infoValue}>{period}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SERVICES</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColDesc}>Description</Text>
              <Text style={styles.tableColAmount}>Montant</Text>
            </View>
            {invoice.lines.map((line, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableDescValue}>{line.description ?? "Abonnement Vocali"}</Text>
                <Text style={styles.tableAmountValue}>{formatAmount(line.amount, invoice.currency)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatAmount(invoice.amount_paid, invoice.currency)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vocali Inc.  ·  contact@vocali.ca</Text>
          <Text style={styles.footerGold}>vocali.ca</Text>
        </View>
      </Page>
    </Document>
  )

  return Buffer.from(await renderToBuffer(doc))
}
