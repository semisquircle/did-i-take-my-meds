import * as GLOBAL from "@/ref/global";
import { AlphaType, Canvas, ColorType, FilterMode, MipmapMode, Skia, Image as SkiaImage } from "@shopify/react-native-skia";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";


const GRID_SIZE = 100;
const CANVAS_SIZE = GLOBAL.screen.width;
const PIXEL_SIZE = CANVAS_SIZE / GRID_SIZE;
const BYTES_PER_PIXEL = 4; //? RGBA = 4 bytes per pixel
const COLORS = {
	red: "#ff0000",
	blue: "#0000ff",
	yellow: "#ffff00",
	green: "#00ff00",
} as const;


const hexToRgb = (hex: string): [number, number, number] => {
	const value = hex.replace("#", "");

	return [
		parseInt(value.substring(0, 2), 16),
		parseInt(value.substring(2, 4), 16),
		parseInt(value.substring(4, 6), 16),
	];
};


const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},

	canvas: {
		width: CANVAS_SIZE,
		height: CANVAS_SIZE,
	},

	palette: {
		flexDirection: "row",
		gap: 12,
		marginTop: 20,
	},

	colorButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "#cccccc",
	},

	selectedColorButton: {
		borderWidth: 4,
		borderColor: "#000000",
	},
});

export default function BufferScreen() {
	const pixelBuffer = useRef(new Uint8Array(GRID_SIZE * GRID_SIZE * BYTES_PER_PIXEL));
	const [revision, setRevision] = useState(0);
	const renderScheduled = useRef(false);
	const lastPixel = useRef<{ x: number, y: number } | null>(null);
	const [brushSize, setBrushSize] = useState(10);
	const [selectedColor, setSelectedColor] = useState<string>(COLORS.red);

	useMemo(() => {
		pixelBuffer.current.fill(255);
	}, []);

	const requestRender = useCallback(() => {
		if (renderScheduled.current) return;

		renderScheduled.current = true;

		requestAnimationFrame(() => {
			renderScheduled.current = false;
			setRevision((value) => value + 1);
		});
	}, []);

	const setPixel = useCallback((x: number, y: number) => {
		if (
			x < 0 ||
			x >= GRID_SIZE ||
			y < 0 ||
			y >= GRID_SIZE
		) {
			return;
		}

		const offset = (y * GRID_SIZE + x) * BYTES_PER_PIXEL;

		const [r, g, b] = hexToRgb(selectedColor);
		pixelBuffer.current[offset] = r;
		pixelBuffer.current[offset + 1] = g;
		pixelBuffer.current[offset + 2] = b;
		pixelBuffer.current[offset + 3] = 255;
	}, [selectedColor]);

	const paintBrush = useCallback((centerX: number, centerY: number) => {
		const radius = brushSize / 2;

		const startX = Math.floor(centerX - radius);
		const endX = Math.ceil(centerX + radius);

		const startY = Math.floor(centerY - radius);
		const endY = Math.ceil(centerY + radius);

		for (let y = startY; y <= endY; y++) {
			for (let x = startX; x <= endX; x++) {
				const pixelCenterX = x + 0.5;
				const pixelCenterY = y + 0.5;

				const dx = pixelCenterX - centerX;
				const dy = pixelCenterY - centerY;

				if (dx * dx + dy * dy <= radius * radius) {
					setPixel(x, y);
				}
			}
		}
	}, [setPixel]);

	const drawBrushLine = useCallback((x0: number, y0: number, x1: number, y1: number) => {
		let x = x0;
		let y = y0;

		const dx = Math.abs(x1 - x0);
		const dy = Math.abs(y1 - y0);

		const sx = x0 < x1 ? 1 : -1;
		const sy = y0 < y1 ? 1 : -1;

		let error = dx - dy;

		while (true) {
			paintBrush(x, y);

			if (x === x1 && y === y1) {
				break;
			}

			const error2 = error * 2;

			if (error2 > -dy) {
				error -= dy;
				x += sx;
			}

			if (error2 < dx) {
				error += dx;
				y += sy;
			}
		}
	}, [paintBrush]);

	const paintAtScreenPosition = useCallback((screenX: number, screenY: number) => {
		const pixelX = Math.floor(screenX / PIXEL_SIZE);
		const pixelY = Math.floor(screenY / PIXEL_SIZE);

		if (
			pixelX < 0 ||
			pixelX >= GRID_SIZE ||
			pixelY < 0 ||
			pixelY >= GRID_SIZE
		) {
			return;
		}

		const previous = lastPixel.current;

		if (previous) {
			drawBrushLine(previous.x, previous.y, pixelX, pixelY);
		} else {
			paintBrush(pixelX, pixelY);
		}

		lastPixel.current = {
			x: pixelX,
			y: pixelY,
		};

		requestRender();
	}, [drawBrushLine, paintBrush, requestRender]);

	const image = useMemo(() => {
		void revision;

		const data = Skia.Data.fromBytes(pixelBuffer.current);

		return Skia.Image.MakeImage(
			{
				width: GRID_SIZE,
				height: GRID_SIZE,
				alphaType: AlphaType.Opaque,
				colorType: ColorType.RGBA_8888,
			},
			data,
			GRID_SIZE * BYTES_PER_PIXEL
		);
	}, [revision]);

	const clearCanvas = useCallback(() => {
		pixelBuffer.current.fill(255);
		requestRender();
	}, [requestRender]);

	const pan = useMemo(() =>
		Gesture.Pan()
			.runOnJS(true)
			.onBegin((event) => {
				lastPixel.current = null;
				paintAtScreenPosition(event.x, event.y);
			})
			.onUpdate((event) => {
				paintAtScreenPosition(event.x, event.y);
			})
			.onEnd(() => {
				lastPixel.current = null;
			})
			.onFinalize(() => {
				lastPixel.current = null;
			}),
	[paintAtScreenPosition]);


	//* Components
	return (
		<GestureHandlerRootView style={styles.container}>
			<GestureDetector gesture={pan}>
				<Canvas style={styles.canvas}>
					{image && (
						<SkiaImage
							image={image}
							x={0}
							y={0}
							width={CANVAS_SIZE}
							height={CANVAS_SIZE}
							fit="fill"
							sampling={{
								filter: FilterMode.Nearest,
								mipmap: MipmapMode.Nearest,
							}}
						/>
					)}
				</Canvas>
			</GestureDetector>

			<View style={styles.palette}>
				{Object.entries(COLORS).map(([name, color]) => (
					<Pressable
						key={name}
						style={[
							styles.colorButton,
							{ backgroundColor: color },
							(selectedColor === color) && styles.selectedColorButton,
						]}
						onPress={() => setSelectedColor(color)}
					/>
				))}
			</View>

			<Button
				title="Clear"
				onPress={() => clearCanvas()}
			/>
		</GestureHandlerRootView>
	);
}
