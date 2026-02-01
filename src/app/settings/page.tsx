
import { TagsSettings } from '@/components/TagsSettings';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';

import { ChangePassword } from '@/components/ChangePassword';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader 
            title="Settings" 
            description="Manage your preferences and configurations. Click on the settings to open them."
        />
        
        <div className="flex flex-col gap-6">
          <section id="password">
              <ChangePassword />
          </section>
          
          <section id="tags">
              <TagsSettings />
          </section>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
