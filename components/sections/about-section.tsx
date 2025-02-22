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

        <div className="mt-16 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">Why Choose Our Platform?</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-primary" />
                </div>
                <span>Real-time registration tracking and updates</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-primary" />
                </div>
                <span>Efficient group-based organization</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-primary" />
                </div>
                <span>Automated capacity management</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-primary" />
                </div>
                <span>Comprehensive registration statistics</span>
              </li>
            </ul>
          </div>

          <div className="bg-muted rounded-xl p-8">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Platform Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary">1000+</p>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-sm text-muted-foreground">Events Managed</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Active Groups</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary">98%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
