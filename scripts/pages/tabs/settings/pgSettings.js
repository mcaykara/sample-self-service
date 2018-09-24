/*globals lang*/
const extend = require("js-base/core/extend");
const AlertView = require("sf-core/ui/alertview");
const Application = require("sf-core/application");
const Data = require("sf-core/data");
const PageDesign = require("../../../ui/ui_pgSettings");
const Router = require("sf-core/ui/router");
const fingerprint = require("sf-extension-utils/lib/fingerprint");
const System = require('sf-core/device/system');
const rau = require("sf-extension-utils/lib/rau");

const Page_ = extend(PageDesign)(
	// Constructor
	function(_super, params) {
		// Initalizes super class for this page scope
		_super(this, params);

		var _superOnLoad = this.onLoad;
		var _superOnShow = this.onShow;

		this.onLoad = function() {
			if (typeof _superOnLoad === "function")
				_superOnLoad.call(this);

			this.ios.safeAreaLayoutMode = true;

			this.headerBar.title = lang["pgSettings.pageTitle"];
			this.headerBar.leftItemEnabled = false;
			this.txtTheme.text = lang["pgSettings.theme"];
			this.txtNotification.text = lang["pgSettings.notifications"];
			this.txtAbout.text = lang["pgSettings.about"] + " v." + Application.version;
			this.txtAboutDesc.text = lang["pgSettings.aboutDesc"];
			this.txtNewVersion.visible = false;
			this.lblSignOut.text = lang.signout;

			initFingerPrint.call(this);
			initCurrentTheme.call(this);
		};

		this.onShow = function() {
			if (typeof _superOnShow === "function") _superOnShow.call(this);

			initNewVersionButton.call(this);
		};

		this.themeBlueLayout.onTouchEnded = () => {
			changeTheme.call(this, "Style1");
		};

		this.themePurpleLayout.onTouchEnded = () => {
			changeTheme.call(this, "Style2");
		};

		this.signoutLayout.onTouchEnded = function() {
			Data.setBooleanVariable("isUserAuthenticated", false);
			Data.setStringVariable("userName", null);
			Data.setStringVariable("password", null);

			if (System.OS === "Android") {
				Router.go("login/pgLogin"); // TODO: remove after AND-2900
			}
			else {
				Router.goBack("login");
			}
		};
	}
);

function changeTheme(themeName) {
	if (Data.getStringVariable("theme") === themeName) {
		return;
	}

	var confirmationAlert = new AlertView({
		title: lang["alertView.confirmation"],
		message: lang["pgSettings.themeChangeMessage"]
	});
	confirmationAlert.addButton({
		text: lang["ok"],
		type: AlertView.Android.ButtonType.POSITIVE,
		onClick: () => {
			this.themeContext({
				type: "changeTheme",
				theme: themeName
			});

			this.dispatch({
				type: "invalidate"
			});

			Data.setStringVariable("theme", themeName);
			initCurrentTheme.call(this);
		}
	});

	confirmationAlert.addButton({
		text: lang["cancel"],
		type: AlertView.Android.ButtonType.NEGATIVE
	});

	confirmationAlert.show();
}

function initCurrentTheme() {
	// if (Data.getStringVariable("theme") !== "Style1") {

	this.themeBlueLayout.dispatch({
		type: "updateUserStyle",
		userStyle: {
			borderWidth: Data.getStringVariable("theme") == "Style1" ? 1 : 0
		}
	});
	this.themePurpleLayout.dispatch({
		type: "updateUserStyle",
		userStyle: {
			borderWidth: Data.getStringVariable("theme") == "Style2" ? 1 : 0
		}
	});
	// }
}

function initFingerPrint() {
	const page = this;
	if (System.fingerPrintAvailable) {
		page.switchFinger.toggle = fingerprint.useFingerprintLogin;
	}
	else {
		page.layoutFinger.height = Number.NaN;
		page.layoutFinger.maxHeight = 0;
		page.layoutFinger.flexGrow = 0;
		page.layoutFinger.visible = false;
		page.horizontalDividerFingerprint.height = Number.NaN;
		page.horizontalDividerFingerprint.flexGrow = 0;
		page.horizontalDividerFingerprint.maxHeight = 0;
		page.horizontalDividerFingerprint.visible = false;
	}
	page.switchFinger.onToggleChanged = function() {
		fingerprint.useFingerprintLogin = page.switchFinger.toggle;

	}.bind(page);
}

function initNewVersionButton() {
	Application.checkUpdate(function(err, succ) {
		if (!err) {
			this.txtNewVersion.visible = true;
			this.txtNewVersion.onTouchEnded = function() {
				rau.checkUpdate({
					url: "https://smf.to/selfservice"
				});
			};
		}
		else {
			this.txtNewVersion.visible = false;
		}
	}.bind(this));
}

module && (module.exports = Page_);
