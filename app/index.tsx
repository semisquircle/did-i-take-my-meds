import * as GLOBAL from "@/ref/global";
import { hexToRGBA } from "@/ref/helpers";
import { AlphaType, Canvas, ColorType, FilterMode, MipmapMode, Skia, Image as SkiaImage } from "@shopify/react-native-skia";
import { File, Paths } from "expo-file-system";
import { Asset, requestPermissionsAsync as requestMediaPermissionsAsync } from "expo-media-library";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";


const canvasResolution = 200;
const canvasBorderWidth = 2;
const canvasBorderRadius = 10;
const canvasDimension = GLOBAL.screen.width - (2 * GLOBAL.screen.horizPadding) - (2 * canvasBorderWidth);
const canvasPixelDimension = canvasDimension / canvasResolution;
const bytesPerPixel = 4; //? RGBA = 4 bytes per pixel

const canvasBrushSizes = [2, 12, 20];
const maxCanvasBrushSize = canvasBrushSizes.at(-1)!;
const brushSizeCanvasDimension = canvasPixelDimension * maxCanvasBrushSize;
const canvasBtnDimension = brushSizeCanvasDimension + 20;
const canvasBtnContainerDiameter = 3.2 * canvasBtnDimension;
const numCanvasBtns = 7;
const canvasBtnRotateStyle = (slice: number) => {
	const thetaBase = (3 * Math.PI / 2) + ((slice * 2 * Math.PI) / numCanvasBtns) - (2 * (2 * Math.PI / numCanvasBtns));
	const angle = (Math.PI / 180) + thetaBase;
	const x = (canvasBtnContainerDiameter - canvasBtnDimension) * Math.cos(angle) / 2;
	const y = (canvasBtnContainerDiameter - canvasBtnDimension) * Math.sin(angle) / 2;
	return { transform: [{ translateX: x }, { translateY: y }] };
}
const canvasBtnBgColor = GLOBAL.ui.palette[2];
const canvasBtnActiveBgColor = GLOBAL.ui.palette[3];
const canvasBtnIconColor = GLOBAL.ui.palette[1];

const canvasPaletteColorWidth = 40;
const canvasPaletteColorHeight = 30;
const canvasPalette = {
	black: "#000000",
	darkGrey: "#5f5f5f",
	lightGrey: "#c7c7c5",
	white: "#ffffff",
	darkRed: "#8c0100",
	red: "#ea0201",
	hotPink: "#f964d4",
	lightPink: "#fbafea",
	darkBrown: "#714000",
	lightbrown: "#b2915b",
	salmon: "#fbb780",
	beige: "#fbdfb3",
	orange: "#f77f02",
	yellowOrange: "#fcce03",
	chartreuse: "#dbd304",
	yellow: "#fcff04",
	darkGreen: "#019516",
	lightGreen: "#6be403",
	turquoise: "#02b790",
	cyan: "#1febc3",
	darkBlue: "#1417f8",
	lightBlue: "#28aff9",
	purple: "#6001bb",
	lavender: "#b083f8",
} as const;
const numCanvasPaletteRows = 6;
const numCanvasPaletteCols = 4;


