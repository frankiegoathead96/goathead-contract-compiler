import { useState, useEffect } from "react";
import { generateContract, ContractFormData } from "@/lib/pdf-generator";

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
    />
  );
}

export default function Home() {
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      setLogoDataUrl(canvas.toDataURL("image/png"));
    };
    img.src = import.meta.env.BASE_URL + "goathead-logo.png";
  }, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [leTotalAmount, setLeTotalAmount] = useState("250");
  const [upgradePrice, setUpgradePrice] = useState("740");
  const [fullAccelAmount, setFullAccelAmount] = useState("990");
  const [productionOption, setProductionOption] = useState<"a" | "b">("a");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>();
  const [compiled, setCompiled] = useState<"le" | "full-accel" | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    };
    img.onerror = () => setSignatureDataUrl(undefined);
    img.src = import.meta.env.BASE_URL + "frank-signature.png";
  }, []);

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    artistName.trim() &&
    email.trim() &&
    phone.trim();

  function compile(type: "le" | "full-accel") {
    if (!isValid) return;

    const data: ContractFormData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      artistName: artistName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      contractType: type,
      totalAmount: type === "le" ? leTotalAmount.trim() : fullAccelAmount.trim(),
      productionOption,
      upgradePrice: upgradePrice.trim(),
      logoDataUrl,
      signatureDataUrl,
    };

    generateContract(data);
    setCompiled(type);
    setTimeout(() => setCompiled(null), 2500);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {logoDataUrl ? (
              <img src={logoDataUrl} alt="Goathead Records" className="h-9 w-auto object-contain" />
            ) : (
              <h1 className="text-lg font-bold tracking-tight text-gray-900">Goathead Records</h1>
            )}
            <p className="text-xs text-gray-500">Contract Compiler</p>
          </div>
          <div className="text-right text-[11px] text-gray-400 leading-relaxed">
            <div>info@goatheadrecords.com</div>
            <div>legal@goatheadrecords.com</div>
            <div>+1 (310) 844-6358</div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Artist Information</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the artist details. Once done, choose a contract type below to compile and download.
            </p>
          </div>

          <div className="px-8 py-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="First Name">
                <Input value={firstName} onChange={setFirstName} placeholder="First Name" />
              </FieldGroup>
              <FieldGroup label="Last Name">
                <Input value={lastName} onChange={setLastName} placeholder="Last Name" />
              </FieldGroup>
            </div>

            <FieldGroup label="Artist Name">
              <Input value={artistName} onChange={setArtistName} placeholder="Artist / Stage Name" />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Email Address">
                <Input type="email" value={email} onChange={setEmail} placeholder="artist@email.com" />
              </FieldGroup>
              <FieldGroup label="Phone Number">
                <Input type="tel" value={phone} onChange={setPhone} placeholder="Phone Number" />
              </FieldGroup>
            </div>

          </div>

          <div className="px-8 py-6 border-t border-gray-100 space-y-6">
            <div className="grid grid-cols-2 gap-6">

              {/* ── L.E. Card ── */}
              <div className="rounded-lg border border-gray-200 p-5 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">L.E. Contract</h3>
                  <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 font-medium uppercase tracking-wide">
                    Limited Edition
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  12-month Accel Program — graphics, branding, management &amp; support. No song productions. Upgrade to Full Accel anytime.
                </p>

                <div className="space-y-3 flex-1">
                  <FieldGroup label="Program Price (USD)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={leTotalAmount}
                        onChange={(e) => setLeTotalAmount(e.target.value)}
                        placeholder="250"
                        className="h-10 w-full rounded-md border border-gray-200 bg-white pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
                      />
                    </div>
                  </FieldGroup>
                  <FieldGroup label="Upgrade to Full Accel (USD)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={upgradePrice}
                        onChange={(e) => setUpgradePrice(e.target.value)}
                        placeholder="740"
                        className="h-10 w-full rounded-md border border-gray-200 bg-white pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
                      />
                    </div>
                  </FieldGroup>
                </div>

                <button
                  onClick={() => compile("le")}
                  disabled={!isValid}
                  className={`mt-5 w-full h-10 rounded-md text-sm font-semibold transition-all ${
                    compiled === "le"
                      ? "bg-green-600 text-white"
                      : isValid
                      ? "bg-gray-900 text-white hover:bg-gray-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {compiled === "le" ? "✓ Downloading..." : "Compile L.E. Contract"}
                </button>
              </div>

              {/* ── Full Accel Card ── */}
              <div className="rounded-lg border border-gray-900 bg-gray-900 p-5 text-white flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-white">Full Accel Contract</h3>
                  <span className="text-[10px] bg-white/10 text-white/80 rounded-full px-2.5 py-0.5 font-medium uppercase tracking-wide">
                    Full Program
                  </span>
                </div>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  Complete 12-month Accel Program with all services. Artist selects a production option below.
                </p>

                <div className="space-y-3 flex-1">
                  {/* Option A / B toggle */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
                      Production Option
                    </label>
                    <div className="flex flex-col gap-2">
                      {(["a", "b"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setProductionOption(opt)}
                          className={`rounded-md border px-4 py-2.5 flex items-center gap-3 transition-all ${
                            productionOption === opt
                              ? "border-white bg-white text-gray-900"
                              : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${productionOption === opt ? "text-gray-500" : "text-white/40"}`}>
                            {opt === "a" ? "A" : "B"}
                          </span>
                          <span className="text-xs text-left leading-snug">
                            {opt === "a" ? "7 Mix / Mastering Songs Bundle" : "3 Original Productions"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
                      Total Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">$</span>
                      <input
                        type="number"
                        value={fullAccelAmount}
                        onChange={(e) => setFullAccelAmount(e.target.value)}
                        placeholder="990"
                        className="h-10 w-full rounded-md border border-white/20 bg-white/10 pl-7 pr-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => compile("full-accel")}
                  disabled={!isValid}
                  className={`mt-5 w-full h-10 rounded-md text-sm font-semibold transition-all ${
                    compiled === "full-accel"
                      ? "bg-green-500 text-white"
                      : isValid
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {compiled === "full-accel" ? "✓ Downloading..." : "Compile Full Accel Contract"}
                </button>
              </div>
            </div>

            {!isValid && (
              <p className="text-center text-xs text-gray-400">
                Fill in all artist fields above to enable contract compilation.
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-gray-400 border-t border-gray-200 bg-white">
        Goathead Records · Music Division of Cloudchasers Entertainment L.L.C. · Confidential Use Only
      </footer>
    </div>
  );
}
