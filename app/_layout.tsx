import { Slot } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";


const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: "pink",
	}
});

export default function RootLayout() {
	//* Components
	return (
		<GestureHandlerRootView style={styles.layout}>
			<Slot />
		</GestureHandlerRootView>
	);
}
