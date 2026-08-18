import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, Avatar, Card, List, Button, Snackbar } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import AppButton from '../../components/common/AppButton';
import ThemeBackground from '../../components/common/ThemeBackground';
import { ENV } from '../../config/env';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { profile, isLoading, error, getProfile, uploadPhoto, deletePhoto, clearError } = useProfile();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const handleSelectPhoto = () => {
    Alert.alert(
      "Update Profile Photo",
      "Choose an option to update your photo.",
      [
        {
          text: "Select Mock Photo 1",
          onPress: () => handleMockUpload("avatar1.png")
        },
        {
          text: "Select Mock Photo 2",
          onPress: () => handleMockUpload("avatar2.png")
        },
        profile?.profile_photo ? {
          text: "Delete Current Photo",
          onPress: async () => {
            try {
              await deletePhoto().unwrap();
              setSnackbarMessage("Photo removed successfully");
            } catch (err) {
              // error is handled by Redux
            }
          },
          style: "destructive"
        } : null,
        {
          text: "Cancel",
          style: "cancel"
        }
      ].filter(Boolean) as any
    );
  };

  const handleMockUpload = async (mockFilename: string) => {
    try {
      await uploadPhoto("file://mock/path/" + mockFilename, mockFilename, "image/png").unwrap();
      setSnackbarMessage("Photo updated successfully");
    } catch (err) {
      // error is handled by Redux
    }
  };

  const getProfilePhotoUri = () => {
    if (profile?.profile_photo) {
      if (profile.profile_photo.startsWith('http')) {
        return profile.profile_photo;
      }
      return `${ENV.API_BASE_URL}${profile.profile_photo}`;
    }
    return null;
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const photoUri = getProfilePhotoUri();

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <LoadingOverlay visible={isLoading} />
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSelectPhoto} style={styles.avatarContainer}>
              {photoUri ? (
                <Avatar.Image size={100} source={{ uri: photoUri }} />
              ) : (
                <Avatar.Text size={100} label={initials} style={{ backgroundColor: '#A58BFF' }} color="#0D0B14" />
              )}
              <View style={[styles.editBadge, { backgroundColor: '#B49BFF' }]}>
                <Avatar.Icon size={24} icon="camera" color="#0D0B14" style={{ backgroundColor: 'transparent' }} />
              </View>
            </TouchableOpacity>
            
            <Text style={[styles.fullName, { color: '#FFFFFF' }]}>
              {user?.full_name}
            </Text>
            <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
              {user?.email}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: '#2C2243' }]}>
              <Text style={[styles.roleText, { color: '#A58BFF' }]}>
                {user?.role?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Bio Section */}
          {profile?.bio ? (
            <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, { color: '#A58BFF' }]}>Bio</Text>
                <Text style={{ color: '#FFFFFF' }}>{profile.bio}</Text>
              </Card.Content>
            </Card>
          ) : null}

          {/* Schedule & Personal Details Section */}
          <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: '#A58BFF' }]}>Wake-up & Sleep Settings</Text>
              <List.Item
                title="Preferred Wake-up Time"
                titleStyle={{ color: '#FFFFFF' }}
                description={profile?.preferred_wakeup_time || "Not Set"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="alarm" color="#A58BFF" />}
              />
              <List.Item
                title="Preferred Sleep Time"
                titleStyle={{ color: '#FFFFFF' }}
                description={profile?.preferred_sleep_time || "Not Set"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="sleep" color="#A58BFF" />}
              />
              <List.Item
                title="Timezone"
                titleStyle={{ color: '#FFFFFF' }}
                description={profile?.timezone || "UTC"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="earth" color="#A58BFF" />}
              />
            </Card.Content>
          </Card>

          <Card style={[styles.card, { backgroundColor: 'rgba(26, 22, 38, 0.85)', borderColor: 'rgba(165, 139, 255, 0.15)' }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: '#A58BFF' }]}>Personal Details</Text>
              <List.Item
                title="Phone Number"
                titleStyle={{ color: '#FFFFFF' }}
                description={profile?.phone_number || "Not Set"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="phone" color="#A58BFF" />}
              />
              <List.Item
                title="Gender"
                titleStyle={{ color: '#FFFFFF' }}
                description={profile?.gender || "Not Set"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="gender-male-female" color="#A58BFF" />}
              />
              <List.Item
                title="Date of Birth"
                titleStyle={{ color: '#FFFFFF' }}
                description={profile?.date_of_birth || "Not Set"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="calendar" color="#A58BFF" />}
              />
              <List.Item
                title="Occupation"
                titleStyle={{ color: '#FFFFFF' }}
                description={profile?.occupation || "Not Set"}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon="briefcase" color="#A58BFF" />}
              />
            </Card.Content>
          </Card>

          <AppButton 
            mode="contained" 
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editBtn}
            buttonColor="#A58BFF"
            textColor="#0D0B14"
          >
            Edit Profile
          </AppButton>
        </ScrollView>

        <Snackbar
          visible={!!error || !!snackbarMessage}
          onDismiss={() => {
            setSnackbarMessage(null);
            clearError();
          }}
          action={{
            label: 'OK',
            onPress: () => {
              setSnackbarMessage(null);
              clearError();
            }
          }}
          style={{ backgroundColor: error ? theme.colors.error : theme.colors.secondary }}
        >
          {error || snackbarMessage}
        </Snackbar>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  editBtn: {
    marginTop: 12,
  },
});

export default ProfileScreen;
