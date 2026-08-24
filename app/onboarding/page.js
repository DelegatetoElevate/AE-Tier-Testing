import { requireUser } from '@/lib/auth';
import OnboardingForm from '@/components/OnboardingForm';

export default async function OnboardingPage() {
  const { user, supabase } = await requireUser({ skipNameCheck: true });
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, name_set')
    .eq('id', user.id)
    .single();

  return (
    <OnboardingForm
      userId={user.id}
      initialFirst={profile?.first_name || ''}
      initialLast={profile?.last_name || ''}
      isEdit={!!profile?.name_set}
    />
  );
}
