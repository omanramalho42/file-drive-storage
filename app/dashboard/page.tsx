import { KnowledgeSidebar } from "@/components/kb/knowledge-sidebar"
import { MainContent } from "@/components/kb/main-content"

export default function HomePage() {
  return (
    <div className="flex w-full h-full">
      <KnowledgeSidebar />
      
      <div className="flex-1 min-w-0">
        <MainContent />
      </div>
    </div>
  )
}