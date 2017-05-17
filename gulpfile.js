// 文件夹结构：
//
// {project-root}
//   └─ app-client
const folderNameClientAppRoot = 'app-client';
const fileNameWlcClientProjectConfigurationJS = 'wlc-client-project-configuration';









// modules: core utilities
const gulp = require('gulp');
// const fileSystem = require('fs');
const pathTool = require('path');
const getJoinedPathFrom = pathTool.join;
const renameFiles = require('gulp-rename');
const deleteFiles = require('del');
const pump = require('pump');
const runTasksInSequnce = require('gulp-sequence');


// modules: file content modifiers
const removeLogging = require('gulp-remove-logging');
const concateFileGroups = require('gulp-group-concat');
const minifyCss = require('gulp-csso');
const uglifyJs = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');


// fetch configuration
const projectConfiguration = require(pathTool.join(__dirname, folderNameClientAppRoot, fileNameWlcClientProjectConfigurationJS));


// printing colorful logs in CLI
const logger = require('@wulechuan/colorful-log').createColorfulLogger(global.console, {
    prefix: projectConfiguration.projectCaption,
    shouldOverrideRawMethods: true, // console.error === logger.error, console.log === logger.log, so on so forth
    shouldPrefixPlainLoggingsIfNotOverrided: true,
    shouldNotShowTimeStamp: true
});

const chalk = logger.chalk;

const logLine = logger.logLines['='];
const formatJSON = logger.formatJSON;

const colorfulLog = logger.log;
const colorfulInfo = logger.info;
const colorfulWarn = logger.warn;
const colorfulError = logger.error;

const logChalk = logger.logChalk;
const infoChalk = logger.infoChalk;
const infoEMChalk = logger.infoEMChalk;
const warnChalk = logger.warnChalk;
const warnEMChalk = logger.warnEMChalk;
const errorChalk = logger.errorChalk;
const errorEMChalk = logger.errorEMChalk;
const cheersChalk = chalk.bgGreen.black;





const processArguments = require('minimist')(process.argv.slice(2));
const isToBuildForRelease = projectConfiguration.isRunningInReleasingMode(processArguments);
const isToDevelopWithWatching = !isToBuildForRelease;
const gulpRunningMode = isToBuildForRelease ? 'release' : 'dev';

colorfulWarn('isToBuildForRelease', isToBuildForRelease);
colorfulInfo(formatJSON(projectConfiguration.genOptionsForGulpHTMLMin(gulpRunningMode)));




const groupConcatBuildingOptionsForThirdPartyCss = {
	taskNameForLogging: 'CSS: 3rd-Party',
	searchingBases: [
		'third-party',
	],
	fileMatchingPatterns: ['*.css'],
	outputFileNameSuffix: '.min',
	outputFileExtension: 'css',
	// shouldNotAppendSuffix: false,
	shouldEvalutateRelativePathToCWD: true
};

const groupConcatBuildingOptionsForAppCss = {
	taskNameForLogging: 'CSS: app',
	searchingBases: [
		'app',
	],
	fileMatchingPatterns: ['*.css'],
	outputFileNameSuffix: '.min',
	outputFileExtension: 'css',
	// shouldNotAppendSuffix: false,
	shouldEvalutateRelativePathToCWD: true
};

const groupConcatBuildingOptionsForThirdPartyJs = {
	taskNameForLogging: 'Javascript: 3rd-Party',
	searchingBases: [
		'merge-into=third-party-*/',
	],
	fileMatchingPatterns: ['*.js'/*, '*.ts'*/],
	outputFileNameSuffix: '.min',
	outputFileExtension: 'js',
	shouldEvalutateRelativePathToCWD: true,
};

const groupConcatBuildingOptionsForAppJs = {
	taskNameForLogging: 'Javascript: app',
	searchingBases: [
		'/'
	],
	fileMatchingPatterns: ['*.js'/*, '*.ts'*/],
	// nameMatchingPatternForFoldersAsAModule: 'mergin-into=*',
	outputFileNameSuffix: '.min',
	outputFileExtension: 'js',
	// shouldNotAppendSuffix: false,
	shouldIncludeNestedEntries: false,
	shouldEvalutateRelativePathToCWD: true,
	shouldLog: false
};


