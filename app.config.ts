import { ConfigContext, ExpoConfig } from "expo/config";


export default ({ config }: ConfigContext): ExpoConfig => ({
	name: "Meds?",
	slug: "did-i-take-my-meds",
	version: "1.0.0",
	orientation: "portrait",
	scheme: "diditakemymeds",
	userInterfaceStyle: "automatic",
	ios: {
		icon: "./assets/images/app-icons/ios/light.png",
	},
	android: {
		adaptiveIcon: {
			backgroundColor: "#E6F4FE",
			backgroundImage: "./assets/images/app-icons/android/background.png",
			foregroundImage: "./assets/images/app-icons/android/foreground.png",
			monochromeImage: "./assets/images/app-icons/android/monochrome.png",
		},
		predictiveBackGestureEnabled: false,
		package: "com.semisquircle.diditakemymeds",
		permissions: [
			"ACCESS_COARSE_LOCATION",
			"ACCESS_FINE_LOCATION",
			"USE_EXACT_ALARM",
			"REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
		],
	},
	plugins: [
		"expo-image",
		"expo-asset",
		"expo-status-bar",
		"expo-router",
		[
			"expo-build-properties",
			{
				ios: {
					useFrameworks: "static",
					buildReactNativeFromSource: true
				},
				android: {
					enableMinifyInReleaseBuilds: true
				},
			}
		],
	],
	experiments: {
		typedRoutes: true,
	},
	owner: "semisquircle",
	extra: {
		router: {},
		eas: {
			projectId: "063eb48b-ca9d-4ecd-aaab-0c45368406ef",
		},
	},
});
