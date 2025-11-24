import { View } from 'react-native';

import ProfileCard from '../components/ProfileCard';
import ResponsiveScreenWrapper from '../components/ResponsiveScreenWrapper';

export default function Profile() {
  return (
    <ResponsiveScreenWrapper scrollable={false}>
      <View style={{ flex: 1 }}>
        <ProfileCard />
      </View>
    </ResponsiveScreenWrapper>
  );
}