const settingsForRemovingLoggingForJsFiles = {
	// namespace: [],
	methods: [
		// 'info',
		// 'error',
		// 'warn',
		'group',
		'groupEnd',
		'log',
		'debug'
	]
};









// initialize some variable
// shouldStripConsoleLoggingsFromJsFiles = shouldStripConsoleLoggingsFromJsFiles && shouldMinifyJsFiles;
shouldGenerateMapFilesForJs = shouldGenerateMapFilesForJs && (shouldMinifyAllJsFiles || shouldStripConsoleLoggingsFromJsFiles);
shouldGenerateMapFilesForCss = shouldGenerateMapFilesForCss && shouldMinifyCssFiles;



// build up fullpaths and globs
const pathForCssSourceFiles = getJoinedPathFrom(pathForClientAppRoot, folderOfCssFiles, folderOfCssSourceFiles);
const pathForCssOutputFiles = getJoinedPathFrom(pathForClientAppRoot, folderOfCssFiles, folderOfCssOutputFiles);
const pathForJsSourceFilesToMerge = getJoinedPathFrom(pathForClientAppRoot, folderOfJsFiles, folderOfJsSourceFilesToMerge);
const pathForJsOutputFilesToMerge = getJoinedPathFrom(pathForClientAppRoot, folderOfJsFiles, folderOfJsOutputFilesToMerge);
const pathForJsSourceAppFilesToProcessEachAlone = getJoinedPathFrom(pathForClientAppRoot, folderOfJsFiles, folderOfJsSourceAppFilesToProcessEachAlone);
const pathForJsOutputAppFilesToProcessEachAlone = getJoinedPathFrom(pathForClientAppRoot, folderOfJsFiles, folderOfJsOutputAppFilesToProcessEachAlone);
const pathForJsSourceLibFilesToProcessEachAlone = getJoinedPathFrom(pathForClientAppRoot, folderOfJsFiles, folderOfJsSourceLibFilesToProcessEachAlone);
const pathForJsOutputLibFilesToProcessEachAlone = getJoinedPathFrom(pathForClientAppRoot, folderOfJsFiles, folderOfJsOutputLibFilesToProcessEachAlone);
const pathForJsSourceFilesForInjections = getJoinedPathFrom(pathForClientAppRoot, folderOfJsFiles, folderOfJsSourceFilesForInjections);
const pathForJsOutputFilesForInjections = getJoinedPathFrom(pathForClientAppRoot, folderOfJsFiles, folderOfJsOutputFilesForInjections);

const globsCssSourceFiles = [
	getJoinedPathFrom(pathForCssSourceFiles, '**/*.css'),
	'!' + getJoinedPathFrom(pathForCssOutputFiles, '**/*') // just in case the output folder is a sub folder of the source folder
];

const globsJsSourceFilesToMerge = [
	getJoinedPathFrom(pathForJsSourceAppFilesToProcessEachAlone, '**/functions*.js'),
	getJoinedPathFrom(pathForJsSourceFilesToMerge, '**/*.js'),
];

const globsJsSourceAppFilesToProcessEachAlone = [
	getJoinedPathFrom(pathForJsSourceAppFilesToProcessEachAlone, '**/*.js'),
	'!'+getJoinedPathFrom(pathForJsSourceAppFilesToProcessEachAlone, '**/functions-extra.js')
];
const globsJsSourceLibFilesToProcessEachAlone = [
	getJoinedPathFrom(pathForJsSourceLibFilesToProcessEachAlone, 'to-minify/**/*.js')
];
const globsJsSourceLibFilesToProcessEachAloneAsIs = [
	getJoinedPathFrom(pathForJsSourceLibFilesToProcessEachAlone, 'as-is/**/*.js')
];

const globsJsSourceFilesForInjections = [
	getJoinedPathFrom(pathForJsSourceFilesForInjections, '**/*.js'),
];

const globsToWatch = []
	.concat(globsCssSourceFiles)
	.concat(globsJsSourceAppFilesToProcessEachAlone)
	.concat(globsJsSourceLibFilesToProcessEachAlone)
	.concat(globsJsSourceFilesToMerge)
	.concat(globsJsSourceFilesForInjections);









