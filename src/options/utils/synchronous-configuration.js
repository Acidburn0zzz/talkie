/*
This file is part of Talkie -- text-to-speech browser extension button.
<https://joelpurra.com/projects/talkie/>

Copyright (c) 2016, 2017 Joel Purra <https://joelpurra.com/>

Talkie is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Talkie is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Talkie.  If not, see <https://www.gnu.org/licenses/>.
*/

export default class SynchronousConfiguration {
    // HACK: note that this is a total hack compared to the asynchronous version of Configuration.
    // NOTE: keep SynchronousConfiguration and Configuration in... sync.
    constructor(configurationObject) {
        this.configurationObject = configurationObject;

        this._initialize();
    }

    _initialize() {
        const manifest = browser.runtime.getManifest();
        const versionName = manifest.version_name;
        this._versionType = versionName.includes(" Premium ") ? "premium" : "free";
        this._systemType = versionName.includes(" Chrome ") ? "chrome" : "webextension";

        this.extensionShortName = browser.i18n.getMessage("extensionShortName");
        this.uiLocale = browser.i18n.getMessage("@@ui_locale");
        this.messagesLocale = browser.i18n.getMessage("extensionLocale");

        // NOTE: direct links to individual tabs.
        this.configurationObject.shared.urls.options = browser.runtime.getURL("/src/options/options.html");
        this.configurationObject.shared.urls["options-voices"] = this.configurationObject.shared.urls.options + "#voices";
        this.configurationObject.shared.urls["options-about"] = this.configurationObject.shared.urls.options + "#about";
        this.configurationObject.shared.urls["options-features"] = this.configurationObject.shared.urls.options + "#features";
        this.configurationObject.shared.urls["options-usage"] = this.configurationObject.shared.urls.options + "#usage";

        // NOTE: direct links to individual tabs.
        // NOTE: need to pass a parameter to the options page.
        this.configurationObject.shared.urls["options-from-popup"] = this.configurationObject.shared.urls.options + "?from=popup";
        this.configurationObject.shared.urls["options-voices-from-popup"] = this.configurationObject.shared.urls["options-from-popup"] + "#voices";
        this.configurationObject.shared.urls["options-about-from-popup"] = this.configurationObject.shared.urls["options-from-popup"] + "#about";
        this.configurationObject.shared.urls["options-features-from-popup"] = this.configurationObject.shared.urls["options-from-popup"] + "#features";
        this.configurationObject.shared.urls["options-usage-from-popup"] = this.configurationObject.shared.urls["options-from-popup"] + "#usage";

        this.configurationObject.shared.urls.popup = browser.runtime.getURL("/src/popup/popup.html");
        this.configurationObject.shared.urls["popup-passclick-false"] = this.configurationObject.shared.urls.popup + "?passclick=false";
    }

    _resolvePath(obj, path) {
        // NOTE: doesn't handle arrays nor properties of "any" non-object objects.
        if (!obj || typeof obj !== "object") {
            throw new Error();
        }

        if (!path || typeof path !== "string" || path.length === 0) {
            throw new Error();
        }

        // NOTE: doesn't handle path["subpath"].
        const parts = path.split(".");
        const part = parts.shift();

        if (({}).hasOwnProperty.call(obj, part)) {
            if (parts.length === 0) {
                return obj[part];
            }
            return this._resolvePath(obj[part], parts.join("."));
        }

        return null;
    }

    getSync(path) {
        // TODO: try/catch?
        const versionedSystemValue = this._resolvePath(this.configurationObject[this._versionType][this._systemType], path);
        const versionedValue = this._resolvePath(this.configurationObject[this._versionType], path);
        const systemValue = this._resolvePath(this.configurationObject[this._systemType], path);
        const sharedValue = this._resolvePath(this.configurationObject.shared, path);

        const value = versionedSystemValue
                         || versionedValue
                         || systemValue
                         || sharedValue
                         || null;

        return value;
    }
}
