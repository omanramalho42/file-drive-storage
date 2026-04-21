import { DocPageClient } from "./doc-page-client"

interface Props {
  params: Promise<{ id: string }>
}

export default async function DocPage({ params }: Props) {
  const { id } = await params
  return <DocPageClient docId={id} />
}