type BrushSizeBtnProps = {
	style?: any,
	currentBrushIndex: number;
	setCurrentBrushIndex: React.Dispatch<React.SetStateAction<number>>;
}
const BrushSizeBtn = (props: BrushSizeBtnProps) => {
	const brushSizePixelBuffer = useMemo(() => {
		const buffer = new Uint8Array(maxCanvasBrushSize * maxCanvasBrushSize * bytesPerPixel);
		const [r, g, b, a] = hexToRGBA(canvasBtnIconColor);

		const centerX = maxCanvasBrushSize / 2;
		const centerY = maxCanvasBrushSize / 2;
		const radius = canvasBrushSizes[props.currentBrushIndex] / 2;
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
					const offset = (y * maxCanvasBrushSize + x) * bytesPerPixel;
					buffer[offset] = r;
					buffer[offset + 1] = g;
					buffer[offset + 2] = b;
					buffer[offset + 3] = 255;
				}
			}
		}

		return buffer;
	}, [props.currentBrushIndex]);

	const brushSizeImage = useMemo(() => {
		const brushSizeImageData = Skia.Data.fromBytes(brushSizePixelBuffer);
		return Skia.Image.MakeImage(
			{
				width: maxCanvasBrushSize,
				height: maxCanvasBrushSize,
				alphaType: AlphaType.Opaque,
				colorType: ColorType.RGBA_8888,
			},
			brushSizeImageData,
			maxCanvasBrushSize * bytesPerPixel
		);
	}, [brushSizePixelBuffer]);

	return (
		<TouchableHighlight
			style={[styles.canvasBtn, props.style]}
			activeOpacity={1}
			underlayColor={canvasBtnActiveBgColor}
			onPress={() => props.setCurrentBrushIndex((prev) => (prev + 1) % canvasBrushSizes.length)}
		>
			<Canvas style={{
				width: brushSizeCanvasDimension,
				height: brushSizeCanvasDimension,
			}}>
				<SkiaImage
					image={brushSizeImage}
					x={0}
					y={0}
					width={brushSizeCanvasDimension}
					height={brushSizeCanvasDimension}
					fit="fill"
					sampling={{
						filter: FilterMode.Nearest,
						mipmap: MipmapMode.Nearest,
					}}
				/>
			</Canvas>
		</TouchableHighlight>
	);
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: GLOBAL.screen.horizPadding,
	},

	title: {
		fontFamily: "ui-rounded",
		fontSize: 30,
		fontWeight: 900,
		color: GLOBAL.ui.palette[2],
		// textShadowColor: GLOBAL.ui.palette[2], 
		// textShadowOffset: { width: 0, height: 2 },
		// textShadowRadius: 0,
	},

	canvasContainer: {
		justifyContent: "center",
		alignItems: "center",
		width: GLOBAL.screen.width - (2 * GLOBAL.screen.horizPadding),
		height: GLOBAL.screen.width - (2 * GLOBAL.screen.horizPadding),
		backgroundColor: GLOBAL.ui.palette[1],
		borderColor: GLOBAL.ui.palette[2],
		borderWidth: canvasBorderWidth,
		borderRadius: canvasBorderRadius,
		marginTop: GLOBAL.screen.horizPadding,
		overflow: "hidden",
		// boxSizing: "content-box",
	},

	canvas: {
		width: canvasDimension,
		height: canvasDimension,
	},

	canvasToolsContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: GLOBAL.screen.width - (2 * GLOBAL.screen.horizPadding),
		marginTop: GLOBAL.screen.horizPadding,
		// backgroundColor: "pink",
	},

	palette: {
		flexWrap: "wrap",
		flexDirection: "row",
		// flexDirection: "column",
		width: (numCanvasPaletteCols * canvasPaletteColorWidth) + (2 * canvasBorderWidth),
		height: (numCanvasPaletteRows * canvasPaletteColorHeight) + (2 * canvasBorderWidth),
		marginRight: GLOBAL.screen.horizPadding / 2,
		borderColor: GLOBAL.ui.palette[2],
		borderWidth: canvasBorderWidth,
		borderRadius: canvasBorderRadius,
	},

	colorBtn: {
		width: canvasPaletteColorWidth,
		height: canvasPaletteColorHeight,
	},

	activeBtn: {
		boxShadow: `
			0 0 0 ${canvasBorderWidth}px #ffffff,
			0 0 0 ${2 * canvasBorderWidth}px #000000
		`,
		zIndex: 999,
	},

	canvasBtnContainer: {
		flex: 1,
		position: "relative",
		justifyContent: "center",
		alignItems: "center",
		// backgroundColor: "lightblue",
	},

	canvasBtnContainerBg: {
		justifyContent: "center",
		alignItems: "center",
		width: canvasBtnContainerDiameter - canvasBtnDimension,
		height: canvasBtnContainerDiameter - canvasBtnDimension,
		backgroundColor: canvasBtnIconColor,
		borderRadius: "50%",
	},

	canvasBtn: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
		width: canvasBtnDimension,
		height: canvasBtnDimension,
		backgroundColor: canvasBtnBgColor,
		borderRadius: "50%",
	},

	wideBtn: {
		justifyContent: "center",
		alignItems: "center",
		width: GLOBAL.screen.width - (2 * GLOBAL.screen.horizPadding),
		height: 70,
		marginTop: "auto",
		backgroundColor: GLOBAL.ui.palette[2],
		borderRadius: canvasBorderRadius,
	},

	wideBtnText: {
		fontFamily: "ui-rounded",
		fontSize: 25,
		fontWeight: 700,
		color: GLOBAL.ui.palette[1],
	},
});


