import { EpisodeIntakeForm } from "@/components/workflow/episode-intake"

export default function IntakePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Episode</h1>
        <EpisodeIntakeForm />
      </div>
    </div>
  )
}
