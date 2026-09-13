import { withDangerousMod } from "@expo/config-plugins";
import fs from "fs";
import path from "path";
import { slugify } from "../ref/helpers";


type NotificationIconsConfig = {
	icons: Record<string, string>;
};
const withNotificationIcons = (config: any, props: NotificationIconsConfig) => {
	return withDangerousMod(config, [
		"android",
		async (config) => {
			const { projectRoot, platformProjectRoot } = config.modRequest;
			const drawableDir = path.join(platformProjectRoot, "app", "src", "main", "res", "drawable");
			fs.mkdirSync(drawableDir, { recursive: true });

			for (const [name, xml] of Object.entries(props.icons)) {
				const xmlPath = path.resolve(projectRoot, xml);

				if (!fs.existsSync(xmlPath)) {
					throw new Error(`[withNotificationIcons] XML file does not exist: ${xmlPath}`);
				}

				const destinationPath = path.join(drawableDir, `ic_notification_${slugify(name)}.xml`);
				fs.copyFileSync(xmlPath, destinationPath);
			}

			return config;
		},
	]);
}

export default withNotificationIcons;
