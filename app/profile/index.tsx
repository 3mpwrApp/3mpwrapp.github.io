import ProfileCard from '../../components/ProfileCard';

export default function ProfileIndex() {
  // ProfileCard has its own ScrollView, no wrapper needed
  // This prevents double SafeArea issues on web
  return <ProfileCard />;
}
