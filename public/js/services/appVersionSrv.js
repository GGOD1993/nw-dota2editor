app.factory("AppVersionSrv", function ($timeout, FS, PATH, Sequence, Sound, KV, Locale) {
	var AppVersionSrv = function() {};
	var _sound_src_file_path = PATH.normalize(Sound.srcFilePath);
	var _sound_tgt_file_path = PATH.normalize(Sound.filePath);

	AppVersionSrv.ready = false;
	AppVersionSrv.stateMSG = "Loading...";

	try {
		new Sequence(function(defer) {
			// ===========================================================
			// =                          Sound                          =
			// ===========================================================
			// TODO: Auto download latest sound file
			AppVersionSrv.stateMSG = "Checking Sound Mapping...";

			FS.exists(_sound_tgt_file_path, function (exist) {
				if(exist) {
					AppVersionSrv.stateMSG = "Sound Mapping exists. Continue...";
					defer.resolve();
				} else {
					AppVersionSrv.stateMSG = "Sound Mapping not exists. Converting...";
					$timeout(function() {
						FS.readFile(_sound_src_file_path, "utf8", function (err, data) {
							if(err) {
								defer.reject(err);
							} else {
								// Parse
								var _kv = KV.parse(data);
								var _json = Sound.convertKVtoJson(_kv);

								// Save
								FS.writeFile(_sound_tgt_file_path, JSON.stringify(_json), "utf8", function (err) {
									if(err) {
										defer.reject(err);
									} else {
										AppVersionSrv.stateMSG = "Sound Mapping converting finished...";
										defer.resolve();
									}
								});
							}
						});
					}, 10);
				}
			});
		}).next(function(defer) {
				AppVersionSrv.stateMSG = "Loading Sound Mapping file...";
				FS.readFile(_sound_tgt_file_path, "utf8", function (err, data) {
					if(err) {
						defer.reject(err);
					} else {
						Sound.setup(data);
						defer.resolve();
					}
				});
		}).then(function() {
				AppVersionSrv.ready = true;
			}, function(err) {
				$.dialog({
					title: Locale('Error'),
					content: $("<div>")
						.append(Locale('versionCheckError'))
						.append($("<pre>").text(err))
				});
				console.log("Failed!",err);
			}).start();
	} catch(err) {
		console.error(err);
	}

	return AppVersionSrv;
});