colorfulInfo(
	logLine,
	'Preparing globs and tasks...',
	logLine
);

// evaluate group-concat settings via building options
groupConcatBuildingOptionsForThirdPartyCss.searchingBases = 
	groupConcatBuildingOptionsForThirdPartyCss.searchingBases.map((glob) => {
		return getJoinedPathFrom(pathForCssSourceFiles, glob) + '/';
	});
const groupConcatSettingsForThirdPartyCss = evaluateGroupConcateOptionsViaFoldersAsAModule(
	groupConcatBuildingOptionsForThirdPartyCss
);


groupConcatBuildingOptionsForAppCss.searchingBases =
	groupConcatBuildingOptionsForAppCss.searchingBases.map((glob) => {
		return getJoinedPathFrom(pathForCssSourceFiles, glob) + '/';
	});
const groupConcatSettingsForAppCss = evaluateGroupConcateOptionsViaFoldersAsAModule(
	groupConcatBuildingOptionsForAppCss
);


groupConcatBuildingOptionsForThirdPartyJs.searchingBases =
	groupConcatBuildingOptionsForThirdPartyJs.searchingBases.map((glob) => {
		return getJoinedPathFrom(pathForJsSourceFilesToMerge, glob) + '/';
	});
const groupConcatSettingsForThirdPartyJs = evaluateGroupConcateOptionsViaFoldersAsAModule(
	groupConcatBuildingOptionsForThirdPartyJs
);


groupConcatBuildingOptionsForAppJs.searchingBases =
	groupConcatBuildingOptionsForAppJs.searchingBases.map((glob) => {
		return getJoinedPathFrom(pathForJsSourceFilesToMerge, glob) + '/';
	});
const groupConcatSettingsForAppJs = evaluateGroupConcateOptionsViaFoldersAsAModule(
	groupConcatBuildingOptionsForAppJs
);
groupConcatSettingsForAppJs['functions.min.js'] = [
	getJoinedPathFrom(pathForJsSourceAppFilesToProcessEachAlone, '**/functions-core.js'),
	getJoinedPathFrom(pathForJsSourceAppFilesToProcessEachAlone, '**/functions-extra.js')
];




(function setupAllCSSTasks() {
	// colorfulLog(
	//     'Css globs of app:',
	//     chalk.green(formatJSON(groupConcatSettingsForAppCss)),
	//     '\n'
	// );

	gulp.task('styles: remove old built files', () => {
		return del([
			getJoinedPathFrom(pathForCssOutputFiles, '**/*')
		]);
	});

	gulp.task('styles: merge third party libs', (onThisTaskDone) => {
		colorfulLog(
			'Css globs of third-party libs:',
			chalk.green(formatJSON(groupConcatSettingsForThirdPartyJs)),
			'\n\n'
			+errorEMChalk(
				' WARNING! '
				+'\n  Both human readable version and minified version '
				+'\n  of a third-party plugin will be included if they both exist! '
			)
			+'\n\n'+
			errorEMChalk(
				' 注意！ '
				+'\n  如果一个插件的《易读版》和《压缩版》均存在，'
				+'\n  那么两个文件都会被包含进合并的css！ '
			)+'\n\n'
		);

		let tasksToPump = [];

		tasksToPump.push(gulp.src(globsCssSourceFiles));
		tasksToPump.push(naturalSort());
		tasksToPump.push(concateFileGroups(groupConcatSettingsForThirdPartyCss));
		tasksToPump.push(gulp.dest(pathForCssOutputFiles));

		pump(tasksToPump, onThisTaskDone);
	});

	gulp.task('styles: build for app', (onThisTaskDone) => {
		let tasksToPump = [];

		tasksToPump.push(gulp.src(globsCssSourceFiles));
		tasksToPump.push(naturalSort());

		if (shouldGenerateMapFilesForCss) {
			tasksToPump.push(sourcemaps.init());
		}

		if (shouldMinifyCssFiles) {
			tasksToPump.push(minifyCss());
		}

		tasksToPump.push(concateFileGroups(groupConcatSettingsForAppCss));

		if (shouldGenerateMapFilesForCss) {
			tasksToPump.push(sourcemaps.write('.'));
		}

		tasksToPump.push(gulp.dest(pathForCssOutputFiles));

		pump(tasksToPump, onThisTaskDone);
	});

	gulp.task('styles: all', (onThisTaskDone) => {
		runTasksInSequnce(
			'styles: remove old built files',
			[
				// 'styles: merge third party libs',
				'styles: build for app'
			]
		)(onThisTaskDone);
	});
})();


