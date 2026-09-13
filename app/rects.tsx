import { Canvas, Rect } from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";


const GRID_SIZE = 100;
const CANVAS_SIZE = 400;
const PIXEL_SIZE = CANVAS_SIZE / GRID_SIZE;

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
	},

	canvas: {
		width: CANVAS_SIZE,
		height: CANVAS_SIZE,
	},
});

export default function RectScreen() {
	const [pixels, setPixels] = useState<string[][]>(() =>
		Array.from({ length: GRID_SIZE }, () =>
			Array(GRID_SIZE).fill("#ffffff")
		)
	);

	const rectangles = useMemo(() => {
		const result = [];

		for (let y = 0; y < GRID_SIZE; y++) {
			for (let x = 0; x < GRID_SIZE; x++) {
				const color = pixels[y][x];

				if (color !== "#ffffff") {
					result.push(
						<Rect
							key={`${x}-${y}`}
							x={x * PIXEL_SIZE}
							y={y * PIXEL_SIZE}
							width={PIXEL_SIZE}
							height={PIXEL_SIZE}
							color={color}
						/>
					);
				}
			}
		}

		return result;
	}, [pixels]);

	const paintPixel = (x: number, y: number) => {
		const pixelX = Math.floor(x / PIXEL_SIZE);
		const pixelY = Math.floor(y / PIXEL_SIZE);

		if (
			pixelX < 0 ||
			pixelX >= GRID_SIZE ||
			pixelY < 0 ||
			pixelY >= GRID_SIZE
		) {
			return;
		}

		setPixels((current) => {
			const next = current.map((row) => [...row]);
			next[pixelY][pixelX] = "#000000";
			return next;
		});
	};

	const pan = Gesture.Pan()
		.onBegin((event) => {
			runOnJS(paintPixel)(event.x, event.y);
		})
		.onUpdate((event) => {
			runOnJS(paintPixel)(event.x, event.y);
		});

	return (
		<GestureDetector gesture={pan}>
			<Canvas style={styles.canvas}>
				{/* White background */}
				<Rect
					x={0}
					y={0}
					width={CANVAS_SIZE}
					height={CANVAS_SIZE}
					color="white"
				/>

				{/* Actual pixels */}
				{rectangles}
			</Canvas>
		</GestureDetector>
	);
}
