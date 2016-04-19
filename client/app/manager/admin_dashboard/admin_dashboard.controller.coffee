'use strict'

angular.module 'elektorApp'
.controller 'AdminDashboardCtrl', ($scope, $rootScope) ->
  $scope.message = 'Hello'

  $rootScope.$on "pollSettings", (e, data) ->
    $scope.settings = data

.controller 'PositionsCtrl', ( $scope, Position, toastr, $stateParams, Poll ) ->
  pollId = $stateParams.id
  $scope.poll = Poll.get id : pollId
  $scope.positions = Position.query _poll: pollId

  $scope.reset = ->
    $scope.position =
      _poll: pollId
      name: null
      description: null

  $scope.newPosition = ->
    $scope.showPositionForm = true
    $scope.reset()

  $scope.hideForm = ->
    $scope.reset()
    $scope.showPositionForm = false

  $scope.submit = (form) ->
    if form.$valid
      p = new Position $scope.position
      p.$save (result) ->
        $scope.positions.push result
        form.$setPristine()
        form.$setUntouched()
        $scope.hideForm()
    else toastr.error "Please fill the form appropriately"
      
.controller 'ResultsCtrl', ( $scope, Vote, $timeout, $rootScope, Setting, toastr, $stateParams, Poll ) ->
  pollId = $stateParams.id
  
  Poll.get id: pollId, (poll) ->
    $scope.poll = poll

    $scope.closed = ->
      moment().isAfter $scope.poll.closes

  $scope.makePublic = ->
    if not $scope.poll.published
      Poll.update
        id: pollId
      , published: true , ->
        $scope.poll.published = true
        toastr.success "Results have been published"
    else
      toastr.info "Results have already been published"

  # Fetch Poll Results Every 30 Seconds
  $scope.standings = ->
    Vote.stats _poll: pollId
    , (results) ->
      $scope.results = results
      $rootScope.$broadcast "pollResults", results
      $timeout ->
        $scope.standings()
      , 30000
    return
  $scope.standings()

  $scope.chartData = (title, candidates) ->
    chartObject =
      type: "BarChart"
      data:
        cols: [
          {id: "t", label: "Topping", type: "string"}
          {id: "s", label: "Votes", type: "number"}
        ]
        rows: []

    _.each candidates, (c) ->
      chartObject.data.rows.push
        c: [
          { v: [c.candidate.surname, (c.candidate.firstName||c.candidate.othername) ].join ' ' }
          { v: c.count }
        ]

    chartObject.options =
      title: title

    chartObject

.controller 'CandidatesCtrl', ( $scope, $stateParams, Position, toastr, Member, Upload, cloudinary, $state ) ->
  $scope.position = Position.get id: $stateParams.position_id

  # TODO: Make this filterable
  $scope.members = Member.query()

  $scope.$parent.collapse = true

  $scope.closeMe = ->
    $scope.$parent.collapse = false
    $state.go "admin_dashboard.positions", id: $stateParams.id

  $scope.reset = ->
    $scope.loaded = ""
    $scope.photo = null
    $scope.error = null
    $scope.candidate =
      _member: null
      bio: null
      photo: null

  $scope.newCandidate = ->
    $scope.showCandidateForm = true
    $scope.reset()

  $scope.hideForm = (form) ->
    form.$setPristine()
    form.$setUntouched()
    $scope.reset()
    $scope.showCandidateForm = false

  $scope.error = null

  $scope.uploadFile = (file) ->
    $scope.error = null
    Upload.upload
      url: "https://api.cloudinary.com/v1_1/" + cloudinary.config().cloud_name + "/upload"
      data:
        upload_preset: cloudinary.config().upload_preset
        tags: 'elektor'
        context: 'photo=' + $scope.candidate._member
        file: file
    .progress (e) ->
      progress = Math.round((e.loaded * 100.0) / e.total)
      $scope.loaded = "Uploading... #{progress}%"
    .success (data) ->
      $scope.candidate.secure_url = data.secure_url
      $scope.candidate.url = data.url
      $scope.candidate.public_id = data.public_id

      $scope.photo = data
      $scope.loaded = ""
    .error (data) ->
      $scope.loaded = ""
      $scope.error = data.error.message

  $scope.submit = (form) ->
    if form.$valid and $scope.error is null
      $scope.candidate.photo = "" #"data:#{$scope.candidate.photo.filetype};base64,#{$scope.candidate.photo.base64}"
      Position.addCandidate id: $stateParams.position_id, $scope.candidate, (position) ->
        $scope.position = position
        $scope.hideForm form
        $scope.reset()
        toastr.success "Candidate Added Successfully!"
    else toastr.error "Error Saving Candidate Details"

