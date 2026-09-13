import * as Application from "expo-application";
import { Directory, File, Paths } from "expo-file-system";
import { useMemo } from "react";
import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";


//* Geometry
export const ui = {
	palette: ["#ffffff", "#000000", "#0008", "#ff453a"],
	animDuration: 200,
	btnAnimDuration: 100,
	alertYes: "Continue",
	alertNo: "Cancel",
}

export const screen = {
	width: Dimensions.get("window").width,
	height: Dimensions.get("window").height,
	horizPadding: 10,
};

export const useReactiveGeometry = () => {
	const screenInsets = useSafeAreaInsets();

	return useMemo(() => {
		const screenTopInset = screenInsets.top;
		const screenBottomInset = (Platform.OS === "android") ? screenInsets.bottom : 20;

		return {
			screen: {
				insets: {
					top: screenTopInset,
					bottom: screenBottomInset,
				}
			},
		};
	}, [screenInsets]);
}


//* Zustand saving
const appVersion = Application.nativeApplicationVersion;
const saveDir = new Directory(Paths.document, "saves");
const saveFile = new File(saveDir, "save.json");

type SaveStoreTypes = {
	// Saves
	version: string | null;

	defaultSaveData?: any; //^ Not save worthy
	initDefaultSaveData: () => void;
	writeDefaultSaveToFile: () => void;

	isSaveLoaded?: boolean; //^ Not save worthy
	setIsSaveLoaded: (bool: boolean) => void;
	loadSave: () => void;
	writeNewSaveToFile: () => void;

	// Permissions n' stuff
	promptsCompleted: { location: boolean, notifs: boolean };
	setPromptCompleted: (prompt: string, bool: boolean) => void;

	// General storage
	activeTab?: number; //^ Not save worthy
	setActiveTab: (index: number) => void;
}

export const useSaveStore = create<SaveStoreTypes>((set, get) => ({
	// Saves
	version: appVersion,

	defaultSaveData: null,
	initDefaultSaveData: () => {
		const saveData = JSON.parse(JSON.stringify(get()));
		delete saveData.defaultSaveData;
		delete saveData.isSaveLoaded;
		delete saveData.activeTab;
		saveData.promptsCompleted = { location: true, notifs: true };
		set({ defaultSaveData: saveData });
	},
	writeDefaultSaveToFile: async () => {
		const saveDataJSON = JSON.stringify(get().defaultSaveData);
		if (!saveDir.exists) saveDir.create();
		if (!saveFile.exists) saveFile.create();
		saveFile.write(saveDataJSON);
		console.log("Wrote default data to save file.");
	},

	isSaveLoaded: false,
	setIsSaveLoaded: (bool) => set({ isSaveLoaded: bool }),
	loadSave: async () => {
		if (saveFile.exists) {
			const dataFromSaveJSON = await saveFile.text();
			const saveData = JSON.parse(dataFromSaveJSON);

			//* =============== Backwards compatibility zone ==================
			//* ===============================================================

			set({ promptsCompleted: saveData.promptsCompleted });

			console.log("Loaded preexisting data from save file.");
		}
		else console.log("No save file found, using default save data.");

		get().setIsSaveLoaded(true);
	},
	writeNewSaveToFile: async () => {
		const saveData = JSON.parse(JSON.stringify(get()));
		delete saveData.defaultSaveData;
		delete saveData.isSaveLoaded;
		delete saveData.activeTab;
		
		const saveDataJSON = JSON.stringify(saveData);
		if (!saveDir.exists) saveDir.create();
		if (!saveFile.exists) saveFile.create();
		saveFile.write(saveDataJSON);
		console.log("Wrote new data to save file.");
	},

	// Permissions n' stuff
	promptsCompleted: { location: false, notifs: false },
	setPromptCompleted: (prompt, bool) => {
		set(state => ({ promptsCompleted: {...state.promptsCompleted, [prompt]: bool} }));
	},

	// General storage
	activeTab: 1,
	setActiveTab: (index) => set({ activeTab: index }),
}));
