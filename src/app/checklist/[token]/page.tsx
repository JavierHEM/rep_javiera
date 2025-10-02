import ChecklistFormLink from '@/components/ChecklistFormLink';

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ChecklistLinkPage({ params }: PageProps) {
  const { token } = await params;
  return <ChecklistFormLink token={token} />;
}