.controller 'MembersCtrl', ( $scope, Member, $modal, toastr, $localStorage ) ->
  modal = null
  $scope.perPage = $localStorage.memberPerPage or 15
  $scope.currentPage = 1
  $scope.members = []
  $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]

  $scope.load = (page) ->
    Member.query
      page: page
      perPage: $scope.perPage
    , (members, headers) ->
      $scope.members = members
      $scope.total = parseInt headers "total_found"
      $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $localStorage.memberPerPage = $scope.perPage
    $scope.load $scope.currentPage
    
  $scope.editMember = (member) ->
    $scope.selectedMember = member
    if member.othername?
      $scope.selectedMember.firstName = member.othername?.split(" ")?[0]
      $scope.selectedMember.middleName = member.othername?.split(" ")?[1]

    modal = $modal.open
      templateUrl: "app/manager/admin_dashboard/views/member-form.html"
      scope: $scope
      backdrop: 'static'
      
  $scope.closeModal = ->
    $scope.selectedMember = null
    modal.dismiss()

  $scope.updateMember = ->
    Member.update id: $scope.selectedMember._id, $scope.selectedMember, ->
      toastr.success "Member Data Updated"
      $scope.closeModal()

  $scope.verify = (member) ->
    if confirm "Are you sure?"
      Member.update
        id: member._id
      , verified:1 , ->
        member.verified = 1

.controller 'VotersRegisterCtrl', ($scope, Member, $localStorage) ->
  $scope.perPage = $localStorage.votersRegisterPerPage or 15
  $scope.currentPage = 1
  $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]

  $scope.load = (page) ->
    Member.query
      page: page
      verified: true
      perPage: $scope.perPage
    , (members, headers) ->
      $scope.members = members
      $scope.total = parseInt headers "total_found"
      $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $localStorage.votersRegisterPerPage = $scope.perPage
    $scope.load $scope.currentPage

.controller 'BURCtrl', ( $scope, BranchRequest, toastr, $modal, Member ) ->
  $scope.perPage = 10
  $scope.currentPage = 1

  modal = null
  $scope.new_branch = null
  
  $scope.closeModal = ->
    modal.dismiss()
  
  $scope.load = (page) ->
    BranchRequest.query
      page: page
      resolved: false
      perPage: $scope.perPage
    , (requests, headers) ->
      $scope.requests = requests
      $scope.total = parseInt headers "total_found"
      $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $scope.load $scope.currentPage
    
  $scope.fixRecord = (record, index) ->
    $scope.selectedRecord = angular.copy record
    $scope.selectedIndex = index
    
    modal = $modal.open
      templateUrl: "app/manager/admin_dashboard/views/fix-record.html"
      backdrop: "static"
      scope: $scope

  $scope.submitFix = (theForm, new_branch) ->
    if theForm.$valid and confirm "Are you sure? Change to #{new_branch}?"
      Member.update
        id: $scope.selectedRecord._member._id
      , _branch: new_branch , ->
        BranchRequest.update
          id: $scope.selectedRecord._id
        , resolved: true , ->
          $scope.closeModal()

          $scope.selectedRecord = null
          $scope.selectedIndex = null
          $scope.load $scope.currentPage
            
  $scope.deleteRecord = (r, $index) ->
    if confirm "Are you sure?"
      BranchRequest.delete id: r._id, ->
        $scope.requests.splice $index, 1
        $scope.total -= 1

.controller 'BranchesCtrl', ($scope, Branch, $localStorage) ->
  $scope.perPage = $localStorage.branchPerPage or 15
  $scope.currentPage = 1
  $scope.branches = []

  $scope.pageSizes = [10, 15, 25, 50, 100, 200, 500]

  $scope.load = (page) ->
    Branch.query
      page: page
      perPage: $scope.perPage
    , (branches, headers) ->
      $scope.branches = branches
      $scope.total = parseInt headers "total_found"
      $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $localStorage.branchPerPage = $scope.perPage
    $scope.load $scope.currentPage

  $scope.hasSelected = ->
    $scope.branches.length and (_.filter $scope.branches, (b) -> b.selected).length > 1

  $scope.mergeSelected = ->
    newName = prompt "Please enter new name for merged branches: "
    if newName isnt null and newName.trim() isnt ""
      selectedBranches = _.pluck (_.filter $scope.branches, (b) -> b.selected), "_id"
      Branch.merge
        ids: selectedBranches
        name: newName
      , (branch) ->
        _.remove $scope.branches, (b) -> (selectedBranches.indexOf b._id) isnt -1
        $scope.branches.push branch

