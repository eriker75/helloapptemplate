import { Text } from "@/components/ui";
import { useGoogleLogin } from "@/src/modules/users/hooks/useGoogleLogin";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SwipeScreen = () => {
  const { signOut } = useGoogleLogin();

  const handleLogout = async () => {
    return await signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center bg-white">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SwipeScreen;
