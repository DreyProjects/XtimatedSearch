import { redirect } from 'next/navigation'

export default function FolderPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard?folder=${params.id}`)
}
