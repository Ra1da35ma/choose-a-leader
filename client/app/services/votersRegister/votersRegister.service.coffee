'use strict'

angular.module 'elektorApp'
.service 'Voters_Register', ($resource) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function
  $resource "/api/votersReg/:id", null,
    branches:
      method: 'POST'
      isArray: true
      url: '/api/votersReg'
    branchDetails:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/details'
    searchDetails:
      method: 'POST'
      isArray: true
      url: '/api/votersReg/search'
    me:
      url: '/api/votersReg/me'
      method: 'GET'
    saveData:
      method: 'POST'
      url: '/api/votersReg/save'
    getCount:
      method: 'GET'
      url: '/api/votersReg/getCount'
    getUpdate:
      method: 'GET'
      url: '/api/votersReg/getUpdate'