export default function BufferScreen() {
	const pixelBuffer = useRef(new Uint8Array(canvasResolution * canvasResolution * bytesPerPixel));

	const [revision, setRevision] = useState(0);
	const renderScheduled = useRef(false);
	const lastPixel = useRef<{ x: number, y: number } | null>(null);

	const [currentTool, setCurrentTool] = useState<string>("brush");
	const [currentBrushIndex, setCurrentBrushIndex] = useState<number>(Math.ceil(canvasBrushSizes.length / 2) - 1);
	const [currentPaintHex, setCurrentPaintHex] = useState<string>(canvasPalette.red);
	const currentPaintRGBA = useMemo(() => (currentTool === "eraser") ? [0, 0, 0, 0] : hexToRGBA(currentPaintHex), [currentTool, currentPaintHex]);

	useMemo(() => {
		pixelBuffer.current.fill(0);
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
		if (x < 0 || x >= canvasResolution || y < 0 || y >= canvasResolution) return;

		const offset = (y * canvasResolution + x) * bytesPerPixel;
		const [r, g, b, a] = currentPaintRGBA;
		pixelBuffer.current[offset] = r;
		pixelBuffer.current[offset + 1] = g;
		pixelBuffer.current[offset + 2] = b;
		pixelBuffer.current[offset + 3] = a;
	}, [currentPaintRGBA]);

	const paintBrush = useCallback((centerX: number, centerY: number) => {
		const radius = canvasBrushSizes[currentBrushIndex] / 2;

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
	}, [currentBrushIndex, setPixel]);

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
			if (x === x1 && y === y1) break;
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
		const pixelX = Math.floor(screenX / canvasPixelDimension);
		const pixelY = Math.floor(screenY / canvasPixelDimension);

		if (pixelX < 0 || pixelX >= canvasResolution || pixelY < 0 || pixelY >= canvasResolution) return;

		const previous = lastPixel.current;

		if (previous) {
			drawBrushLine(previous.x, previous.y, pixelX, pixelY);
		} else {
			paintBrush(pixelX, pixelY);
		}

		lastPixel.current = { x: pixelX, y: pixelY };

		requestRender();
	}, [drawBrushLine, paintBrush, requestRender]);

	const canvasImage = useMemo(() => {
		void revision;

		const data = Skia.Data.fromBytes(pixelBuffer.current);
		return Skia.Image.MakeImage(
			{
				width: canvasResolution,
				height: canvasResolution,
				alphaType: AlphaType.Opaque,
				colorType: ColorType.RGBA_8888,
			},
			data,
			canvasResolution * bytesPerPixel
		);
	}, [revision]);

	const floodFill = useCallback((startX: number, startY: number) => {
		const buffer = pixelBuffer.current;

		const startPixel = startY * canvasResolution + startX;
		const startOffset = startPixel * bytesPerPixel;

		const targetR = buffer[startOffset];
		const targetG = buffer[startOffset + 1];
		const targetB = buffer[startOffset + 2];
		const targetA = buffer[startOffset + 3];

		const [fillR, fillG, fillB, fillA] = currentPaintRGBA;

		if (
			targetR === fillR &&
			targetG === fillG &&
			targetB === fillB &&
			targetA === fillA
		) {
			return;
		}

		const stack: number[] = [startPixel];

		while (stack.length > 0) {
			const pixel = stack.pop()!;

			const x = pixel % canvasResolution;
			const y = Math.floor(pixel / canvasResolution);

			const offset = pixel * bytesPerPixel;

			if (
				buffer[offset] !== targetR ||
				buffer[offset + 1] !== targetG ||
				buffer[offset + 2] !== targetB ||
				buffer[offset + 3] !== targetA
			) {
				continue;
			}

			buffer[offset] = fillR;
			buffer[offset + 1] = fillG;
			buffer[offset + 2] = fillB;
			buffer[offset + 3] = fillA;

			if (x > 0) stack.push(pixel - 1);
			if (x < canvasResolution - 1) stack.push(pixel + 1);
			if (y > 0) stack.push(pixel - canvasResolution);
			if (y < canvasResolution - 1) stack.push(pixel + canvasResolution);
		}

		requestRender();
	}, [currentPaintRGBA, requestRender]);


	//* Revision history
	const undoStack = useRef<Uint8Array[]>([]);
	const redoStack = useRef<Uint8Array[]>([]);
	const [historyRevision, setHistoryRevision] = useState(0);
	const beginHistoryAction = useCallback(() => {
		undoStack.current.push(new Uint8Array(pixelBuffer.current));
		if (undoStack.current.length > 50) undoStack.current.shift();
		redoStack.current = [];
		setHistoryRevision((value) => value + 1);
	}, []);

	const undoCanvas = useCallback(() => {
		const previous = undoStack.current.pop();
		if (!previous) return;
		redoStack.current.push(new Uint8Array(pixelBuffer.current));
		pixelBuffer.current.set(previous);
		setHistoryRevision(value => value + 1);
		requestRender();
	}, [requestRender]);

	const redoCanvas = useCallback(() => {
		const next = redoStack.current.pop();
		if (!next) return;
		undoStack.current.push(new Uint8Array(pixelBuffer.current));
		pixelBuffer.current.set(next);
		setHistoryRevision(value => value + 1);
		requestRender();
	}, [requestRender]);


	//* Other canvas functions
	const clearCanvas = useCallback(() => {
		const buffer = pixelBuffer.current;
		
		const hasPixels = buffer.some((value, index) => {
			return index % bytesPerPixel === 3 && value !== 0;
		});
		if (!hasPixels) return;

		beginHistoryAction();
		buffer.fill(0);
		requestRender();
	}, [beginHistoryAction, requestRender]);

	const downloadCanvas = useCallback(async () => {
		if (!canvasImage) return;

		const permission = await requestMediaPermissionsAsync();
		if (!permission.granted) return;

		try {
			const pngBytes = canvasImage.encodeToBytes();
			const file = new File(Paths.cache, "pixel-art.png");
			file.write(pngBytes);
			const asset = await Asset.create(file.uri);
			Alert.alert("Success", `Image saved successfully with ID: ${asset.id}`);
		} catch (e) {
			console.error(e);
			Alert.alert("Error", "Failed to download or save the image.");
		}
	}, [canvasImage]);


	//* Drawing gesture
	const activeTouchId = useRef<number | null>(null);
	const drawGesture = useMemo(() => Gesture.Manual()
		.runOnJS(true)
		.onTouchesDown((event) => {
			const touch = event.changedTouches[0];
			if (!touch || activeTouchId.current !== null) return;
			activeTouchId.current = touch.id;

			const pixelX = Math.floor(touch.x / canvasPixelDimension);
			const pixelY = Math.floor(touch.y / canvasPixelDimension);
			if (currentTool === "bucket") {
				beginHistoryAction();
				floodFill(pixelX, pixelY);
				activeTouchId.current = null;
				return;
			}

			beginHistoryAction();
			lastPixel.current = null;
			paintAtScreenPosition(touch.x, touch.y);
		})
		.onTouchesMove((event) => {
			if (activeTouchId.current === null || currentTool === "bucket") return;
			const touch = event.changedTouches.find((touch) => touch.id === activeTouchId.current);
			if (!touch) return;
			paintAtScreenPosition(touch.x,touch.y);
		})
		.onTouchesUp((event) => {
			const touch = event.changedTouches.find((touch) => touch.id === activeTouchId.current);
			if (touch) {
				activeTouchId.current = null;
				lastPixel.current = null;
			}
		})
		.onTouchesCancelled(() => {
			activeTouchId.current = null;
			lastPixel.current = null;
		}),
	[paintAtScreenPosition]);


	//* Components
	return (
		<GestureHandlerRootView style={styles.container}>
			<Text style={styles.title}>ShawnDraw v0.1 (iOS)</Text>

			<View style={styles.canvasContainer}>
				<GestureDetector gesture={drawGesture}>
					<Canvas style={styles.canvas}>
						{canvasImage && (
							<SkiaImage
								image={canvasImage}
								x={0}
								y={0}
								width={canvasDimension}
								height={canvasDimension}
								fit="fill"
								sampling={{
									filter: FilterMode.Nearest,
									mipmap: MipmapMode.Nearest,
								}}
							/>
						)}
					</Canvas>
				</GestureDetector>
			</View>

			<View style={styles.canvasToolsContainer}>
				<View style={styles.palette}>
					{Object.entries(canvasPalette).map(([name, color], c) => (
						<Pressable
							key={name}
							style={[
								styles.colorBtn,
								{ backgroundColor: color },
								(currentPaintHex === color) && styles.activeBtn,
								(c === 0) && { borderTopLeftRadius: canvasBorderRadius - canvasBorderWidth },
								(c === numCanvasPaletteCols - 1) && { borderTopRightRadius: canvasBorderRadius - canvasBorderWidth },
								(c === numCanvasPaletteCols * (numCanvasPaletteRows - 1)) && { borderBottomLeftRadius: canvasBorderRadius - canvasBorderWidth },
								(c === Object.entries(canvasPalette).length - 1) && { borderBottomRightRadius: canvasBorderRadius - canvasBorderWidth },
							]}
							onPress={() => setCurrentPaintHex(color)}
						/>
					))}
				</View>

				<View style={styles.canvasBtnContainer}>
					<View style={styles.canvasBtnContainerBg}>
						{/* <SymbolView
							name={{ ios: "heart.fill" }}
							tintColor={GLOBAL.ui.palette[2]}
							size={0.6 * canvasBtnDimension}
						/> */}
					</View>

					<BrushSizeBtn
						style={canvasBtnRotateStyle(0)}
						currentBrushIndex={currentBrushIndex}
						setCurrentBrushIndex={setCurrentBrushIndex}
					/>

					<TouchableHighlight
						style={[
							styles.canvasBtn,
							(currentTool === "brush") && styles.activeBtn,
							canvasBtnRotateStyle(1),
						]}
						activeOpacity={1}
						underlayColor={canvasBtnActiveBgColor}
						onPress={() => setCurrentTool("brush")}
					>
						<SymbolView
							name={{ ios: "pencil.tip" }}
							tintColor={canvasBtnIconColor}
							size={canvasBtnDimension / 2}
						/>
					</TouchableHighlight>

					<TouchableHighlight
						style={[
							styles.canvasBtn,
							(currentTool === "eraser") && styles.activeBtn,
							canvasBtnRotateStyle(2),
						]}
						activeOpacity={1}
						underlayColor={canvasBtnActiveBgColor}
						onPress={() => setCurrentTool("eraser")}
					>
						<SymbolView
							name={{ ios: "eraser.fill" }}
							tintColor={canvasBtnIconColor}
							size={canvasBtnDimension / 2}
						/>
					</TouchableHighlight>

					<TouchableHighlight
						style={[
							styles.canvasBtn,
							(currentTool === "bucket") && styles.activeBtn,
							canvasBtnRotateStyle(3),
						]}
						activeOpacity={1}
						underlayColor={canvasBtnActiveBgColor}
						onPress={() => setCurrentTool("bucket")}
					>
						<SymbolView
							name={{ ios: "paintbrush.fill" }}
							tintColor={canvasBtnIconColor}
							size={canvasBtnDimension / 2}
						/>
					</TouchableHighlight>

					<TouchableHighlight
						style={[styles.canvasBtn, canvasBtnRotateStyle(4)]}
						activeOpacity={1}
						underlayColor={canvasBtnActiveBgColor}
						onPress={() => {
							clearCanvas();
						}}
					>
						<SymbolView
							name={{ ios: "trash.fill" }}
							tintColor={canvasBtnIconColor}
							size={canvasBtnDimension / 2}
						/>
					</TouchableHighlight>

					<TouchableHighlight
						style={[styles.canvasBtn, canvasBtnRotateStyle(5)]}
						activeOpacity={1}
						underlayColor={canvasBtnActiveBgColor}
						onPress={() => {
							redoCanvas();
						}}
					>
						<SymbolView
							name={{ ios: "arrowshape.turn.up.right.fill" }}
							tintColor={canvasBtnIconColor}
							size={canvasBtnDimension / 2}
						/>
					</TouchableHighlight>

					<TouchableHighlight
						style={[styles.canvasBtn, canvasBtnRotateStyle(6)]}
						activeOpacity={1}
						underlayColor={canvasBtnActiveBgColor}
						onPress={() => {
							undoCanvas();
						}}
					>
						<SymbolView
							name={{ ios: "arrowshape.turn.up.left.fill" }}
							tintColor={canvasBtnIconColor}
							size={canvasBtnDimension / 2}
						/>
					</TouchableHighlight>
				</View>
			</View>

			<Pressable style={styles.wideBtn}>
				<Text style={styles.wideBtnText}>I'm Done!</Text>
			</Pressable>
		</GestureHandlerRootView>
	);
}
