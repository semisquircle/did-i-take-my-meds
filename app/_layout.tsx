import * as GLOBAL from "@/ref/global";
import { Slot } from "expo-router";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";


const styles = StyleSheet.create({
	layout: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: GLOBAL.ui.palette[0],
	}
});

export default function RootLayout() {
	//* Components
	return (
		<GestureHandlerRootView style={styles.layout}>
			<SafeAreaView>
				<Slot />
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}