.controller 'PollsCtrl', ( $scope, Poll, $modal, $timeout, toastr ) ->
  $scope.perPage = 15
  $scope.currentPage = 1
  
  $scope.poll = {}
  modal = undefined 

  $scope.load = (page) ->
    Poll.query
      page: page
      perPage: $scope.perPage
    , (polls, headers) ->
      $scope.polls = polls
      $scope.total = parseInt headers "total_found"
      $scope.pages = Math.ceil($scope.total / $scope.perPage)

  $scope.load $scope.currentPage

  $scope.pageChanged = ->
    $scope.load $scope.currentPage
    
  $scope.newPoll = ->
    modal = $modal.open
      templateUrl: "app/manager/admin_dashboard/views/new-poll.html"
      backdrop: "static"
      scope: $scope

  $scope.edit = (poll) ->
    $scope.poll=  poll
    modal = $modal.open
      templateUrl: "app/manager/admin_dashboard/views/new-poll.html"
      backdrop: "static"
      scope: $scope

  $scope.closeModal = ->
    $scope.poll = {}
    modal.dismiss()

  $scope.clear = -> $scope.dt = null

  $scope.toggleMin = -> $scope.minDate = $scope.minDate or new Date()
  $scope.toggleMin()

  $scope.datePicker = [
    { isOpen: false }
    { isOpen: false }
  ]

  $scope.open = (pos, $event) ->
    $event.preventDefault()
    $event.stopPropagation()

    $timeout ->
      $scope.datePicker[pos].isOpen = true
    , 50

  $scope.dateOptions =
    formatYear: 'yy'
    startingDay: 1
    class: 'datepicker'
    
  $scope.submit = (theForm) ->
    if theForm.$valid and ((not $scope.poll.national and $scope.poll._branch) or $scope.poll.national)
      if $scope.poll._id
        Poll.update
          id: $scope.poll._id
        , $scope.poll, (res) ->
          $scope.closeModal()
      else
        poll = new Poll $scope.poll

        poll.$save().then (p) ->
          $scope.polls.push p
          $scope.closeModal()

    else toastr.info "Please fill the form before submitting"

.controller 'AdminResultDetailsCtrl', ($scope, $stateParams, Position, Vote) ->
  Position.get id: $stateParams.id, (position) ->
    $scope.position = position

    Vote.votesForPosition id: $stateParams.id, (votes) ->
      $scope.votes = votes

      $scope.data = [[]]
      $scope.chartObject =
        type: "BarChart"
        data:
          cols: [
            {id: "t", label: "Topping", type: "string"}
            {id: "s", label: "Votes", type: "number"}
          ]
          rows: []

      _.each $scope.position.candidates, (c) ->
        $scope.chartObject.data.rows.push
          c: [
            { v: c._member.surname }
            { v: $scope.getVotes c._member._id }
          ]
#        $scope.data[0].push $scope.getVotes c._member._id
#        c.code

      $scope.chartObject.options =
        title: $scope.position.name


  $scope.getVotes = (id) ->
    (_.filter $scope.votes, (v) ->
      v.candidate is id ).length

.controller 'PollSettingsCtrl', ($scope, Setting, toastr) ->

  $scope.settings = []

  Setting.query {}
  .$promise.then (settings) ->
    _.each settings, (s, i) ->
      if s.type is 'datetime-local'
        settings[i].value = new Date s.value

    $scope.settings = settings

  $scope.submit = (form) ->
    if form.$valid
      jobs = []
      _.each $scope.settings, (s) ->
        jobs.push (cb) ->
          Setting.update id: s._id, s, ->
            cb()

      async.parallel jobs, (err, results) ->
        console.log err, results
        toastr.success "Settings Updated Successfully"
    else toastr.error "Please fill the form appropriately"