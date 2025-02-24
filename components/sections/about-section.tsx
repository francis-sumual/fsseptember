import { Calendar, Users, ClipboardCheck, Bell } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Tepro September 2025</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Maksud dan tujuan Tepro September 2025 adalah sebagai sarana refleksi diri terhadap sikap pelayanan sebagai
            seorang prodiakon/prodiakones.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Sebagai sarana berbagi pengalaman sesama prodiakon, penyegaran iman dan tentunya sarana untuk meningkatkan
            kebersamaan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-background rounded-lg p-6 shadow-sm">
            <Calendar className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tanggal Pelaksanaan</h3>
            <p className="text-muted-foreground">Skedul pelaksanaan Tanggal 17 September 2025.</p>
          </div>

          <div className="bg-background rounded-lg p-6 shadow-sm">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Peserta</h3>
            <p className="text-muted-foreground">
              Seluruh Prodiakon dan Prodiakones dapat mengikuti Tepro September 2025, baik dari kelompok 1, 2, 3 dan 4.
            </p>
          </div>

          <div className="bg-background rounded-lg p-6 shadow-sm">
            <ClipboardCheck className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sistim Pendaftaran</h3>
            <p className="text-muted-foreground">Secara onlne melalu web ini, perhatikan petunjuk pendaftaran.</p>
          </div>

          <div className="bg-background rounded-lg p-6 shadow-sm">
            <Bell className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Konfirmasi Pendaftaran</h3>
            <p className="text-muted-foreground">
              Peserta yang sudah terdaftar dapat dilihat pada list pendaftar, hubungi panitia jika ada kendala.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
