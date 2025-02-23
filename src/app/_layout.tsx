import { Slot } from 'expo-router';

import '~/styles/global.css';
import { PageLayout } from '~/components/PageLayout/PageLayout';

export default () => (
  <PageLayout>
    <Slot />
  </PageLayout>
);
