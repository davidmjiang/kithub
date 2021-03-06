Lesson.factory('MarkdownService', ['$document', 'SimpleMDE', function($document, SimpleMDE) {

  var markdownService = {};
  var _editor = new SimpleMDE({
    element: $document.find('#editor')[0],
    spellChecker: false,
    placeholder: "Lesson plan...",
    status: false,
    forceSync: true
  });

  markdownService.getEditor = function() {
    return _editor;
  }

  return markdownService;

}]);
