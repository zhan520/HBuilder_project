/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if(loginInfo.account.length != 11) {
			return callback('请输入正确手机号码');
		}
		if(loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}

		var tokenstr = loginInfo.account + GC.key;

		//var hash = hex_md5("123dafd");
		var token = md5(tokenstr);
		
		var RequestData = "method=login&mobile=" + loginInfo.account + "&password=" + loginInfo.password + "&token=" + token;
		
		LoginRequestHttpClient(RequestData,function(data){
			console.log("data=" + data);
			if(data != 0) {
				var json = JSON.parse(data);
				var code = json['code'];
				if(code == 1) {
					return callback();
				} else {
					return callback(json['message']);
				}
			}
			
		})


	};

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		regInfo.pollcode = regInfo.pollcode || '';

		if(regInfo.account.length < 5) {
			return callback('用户名最短需要 5 个字符');
		}
		if(regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if(!checkEmail(regInfo.email)) {
			return callback('邮箱地址不合法');
		}

		var tokenstr = regInfo.account + GC.key;
		//var hash = hex_md5("123dafd");
		var token = md5(tokenstr);
		//me thod=regist&mobile=15600901539&password=111111&email=2622638480@qq.com&registcode=BY3SBA367644&token=f36b2e07f1d7c7910bb7f7bd665fa260
		var RequestData = "method=regist&mobile=" + regInfo.account + "&password=" + regInfo.password + "&email=" + regInfo.email + "&registcode=" + regInfo.pollcode + "&token=" + token;

		RegRequestHttpClient(RequestData, function(data) {
			console.log("data=" + data);
			if(data != 0) {
				var json = JSON.parse(data);
				var code = json['code'];
				if(code == 1) {
					return callback();
				} else {
					return callback(json['message']);
				}
			}
		})
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return(email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(forgetpasswordInfo, callback) {
		callback = callback || $.noop;
		forgetpasswordInfo = forgetpasswordInfo || {};
		forgetpasswordInfo.account = forgetpasswordInfo.account || '';
		forgetpasswordInfo.emailBox = forgetpasswordInfo.emailBox || '';
		
		
		if(forgetpasswordInfo.account.length != 11) {
			return callback('请输入正确手机号码');
		}
		
		callback = callback || $.noop;
		if(!checkEmail(forgetpasswordInfo.emailBox)) {
			return callback('邮箱地址不合法');
		}
		
		var tokenstr = forgetpasswordInfo.account + GC.key;

		//var hash = hex_md5("123dafd");
		var token = md5(tokenstr);
		
		var RequestData = "method=getpassword&mobile=" + forgetpasswordInfo.account + "&email=" + forgetpasswordInfo.emailBox + "&token=" + token;
		
		SendEmileRequestHttpClient(RequestData,function(data){
			console.log("data=" + data);
			if(data != 0) {
				var json = JSON.parse(data);
				var code = json['code'];
				if(code == 1) {
					return callback(null, '密码已经发送到您的邮箱，请查收邮件。');
				} else {
					return callback(json['message']);
				}
			}
			
		})
		
		
		
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if(id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch(e) {}
		} else {
			switch(id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));