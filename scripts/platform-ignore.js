const { existsSync, rmSync } = require("fs");

const platform = process.env.EAS_BUILD_PLATFORM;

const iosRemoves = ["assets/images/app-icons/ios"];
const androidRemoves = ["assets/images/app-icons/android"];

const removes = (platform === "ios") ? androidRemoves : iosRemoves;
for (const remove of removes) {
	if (existsSync(remove)) {
		rmSync(remove, { recursive: true, force: true });
		console.log(`Removed ${remove}`);
	}
}
