"use client";

import { useMemo, useState } from "react";

type Mode = "24h" | "parcial";
type MetodoPerdidasInsensibles = "pesoNacimiento" | "gravedad" | "manual";

const soporteGravedadOptions = [
  { label: "Casco cefálico / Oxígeno ambiental", value: 25 },
  { label: "CPAP nasal y/o fototerapia", value: 35 },
  { label: "Ventilación mecánica", value: 45 },
  { label: "Ventilación mecánica + fototerapia", value: 55 },
];

const perdidasInsensiblesPorPesoNacimiento = [
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

function getPerdidasInsensiblesPorPesoNacimiento(pesoKg: number) {
  if (!pesoKg || pesoKg <= 0) return 0;

  const range = perdidasInsensiblesPorPesoNacimiento.find(
    (r) => pesoKg >= r.min && pesoKg <= r.max
  );

  return range ? range.pia : 0;
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("24h");

  const [ingresosTotales, setIngresosTotales] = useState("");
  const [egresosTotales, setEgresosTotales] = useState("");
  const [pesoActual, setPesoActual] = useState("");
  const [pesoAlNacimiento, setPesoAlNacimiento] = useState("");
  const [diuresisTotal, setDiuresisTotal] = useState("");
  const [horasParciales, setHorasParciales] = useState("");

  const [metodoPerdidasInsensibles, setMetodoPerdidasInsensibles] =
    useState<MetodoPerdidasInsensibles>("pesoNacimiento");

  const [soporteGravedadSeleccionado, setSoporteGravedadSeleccionado] =
    useState("25");

  const [perdidasInsensiblesManual, setPerdidasInsensiblesManual] = useState("");

  const result = useMemo(() => {
    const ING = Number(ingresosTotales);
    const EGR = Number(egresosTotales);
    const PESO_ACTUAL = Number(pesoActual);
    const PESO_NACIMIENTO = Number(pesoAlNacimiento);
    const DIURESIS = Number(diuresisTotal);
    const HORAS = Number(horasParciales);
    const SOPORTE_GRAVEDAD = Number(soporteGravedadSeleccionado);
    const PI_MANUAL = Number(perdidasInsensiblesManual);

    if (
      !Number.isFinite(ING) ||
      !Number.isFinite(EGR) ||
      !Number.isFinite(PESO_ACTUAL) ||
      PESO_ACTUAL <= 0
    ) {
      return null;
    }

    let valorPerdidasInsensibles = 0;
    let pesoUsadoParaPerdidasInsensibles = 0;
    let valorPerdidasInsensiblesPorPesoNacimiento = 0;
    let valorPerdidasInsensiblesPorGravedad = 0;

    let liquidosReales = 0;
    let balanceHidricoTotal = 0;
    let uresisHoraria = 0;

    let procedimientoPerdidasInsensibles = "";
    let procedimientoLR = "";
    let procedimientoBH = "";
    let procedimientoUH = "";
    let nombreMetodoPerdidasInsensibles = "";

    if (metodoPerdidasInsensibles === "pesoNacimiento") {
      if (!Number.isFinite(PESO_NACIMIENTO) || PESO_NACIMIENTO <= 0) {
        return null;
      }

      pesoUsadoParaPerdidasInsensibles = PESO_NACIMIENTO;
      valorPerdidasInsensiblesPorPesoNacimiento =
        getPerdidasInsensiblesPorPesoNacimiento(PESO_NACIMIENTO);

      nombreMetodoPerdidasInsensibles =
        "Pérdidas insensibles de agua por peso al nacimiento";

      if (mode === "24h") {
        valorPerdidasInsensibles =
          valorPerdidasInsensiblesPorPesoNacimiento *
          pesoUsadoParaPerdidasInsensibles;

        procedimientoPerdidasInsensibles = `Pérdidas insensibles de agua por peso al nacimiento = ${round2(
          valorPerdidasInsensiblesPorPesoNacimiento
        )} mL/kg/día × ${round2(pesoUsadoParaPerdidasInsensibles)} kg`;
      } else {
        if (!Number.isFinite(HORAS) || HORAS <= 0) return null;

        valorPerdidasInsensibles =
          ((valorPerdidasInsensiblesPorPesoNacimiento *
            pesoUsadoParaPerdidasInsensibles) /
            24) *
          HORAS;

        procedimientoPerdidasInsensibles = `Pérdidas insensibles de agua parciales por peso al nacimiento = ((${round2(
          valorPerdidasInsensiblesPorPesoNacimiento
        )} mL/kg/día × ${round2(
          pesoUsadoParaPerdidasInsensibles
        )} kg) / 24) × ${round2(HORAS)} horas`;
      }
    }

    if (metodoPerdidasInsensibles === "gravedad") {
      pesoUsadoParaPerdidasInsensibles = PESO_ACTUAL;
      valorPerdidasInsensiblesPorGravedad = SOPORTE_GRAVEDAD;

      nombreMetodoPerdidasInsensibles =
        "Pérdidas insensibles de agua por gravedad";

      if (mode === "24h") {
        valorPerdidasInsensibles =
          valorPerdidasInsensiblesPorGravedad * pesoUsadoParaPerdidasInsensibles;

        procedimientoPerdidasInsensibles = `Pérdidas insensibles de agua por gravedad = ${round2(
          valorPerdidasInsensiblesPorGravedad
        )} mL/kg/día × ${round2(pesoUsadoParaPerdidasInsensibles)} kg`;
      } else {
        if (!Number.isFinite(HORAS) || HORAS <= 0) return null;

        valorPerdidasInsensibles =
          ((valorPerdidasInsensiblesPorGravedad *
            pesoUsadoParaPerdidasInsensibles) /
            24) *
          HORAS;

        procedimientoPerdidasInsensibles = `Pérdidas insensibles de agua parciales por gravedad = ((${round2(
          valorPerdidasInsensiblesPorGravedad
        )} mL/kg/día × ${round2(
          pesoUsadoParaPerdidasInsensibles
        )} kg) / 24) × ${round2(HORAS)} horas`;
      }
    }

    if (metodoPerdidasInsensibles === "manual") {
      valorPerdidasInsensibles = PI_MANUAL;
      nombreMetodoPerdidasInsensibles = "Pérdidas insensibles manuales";
      procedimientoPerdidasInsensibles = `Pérdidas insensibles manuales = ${round2(
        PI_MANUAL
      )} mL`;
    }

    if (mode === "24h") {
      liquidosReales = ING / PESO_ACTUAL;

      uresisHoraria =
        Number.isFinite(DIURESIS) && DIURESIS > 0
          ? (DIURESIS / PESO_ACTUAL) / 24
          : 0;

      procedimientoLR = `Líquidos reales = ${round2(ING)} / ${round2(
        PESO_ACTUAL
      )}`;

      procedimientoUH = `Uresis horaria = (${round2(DIURESIS)} / ${round2(
        PESO_ACTUAL
      )}) / 24`;
    } else {
      if (!Number.isFinite(HORAS) || HORAS <= 0) return null;

      liquidosReales = ((ING / PESO_ACTUAL) / HORAS) * 24;

      uresisHoraria =
        Number.isFinite(DIURESIS) && DIURESIS > 0
          ? (DIURESIS / PESO_ACTUAL) / HORAS
          : 0;

      procedimientoLR = `Líquidos reales = ((${round2(ING)} / ${round2(
        PESO_ACTUAL
      )}) / ${round2(HORAS)}) × 24`;

      procedimientoUH = `Uresis horaria = (${round2(DIURESIS)} / ${round2(
        PESO_ACTUAL
      )}) / ${round2(HORAS)}`;
    }

    balanceHidricoTotal = ING - (EGR + valorPerdidasInsensibles);

    procedimientoBH = `Balance hídrico total = ${round2(ING)} - (${round2(
      EGR
    )} + ${round2(valorPerdidasInsensibles)})`;

    return {
      pesoUsadoParaPerdidasInsensibles: round2(
        pesoUsadoParaPerdidasInsensibles
      ),
      valorPerdidasInsensiblesPorPesoNacimiento: round2(
        valorPerdidasInsensiblesPorPesoNacimiento
      ),
      valorPerdidasInsensiblesPorGravedad: round2(
        valorPerdidasInsensiblesPorGravedad
      ),
      valorPerdidasInsensibles: round2(valorPerdidasInsensibles),
      liquidosReales: round2(liquidosReales),
      balanceHidricoTotal: round2(balanceHidricoTotal),
      uresisHoraria: round2(uresisHoraria),
      procedimientoPerdidasInsensibles,
      procedimientoLR,
      procedimientoBH,
      procedimientoUH,
      nombreMetodoPerdidasInsensibles,
    };
  }, [
    mode,
    ingresosTotales,
    egresosTotales,
    pesoActual,
    pesoAlNacimiento,
    diuresisTotal,
    horasParciales,
    metodoPerdidasInsensibles,
    soporteGravedadSeleccionado,
    perdidasInsensiblesManual,
  ]);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Equilibrios Hídricos Neonatales
        </h1>
        <p className="mt-2 text-slate-600">
          Cálculo de pérdidas insensibles, líquidos reales, balance hídrico total
          y uresis horaria.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode("24h")}
            className={`rounded-xl px-4 py-2 ${
              mode === "24h"
                ? "bg-slate-900 text-white"
                : "bg-slate-200 text-slate-800"
            }`}
          >
            Cálculo de 24 horas
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
            Cálculo parcial
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow xl:col-span-1">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              1. Datos a ingresar
            </h2>

            <div className="grid gap-4">
              <Input
                label="Total de ingresos (ING) en mililitros"
                value={ingresosTotales}
                onChange={setIngresosTotales}
              />

              <Input
                label="Total de egresos (EGR) en mililitros"
                value={egresosTotales}
                onChange={setEgresosTotales}
              />

              <Input
                label="Peso actual en kilogramos"
                value={pesoActual}
                onChange={setPesoActual}
              />

              <Input
                label="Peso al nacimiento en kilogramos"
                value={pesoAlNacimiento}
                onChange={setPesoAlNacimiento}
              />

              <Input
                label="Diuresis total en mililitros"
                value={diuresisTotal}
                onChange={setDiuresisTotal}
              />

              {mode === "parcial" && (
                <Input
                  label="Horas del balance parcial"
                  value={horasParciales}
                  onChange={setHorasParciales}
                />
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                Pérdidas insensibles
              </h3>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Método de cálculo de pérdidas insensibles
                  </label>
                  <select
                    value={metodoPerdidasInsensibles}
                    onChange={(e) =>
                      setMetodoPerdidasInsensibles(
                        e.target.value as MetodoPerdidasInsensibles
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                  >
                    <option value="pesoNacimiento">
                      Por peso al nacimiento
                    </option>
                    <option value="gravedad">Por gravedad</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                {metodoPerdidasInsensibles === "gravedad" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Tipo de soporte / gravedad
                    </label>
                    <select
                      value={soporteGravedadSeleccionado}
                      onChange={(e) =>
                        setSoporteGravedadSeleccionado(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
                    >
                      {soporteGravedadOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label} - {item.value} mL/kg/día
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {metodoPerdidasInsensibles === "manual" && (
                  <Input
                    label="Pérdidas insensibles manuales en mililitros"
                    value={perdidasInsensiblesManual}
                    onChange={setPerdidasInsensiblesManual}
                  />
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniCard
                    title="Peso usado para el cálculo"
                    value={
                      result
                        ? `${result.pesoUsadoParaPerdidasInsensibles} kg`
                        : "--"
                    }
                  />
                  <MiniCard
                    title="Pérdidas insensibles por peso al nacimiento"
                    value={
                      result
                        ? `${result.valorPerdidasInsensiblesPorPesoNacimiento} mL/kg/día`
                        : "--"
                    }
                  />
                  <MiniCard
                    title="Pérdidas insensibles por gravedad"
                    value={
                      result
                        ? `${result.valorPerdidasInsensiblesPorGravedad} mL/kg/día`
                        : "--"
                    }
                  />
                  <MiniCard
                    title="Método usado"
                    value={result ? result.nombreMetodoPerdidasInsensibles : "--"}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow xl:col-span-1">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              2. Resultados automáticos
            </h2>

            <div className="grid gap-4">
              <ResultCard
                title="Pérdidas insensibles"
                value={result ? `${result.valorPerdidasInsensibles} mL` : "--"}
              />
              <ResultCard
                title="Líquidos reales"
                value={result ? `${result.liquidosReales} mL/kg/día` : "--"}
              />
              <ResultCard
                title="Balance hídrico total"
                value={result ? `${result.balanceHidricoTotal} mL` : "--"}
                danger={!!result && result.balanceHidricoTotal < 0}
              />
              <ResultCard
                title="Uresis horaria"
                value={result ? `${result.uresisHoraria} mL/kg/h` : "--"}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow xl:col-span-1">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              3. Fórmulas y procedimientos
            </h2>

            <div className="grid gap-4">
              <FormulaCard
                title="Fórmula de pérdidas insensibles de agua por peso al nacimiento"
                formula={
                  mode === "24h"
                    ? "Pérdidas insensibles = Pérdidas insensibles de agua por peso al nacimiento × Peso al nacimiento"
                    : "Pérdidas insensibles = ((Pérdidas insensibles de agua por peso al nacimiento × Peso al nacimiento) / 24) × Horas"
                }
                procedure={
                  metodoPerdidasInsensibles === "pesoNacimiento" && result
                    ? result.procedimientoPerdidasInsensibles
                    : "Selecciona el método por peso al nacimiento para usar este procedimiento."
                }
              />

              <FormulaCard
                title="Fórmula de pérdidas insensibles de agua por gravedad"
                formula={
                  mode === "24h"
                    ? "Pérdidas insensibles = Pérdidas insensibles de agua por gravedad × Peso actual"
                    : "Pérdidas insensibles = ((Pérdidas insensibles de agua por gravedad × Peso actual) / 24) × Horas"
                }
                procedure={
                  metodoPerdidasInsensibles === "gravedad" && result
                    ? result.procedimientoPerdidasInsensibles
                    : "Selecciona el método por gravedad para usar este procedimiento."
                }
              />

              <FormulaCard
                title="Fórmula de pérdidas insensibles manuales"
                formula="Pérdidas insensibles = valor manual ingresado"
                procedure={
                  metodoPerdidasInsensibles === "manual" && result
                    ? result.procedimientoPerdidasInsensibles
                    : "Selecciona el método manual para usar este procedimiento."
                }
              />

              <FormulaCard
                title="Fórmula de líquidos reales"
                formula={
                  mode === "24h"
                    ? "Líquidos reales = Ingresos totales / Peso actual"
                    : "Líquidos reales = ((Ingresos totales / Peso actual) / Horas) × 24"
                }
                procedure={result ? result.procedimientoLR : "Ingresa los datos."}
              />

              <FormulaCard
                title="Fórmula de balance hídrico total"
                formula="Balance hídrico total = Ingresos totales - (Egresos totales + Pérdidas insensibles)"
                procedure={result ? result.procedimientoBH : "Ingresa los datos."}
              />

              <FormulaCard
                title="Fórmula de uresis horaria"
                formula={
                  mode === "24h"
                    ? "Uresis horaria = (Diuresis total / Peso actual) / 24"
                    : "Uresis horaria = (Diuresis total / Peso actual) / Horas"
                }
                procedure={result ? result.procedimientoUH : "Ingresa los datos."}
              />
            </div>
          </section>
        </div>

        <footer className="mt-10 rounded-2xl bg-white p-5 text-center shadow">
          <p className="text-sm text-slate-500">
            © 2026 Dr. Cristopher Iglesias
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
            <a
              href="https://www.facebook.com/drcristopheriglesias/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-slate-900"
            >
              Facebook
            </a>

            <span className="text-slate-300">•</span>

            <a
              href="https://instagram.com/drcristopheriglesias"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-slate-900"
            >
              Instagram
            </a>

            <span className="text-slate-300">•</span>

            <span>@drcristopheriglesias</span>
          </div>
        </footer>
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
        className={`mt-1 text-2xl font-bold break-words ${
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
      <p className="mt-1 text-base font-semibold text-slate-900 break-words">
        {value}
      </p>
    </div>
  );
}

function FormulaCard({
  title,
  formula,
  procedure,
}: {
  title: string;
  formula: string;
  procedure: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-700">
        <span className="font-medium">Fórmula:</span> {formula}
      </p>
      <p className="mt-2 text-sm text-slate-700">
        <span className="font-medium">Procedimiento:</span> {procedure}
      </p>
    </div>
  );
}
