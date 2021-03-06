function SearchHeadController(ParamService, ProjectsService, LanguagesService, MainService, utils) {
	'use strict';

	LanguagesService.get();
	ProjectsService.get();

	var ctrl = this;
	ctrl.paramService = ParamService;
	ctrl.languageService = LanguagesService;
	ctrl.projectService = ProjectsService;


	/*** PUBLIC METHODS ***/

	ctrl.checkMaxResults = function () {
		if (ParamService.pages.gsrlimit > 50) ParamService.pages.gsrlimit = 50;
	}; // checkMaxResults

	ctrl.isSelectedProject = function (project) {
		return ParamService.settings.domain == project.name;
	}; // isChosenProject

	ctrl.toggleSave = function () {
		ParamService.toggleSave();
	}; // toggleRemember

	ctrl.reset = function () {
		resetSearchTerm();
        MainService.clearResults();
	}; // reset

    ctrl.hardReset = function () {
        ctrl.reset();
        ParamService.turnOffRemember();
        ParamService.resetToDefaults();
    }; // reset

	ctrl.refreshLanguages = function () {
		LanguagesService.get();
	}; // refreshLanguages

	ctrl.refreshProjects = function () {
		ProjectsService.get();
	}; // refreshProjects

	ctrl.isCommons = function () {
		return ParamService.isCommons();
	}; // isCommons


	/*** PRIVATE ***/

	function resetSearchTerm() {
		ParamService.setSearchTerm('');
		utils.resetPath();
	} // resetSearchTerm

} // SearchHeadController

module.exports = SearchHeadController;
