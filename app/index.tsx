import { SketchCanvas } from "@sourcetoad/react-native-sketch-canvas";
import { StyleSheet, View } from "react-native";


const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F5FCFF",
	},
});

export default function Example() {
	return (
		<View style={styles.container}>
			<View style={{ flex: 1, flexDirection: "row" }}>
				<SketchCanvas
					style={{ flex: 1 }}
					strokeColor={"red"}
					strokeWidth={7}
				/>
			</View>
		</View>
	);
}
