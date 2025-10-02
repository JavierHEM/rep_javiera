import EditChecklistForm from '@/components/EditChecklistForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditChecklistPage({ params }: PageProps) {
  const { id } = await params;
  return <EditChecklistForm checklistId={id} />;
}
