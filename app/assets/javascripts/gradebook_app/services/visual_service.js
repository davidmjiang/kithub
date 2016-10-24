Gradebook.factory("VisualService", ["Restangular", "_", function(Restangular, _) {

  var VisualService = {}

  var _assignments = []

  VisualService.courseGPAs = function() {
    return Restangular.all('submissions').getList().then(function(response) {
      return angular.copy(response, _assignments)
    })
  }

  VisualService.getPercent = function(assignment, score) {
    var possible = assignment.possible_score;
    return ((score/possible)*100);
  };

  VisualService.assignmentAvg = function(assignment) {
    var sum = 0;
    var possible = 0;
    for (var i = 0; i < assignment.submissions.length; i++) {
      sum += assignment.submissions[i].raw_score
      possible += assignment.possible_score;
    }
    return (sum / possible)*100
  };

  VisualService.studentAvg = function(student, assignments) {
    var sum = 0;
    var possible = 0;
    for (var i = 0; i < student.submissions.length; i++) {
      var submission = student.submissions[i]
      var assignment = _.find(assignments, {'id': submission.assignment_id});
      sum += submission.raw_score
      possible += assignment.possible_score
    }
    return (sum / possible)*100
  };

  VisualService.studentAverages = function(students, assignments) {
    var studentArray = [];
    angular.forEach(students, function(student) {
      studentArray.push({
              'name': student.first_name + " " + student.last_name[0] + ".",
              'percent': VisualService.studentAvg(student, assignments)})
    })
    studentArray.sort(function(a, b){
      return a.percent-b.percent
    })
    return studentArray
  };

  VisualService.studentScores = function(students, assignment) {
    var scoreArray = [];
    angular.forEach(students, function(student) {
      var submission = _.find(student.submissions,
                             {'assignment_id': assignment.id});
      var score = VisualService.getPercent(assignment, submission.raw_score)
      scoreArray.push({
              'name': student.first_name + " " + student.last_name[0] + ".",
              'percent': score})
    })
    scoreArray.sort(function(a, b){
      return a.percent-b.percent
    })
    return scoreArray
  }

  VisualService.gradeDistribution = function(students) {
    var grades = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    angular.forEach(students, function(student){
      if (student.percent >= 90) {
        grades["A"] += 1
      } else if (student.percent >= 80) {
        grades["B"] += 1
      } else if (student.percent >= 70) {
        grades["C"] += 1
      } else if (student.percent >= 60) {
        grades["D"] += 1
      } else {
        grades["F"] += 1
      }
    })
    return grades
  }

  return VisualService

}])