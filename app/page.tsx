"use client";

import { useMemo, useState } from "react";

type Mode = "24h" | "parcial";
type PiMethod = "auto" | "manual";

const gravedadOptions = [
  { label: "Casco cefálico / O2 ambiental", value: 0 },
  { label: "CPAP / fototerapia", value: 5 },
  { label: "Ventilación mecánica", value: 10 },
  { label: "Ventilación + fototerapia", value: 15 },
];

// Ajusta aquí si en tu servicio usan otros rangos o valores
const piaPrematuroRanges = [
  { min: 0.75, max: 1.0, pia: 64 },
  { min: 1.001, max: 1.25, pia: 56 },
  { min: 1.251, max: 1.5, pia: 38 },
  { min: 1.501, max: 1.75, pia: 23 },
  { min: 1.751, max: 2.0, pia: 20 },
  { min: 2.001, max: 3.25, pia: 20 },
];

function round2(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function getPiaPrematuroByPesoNacimiento(pesoKg: number) {
  if (!pesoKg || pesoKg <= 0) return 0;
  const range = piaPrematuroRanges.find(
    (r) => pesoKg >= r.min && pesoKg <= r.max
  );
  return range ? range.pia : 0;
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("24h");

  const [ing, setIng] = useState("");
  const [egr, setEgr] = useState("");
  const [pesoActual, setPesoActual] = useState("");
  const [pesoNacimiento, setPesoNacimiento] = useState("");
  const [diuresis, setDiuresis] = useState("");
  const [horas, setHoras] = useState("");

  const [rnPrematuro, setRnPrematuro] = useState(true);
  const [piMethod, setPiMethod] = useState<PiMethod>("auto");
  const [gravedadBase, setGravedadBase] = useState("0");
  const [piManual, setPiManual] = useState("");

  const result = useMemo(() => {
    const ING = Number(ing);
    const EGR = Number(egr);
    const PESO_ACTUAL = Number(pesoActual);
    const PESO_NAC = Number(pesoNacimiento);
    const DIURESIS = Number(diuresis);
    const HORAS = Number(horas);
    const AJUSTE_GRAVEDAD = Number(gravedadBase);
    const PI_MANUAL = Number(piManual);

    if (
      !Number.isFinite(ING) ||
      !Number.isFinite(EGR) ||
      !Number.isFinite(PESO_ACTUAL) ||
      PESO_ACTUAL <= 0
    ) {
      return null;
    }

    const pesoBusquedaPIA =
      rnPrematuro && Number.isFinite(PESO_NAC) && PESO_NAC > 0
        ? PESO_NAC
        : PESO_ACTUAL;

    const piaBase = rnPrematuro
      ? getPiaPrematuroByPesoNacimiento(pesoBusquedaPIA)
      : 20;

    const constantePI = piaBase + AJUSTE_GRAVEDAD;

    let PI = 0;
    let LR = 0;
    let UH = 0;
    let BH = 0;

    if (mode === "24h") {
      PI =
        piMethod === "manual"
          ? PI_MANUAL
          : constantePI * pesoBusquedaPIA;

      LR = ING / PESO_ACTUAL;
      UH =
        Number.isFinite(DIURESIS) && DIURESIS > 0
          ? (DIURESIS / PESO_ACTUAL) / 24
          : 0;
      BH = ING - (EGR + PI);
    } else {
      if (!Number.isFinite(HORAS) || HORAS <= 0) return null;

      PI =
        piMethod === "manual"
          ? PI_MANUAL
          : ((constantePI * pesoBusquedaPIA) / 24) * HORAS;

      LR = ((ING / PESO_ACTUAL) / HORAS) * 24;
      UH =
        Number.isFinite(DIURESIS) && DIURESIS > 0
          ? (DIURESIS / PESO_ACTUAL) / HORAS
          : 0;
      BH = ING - (EGR + PI);
    }

    return {
      pesoBusquedaPIA: round2(pesoBusquedaPIA),
      piaBase: round2(piaBase),
      ajusteGravedad: round2(AJUSTE_GRAVEDAD),
      constantePI: round2(constantePI),
      PI: round2(PI),
      LR: round2(LR),
      BH: round2(BH),
      UH: round2(UH),
    };
  }, [
    mode,
    ing,
    egr,
    pesoActual,
    pesoNacimiento,
    diuresis,
    horas,
    rnPrematuro,
    piMethod,
    gravedadBase,
    piManual,
  ]);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Balance Hídrico Neonatal
        </h1>
        <p className="mt-2 text-slate-600">
          Cálculo de PI con PIA por peso al nacimiento en RN prematuro.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setMode("24h")}
            className={`rounded-xl px-4 py-2 ${
              mode === "24h"
                ? "bg-slate-900 text-white"
                : "bg-slate-200 text-slate-800"
            }`}
          >
            24 horas
          </button>
          <button
            type="button"
            onClick={() => setMode("parcial")}
            className={`rounded-xl px-4 py-2 ${
              mode === "parcial"
                ? "bg-slate-900 text-white"
                : "bg-slate-200 text-slate-800"
            }`}
          >
            Parcial
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              1. Datos a ingresar
            </h2>

            <div className="grid gap-4">
              <Input
                label="Total de ingresos (ING) mL"
                value={ing}
                onChange={setIng}
              />

              <Input
                label="Total de egresos (EGR) mL"
                value={egr}
                onChange={setEgr}
              />

              <Input
                label="Peso actual (kg)"
                value={pesoActual}
                onChange={setPesoActual}
              />

              <Input
                label="Peso al nacimiento (kg)"
                value={pesoNacimiento}
                onChange={setPesoNacimiento}
              />

              <Input
                label="Diuresis (mL)"
                value={diuresis}
                onChange={setDiuresis}
              />

              {mode === "parcial" && (
                <Input
                  label="Horas"
                  value={horas}
                  onChange={setHoras}
                />
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                Pérdidas insensibles
              </h3>

              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="rnPrematuro"
                    type="checkbox"
                    checked={rnPrematuro}
                    onChange={(e) => setRnPrematuro(e.target.checked)}
                  />
                  <label htmlFor="rnPrematuro" className="text-sm text-slate-700">
                    RN prematuro
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Método de PI
                  </label>
                  <select
                    value={piMethod}
                    onChange={(e) => setPiMethod(e.target.value as PiMethod)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  >
                    <option value="auto">Automática</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Soporte / gravedad
                  </label>
                  <select
                    value={gravedadBase}
                    onChange={(e) => setGravedadBase(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  >
                    {gravedadOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label} + {item.value} mL/kg/día
                      </option>
                    ))}
                  </select>
                </div>

                {piMethod === "manual" && (
                  <Input
                    label="PI manual (mL)"
                    value={piManual}
                    onChange={setPiManual}
                  />
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniCard
                    title="Peso usado para PIA"
                    value={result ? `${result.pesoBusquedaPIA} kg` : "--"}
                  />
                  <MiniCard
                    title="PIA base"
                    value={result ? `${result.piaBase} mL/kg/día` : "--"}
                  />
                  <MiniCard
                    title="Ajuste gravedad"
                    value={result ? `${result.ajusteGravedad} mL/kg/día` : "--"}
                  />
                  <MiniCard
                    title="Constante PI final"
                    value={result ? `${result.constantePI} mL/kg/día` : "--"}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              2. Resultados automáticos
            </h2>

            <div className="grid gap-4">
              <ResultCard
                title="PI calculada"
                value={result ? `${result.PI} mL` : "--"}
              />
              <ResultCard
                title="Líquidos reales (LR)"
                value={result ? `${result.LR} mL/kg/día` : "--"}
              />
              <ResultCard
                title="Balance total (BH)"
                value={result ? `${result.BH} mL` : "--"}
                danger={!!result && result.BH < 0}
              />
              <ResultCard
                title="Uresis horaria (UH)"
                value={result ? `${result.UH} mL/kg/h` : "--"}
              />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Fórmulas</p>
              <p className="mt-2">PIA base = según rango de peso al nacimiento</p>
              <p>Constante PI final = PIA base + ajuste por gravedad</p>
              <p>PI = Constante PI final × peso usado para PIA</p>
              <p>BH = ING - (EGR + PI)</p>
              <p>LR = ING / peso actual</p>
              <p>UH = diuresis / peso actual / tiempo</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
      />
    </div>
  );
}

function ResultCard({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          danger ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}