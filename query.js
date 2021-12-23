/*
Path pattern: 	/view_customizes/new
Insertion position: Bottom of all pages
Type: JavaScript
新規 View Customize 画面にリポジトリから取得する機能を追加する
*/


get_json = function (url) {
  var deferred = $.Deferred();
  github = url.match("^https://github.com/([^/]+)/([^/]+)/blob/([^/]+)/(.*)");
  // user, repo, hash, path, 
  if (github && github[3].match('^[a-z0-9]{40}$')) {  // heuristic check; would be a hash, not a branch name
    $.getJSON("https://api.github.com/repos/" + github[1] + "/" + github[2] + "/contents/" + github[4] + "?ref=" + github[3],
      function (data) {
        $.get(data.download_url, function (data) { deferred.resolve(data) })
      }
    );
    return deferred.promise();
  } else {
    $.get(url, function (data) { deferred.resolve(data) });
    return deferred.promise();
  }
};

retrieve = function (event) {
  url = event.target.parentNode.previousSibling.innerText;
  get_json(url)
    .then(function (js_body) {
      $('#view_customize_code')[0].innerText = js_body;
    });
}

view_customize_query = function () {
  url = $('#view_customize_query-url').val();
  get_json(url)
    .then(function (repos) {
      JSON.parse(repos).forEach(function (repo) {
        get_json(repo.url)
          .then(function (contents) {
            JSON.parse(contents).forEach(function (content, index) {
              tr = $('<tr>', { "class": ["even", "odd"][index + 1 % 2] });
              tr.append($('<td>', { text: index + 1 }));
              tr.append($('<td>', { text: content.name }));
              tr.append($('<td>', { text: content.url }));
              tr.append($('<td>').append(
                $('<a>', {
                  "class": 'icon icon-download',
                }).on('click', retrieve)
              ));
              $('#view_customize-query_result').append(tr);
            });
          });
      });
    });
};

$('#view_customize-form').after(
  $('<br/>'),
  $('<input>', {
    id: "view_customize_query-url", size: 100,
    value: "https://github.com/matobaa/redmine-view-customize_script-lookup/blob/4cc2ee06aa30d92f1b2739bf9e813a185e955304/repository_list.json"
  }),
  $('<button>', { id: "view_customize-query", text: "query" }).on("click", view_customize_query),
  $('<table id="view_customize-query_result" class="list"><tr><th>id</th><th>name</th><th>url</th><th></th></tr></table>')
);