(function setupAllJSTasks() {
	gulp.task('javascript: remove old built files', () => {
		return del([
			getJoinedPathFrom(pathForJsOutputFilesToMerge, '**/*'),
			getJoinedPathFrom(pathForJsOutputFilesForInjections, '**/*')
		]);
	});

	gulp.task('javascript: build files for app: those to merge', (onThisTaskDone) => {
		colorfulLog(
			'Javascript globs of app: ',
			chalk.green(formatJSON(groupConcatSettingsForAppJs)),
			'\n'
		);

		let tasksToPump = [];

		tasksToPump.push(gulp.src(globsJsSourceFilesToMerge));
		tasksToPump.push(naturalSort());

		if (shouldGenerateMapFilesForJs) {
			tasksToPump.push(sourcemaps.init());
		}

		if (shouldStripConsoleLoggingsFromJsFiles) {
			tasksToPump.push(removeLogging(settingsForRemovingLoggingForJsFiles));
		}

		tasksToPump.push(concateFileGroups(groupConcatSettingsForAppJs));

		if (shouldMinifyAllJsFiles) {
			tasksToPump.push(uglifyJs());
		}

		if (shouldGenerateMapFilesForJs) {
			tasksToPump.push(sourcemaps.write('.'));
		}

		tasksToPump.push(gulp.dest(pathForJsOutputFilesToMerge));

		pump(tasksToPump, onThisTaskDone);
	});

	gulp.task('javascript: build files for app: those each alone', (onThisTaskDone) => {
		let tasksToPump = [];

		tasksToPump.push(gulp.src(globsJsSourceAppFilesToProcessEachAlone));

		if (shouldGenerateMapFilesForJs) {
			tasksToPump.push(sourcemaps.init());
		}

		if (shouldStripConsoleLoggingsFromJsFiles) {
			tasksToPump.push(removeLogging(settingsForRemovingLoggingForJsFiles));
		}

		if (shouldMinifyAllJsFiles) {
			tasksToPump.push(uglifyJs());
		}

		tasksToPump.push(renameFiles({suffix: '.min'}));

		if (shouldGenerateMapFilesForJs) {
			tasksToPump.push(sourcemaps.write('.'));
		}

		tasksToPump.push(gulp.dest(pathForJsOutputAppFilesToProcessEachAlone));

		pump(tasksToPump, onThisTaskDone);
	});


	gulp.task('javascript: remove old third-party files', () => {
		return del([
			getJoinedPathFrom(pathForJsOutputLibFilesToProcessEachAlone, '**/*')
		]);
	});

	gulp.task('javascript: merge third party libs', (onThisTaskDone) => {

		colorfulLog(
			'Javascript globs of third-party libs:',
			chalk.green(formatJSON(groupConcatSettingsForThirdPartyJs)),
			'\n\n'
			+errorEMChalk(
				' WARNING! '
				+'\n  Both human readable version and minified version '
				+'\n  of a third-party plugin will be included if they both exist! '
			)
			+'\n\n'+
			errorEMChalk(
				' 注意！ '
				+'\n  如果一个插件的《易读版》和《压缩版》均存在，'
				+'\n  那么两个文件都会被包含进合并的js！ '
			)+'\n\n'
		);

		let tasksToPump = [];

		tasksToPump.push(gulp.src(globsJsSourceFilesToMerge));
		tasksToPump.push(naturalSort());
		tasksToPump.push(concateFileGroups(groupConcatSettingsForThirdPartyJs));
		tasksToPump.push(gulp.dest(pathForJsOutputFilesToMerge));

		pump(tasksToPump, onThisTaskDone);
	});

	gulp.task('javascript: copy some third-party files: each alone', (onThisTaskDone) => {
		return gulp.src(globsJsSourceLibFilesToProcessEachAloneAsIs)
			.pipe(renameFiles({suffix: '.min'}))
			.pipe(gulp.dest(pathForJsOutputLibFilesToProcessEachAlone))
			;
	});

	gulp.task('javascript: minify some third-party files: each alone', (onThisTaskDone) => {
		colorfulWarn(
			'globsJsSourceLibFilesToProcessEachAlone:',
			formatJSON(globsJsSourceLibFilesToProcessEachAlone),
			'\n\nto "'+pathForJsOutputLibFilesToProcessEachAlone+'"'
		);

		return gulp.src(globsJsSourceLibFilesToProcessEachAlone)
			.pipe(uglifyJs())
			.pipe(renameFiles({suffix: '.min'}))
			.pipe(gulp.dest(pathForJsOutputLibFilesToProcessEachAlone))
			;
	});




	gulp.task('javascript: all', (onThisTaskDone) => {
		runTasksInSequnce(
			'javascript: remove old built files',
			[
				'javascript: build files for app: those to merge',
				'javascript: build files for app: those each alone',
				'javascript: build files for injections'
			]
		)(onThisTaskDone);
	});
})();




