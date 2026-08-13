import { RESOURCE_REGISTRY } from "@/lib/creative-os/registry"

export const metadata = {
  title: "Creative OS — Governed Resource Registry",
  description: "Read-only ledger of registered creative capabilities, internal methods, and external providers."
}

export default function CreativeOSRegistryPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 font-sans p-6 sm:p-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header section */}
        <div className="border-b border-stone-200 pb-6">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-stone-500 block mb-1">
            CREATIVE OPERATING SYSTEM
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            Governed Resource Registry
          </h1>
          <p className="mt-2 text-sm text-stone-600 max-w-3xl leading-relaxed">
            A read-only, audited ledger of methods, discovery feeds, skills, and tools. Governed by deterministically enforced authority ceilings and lifecycle states.
          </p>
        </div>

        {/* Registry Table */}
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-stone-200 text-left text-xs font-mono">
            <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Name & ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Lifecycle State</th>
                <th className="px-6 py-4">Authority Ceiling</th>
                <th className="px-6 py-4">Modes</th>
                <th className="px-6 py-4">Provenance & License</th>
                <th className="px-6 py-4">Destination / Source</th>
                <th className="px-6 py-4 text-center">Recommendable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 bg-white text-stone-700">
              {RESOURCE_REGISTRY.map((res) => {
                const isRecommendable = ["TEST_CANDIDATE", "TESTING", "AUDITED", "CAPTURED"].includes(res.lifecycleState)
                
                let recommendationTypeLabel = "Not yet human-approved"
                if (res.type === "DISCOVERY_FEED") {
                  recommendationTypeLabel = "Discovery only"
                } else if (isRecommendable) {
                  recommendationTypeLabel = "Experimental"
                }

                return (
                  <tr key={res.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Name & ID */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="font-bold text-stone-900 text-sm font-sans">{res.name}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{res.id}</div>
                    </td>
                    {/* Type */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 font-semibold text-[10px] text-stone-700">
                        {res.type}
                      </span>
                    </td>
                    {/* Lifecycle */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        res.lifecycleState === "APPROVED"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : res.lifecycleState === "VALIDATED"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : res.lifecycleState === "REJECTED" || res.lifecycleState === "DEPRECATED" || res.lifecycleState === "SUPERSEDED"
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"
                      }`}>
                        {res.lifecycleState}
                      </span>
                    </td>
                    {/* Authority Ceiling */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="font-semibold text-stone-800">{res.maxExecutionAuthority}</span>
                    </td>
                    {/* Modes */}
                    <td className="px-6 py-4.5">
                      <div className="flex flex-wrap gap-1">
                        {res.modes.map((mode) => (
                          <span key={mode} className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.2 text-[9px] text-stone-600">
                            {mode}
                          </span>
                        ))}
                      </div>
                    </td>
                    {/* Provenance */}
                    <td className="px-6 py-4.5">
                      <div className="text-[11px] text-stone-800 break-all max-w-[200px]">{res.provenance}</div>
                      <div className="text-[9px] text-stone-400 mt-0.5">License: {res.license}</div>
                    </td>
                    {/* Destination / Source */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-stone-500">
                      {res.sourceUrl ? (
                        <a href={res.sourceUrl} className="hover:underline text-stone-600 break-all max-w-[180px] block" target="_blank" rel="noopener noreferrer">
                          {res.sourceUrl}
                        </a>
                      ) : (
                        <span className="text-stone-400 font-sans italic">Internal Method</span>
                      )}
                    </td>
                    {/* Recommendable Status */}
                    <td className="px-6 py-4.5 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex h-2 w-2 rounded-full ring-4 ${
                          isRecommendable ? "bg-amber-500 ring-amber-500/20" : "bg-stone-300 ring-stone-300/20"
                        }`} aria-label={isRecommendable ? "Recommendable" : "Not Recommendable"}></span>
                        <span className="text-[9px] text-stone-500">{recommendationTypeLabel}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