gulp.task('app: build', [
	'styles: all',
	'javascript: all'
]);


(function setupWatching() {
	gulp.task('app: watch all source files', [], () => {
		return gulp.watch(globsToWatch, ['app: build'])
			.on('change', logWatchedChange);
	});

	function logWatchedChange(event) {
		let _path = event.path;
		let _posOfClientAppRoot = _path.indexOf(pathForClientAppRoot);

		let subFolderOfChangedFile = _path;
		if (_posOfClientAppRoot > -1) {
			subFolderOfChangedFile = _path.slice(_posOfClientAppRoot + pathForClientAppRoot.length);
		}

		let actionName = '';
		switch (event.type) {
			case 'added': actionName = 'added';
				break;
			case 'changed': actionName = 'changed';
				break;
			case 'renamed': actionName = 'renamed';
				break;
			case 'unlink':
			case 'deleted': actionName = 'deleted';
				break;
			default: actionName = event.type;
				break;
		}

		colorfulLog(chalk.cyan(
			logLine,

			'  '
			+ 'File system changes happen under folder '
			+ '[' + pathForClientAppRoot + ']'
			+ ':\n'
			+ '  '
			+ chalk.white.bgRed('<' + actionName + '>')
			+ ' '
			+ chalk.black.bgYellow('[' + subFolderOfChangedFile + ']'),

			logLine
		));
	}
})();




(function setupTopLevelTasks() {
	const topLevelTasksToRun = [
		'app: build'
	];

	if (isToBuildForRelease) {
		topLevelTasksToRun.push(
			'renew-lib'
		);
	}

	if (isToDevelopWithWatching) {
		topLevelTasksToRun.push(
			'app: watch all source files'
		);
	}

	gulp.task('default', topLevelTasksToRun, (onThisTaskDone) => {
		if (isToBuildForRelease) {
			colorfulLog(
				cheersChalk('App is built sucessfully! Congradulations!')
			);
		}

		onThisTaskDone();
	});

	// gulp.task('watch');

	// gulp.task('test');

	// gulp.task('clean');


	gulp.task('renew-lib', (onThisTaskDone) => {
		runTasksInSequnce(
			'javascript: remove old third-party files',
			[
				'javascript: merge third party libs',
				'javascript: copy some third-party files: each alone',
				'javascript: minify some third-party files: each alone'
			]
		)(onThisTaskDone);
	});

})();

colorfulInfo(
	logLine,
	'Globs and tasks are prepared.',
	logLine
);

if (isToDevelopWithWatching) {
	colorfulWarn(
		warnEMChalk('Running in DEVELOPMENT Mode! Have a Nice Day!')
	);
}

if (isToBuildForRelease) {
	colorfulLog(
		cheersChalk('Building app for releasing...! So exciting!')
	);
}
